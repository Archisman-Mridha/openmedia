local Tanka = import 'github.com/grafana/jsonnet-libs/tanka-util/main.libsonnet',
      Helm = Tanka.helm.new(std.thisFile);
local Kubernetes = import 'github.com/jsonnet-libs/k8s-libsonnet/1.32/main.libsonnet';
local Utils = import '../utils.libsonnet';

local app = 'loki';

/*
  Loki is a horizontally-scalable, highly-available, multi-tenant log aggregation system inspired
  by Prometheus. Loki differs from Prometheus by focusing on logs instead of metrics, and
  collecting logs via push, instead of pull.

  Loki is designed to be very cost effective and highly scalable. Unlike other logging systems,
  Loki does not index the contents of the logs, but only indexes metadata about your logs as a set
  of labels for each log stream.

  A log stream is a set of logs which share the same labels. Labels help Loki to find a log stream
  within your data store, so having a quality set of labels is key to efficient query execution.

  Log data is then compressed and stored in chunks in an object store such as Amazon Simple Storage
  Service (S3) or Google Cloud Storage (GCS), or even, for development or proof of concept, on the
  filesystem. A small index and highly compressed chunks simplify the operation and significantly
  lower the cost of Loki.
*/
function(bucketName) {
  loki: Utils.withAppLabel(app, {
    namespace: Kubernetes.core.v1.namespace.new(app),

    installation: Helm.template(app, Utils.chartsDir(app, std.thisFile), {
      version: '21.2.3',

      namespace: app,
      createNamespace: false,

      values: {
        deploymentMode: 'Monolithic',

        loki: {
          auth_enabled: false,

          schemaConfig: {
            configs: [
              {
                from: '2026-11-01',
                store: 'tsdb',
                object_store: 's3',
                schema: 'v13',
                index: { prefix: 'index_', period: '24h' },
              },
            ],
          },

          storage: {
            type: 's3',
            bucketNames: { chunks: bucketName, ruler: bucketName },
            s3: {
              endpoint: 'https://s3.fr-par.scw.cloud',
              region: 'fr-par',
              accessKeyId: '${AWS_ACCESS_KEY_ID}',
              secretAccessKey: '${AWS_SECRET_ACCESS_KEY}',
            },
          },
        },

        defaults: {
          extraArgs: ['-config.expand-env=true'],
          extraEnvFrom: [{ secretRef: { name: 'loki-s3-credentials' } }],
        },

        singleBinary: {
          replicas: 3,
          persistence: { size: '10Gi' },
        },
        backend: { replicas: 0 },
        read: { replicas: 0 },
        write: { replicas: 0 },

        chunksCache: { allocatedMemory: 1024 },

        test: { enabled: false },
      },
    }),
  }),
}
