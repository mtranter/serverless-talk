
module "api_gw" {
  source             = "./../../..//modules/api_gateway"
  api_gw_name        = "terraform-talk-api"
  api_gw_description = "Public API GW for Terraform Talk API Demo"
  default_stage_name = "live"
}

data "aws_acm_certificate" "existing_cert" {
  domain   = "*.${var.hosted_zone}"
  provider = aws.us
}

data "aws_route53_zone" "zone" {
  name = "${var.hosted_zone}."
}

resource "aws_api_gateway_domain_name" "api_domain" {
  certificate_arn = data.aws_acm_certificate.existing_cert.arn
  domain_name     = "api.${var.hosted_zone}"
}

resource "aws_route53_record" "api_domain" {
  name    = aws_api_gateway_domain_name.api_domain.domain_name
  type    = "A"
  zone_id = data.aws_route53_zone.zone.zone_id

  alias {
    evaluate_target_health = true
    name                   = aws_api_gateway_domain_name.api_domain.cloudfront_domain_name
    zone_id                = aws_api_gateway_domain_name.api_domain.cloudfront_zone_id
  }
}

resource "aws_api_gateway_base_path_mapping" "api_domain_mapping" {
  api_id      = module.api_gw.api_gateway.id
  stage_name  = module.api_gw.default_stage.stage_name
  domain_name = aws_api_gateway_domain_name.api_domain.domain_name
}
