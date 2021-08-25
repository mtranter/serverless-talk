module "app_event_bus" {
  source = "./../../..//primitives/aws/event_bus"
  name   = "TerraformTalkEvents"
}
