data "terraform_remote_state" "infra" {
  backend = "s3"
  config = {
    key    = "terraform/tf-talk-infra.tfstate"
    bucket = "tf-talk-mgmt"
    region = "ap-southeast-2"
  }
}