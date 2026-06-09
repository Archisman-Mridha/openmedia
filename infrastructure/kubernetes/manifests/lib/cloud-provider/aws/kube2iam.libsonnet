// Provide IAM credentials to containers running inside a kubernetes cluster based on annotations.
//
// The problem is that in a multi-tenanted containers based world, multiple containers will be
// sharing the underlying nodes. Given containers will share the same underlying nodes, providing
// access to AWS resources via IAM roles would mean that one needs to create an IAM role which is a
// union of all IAM roles. This is not acceptable from a security perspective.
//
// The solution is to redirect the traffic that is going to the ec2 metadata API for docker
// containers to a container running on each instance, make a call to the AWS API to retrieve
// temporary credentials and return these to the caller. Other calls will be proxied to the EC2
// metadata API. This container will need to run with host networking enabled so that it can call
// the EC2 metadata API itself.
{}
