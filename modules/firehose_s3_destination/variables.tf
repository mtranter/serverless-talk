variable "delivery_stream_name" {
  type = string
}

variable "bucket_arn" {
  type = string
}

variable "bucket_prefix" {
  type = string
  default = ""
}

variable "kms_key_arn" {
  type = string
}