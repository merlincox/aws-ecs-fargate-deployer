## aws-ecs-fargate-deployer

This repo contains a Bash deploy script and CloudFormation templates for deploying a Docker image to AWS ECS (Elastic 
Container Service) using the serverless Fargate launch type.

The application which is deployed is a example React service side rendered (SSR) single page app (SPA).

### AWS deployment

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

### The application

The application is a simple React/Express single-page application which demonstrates server-side rendering.

It also demonstrates a method of passing the ECS execution environment to React code running in the client.

The application can be run locally using `local-dev.sh` (requires `node`, `npm install`, `npm run build-dev`).

It can also be run in a local docker container using `docker.sh`.

The app demonstrates simple API integration (currently hard-coded for api-test.merlincox.uk).

### Prerequsisites for the deployment

* A domain with a hosted-zone record in AWS Route 53
* A SSL certificate for that domain in the AWS Certificate Manager
* The AWS command line interface `aws` installed and suitably set up with credentials for your AWS account
* `docker` installed
* `git` installed
* `jq` installed (`jq` is a very useful command-line tool for manipulating JSON. See https://stedolan.github.io/jq.)

## Additional prerequisites for running the application locally

*`node` installed

 