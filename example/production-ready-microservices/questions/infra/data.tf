data "terraform_remote_state" "infra" {
  backend = "s3"
  config = {
    key    = "terraform/tf-talk-infra.tfstate"
    bucket = "serverless-talk-tf-state"
    region = "ap-southeast-2"
  }
}