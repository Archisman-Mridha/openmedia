local CloudNativePG = import './cloudnative-pg.libsonnet';
local Dragonfly = import './dragonfly.libsonnet';
local Strimzi = import './strimzi.libsonnet';
local Utils = import './utils.libsonnet';

local app = 'openmedia';

local postgresqlCluster = CloudNativePG.newCluster(app, app) + {
  cluster+: {
    spec+: {
      bootstrap: {
        initdb: {
          database: app,
          owner: 'openmedia-backend',

          // Thanks to the convention over configuration paradigm, you can let the operator choose
          // a default database name (app) and a default application user name (same as the
          // database name), as well as randomly generate a secure password for both the superuser
          // and the application user in PostgreSQL.
        },
      },
    },
  },
};

local kafkaCluster =
  local controllerVolumeSize = '1Gi',
        brokerVolumeSize = '5Gi';

  local topics = [
    'events.users.created',
    'events.profiles.created',
  ];

  local consumerGroups = [
    {
      local consumerGroupName = 'openmedia-backend',

      name: consumerGroupName,
      users: [
        {
          name: 'openmedia-backend',
          acls: [
            {
              resource: {
                type: 'topic',
                name: topic,
                patternType: 'literal',
              },
              operations: ['Describe', 'Read', 'Write'],
              host: '*',
            }
            for topic in topics
          ],
        },
      ],
    },
  ];

  Strimzi.newCluster(app, app, controllerVolumeSize, brokerVolumeSize, topics, consumerGroups);

local dragonflyCluster = Dragonfly.newCluster(app, app);

{
  openmedia: Utils.withAppLabel(app, {
    postgresqlCluster: postgresqlCluster,

    kafkaCluster: kafkaCluster,

    dragonflyCluster: dragonflyCluster,

    meilisearchCluster: {},

    backend: {},
  }),
}
