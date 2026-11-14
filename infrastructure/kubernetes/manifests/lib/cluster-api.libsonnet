local Tanka = import 'github.com/grafana/jsonnet-libs/tanka-util/main.libsonnet',
      Helm = Tanka.helm.new(std.thisFile);
local Kubernetes = import 'github.com/jsonnet-libs/k8s-libsonnet/1.32/main.libsonnet';
local Utils = import './utils.libsonnet';

local app = 'cluster-api';

// Started by the Kubernetes Special Interest Group (SIG) Cluster Lifecycle, the Cluster API
// project uses Kubernetes-style APIs and patterns to automate cluster lifecycle management for
// platform operators. The supporting infrastructure, like virtual machines, networks, load
// balancers, and VPCs, as well as the Kubernetes cluster configuration are all defined in the same
// way that application developers operate deploying and managing their workloads. This enables
// consistent and repeatable cluster deployments across a wide variety of infrastructure
// environments.
{
  clusterAPI: Utils.withAppLabel(app, {
    namespace: Kubernetes.core.v1.namespace.new(app),

    operator: {
      installation: Helm.template(app, Utils.chartsDir(app, std.thisFile), {
        version: '0.30.0',

        namespace: app,
        createNamespace: false,

        values: {
          // A component responsible for providing the fundamental building blocks of the Cluster
          // API. It defines and implements the main Cluster API resources such as Clusters,
          // Machines, and MachineSets, and manages their lifecycle.
          core: {
            clusterAPI: {
              version: 'v1.14.4',
              namespace: app,
              createNamespace: false,
            },
          },

          /*
            A component responsible for turning a server into a Kubernetes node as well as for:

              (1) Generating the cluster certificates, if not otherwise specified
              (2) Initializing the control plane, and gating the creation of other nodes until it
                is complete
              (3) Joining control plane and worker nodes to the cluster
          */
          bootstrap: {
            kubeadm: {
              version: 'v1.14.4',
              namespace: app,
              createNamespace: false,
            },
          },

          // A component responsible for managing the control plane of a Kubernetes cluster.
          controlPlane: {
            kubeadm: {
              version: 'v1.14.4',
              namespace: app,
              createNamespace: false,
            },
          },
        },
      }),

      // A component responsible for the provisioning of infrastructure/computational resources
      // required by the Cluster or by Machines (e.g. VMs, networking, etc.). For example,
      // cloud Infrastructure Providers include AWS, Azure, and Google, and bare metal
      // Infrastructure Providers include VMware, MAAS, and metal3.io.
      infrastructureProvider: {
        aws: {
          apiVersion: 'operator.cluster.x-k8s.io/v1alpha2',
          kind: 'InfrastructureProvider',
          metadata: {
            name: 'aws',
            namespace: app,
          },
          spec: {
            version: 'v2.1.4',
            configSecret: {
              name: 'aws-credentials',
            },
          },
        },
      },

      cluster: {},
    },
  }),
}
