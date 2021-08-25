# module "website" {
#   source                 = "chgangaraju/cloudfront-s3-website/aws"
#   version                = "1.2.3"
#   hosted_zone            = var.parent_domain
#   domain_name            = local.website_host
#   acm_certificate_domain = "*.${var.parent_domain}"
# }
