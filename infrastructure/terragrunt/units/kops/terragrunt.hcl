include "root" {
  path = find_in_parent_folders("root.hcl")
}

terraform {
  source = "${find_in_parent_folders("modules")}//kops"
}

inputs = {
  creator_ssh_public_key = values.creator_ssh_public_key
}
