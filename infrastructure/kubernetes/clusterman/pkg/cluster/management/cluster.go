package management

import (
	"context"
	"fmt"
	"log/slog"

	k3dclient "github.com/k3d-io/k3d/v5/pkg/client"
	"github.com/k3d-io/k3d/v5/pkg/config"
	configtypes "github.com/k3d-io/k3d/v5/pkg/config/types"
	"github.com/k3d-io/k3d/v5/pkg/config/v1alpha5"
	"github.com/k3d-io/k3d/v5/pkg/runtimes"
	"github.com/k3d-io/k3d/v5/pkg/types"
	"github.com/samber/oops"
	"openmedia.io/clusterman/pkg/cluster"
)

const (
	clusterName      = "openmedia-management-cluster"
	clusterNodeImage = "rancher/k3s:v1.35.2-k3s1"
)

const dockerDSocketPath = "/var/run/docker.sock"

const nodeFilterServersSelector = "server:*"

/*
Represents a temporary local K3d managed Kubernetes cluster, used to bootstrap Cluster API managed
Kubernetes clusters.

K3d is a lightweight wrapper to run K3s (Rancher Lab’s minimal Kubernetes distribution) in docker.
*/
type Cluster struct {
	cluster.Cluster
}

func New(ctx context.Context) (*Cluster, error) {
	// Ensure that the management cluster is running.

	simpleConfig := v1alpha5.SimpleConfig{
		ObjectMeta: configtypes.ObjectMeta{
			Name: clusterName,
		},

		Image: clusterNodeImage,

		Servers: 1,
		Agents:  0,

		Registries: v1alpha5.SimpleConfigRegistries{
			Create: &v1alpha5.SimpleConfigRegistryCreateConfig{
				Name:  clusterName,
				Proxy: types.RegistryProxy{RemoteURL: "*"},
				Volumes: []string{
					fmt.Sprintf("%s:%s", dockerDSocketPath, dockerDSocketPath),
				},
			},
		},

		Options: v1alpha5.SimpleConfigOptions{
			K3sOptions: v1alpha5.SimpleConfigOptionsK3s{
				ExtraArgs: []v1alpha5.K3sArgWithNodeFilters{
					// Disable unnecessary components that come packaged with the K3s image.
					{Arg: "--disable=metrics-server", NodeFilters: []string{nodeFilterServersSelector}},
					{Arg: "--disable=traefik", NodeFilters: []string{nodeFilterServersSelector}},
					{Arg: "--disable=servicelb", NodeFilters: []string{nodeFilterServersSelector}},
					{Arg: "--disable=local-storage", NodeFilters: []string{nodeFilterServersSelector}},
					{Arg: "--disable-network-policy", NodeFilters: []string{nodeFilterServersSelector}},
				},
			},
		},
	}

	clusterConfig, err := config.TransformSimpleToClusterConfig(ctx, runtimes.Docker, simpleConfig, "")
	if err != nil {
		return nil, oops.Wrapf(err, "Failed transforming management cluster's Simple config")
	}

	err = config.ValidateClusterConfig(ctx, runtimes.Docker, *clusterConfig)
	if err != nil {
		return nil, oops.Wrapf(err, "Failed validating management cluster's K3d config")
	}

	err = k3dclient.ClusterRun(ctx, runtimes.Docker, clusterConfig)
	if err != nil {
		return nil, oops.Wrapf(err, "Failed running management cluster")
	}

	/**
	  NOTE : We have the KUBECONFIG environment variable set to the path of the ClusterMan managed
	         kubeconfig file. k3dclient.Run updates that kubeconfig file.
	*/

	slog.Info("Running management cluster")

	context := fmt.Sprintf("k3d-%s", clusterName)

	cluster := &Cluster{
		Cluster: *cluster.New(context),
	}
	return cluster, nil
}

func (c *Cluster) Destroy(ctx context.Context) error {
	err := k3dclient.ClusterDelete(ctx,
		runtimes.Docker,
		&types.Cluster{Name: clusterName},
		types.ClusterDeleteOpts{},
	)
	if err != nil {
		return oops.Wrapf(err, "Failed deleting management cluster")
	}

	return nil
}
