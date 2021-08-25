terraform {
  backend "s3" {
    key    = "terraform/tf-talk-approvals.tfstate"
    bucket = "tf-talk-mgmt"
    region = "ap-southeast-2"
  }
}
