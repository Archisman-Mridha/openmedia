output "openobserve_role_arn" {
  description = "ARN of the IAM role to be used by OpenObserve"
  value       = aws_iam_role.openobserve.arn
}
