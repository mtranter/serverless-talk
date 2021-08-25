# output "website_bucket" {
#     value = module.website.s3_bucket_name
# }

output "region" {
    value = var.region
}

output "public_api_gw" {
    value = module.api_gw
}

output "website_domain_name" {
    value = local.website_host
}

output "api_domain_name" {
    value = aws_api_gateway_domain_name.api_domain.domain_name
}

output "api_gateway" {
  value = module.api_gw.api_gateway
}

output "event_bus" {
    value = module.app_event_bus
}