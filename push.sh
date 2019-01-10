#!/usr/bin/env bash

usage()
{
    echo "Usage: $(basename $0) -d <domain> -s <subdomain_base> -a <app_name> [ -p <platform> ]" >&2
    echo "   where <domain> is a domain for which there is Route53 hosted zone;" >&2
    echo "   where <app_name> is an arbitrary application name used for naming resources;" >&2
    echo "   where <subdomain_base> and <platform> {default 'test') are used together to generate a subdomain name" >&2
    echo "     of the form <subdomain_base>-<platform> unless <platform> is 'live'" >&2
    echo "     in which case the subdomain will match <subdomain_base> exactly;" >&2
}

cd "$(dirname "$0")"

for cmd in "jq docker aws git"; do

    if [[ -z "$(which ${cmd})" ]]; then
        echo "${cmd} is required to run this script."  >&2
        exit 1
    fi

done

if [[ ! -z "$(git status --porcelain)" ]]; then
    echo "There are uncommitted changes in this git repo."  >&2
    exit 1
fi

while getopts ":d:s:a:p:r:" opt; do
    case "${opt}" in
        d)
            domain=${OPTARG}
            ;;
        s)
            subdomain_base=${OPTARG}
            ;;
        a)
            ecs_app_name=${OPTARG}
            ;;
        p)
            platform=${OPTARG}
            ;;
        *)
            usage
            exit 1
            ;;
    esac
done

if [[ -z "${domain}" ]] || [[ -z "${subdomain_base}" ]] || [[ -z "${ecs_app_name}" ]]; then
    usage
    exit 1
fi

if [[ -z "${platform}" ]]; then
    platform=test
fi

platform_regex="^(test|stage|live)$"

if [[ ! "${platform}" =~ $platform_regex ]]
then
    echo "Platform must live, test or stage"
    exit 1
fi

if [[ "${platform}" != "live" ]]; then
    subdomain=${subdomain_base}-${platform}
else
    subdomain=${subdomain_base}
fi

set -euo pipefail

git_tag="untagged"

if git describe --tags >/dev/null 2>/dev/null; then
   git_tag=$(git describe --tags)
fi

git_branch=$(git rev-parse --abbrev-ref HEAD)
git_commit=$(git rev-parse --short=16 HEAD)

domain_zone_id=$(aws route53 list-hosted-zones | jq -r ".HostedZones[] | select(.Name == \"${domain}.\")| .Id")

if [[ -z "${domain_zone_id}" ]]; then
    echo "No hosted-zone record was found for ${domain} domain" >&2
    exit 1
fi

custom_domain="${subdomain}.${domain}"

certificate_arn=$(aws acm list-certificates | jq -r ".CertificateSummaryList[] | select(.DomainName == \"${custom_domain}\") | .CertificateArn")

if [[ -z "${certificate_arn}" ]]; then
    certificate_arn=$(aws acm list-certificates | jq -r ".CertificateSummaryList[] | select(.DomainName == \"*.${domain}\") | .CertificateArn")

    if [[ -z "${certificate_arn}" ]]; then
        echo "No SSL certificate was found for ${custom_domain} or *.${domain} patterns" >&2
        exit 1
    fi
fi

cluster_yml=cf/cluster.yml
service_yml=cf/service.yml
route53_json=cf/route53.json

for file in ${cluster_yml} ${service_yml} ${route53_json}; do
    if [[ ! -f ${file} ]]; then
        echo "${file} not found"
        exit 1
    fi
done

tag_pattern="^v[0-9]+\.[0-9]+\.[0-9]+$"
if [[ $platform == live ]] ; then

    if [[ "${git_branch}" != "master" ]]; then

       echo "Live deployments must be on the master branch" >&2
       exit 1
    fi

    git fetch
    git_diff=$(git diff origin/master)

    if [[ ! -z "${git_diff}" ]]; then
        echo "Live deployments must be in sync with origin/master" >&2
        exit 1
    fi

    if [[ ! "${git_tag}" =~ ${tag_pattern} ]] ; then

        echo "Live deployments must be tagged with vN.N.N: ${git_tag} does not match" >&2
        exit 1
    fi

    read -p "About to deploy ${git_tag} to live. Confirm? :" -n 1 -r reply
    echo
    case "$reply" in
        y|Y ) echo "Proceeding with deployment";;
        * )   echo "Cancelling deployment" >&2
              exit 1
              ;;
    esac
fi

ecs_cluster=${ecs_app_name}-${subdomain}-cluster
ecs_platform_balancer=${ecs_app_name}-${subdomain}-balancer
ecs_platform_service=${ecs_app_name}-${subdomain}-service

cf_cluster_stack=${ecs_app_name}-${subdomain}-c
cf_service_stack=${ecs_app_name}-${subdomain}-s

if [[ ${#cf_cluster_stack} -gt 20 ]]; then
    echo  "Computed stack name ${cf_cluster_stack} is too long at ${#cf_cluster_stack} chars. Maximum 20" >&2
    exit 1
fi

ecr_login=$(aws ecr get-login --no-include-email)

if ecr_repo=$(aws ecr describe-repositories --repository-names ${ecs_app_name} | jq -r ".repositories[0].repositoryUri") 2>/dev/null; then
    echo "ECR repo ${ecs_app_name} found"
else
    echo "No such ECR repo as ${ecs_app_name}: creating one"

    ecr_repo=$(aws ecr create-repository --repository-name "${ecs_app_name}" | jq -r ".repository.repositoryUri")
fi

image_uri=${ecr_repo}:${git_commit}

$ecr_login

docker images  "${image_uri}"

if [[ ! -z "$(docker images --format "{{.Tag}}" "${image_uri}")" ]]; then
    echo "Docker image for ${git_commit} already pushed to ${ecr_repo}"
else

    docker build -t ${image_uri} .
    docker push ${image_uri}
fi

aws cloudformation deploy \
       --stack-name ${cf_cluster_stack} \
       --template-file "${cluster_yml}" \
       --capabilities CAPABILITY_IAM \
       --no-fail-on-empty-changeset \
       --parameter-overrides CertificateArn=${certificate_arn} \
         LoadBalancerName=${ecs_platform_balancer} ClusterName=${ecs_cluster}

aws cloudformation deploy \
       --template-file "${service_yml}" \
       --stack-name ${cf_service_stack} \
       --capabilities CAPABILITY_IAM \
       --no-fail-on-empty-changeset \
       --parameter-overrides ServiceName="${ecs_platform_service}" StackName=${cf_cluster_stack} \
         ImageUrl="${image_uri}" GitCommit=${git_commit} GitBranch=${git_branch} GitTag=${git_tag} Platform=${platform}

load_balancer_info=$(aws elbv2 describe-load-balancers | jq ".LoadBalancers[] | select(.LoadBalancerName == \"${ecs_platform_balancer}\")")

balancer_dns_name="dualstack.$(echo ${load_balancer_info} | jq -r ".DNSName")."

balancer_zone_id=$(echo ${load_balancer_info} | jq -r ".CanonicalHostedZoneId")

existing_r53=$(aws route53 list-resource-record-sets --hosted-zone-id ${domain_zone_id} | jq ".ResourceRecordSets[] | select(.Type == \"A\" and .AliasTarget.DNSName == \"${balancer_dns_name}\" and .AliasTarget.HostedZoneId == \"${balancer_zone_id}\")")

if [[ ! -z "${existing_r53}" ]]; then
    echo "Route 53 set-up is already correct"
    exit 0
fi

r53_change=$(cat "${route53_json}" | jq ".Changes[0].ResourceRecordSet.Name = \"${custom_domain}\" | .Changes[0].ResourceRecordSet.AliasTarget.DNSName = \"${balancer_dns_name}\" | .Changes[0].ResourceRecordSet.AliasTarget.HostedZoneId = \"${balancer_zone_id}\"")

aws route53 change-resource-record-sets --hosted-zone-id ${domain_zone_id} --change-batch "${r53_change}"

