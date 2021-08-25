module "app_event_bus" {
  source = "github.com/mtranter/serverless-talk//primitives/aws/event_bus"
  name   = "TerraformTalkEvents"
}
