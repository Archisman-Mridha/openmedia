local Tanka = import 'github.com/grafana/jsonnet-libs/tanka-util/main.libsonnet',
      Helm = Tanka.helm.new(std.thisFile);
local Kubernetes = import 'github.com/jsonnet-libs/k8s-libsonnet/1.32/main.libsonnet';
local Utils = import '../utils.libsonnet';
local CloudNativePG = import '../cloudnative-pg.libsonnet';

local app = 'openobserve';

// OpenObserve, also called O2, is a cloud-native observability platform that unifies logs,
// metrics, and traces into a single, powerful solution.
function(bucketName) {
  openobserve: Utils.withAppLabel(app, {
    namespace: Kubernetes.core.v1.namespace.new(app),

    installation: Helm.template(app, Utils.chartsDir(app, std.thisFile), {
      version: '0.80.3',

      namespace: app,
      createNamespace: false,

      values: {
        config: {
          ZO_S3_BUCKET_NAME: bucketName,
        },

        serviceAccount: {
          annotations: {
            // TODO : Assign an IAM role.
          },
        },

        externalSecret: {
          enabled: true,
          name: 'openobserve-auth-credentials',
        },

        postgres: { enabled: false },

        // OpenObserve uses Ingester nodes to receive ingest requests, to convert data into parquet
        // format and to store it in object storage. Ingesters store data temporarily in WAL before
        // transferring it to object storage.
        ingester: { persistence: { enabled: false } },

        // OpenObserve uses Querier nodes to query data. Queriers are fully stateless.
        // The queriers will cache parquet files in memory by default. Use the
        // ZO_MEMORY_CACHE_MAX_SIZE environment variable to configure how much memory a querier
        // uses for caching. By default, queriers use 50% of their available memory for caching.
        querier: { persistence: { enabled: false } },
        alertquerier: { persistence: { enabled: false } },

        // The AlertManager node runs the standard alert queries, reports jobs and sends
        // notifications.
        // We're not using this currently.
        alertmanager: { persistence: { enabled: false } },
      },
    }),

    metadataStore: CloudNativePG.newCluster(app, app),
  }),
}
