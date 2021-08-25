module.exports = {
  tables: [
    {
      TableName: `Approvals`,
      KeySchema: [
        { AttributeName: 'hash', KeyType: 'HASH' },
        { AttributeName: 'range', KeyType: 'RANGE' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'hash', AttributeType: 'S' },
        { AttributeName: 'range', AttributeType: 'S' },
        { AttributeName: 'lsiRange', AttributeType: 'S' },
      ],
      ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
      LocalSecondaryIndexes: [
        {
          IndexName: 'ApprovalsByDate',
          KeySchema: [
            {
              AttributeName: 'hash',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'lsiRange',
              KeyType: 'RANGE',
            },
          ],
          Projection: {
            ProjectionType: 'ALL',
          },
        },
      ],
    },
  ],
  basePort: 8000,
};
