/*
  unit "backup_store" {
    source = "${find_in_parent_folders("units")}/backup-store"
    path   = "backup-store"
    values = {
      environment = values.environment
    }
  }
*/

unit "openobserve_store" {
  source = "${find_in_parent_folders("units")}/openobserve-store"
  path   = "openobserve-store"
  values = {
    environment = values.environment
  }
}
