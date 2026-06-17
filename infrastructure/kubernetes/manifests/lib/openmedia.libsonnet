local Dragonfly = import './dragonfly.libsonnet';
local Utils = import './utils.libsonnet';

local app = 'openmedia';

local dragonflyCluster = Dragonfly.newCluster(app, app);

{
  openmedia: Utils.withAppLabel(app, {
    dragonflyCluster: dragonflyCluster,

    meilisearchCluster: {},

    backend: {},
  }),
}
