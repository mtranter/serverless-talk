import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { dynamoApprovalsRepo } from './approvals-repo';
import { routes } from './approvals-routes';
import { ApprovalsService, TalkId } from './approvals-service';

const dynamoClient = new DynamoDB({
  endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
  sslEnabled: false,
  region: 'local',
  credentials: {
    accessKeyId: '1',
    secretAccessKey: '2',
  },
});

const testHandler =
  (h: APIGatewayProxyHandler) =>
  (event: Partial<APIGatewayProxyEvent>): Promise<APIGatewayProxyResult> =>
    h(event as any as APIGatewayProxyEvent, null as any, null as any) as any;

describe('Questions Routes', () => {
  const repo = dynamoApprovalsRepo('Approvals', 'ApprovalsByDate', dynamoClient);
  const sut = testHandler(routes(ApprovalsService(repo), []));
  describe('List unapproved questions', async () => {
    const testMsg = {
      id: '1',
      talkId: TalkId,
      text: 'Question 1',
      username: 'jsmith',
      createDateIso: new Date().toISOString(),
    };
    it('should return 200 status and list of results', async () => {
      await repo.saveUnapprovedQuestion(testMsg);
      const result = await sut({
        path: '/approvals/questions/unapproved',
        httpMethod: 'get',
      });
      expect(result.statusCode).toEqual(200);
      expect(JSON.parse(result.body)).toEqual([testMsg]);
    });
  });

  describe('List approved questions', async () => {
    const testMsg = {
      id: '1',
      talkId: TalkId,
      text: 'Question 1',
      username: 'jsmith',
      createDateIso: new Date().toISOString(),
    };
    it('should return 200 status and list of results', async () => {
      await repo.saveApprovedQuestion(testMsg);
      const result = await sut({
        path: '/approvals/questions/approved',
        httpMethod: 'get',
      });
      expect(result.statusCode).toEqual(200);
      expect(JSON.parse(result.body)).toEqual([testMsg]);
    });
  });
  describe('E2E Approval flow', () => {
    const testMsg = {
      id: '1',
      talkId: TalkId,
      text: 'Question 1',
      username: 'jsmith',
      createDateIso: new Date().toISOString(),
    };
    it('should return 200 status and list of results', async () => {
      await repo.saveUnapprovedQuestion(testMsg);
      const resulApprovedResult = await sut({
        path: '/approvals/questions/approved',
        httpMethod: 'get',
      });

      expect(resulApprovedResult.statusCode).toEqual(200);
      expect(JSON.parse(resulApprovedResult.body)).toEqual([]);

      const unapprovedResult = await sut({
        path: '/approvals/questions/unapproved',
        httpMethod: 'get',
      });
      expect(unapprovedResult.statusCode).toEqual(200);
      expect(JSON.parse(unapprovedResult.body)).toEqual([testMsg]);

      const approveResult = await sut({
        httpMethod: 'put',
        path: `/approvals/questions/${testMsg.id}/approve`,
        pathParameters: {
          questionId: testMsg.id,
        },
      });
      expect(approveResult.statusCode).toEqual(200);
      const resulApprovedResult2 = await sut({
        path: '/approvals/questions/approved',
        httpMethod: 'get',
      });

      expect(resulApprovedResult2.statusCode).toEqual(200);
      expect(JSON.parse(resulApprovedResult2.body)).toEqual([testMsg]);
    });
  });
});
