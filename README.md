## aws-ecs-fargate-deployer

This repo contains a Bash deploy script and CloudFormation templates for deploying a Docker image to AWS ECS (Elastic 
Container Service) using the serverless Fargate launch type.

The CloudFormation templates are adapted from the [AWS Labs ECS templates](https://github.com/awslabs/aws-cloudformation-templates/tree/master/aws/services/ECS).

Natively the templates already accomplish these tasks:

* They create a ECS cluster, network infrastructure and a public-facing application load-balancer.
* They create a ECS service within the cluster using the Fargate serverless launch type and a task definition 
with Docker containers attached to the load-balancer.

The templates have been adapted to make them more production-ready by:

* Supporting HTTPS (using an AWS Certificate Manager SSL certificate)
* Redirecting HTTP requests to HTTPS
* Setting up a CloudWatch log group for the comtainers to log to

In addition, the deploy script

* Creates a ECR (Elastic Container Registry) repo
* Deploys the docker image as necessary to the repo
* Passes an environment to the containers
* Uses Route 53 to create the subdomain of your choice pointing to the load balancer

Altogether, given some code to deploy (a very simple Node Express HTTP server app is provided), and the prerequisites listed 
below, the deployment script enables you to deploy it to `https://{your-sub-domain}.{your-domain}` with redirection of 
HTTP to HTTPS, an environment for your app (in the supplied example git tag, branch, and commit information and a 
'platform' variable) and CloudWatch logging for your app.

### Prerequsisites

* A domain with a hosted-zone record in AWS Route 53
* A SSL certificate for that domain in the AWS Certificate Manager
* The AWS command line interface `aws` installed and suitably set up with credentials for your AWS account
* `docker` installed
* `git` installed
* `jq` installed (`jq` is a very useful command-line tool for manipulating JSON. See https://stedolan.github.io/jq.)


 