unit "kops" {
  source = "${find_in_parent_folders("units")}/kops"
  path   = "kops"
  values = {
    creator_ssh_public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDRyB8/MmNLEN5IBmowonvliOhuIxqIh4vsLVe76XyEhL3ePA5pI0gC4Vbe8vspNZkV2uwCBR2S2E9gOIdGBNWFoxJCZpHd0XWwnaCEYihKCNumRgVvXhih/fNzgFiB3A3XoXGffegv4tA04fYxN9Qe8x6YdjXOthSED4ngesVx6/bEWHpXzE6mbsc1M3KyzBtVqZuv8ITQjybZ6GSy+2XcZCH8Z8mkBOpJxY1vqMqMl/7+7QnUvJESt3REg8xWTOb1jWamsgvbkvmAvNmcSWm8bBKx9AF4rfMx4UKNwyHmflYmcFlxeVm7noeyBiXe0OHNrmJYqvyRxmBbJo83RW37pSFBZXmWcz5jHoEBJ0s3ZOWKazHaDx4xx0cm5yE1XmyQXJf+l7Dqa2WcG87MCqmF9THwEd+8bC2x0CrBw5L7Ef93RxyBn1DaNH6LsZIPZ6PGK2oTZ98BAWVAavql6RCE8TYNmToU8JNiq5OydkgDDXk7JQBS7I63d3yzajved+0= archismanmridha@Archismans-MacBook-Air.local"
  }
}

stack "staging" {
  source = "${find_in_parent_folders("stacks")}/environment"
  path   = "staging"
  values = {
    environment = "staging"
  }
}
