package cluster

import "context"

// Represents a Kubernetes cluster, whose lifecycle is managed by ClusterMan.
type Managed interface {
	// NOTE : Every implementation's constructor function bootstraps the cluster.

	Destroy(ctx context.Context) error
}
