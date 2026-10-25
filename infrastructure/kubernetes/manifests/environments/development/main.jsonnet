local clusterName = 'development.openmedia',
      k8sServiceHost = 'localhost',

      argoCDSourceRepo = 'https://github.com/Archisman-Mridha/openmedia';

// Networking and Ingress related.
(import 'networking/cilium.libsonnet')(k8sServiceHost)
