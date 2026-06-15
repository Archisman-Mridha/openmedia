local /* clusterName = 'development.openmedia', */
      k8sServiceHost = 'k3d-development.openmedia-serverlb';

// For networking.
(import 'cilium.libsonnet')(k8sServiceHost)
