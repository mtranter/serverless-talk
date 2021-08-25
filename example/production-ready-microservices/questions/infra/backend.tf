terraform {
  backend "s3" {
    key    = "terraform/tf-talk-questions.tfstate"
    bucket = "tf-talk-mgmt"
    region = "ap-southeast-2"
  }
}
