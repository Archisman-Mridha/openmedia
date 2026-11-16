// CI checks for the OpenMedia monorepo.

package ci

import (
	"context"

	"dagger.io/dagger/core"

	"dagger/ci/internal/dagger"
)

type Ci struct {
	// Node.js image the JavaScript / TypeScript projects are checked on.
	NodeImageAddress string

	// Bun image the Bun binary is taken from.
	BunImageAddress string

	// JDK image the Gradle projects are built on.
	JdkImageAddress string

	// +private
	Source *dagger.Directory
}

func New(
	ws *dagger.Workspace,
	// +default="node:26-bookworm-slim"
	nodeImageAddress string,
	// +default="oven/bun:1.3.13"
	bunImageAddress string,
	// +default="azul/zulu-openjdk:21"
	jdkImageAddress string,
) *Ci {
	return &Ci{
		NodeImageAddress: nodeImageAddress,
		BunImageAddress:  bunImageAddress,
		JdkImageAddress:  jdkImageAddress,
		Source: ws.Directory("/", dagger.WorkspaceDirectoryOpts{
			Exclude:   []string{"**/.git", "**/.dagger", "**/vendor"},
			Gitignore: true,
		}),
	}
}

// A Node.js container with Bun, the JavaScript / TypeScript sources and their installed
// dependencies.
func (m *Ci) JsContainer() *dagger.Container {
	source := m.Source.
		// Without Gradle build files, the Nx Gradle plugin infers no projects and doesn't need Java.
		WithoutDirectory("data-processing-pipelines").
		WithoutDirectory("infrastructure")

	return core.NewContainer().
		From(m.NodeImageAddress).
		WithFile("/usr/local/bin/bun", core.NewContainer().From(m.BunImageAddress).File("/usr/local/bin/bun")).
		WithExec([]string{"ln", "-s", "/usr/local/bin/bun", "/usr/local/bin/bunx"}).
		WithMountedCache("/root/.bun/install/cache", core.NewCacheVolume("openmedia-bun-install")).
		WithEnvVariable("CI", "true").
		WithEnvVariable("NX_DAEMON", "false").
		WithEnvVariable("NX_NO_CLOUD", "true").
		WithEnvVariable("NEXT_TELEMETRY_DISABLED", "1").
		WithWorkdir("/src").
		// Install dependencies first, so source changes don't invalidate the install layer.
		WithFile("package.json", source.File("package.json")).
		WithFile("bun.lock", source.File("bun.lock")).
		WithFile("bunfig.toml", source.File("bunfig.toml")).
		WithExec([]string{"bun", "install", "--frozen-lockfile"}).
		WithDirectory(".", source)
}

// Type-check the backend.
// +check
func (m *Ci) BackendTypecheck(ctx context.Context) error {
	_, err := m.JsContainer().
		WithExec([]string{"bunx", "--bun", "tsc", "-p", "backend/tsconfig.app.json", "--noEmit"}).
		Sync(ctx)
	return err
}

// Lint and format-check the backend with Biome.
// +check
func (m *Ci) BackendLint(ctx context.Context) error {
	_, err := m.JsContainer().
		WithExec([]string{"bunx", "--bun", "biome", "check", "backend"}).
		Sync(ctx)
	return err
}

// Build the backend.
// +check
func (m *Ci) BackendBuild(ctx context.Context) error {
	_, err := m.JsContainer().
		WithExec([]string{"bun", "run", "nx", "build", "backend"}).
		Sync(ctx)
	return err
}

// Build the validators package.
// +check
func (m *Ci) ValidatorsBuild(ctx context.Context) error {
	_, err := m.JsContainer().
		WithExec([]string{"bun", "run", "nx", "build", "validators"}).
		Sync(ctx)
	return err
}

// Build the web frontend.
// +check
func (m *Ci) WebBuild(ctx context.Context) error {
	_, err := m.JsContainer().
		WithExec([]string{"bun", "run", "nx", "build", "web"}).
		Sync(ctx)
	return err
}

// A JDK container with the data processing pipelines' sources.
func (m *Ci) GradleContainer() *dagger.Container {
	return core.NewContainer().
		From(m.JdkImageAddress).
		WithMountedCache("/root/.gradle", core.NewCacheVolume("openmedia-gradle")).
		WithDirectory("/src", m.Source.Directory("data-processing-pipelines")).
		WithWorkdir("/src")
}

// The feed-updater Flink job's shadow JAR.
func (m *Ci) FeedUpdaterJar() *dagger.File {
	return m.GradleContainer().
		WithExec([]string{"./gradlew", "--no-daemon", ":feed-updater:shadowJar"}).
		File("feed-updater/build/libs/feed-updater-0.1-SNAPSHOT-all.jar")
}

// Test the data processing pipelines and build the feed-updater Flink job's shadow JAR.
// +check
func (m *Ci) PipelinesBuild(ctx context.Context) error {
	_, err := m.GradleContainer().
		WithExec([]string{"./gradlew", "--no-daemon", "test", ":feed-updater:shadowJar"}).
		Sync(ctx)
	return err
}
