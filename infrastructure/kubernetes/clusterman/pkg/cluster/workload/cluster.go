package workload

import (
	"context"

	"openmedia.io/clusterman/pkg/cluster"
)

// Represents a Cluster API managed Kubernetes cluster.
type Cluster struct {
	cluster.Cluster
}

func New(ctx context.Context) (*Cluster, error) {
	// TODO : Implement.

	return nil, nil
}
