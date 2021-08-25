provider "aws" {
  region = "us-east-1"
  alias  = "us"
}

provider "aws" {
  region = var.region
}