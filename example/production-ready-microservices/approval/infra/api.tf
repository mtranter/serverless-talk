locals {
  lsi_by_date_name = "ApprovalsByDate"
}
module "api" {
  source = "./../../../..//modules/api"
  api = {
    approve-question = {
      path = "/approvals/questions/{questionId}/approve"
      methods = [
        "PUT"]
      enable_cors = true
    }
    get-unapproved-questions = {
      path = "/approvals/questions/approved"
      methods = [
        "GET"]
      enable_cors = true
    }
    get-approved-questions = {
      path = "/approvals/questions/unapproved"
      methods = [
        "GET"]
      enable_cors = true
    }
  }
  api_gateway_name = data.terraform_remote_state.infra.outputs.api_gateway.name
}


module "api_handler" {
  source = "./../../../..//services/lambda"
  filename = "${path.module}/../package/source.zip"
  layers_source = {
    dependencies = "${path.module}/../package/layer.zip"
  }
  service_name = "ApprovalsService"
  function_name = "PublicApi"
  handler = "index.apiHandler"
  environment_vars = {
    CORS_ALLOWED_ORIGINS = ""
    APPROVALS_TABLE = module.approvals_table.table.name
    APPROVALS_BY_DATE_INDEX_NAME = local.lsi_by_date_name
    EVENT_BUS_NAME = data.terraform_remote_state.infra.outputs.event_bus.bus.name
  }
  triggers = {
    api = module.api.api
  }
  give_access_to = [
    module.approvals_table.table.arn,
    "${module.approvals_table.table.arn}/index/*"
  ]
}

module "question_events_handler" {
  source = "./../../../..//services/lambda"
  filename = "${path.module}/../package/source.zip"
  layers_source = {
    dependencies = "${path.module}/../package/layer.zip"
  }
  service_name = "ApprovalsService"
  function_name = "QuestionEventHandler"
  handler = "index.questionCreatedHandler"
  environment_vars = {
    CORS_ALLOWED_ORIGINS = ""
    APPROVALS_TABLE = module.approvals_table.table.name
    APPROVALS_BY_DATE_INDEX_NAME = local.lsi_by_date_name
    EVENT_BUS_NAME = data.terraform_remote_state.infra.outputs.event_bus.bus.name
  }
  triggers = {
    eventbridge = {
      questions-created = {
        event_bus_name = data.terraform_remote_state.infra.outputs.event_bus.bus.name
        detail_types = [
          "com.mtranter.serverless-talk.QuestionCreated"]
      }
    }
  }
  give_access_to = [
    module.approvals_table.table.arn,
    "${module.approvals_table.table.arn}/index/*"
  ]
}


module "approvals_table" {
  source = "./../../../..//primitives/aws/dynamodb_table"
  hash_key = {
    name = "hash"
    type = "S"
  }
  range_key = {
    name = "range"
    type = "S"
  }
  local_secondary_indexes = [
    {
      name = local.lsi_by_date_name
      range_key = {
        name = "lsiRange"
        type = "S"
      }
    }]

  name = "ServerlessTalk.Approvals"
}