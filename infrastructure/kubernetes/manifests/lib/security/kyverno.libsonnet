local Tanka = import 'github.com/grafana/jsonnet-libs/tanka-util/main.libsonnet',
      Helm = Tanka.helm.new(std.thisFile);
local Kubernetes = import 'github.com/jsonnet-libs/k8s-libsonnet/1.32/main.libsonnet';
local Utils = import './utils.libsonnet';

local app = 'kyverno';

// Kyverno (Greek for “govern”) is a cloud native policy engine. It was originally built for
// Kubernetes and now can also be used outside of Kubernetes clusters as a unified policy language.
{
  kyverno: Utils.withAppLabel(app, {
    namespace: Kubernetes.core.v1.namespace.new(app),

    installation: Helm.template(app, Utils.chartsDir(app, std.thisFile), {
      version: '3.8.1',

      namespace: app,
      createNamespace: false,

      values: {
        // Kyverno configures its resource webhooks by default (but configurable) in fail closed
        // mode. This means if the API server cannot reach Kyverno in its attempt to send an
        // AdmissionReview request for a resource that matches a policy, the request will fail.
        // Care must therefore be taken to ensure that Kyverno is always available or else
        // configured appropriately to exclude certain key Namespaces, specifically that of
        // Kyverno’s, to ensure it can receive those API requests. There is a tradeoff between
        // security by default and operability regardless of which option is chosen.
        //
        // We've decided to go the 'security by default' way. Upon encountering some crtical issue,
        // we can just delete the admission and mutation webhooks as an immediate solution.

        admissionController: {
          replicas: 2,
          metricsService: { create: true },
        },
        backgroundController: {
          replicas: 2,
          metricsService: { create: true },
        },
        cleanupController: {
          replicas: 2,
          metricsService: { create: true },
        },
        reportsController: {
          replicas: 2,
          metricsService: { create: true },
        },

        grafana: { enabled: true },
      },
    }),
  }),
}
