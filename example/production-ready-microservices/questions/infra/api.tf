
module "public_api" {
  source = "./../../../..//modules/api"
  api = {
    create-question = {
      path = "/questions"
      methods = [
        "POST"]
      enable_cors   = true
    }
  }
  api_gateway_name = data.terraform_remote_state.infra.outputs.api_gateway.name
}

module "api_handler" {
  source = "./../../../..//services/lambda"
  filename      = "${path.module}/../package/source.zip"
  layers_source = {
    dependencies = "${path.module}/../package/layer.zip"
  }
  service_name = "QuestionsService"
  function_name = "PublicApi"
  handler = "index.apiHandler"
  environment_vars = {
    CORS_ALLOWED_ORIGINS = "*"
    QUESTIONS_TABLE = module.questions_table.table.name
    EVENT_BUS_NAME = data.terraform_remote_state.infra.outputs.event_bus.bus.name
  }
  triggers = {
    api = module.public_api.api
  }
  give_access_to = [
    module.questions_table.table.arn
  ]
}

module "questions_published_events" {
  source     = "./../../../..//services/analytics_enabled_stream"
  publisher_role_id = module.api_handler.function_execution_role.id
  event_bus_arn = data.terraform_remote_state.infra.outputs.event_bus.bus.arn
  event_source_name = "com.mtranter.serverless-talk.Questions"
  event_detail_type = "com.mtranter.serverless-talk.QuestionCreated"
  stream_name = "ServerlesTalkQuestions"
  bucket_name = "serverless-talk-data"
  bucket_region = "ap-southeast-2"
  bucket_path = "questions/"
}

module "questions_table" {
  source = "./../../../..//primitives/aws/dynamodb_table"
  hash_key = {
    name = "hash"
    type = "S"
  }
  range_key = {
    name = "range"
    type = "S"
  }
  name = "ServerlessTalk.Questions"
}