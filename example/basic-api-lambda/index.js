const AWS = require("aws-sdk");

const dynamo = new AWS.DynamoDB();
const sns = new AWS.SNS();
const handler = async (e) => {
  const params = {
    ExpressionAttributeValues: {
      ":start": {
        N: "1",
      },
      ":incr": {
        N: "1",
      },
    },
    Key: {
      HASH: {
        S: "COUNTER_KEY",
      },
    },
    ReturnValues: "ALL_NEW",
    TableName: process.env.TABLE_NAME,
    UpdateExpression: "SET kounter = if_not_exists(kounter, :start) + :incr",
  };

  const result = await dynamo.updateItem(params).promise();
  await sns.publish({
    Message: JSON.stringify({
      count: result.Attributes.kounter.N,
      _eventType: "com.acme.CounterIncremented",
    }) /* required */,
    TopicArn: process.env.TOPIC_ARN,
  });
  return {
    statusCode: 200,
    body: `Hello. You are request #${result.Attributes.kounter.N}`,
  };
};

module.exports.handler = handler;
