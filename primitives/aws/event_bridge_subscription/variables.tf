variable "event_bus_name" {
  type = string
}

variable "subscription_name" {
  type = string
}

variable "detail_types" {
  type = list(string)
}

variable "target_arn" {
  type = string
}

variable "access_to_target_role_arn" {
  type = string
  default = null
}