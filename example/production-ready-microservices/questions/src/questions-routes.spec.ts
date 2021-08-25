import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { dynamoQuestionsRepo } from './quesions-repo';
import { eventBridgePubliser } from './questions-event-publisher';
import { routes } from './questions-routes';
import { QuestionsService } from './questions-service';

const dynamoClient = new DynamoDB({
  endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
  sslEnabled: false,
  region: 'local',
  credentials: {
    accessKeyId: '1',
    secretAccessKey: '2',
  },
});

const putEvents = jest.fn().mockReturnValue({
  promise: () => Promise.resolve(),
});

const testHandler =
  (h: APIGatewayProxyHandler) =>
  (event: Partial<APIGatewayProxyEvent>): Promise<APIGatewayProxyResult> =>
    h(event as any as APIGatewayProxyEvent, null as any, null as any) as any;

describe('Questions Routes', () => {
  const sut = testHandler(
    routes(
      QuestionsService(dynamoQuestionsRepo('Questions', dynamoClient), eventBridgePubliser({ putEvents }, 'TestBus')),
      []
    )
  );
  describe('POST a new question', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    const testQuestion = {
      text: 'What is the meaning of life?',
      username: 'Lunkwill',
    };
    const postPromise = () =>
      sut({
        path: '/questions',
        body: JSON.stringify(testQuestion),
        httpMethod: 'post',
      });
    it('should return 201 status', async () => {
      const result = await postPromise();
      expect(result.statusCode).toEqual(201);
    });
    it('should save the created question', async () => {
      await postPromise();
      const saved = await dynamoClient
        .query({
          TableName: 'Questions',
          KeyConditionExpression: '#h = :hash and begins_with(#r, :range)',
          ExpressionAttributeValues: {
            ':hash': { S: 'QUESTION_BY_USERNAME:ServerlessTalk-2021-08-26' },
            ':range': { S: 'username:Lunkwill:' },
          },
          ExpressionAttributeNames: {
            '#h': 'hash',
            '#r': 'range',
          },
        })
        .promise();
      expect(saved.Count).toEqual(1);
      const savedQuestion = saved.Items![0].question;
      expect(savedQuestion.M!.text.S).toEqual(testQuestion.text);
      expect(savedQuestion.M!.username.S).toEqual(testQuestion.username);
    });
    it('should publish a question created event', async () => {
      await postPromise();
      expect(putEvents).toHaveBeenCalledTimes(1);
      const event = putEvents.mock.calls[0][0];
      const entry = JSON.parse(event.Entries[0].Detail);
      expect(entry).toMatchObject(testQuestion);
    });
  });
  describe('get user questions', () => {
    const fetchResult = () =>
      sut({
        path: '/questions/jsmith',
        httpMethod: 'get',
      });
    it('should return 200 and a list of questions for valid request', async () => {
      const result = await fetchResult();
      expect(result.statusCode).toEqual(200);
      expect(JSON.parse(result.body).length).toEqual(2);
    });
  });
});
