resource "aws_s3_bucket" "openobserve_store" {
  bucket           = "openobserve.${var.environment}.openmedia"
  bucket_namespace = "global"
}

resource "aws_iam_role" "openobserve" {
  name = "openobserve"
  path = "/openmedia/${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:ListBucket",
          "s3:DeleteObject"
        ],
        Effect   = "Allow",
        Resource = "arn:aws:s3:::${aws_s3_bucket.openobserve_store.id}/*",
      }
    ]
  })

  tags = {
    environment = var.environment
  }
}
