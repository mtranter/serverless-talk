terraform {
  backend "s3" {
    key    = "terraform/tf-talk-questions.tfstate"
    bucket = "serverless-talk-tf-state"
    region = "ap-southeast-2"
  }
}
