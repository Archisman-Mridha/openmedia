local Tanka = import 'github.com/grafana/jsonnet-libs/tanka-util/main.libsonnet',
      Helm = Tanka.helm.new(std.thisFile);
local Kubernetes = import 'github.com/jsonnet-libs/k8s-libsonnet/1.32/main.libsonnet';
local Utils = import '../utils.libsonnet';

local app = 'node-problem-detector';

/*
  There are tons of node problems that could possibly affect the pods running on the node, such as:

    (1) Infrastructure daemon issues: ntp service down.

    (2) Hardware issues: Bad CPU, memory or disk.

    (3) Kernel issues: Kernel deadlock, corrupted file system.

    (4) Container runtime issues: Unresponsive runtime daemon.

    ...

  Currently, these problems are invisible to the upstream layers in the cluster management stack,
  so Kubernetes will continue scheduling pods to the bad nodes.

  To solve this problem, we introduced this new daemon node-problem-detector to collect node
  problems from various daemons and make them visible to the upstream layers. Once upstream layers
  have visibility to those problems, we can discuss the remedy system.

  node-problem-detector uses Event and NodeCondition to report problems to apiserver.

    - NodeCondition: Permanent problem that makes the node unavailable for pods should be reported
                     as NodeCondition.

    - Event: Temporary problem that has limited impact on pod but is informative should be reported
             as Event.

  REFER : https://github.com/kubernetes/node-problem-detector.
*/
{
  nodeProblemDetector: Utils.withAppLabel(app, {
    namespace: Kubernetes.core.v1.namespace.new(app),

    installation: Helm.template(app, Utils.chartsDir(app, std.thisFile), {
      version: '2.4.1',

      namespace: app,
      createNamespace: false,

      values: {
        metrics: {
          enabled: true,
          serviceMonitor: { enabled: true },
          prometheusRule: { enabled: true },
        },
      },
    }),
  }),
}
