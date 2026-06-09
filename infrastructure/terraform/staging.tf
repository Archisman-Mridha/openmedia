module "backup_store_staging" {
  source = "./modules/backup-store"

  environment = "staging"
}

module "openobserve_store_staging" {
  source = "./modules/openobserve-store"

  environment = "staging"
}
