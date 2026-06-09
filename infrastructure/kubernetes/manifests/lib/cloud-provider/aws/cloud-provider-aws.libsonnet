local Tanka = import 'github.com/grafana/jsonnet-libs/tanka-util/main.libsonnet',
      Helm = Tanka.helm.new(std.thisFile);
local Utils = import '../../utils.libsonnet';

local namespace = 'aws';

/*
  // The AWS Cloud Controller Manager is the controller that is primarily responsible for creating
  // and updating AWS loadbalancers (classic and NLB) and node lifecycle management.
  local awsCloudControllerManager = function(clusterName)
    local app = 'aws-cloud-controller-manager';

    {
      ccm: Utils.withAppLabel(app, {
        installation: Helm.template(app, Utils.chartsDir(app, std.thisFile), {
          version: '0.0.11',

          namespace: namespace,
          createNamespace: false,

          values: {
            namespace: namespace,
            args: [
              '--cloud-provider=aws',
              '--cluster-name=' + clusterName,

              // Should CIDRs allocated by allocate-node-cidrs (enabled by default) be configured on
              // the cloud provider.
              '--configure-cloud-routes',

              // Use individual service account credentials for each controller.
              '--use-service-account-credentials',
            ],
          },
        }),
      }),
    };
*/

// The Amazon Elastic Block Store Container Storage Interface (CSI) Driver provides a CSI interface
// used by Container Orchestrators to manage the lifecycle of Amazon EBS volumes and snapshots.
local awsEBSCSIDriver =
  local app = 'aws-ebs-csi-driver';

  {
    csiDrivers: {
      ebs: Utils.withAppLabel(app, {
        installation: Helm.template(app, Utils.chartsDir(app, std.thisFile), {
          version: '2.60.1',

          namespace: namespace,
          createNamespace: false,

          values: {
            controller: {
              serviceAccount: {
                annotations: {
                  'eks.amazonaws.com/role-arn': 'arn:aws:iam::123412341234:role/ebs-csi-role',
                },
              },

              enableMetrics: true,
              serviceMonitor: { forceEnable: true },
            },
            node: {
              enableMetrics: true,
              serviceMonitor: { forceEnable: true },
            },
          },
        }),
      }),
    },
  };

function(clusterName)
  // Currently, being managed by KOps. And there is no way to disable that.
  // awsCloudControllerManager(clusterName) +
  awsEBSCSIDriver
