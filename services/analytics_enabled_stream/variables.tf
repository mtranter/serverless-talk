variable "publisher_role_id" {
  type = string
}

variable "event_bus_arn" {
  type = string
}

variable "event_source_name" {
  type = string
  description = "e.g. com.acme.customer-service"
}

variable "event_detail_type" {
  type = string
  description = "com.acme.customers.CustomerEvent"
}


variable "stream_name" {
  type = string
}

variable "bucket_path" {
  type = string
  default = ""
}

variable "bucket_name" {
  type = string
}

variable "bucket_region" {
  type = string
}
