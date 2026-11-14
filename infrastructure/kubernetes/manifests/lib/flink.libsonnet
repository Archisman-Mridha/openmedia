local Tanka = import 'github.com/grafana/jsonnet-libs/tanka-util/main.libsonnet',
      Helm = Tanka.helm.new(std.thisFile);
local Kubernetes = import 'github.com/jsonnet-libs/k8s-libsonnet/1.32/main.libsonnet';
local Utils = import './utils.libsonnet';

local app = 'flink';

local newDeployment = function(
  name,
  namespace,
  image,
  jarURI,
  entryClass,
  bucketName,
  s3CredentialsSecretName,
  env
                      ) {
  apiVersion: 'flink.apache.org/v1beta1',
  kind: 'FlinkDeployment',
  metadata: {
    name: name,
    namespace: namespace,
  },
  spec: {
    image: image,
    flinkVersion: 'v2_2',
    serviceAccount: 'flink',

    flinkConfiguration: {
      'taskmanager.numberOfTaskSlots': '2',

      'state.backend.type': 'rocksdb',
      'execution.checkpointing.incremental': 'true',
      'execution.checkpointing.dir': std.format('s3://%s/%s/checkpoints', [bucketName, name]),
      'execution.checkpointing.savepoint-dir': std.format('s3://%s/%s/savepoints', [bucketName, name]),

      'high-availability.type': 'kubernetes',
      'high-availability.storageDir': std.format('s3://%s/%s/ha', [bucketName, name]),

      's3.endpoint': 'https://s3.fr-par.scw.cloud',
      's3.path.style.access': 'true',
    },

    jobManager: {
      replicas: 1,
      resource: { cpu: 0.5, memory: '1024m' },
    },
    taskManager: {
      resource: { cpu: 1, memory: '2048m' },
    },

    podTemplate: {
      spec: {
        containers: [{
          name: 'flink-main-container',
          env: [
            { name: 'ENABLE_BUILT_IN_PLUGINS', value: 'flink-s3-fs-hadoop-2.2.1.jar' },
          ] + env,
          envFrom: [{ secretRef: { name: s3CredentialsSecretName } }],
        }],
      },
    },

    job: {
      jarURI: jarURI,
      entryClass: entryClass,
      parallelism: 2,
      upgradeMode: 'last-state',
      state: 'running',
    },
  },
};

{
  flink: Utils.withAppLabel(app, {
    namespace: Kubernetes.core.v1.namespace.new(app),

    operator: Helm.template(app, Utils.chartsDir('flink-kubernetes-operator', std.thisFile), {
      version: '1.16.1',

      namespace: app,
      createNamespace: false,
      nameFormat: '{{ print .kind "_" .metadata.namespace "_" .metadata.name | snakecase }}',

      values: {
        watchNamespaces: ['openmedia'],
      },
    }),
  }),

  newDeployment:: newDeployment,
}
