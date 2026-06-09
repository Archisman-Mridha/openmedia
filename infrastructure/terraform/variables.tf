variable "aws_credentials" {
  description = "AWS credentials"
  type = object({
    access_key_id     = string
    secret_access_key = string
  })
  sensitive = true
}

variable "creator_ssh_public_key" {
  description = "SSH public key of the creator"
  type        = string
}
