provider "aws" {
  region = "us-east-2"

  access_key = var.aws_credentials.access_key_id
  secret_key = var.aws_credentials.secret_access_key

  default_tags {
    tags = {
      project = "openmedia"
    }
  }
}
