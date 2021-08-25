terraform {
  backend "s3" {
    key    = "terraform/tf-talk-infra.tfstate"
    bucket = "serverless-talk-tf-state"
    region = "ap-southeast-2"
  }
}
