terraform {
  backend "s3" {
    key    = "terraform/tf-talk-approvals.tfstate"
    bucket = "serverless-talk-tf-state"
    region = "ap-southeast-2"
  }
}
