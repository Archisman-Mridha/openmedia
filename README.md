# OpenMedia

## Wishlist

- Use `HashiCorp Vault` (or `Infisical`) and `External Secrets Operator (ESO)` to periodically rotate all Kubernetes Secrets.

- Use `Harbor` to cache all container images in the cluster.

- Use `Gateway Endpoint` to access `S3` from a Kubernetes cluster's `VPC`.

- Replace `Terraform` with `CrossPlane` to manage all infrastructure outside Kubernetes.

- Replace `kOps` with `ClusterAPI (CAPI)` to provision a Kubernetes cluster.

- Use `Kyverno` to generate `LimitRange` and `ResourceQuota` per namespace.

- Use a `VPN` (like `NetBird`) to get the Kubernetes API server LB off the internet.

- Use `KeycloakX` for `Single Sign On (SSO)`. 

- Use `KEDA` for auto-scaling our microservices based on the number of messages in Redpanda topics.

- Write a custom `manager` for updating Helm chart versions in `chartfile.yaml` file of a `Grafana Tanka` project.

- Automated Backup and Disaster recovery.
