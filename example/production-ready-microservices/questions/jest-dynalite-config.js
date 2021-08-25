module.exports = {
    tables: [
        {
          TableName: `Questions`,
          KeySchema: [{ AttributeName: 'hash', KeyType: 'HASH' }, { AttributeName: 'range', KeyType: 'RANGE' }],
          AttributeDefinitions: [{ AttributeName: 'hash', AttributeType: 'S' }, { AttributeName: 'range', AttributeType: 'S' }],
          ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
          data: [{
            hash: 'ServerlessTalk-2021-08-26',
            range: `username:jsmith:timestamp:2021-08-25T00:00:00:check:V2hhdCBpcyB0aGUgbWVhbmluZyBvZiBsaWZlPwo=`,
            question: {
              text: 'What is the meaning of life?',
              username: 'jsmith'
            }
          },{
            hash: 'ServerlessTalk-2021-08-26',
            range: `username:jsmith:timestamp:2021-08-25T00:00:00:check:SXMgUCBlcXVhbCB0byBOUD8K`,
            question: {
              text: 'Is P equal to NP?',
              username: 'jsmith'
            }
          },{
            hash: 'ServerlessTalk-2021-08-26',
            range: `username:rjones:timestamp:2021-08-25T00:00:00:check:V2hhdCBpcyB0aGUgbWVhbmluZyBvZiBsaWZlPwo=`,
            question: {
              text: 'What is the meaning of lyff?',
              username: 'rjones'
            }
          }]
        },
      ],
    basePort: 8000,
  };