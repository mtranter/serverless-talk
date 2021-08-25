locals {
  function_name = "basic_api_lambda"
}

provider "aws" {
  region = "ap-southeast-2"
}

data "aws_caller_identity" "me" {}

data "aws_region" "here" {}

data "archive_file" "source" {
  source_file = "${path.module}/index.js"
  output_path = "${path.module}/src.zip"
  type = "zip"
}

resource "aws_iam_role" "iam_for_lambda" {
  name = "${local.function_name}ExecutionRole"
  assume_role_policy = <<-EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_lambda_function" "lambda" {
  function_name = local.function_name
  handler = "index.handler"
  role = aws_iam_role.iam_for_lambda.arn
  runtime = "nodejs14.x"
  filename = data.archive_file.source.output_path
  source_code_hash = data.archive_file.source.output_base64sha256
  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.table.name
      TOPIC_ARN = aws_sns_topic.events.arn
    }
  }
}


resource "aws_dynamodb_table" "table" {
  hash_key = "HASH"
  name = local.function_name
  billing_mode = "PAY_PER_REQUEST"
  attribute {
    name = "HASH"
    type = "S"
  }
}

resource "aws_iam_role_policy" "can_dynamo" {
  role = aws_iam_role.iam_for_lambda.id
  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "DynamoDBTableAccess",
            "Effect": "Allow",
            "Action": [
                "dynamodb:BatchGetItem",
                "dynamodb:BatchWriteItem",
                "dynamodb:ConditionCheckItem",
                "dynamodb:PutItem",
                "dynamodb:DescribeTable",
                "dynamodb:DeleteItem",
                "dynamodb:GetItem",
                "dynamodb:Scan",
                "dynamodb:Query",
                "dynamodb:UpdateItem"
            ],
            "Resource": "${aws_dynamodb_table.table.arn}"
        }
    ]
}
EOF
}

resource "aws_sns_topic" "events" {
  name = "test_events"
}


resource "aws_iam_role_policy" "can_sns" {
  role = aws_iam_role.iam_for_lambda.id
  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "CanAccessSns",
            "Effect": "Allow",
            "Action": "sns:Publish",
            "Resource": "${aws_sns_topic.events.arn}"
        }
    ]
}
EOF
}

resource "aws_api_gateway_rest_api" "gateway" {
  name = local.function_name
}

resource "aws_api_gateway_resource" "hello_world" {
  parent_id = aws_api_gateway_rest_api.gateway.root_resource_id
  path_part = "hello-world"
  rest_api_id = aws_api_gateway_rest_api.gateway.id
}

resource "aws_api_gateway_method" "get_method" {
  authorization = "NONE"
  http_method = "GET"
  resource_id = aws_api_gateway_resource.hello_world.id
  rest_api_id = aws_api_gateway_rest_api.gateway.id
}

resource "aws_api_gateway_integration" "get_lambda" {
  http_method = aws_api_gateway_method.get_method.http_method
  resource_id = aws_api_gateway_resource.hello_world.id
  rest_api_id = aws_api_gateway_rest_api.gateway.id
  type = "AWS_PROXY"
  integration_http_method = "POST"
  uri = aws_lambda_function.lambda.invoke_arn
}

resource "aws_lambda_permission" "apigw_lambda" {
  statement_id = "AllowExecutionFromAPIGateway"
  action = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda.function_name
  principal = "apigateway.amazonaws.com"

  source_arn = "arn:aws:execute-api:${data.aws_region.here.name}:${data.aws_caller_identity.me.account_id}:${aws_api_gateway_rest_api.gateway.id}/*/${aws_api_gateway_method.get_method.http_method}${aws_api_gateway_resource.hello_world.path}"
}

resource "aws_api_gateway_deployment" "deploy" {
  rest_api_id = aws_api_gateway_rest_api.gateway.id
  depends_on = [
    aws_api_gateway_method.get_method,
    aws_api_gateway_integration.get_lambda,
    aws_api_gateway_resource.hello_world]
}

resource "aws_api_gateway_stage" "stage" {
  deployment_id = aws_api_gateway_deployment.deploy.id
  rest_api_id = aws_api_gateway_rest_api.gateway.id
  stage_name = "prod"
}

output "url" {
  value = "${aws_api_gateway_stage.stage.invoke_url}${aws_api_gateway_resource.hello_world.path}"
}