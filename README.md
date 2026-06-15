# OpenMedia

## TODOs

- [ ] Expire `consumer feed`s after 10 days, using `CockroachDB`'s `row level TTL` feature.

- [ ] Shift from `sequential integer ID`s to `UUID`s, as [recommended by `CockroachDB`](https://www.cockroachlabs.com/docs/stable/create-sequence).

- [ ] Automated Backup and Disaster recovery.

## Wishlist

- [ ] Use `HashiCorp Vault` (or `Infisical`) and `External Secrets Operator (ESO)` to periodically rotate all secrets.

- [ ] Use `Harbor` to cache all container images in the cluster.

- [ ] Replace `KOps` with `ClusterAPI (CAPI)` to provision a Kubernetes cluster.

- [ ] Use `Kyverno` to generate `LimitRange` and `ResourceQuota` per namespace.

- [ ] Replace `Terraform` with `CrossPlane` to manage all infrastructure outside Kubernetes.

- [ ] Use `Gateway Endpoint` to access `S3` from a Kubernetes cluster's `VPC`.

- [ ] Replace `Kube2iam` with `IAM Roles for Service Accounts (IRSA)`.

- [ ] Use a `VPN` (like `NetBird`) to get the Kubernetes API server LB off the internet.

- [ ] Use `KeycloakX` for `Single Sign On (SSO)`. 

- [ ] Write a custom `manager` for updating Helm chart versions in `chartfile.yaml` file of a `Grafana Tanka` project.
