package cluster

import (
	"context"

	"github.com/samber/oops"
	"k8s.io/client-go/tools/clientcmd"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

// Represents a Kubernetes cluster.
type Cluster struct {
	// Context of this cluster in the ClusterMan owned kubeconfig file.
	context string

	cachedClient client.Client
}

func New(context string) *Cluster {
	return &Cluster{
		context: context,
	}
}

func (c *Cluster) Client(ctx context.Context) (client.Client, error) {
	// When we have cached the client, use it.
	if c.cachedClient != nil {
		return c.cachedClient, nil
	}

	// Load the cluster's kubeconfig.
	clientConfig, err := clientcmd.NewNonInteractiveDeferredLoadingClientConfig(
		clientcmd.NewDefaultClientConfigLoadingRules(),
		&clientcmd.ConfigOverrides{CurrentContext: c.context},
	).ClientConfig()
	if err != nil {
		return nil, oops.Wrapf(err, "Failed loading kubeconfig")
	}

	client, err := client.New(clientConfig, client.Options{})
	if err != nil {
		return nil, oops.Wrapf(err, "Failed creating Kubernetes client")
	}

	// Cache the client.
	c.cachedClient = client

	return client, nil
}
