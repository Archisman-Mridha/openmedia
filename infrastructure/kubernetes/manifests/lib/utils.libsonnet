local Tanka = import 'github.com/grafana/jsonnet-libs/tanka-util/main.libsonnet';

{
  // Returns the path to the given Helm Chart, relative to the calling file.
  chartsDir(app, thisFile)::
    local callerFilePathParts = std.split(thisFile, '/');
    local utilsFilePathParts = std.split(std.thisFile, '/');

    local manifestsDirAbsoluteDepth = std.length(utilsFilePathParts) - 2;
    local callerDirAbsoluteDepth = std.length(callerFilePathParts) - 1;

    local callerDirRelativeDepth = callerDirAbsoluteDepth - manifestsDirAbsoluteDepth;

    local chartsDir =
      std.join('', ['../' for _ in std.range(0, callerDirRelativeDepth - 1)]) + 'charts/' + app;

    chartsDir,

  // Adds the app.tanka.grafana.com label to the given resource.
  withAppLabel(app, resources)::
    Tanka.k8s.patchLabels(resources, {
      'app.tanka.grafana.com': app,
    }),

  // You can visualize and manage Kubernetes objects with more tools than kubectl and the dashboard.
  // A common set of labels allows tools to work interoperably, describing objects in a common
  // manner that all tools can understand.
  // In addition to supporting tooling, the recommended labels describe applications in a way that
  // can be queried.
  recommendedLabels(app, instance=app, version='', component=app, partOf=app):: (
    {
      metadata+: {
        labels+: {
          // The name of the application.
          'app.kubernetes.io/name': app,

          // A unique name identifying the instance of an application.
          'app.kubernetes.io/instance': instance,

          // The current version of the application.
          'app.kubernetes.io/version': version,

          // The component within the architecture.
          'app.kubernetes.io/component': component,

          // The name of a higher level application this one is part of.
          'app.kubernetes.io/part-of': partOf,
        },
      },
    }
  ),
}
