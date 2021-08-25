module "topic" {
  source = "./../../modules/event_bus_topic"
  event_bus_arn = var.event_bus_arn
  event_source_name = var.event_source_name
  event_type = var.event_detail_type
  role_id = var.publisher_role_id
}

module "bucket" {
  source = "./../../primitives/aws/private_s3_bucket"
  bucket = lower("${var.stream_name}-persistent-storage")
  lifecycle_transitions = []
  versioning_enabled = false
}

module "firehose" {
  source = "./../../modules/firehose_s3_destination"
  bucket_arn = module.bucket.bucket.arn
  delivery_stream_name = "${var.stream_name}_persistent_transport"
  kms_key_arn = module.bucket.kms_key.arn
  bucket_prefix = var.bucket_path
}

resource "aws_iam_role" "eventbridge_can_firehose" {
  name = "EventBridge${var.stream_name}CanFirehose"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "events.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "can_firehose" {
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "firehose:DescribeDeliveryStream",
        "firehose:ListDeliveryStreams",
        "firehose:ListTagsForDeliveryStream",
        "firehose:PutRecord",
        "firehose:PutRecordBatch"
      ],
      "Resource": [
        "${module.firehose.delivery_stream.arn}"
      ],
      "Effect": "Allow"
    }
  ]
}
EOF
  role = aws_iam_role.eventbridge_can_firehose.id
}

module "event_bridge_subscription" {
  source = "./../../primitives/aws/event_bridge_subscription"
  detail_types = [
    var.event_detail_type]
  event_bus_name = var.event_bus_arn
  subscription_name = var.stream_name
  target_arn = module.firehose.delivery_stream.arn
  access_to_target_role_arn = aws_iam_role.eventbridge_can_firehose.arn

}