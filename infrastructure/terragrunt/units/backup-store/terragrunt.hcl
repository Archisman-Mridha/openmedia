include "root" {
  path = find_in_parent_folders("root.hcl")
}

terraform {
  source = "${find_in_parent_folders("modules")}//backup-store"
}

inputs = {
  environment = values.environment
}
