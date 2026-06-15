include "root" {
  path = find_in_parent_folders("root.hcl")
}

terraform {
  source = "${find_in_parent_folders("modules")}//openobserve-store"
}

inputs = {
  environment = values.environment
}
