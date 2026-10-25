//@ts-check

const { composePlugins, withNx } = require("@nx/next")

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
	// Cache Components enables component and function-level caching using the use cache directive.
	// Data fetching is dynamic by default, and you choose what to cache at the page, component, or
	// function level. Next.js prerenders a static HTML shell that is served immediately while
	// dynamic content streams in when ready, letting you mix static and dynamic content within a
	// single route.
	cacheComponents: true,
	// partialPrefetching enables Partial Prefetching at the app level. The framework prefetches the
	// static parts of each route by default
	partialPrefetching: true,

	// devIndicators allows you to configure the on-screen indicator that gives context about the
	// current route you're viewing during development.
	devIndicators: {
		position: "bottom-right"
	},

	logging: {
		fetches: {
			// Any fetch requests that are restored from the Server Components HMR cache are not logged
			// by default.
			hmrRefreshes: true
		},

		// You can forward browser console logs (such as console.log, console.warn, console.error) to
		// the terminal during development. This is useful for debugging client-side code without
		// needing to check the browser's developer tools.
		browserToTerminal: true
	},

	/*
    Next.js includes support for the React Compiler, a tool designed to improve performance by
    automatically optimizing component rendering. This reduces the need for manual memoization
    using useMemo and useCallback.
    Next.js includes a custom performance optimization written in SWC that makes the React
    Compiler more efficient. Instead of running the compiler on every file, Next.js analyzes your
    project and only applies the React Compiler to relevant files. This avoids unnecessary work
    and leads to faster builds compared to using the Babel plugin on its own.
  */
	reactCompiler: true,

	// Support for statically typed links.
	typedRoutes: true,

	compiler: {
		reactRemoveProperties: true,
		removeConsole: true
	},

	experimental: {
		// The authInterrupts configuration option allows you to use forbidden and unauthorized APIs in
		// your application.
		authInterrupts: true,

		// CSS Chunking is a strategy used to improve the performance of your web application by
		// splitting and re-ordering CSS files into chunks. This lets a route load close to only the
		// CSS it needs, instead of loading all the application's CSS at once.
		cssChunking: true,

		// The experimental.turbopackGc option enables garbage collection for Turbopack's in-memory and
		// persistent caches.
		turbopackGc: true,

		// The experimental.turbopackRustReactCompiler option enables the native Rust version of the
		// React Compiler, running it directly inside Turbopack as native code instead of through
		// Node.js as it does with the standard Babel version. This typically results in a noticeable
		// performance improvement.
		turbopackRustReactCompiler: true,

		// By default, next build runs the project-local tsc command instead of loading the TypeScript
		// JavaScript compiler API. This supports TypeScript 6 and enables TypeScript 7 while its
		// JavaScript API is unavailable.
		useTypeScriptCli: true
	},

	// Use this to set Nx-specific options
	// See: https://nx.dev/recipes/next/next-config-setup
	nx: {}
}

const plugins = [
	// Add more Next.js plugins to this list if needed.
	withNx
]

module.exports = composePlugins(...plugins)(nextConfig)
