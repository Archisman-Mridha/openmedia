local Tanka = import 'github.com/grafana/jsonnet-libs/tanka-util/main.libsonnet',
      Helm = Tanka.helm.new(std.thisFile);
local Kubernetes = import 'github.com/jsonnet-libs/k8s-libsonnet/1.32/main.libsonnet';
local Utils = import '../utils.libsonnet';

local app = 'alloy';

local lokiWrite = |||
  loki.write "default" {
    endpoint {
      url = "http://loki-gateway.loki.svc.cluster.local/loki/api/v1/push"
    }
  }
|||;

local newAlloy(name, spec) = {
  apiVersion: 'collectors.grafana.com/v1alpha1',
  kind: 'Alloy',
  metadata: { name: name, namespace: app },
  spec: spec,
};

{
  alloy: Utils.withAppLabel(app, {
    namespace: Kubernetes.core.v1.namespace.new(app),

    operator: Helm.template('alloy-operator', Utils.chartsDir('alloy-operator', std.thisFile), {
      version: '0.9.4',

      namespace: app,
      createNamespace: false,
    }),

    logs: newAlloy('alloy-logs', {
      controller: {
        type: 'daemonset',
        tolerations: [{ operator: 'Exists' }],
        volumes: {
          extra: [
            { name: 'run-log-journal', hostPath: { path: '/run/log/journal' } },
          ],
        },
      },

      alloy: {
        mounts: {
          varlog: true,
          extra: [
            { name: 'run-log-journal', mountPath: '/run/log/journal', readOnly: true },
          ],
        },

        resources: {
          requests: { cpu: '100m', memory: '256Mi' },
          limits: { memory: '2Gi' },
        },

        configMap: {
          content: |||
            discovery.kubernetes "pods" {
              role = "pod"

              selectors {
                role  = "pod"
                field = "spec.nodeName=" + sys.env("HOSTNAME")
              }
            }

            discovery.relabel "pod_logs" {
              targets = discovery.kubernetes.pods.targets

              rule {
                source_labels = ["__meta_kubernetes_namespace"]
                target_label  = "namespace"
              }

              rule {
                source_labels = ["__meta_kubernetes_pod_name"]
                target_label  = "pod"
              }

              rule {
                source_labels = ["__meta_kubernetes_pod_container_name"]
                target_label  = "container"
              }

              rule {
                source_labels = ["__meta_kubernetes_pod_node_name"]
                target_label  = "node"
              }

              rule {
                source_labels = ["__meta_kubernetes_namespace", "__meta_kubernetes_pod_container_name"]
                separator     = "/"
                target_label  = "job"
              }

              rule {
                source_labels = ["__meta_kubernetes_pod_uid", "__meta_kubernetes_pod_container_name"]
                separator     = "/"
                replacement   = "/var/log/pods/*$1/*.log"
                target_label  = "__path__"
              }
            }

            local.file_match "pod_logs" {
              path_targets = discovery.relabel.pod_logs.output
            }

            loki.source.file "pod_logs" {
              targets       = local.file_match.pod_logs.targets
              tail_from_end = true
              forward_to    = [loki.process.pod_logs.receiver]
            }

            loki.process "pod_logs" {
              stage.cri {}

              stage.label_drop {
                values = ["filename"]
              }

              forward_to = [loki.write.default.receiver]
            }

            loki.relabel "journal" {
              forward_to = []

              rule {
                source_labels = ["__journal__systemd_unit"]
                target_label  = "unit"
              }

              rule {
                source_labels = ["__journal__hostname"]
                target_label  = "node"
              }

              rule {
                source_labels = ["__journal_priority_keyword"]
                target_label  = "level"
              }
            }

            loki.source.journal "journal" {
              relabel_rules = loki.relabel.journal.rules
              labels        = { job = "integrations/kubernetes/journal" }
              forward_to    = [loki.write.default.receiver]
            }
          ||| + lokiWrite,
        },
      },
    }),

    // Kubernetes events are cluster-wide, so they are collected by a single instance, to avoid
    // duplicates.
    events: newAlloy('alloy-events', {
      controller: {
        type: 'deployment',
        replicas: 1,
      },

      alloy: {
        configMap: {
          content: |||
            loki.source.kubernetes_events "events" {
              job_name   = "integrations/kubernetes/eventhandler"
              log_format = "logfmt"
              forward_to = [loki.write.default.receiver]
            }
          ||| + lokiWrite,
        },
      },
    }),
  }),
}
