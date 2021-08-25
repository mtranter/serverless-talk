import { LambdaRouter } from 'ts-lambda-router';
import { ApprovalsService } from './approvals-service';
import { logger } from './logging';

export const routes = (svc: ApprovalsService, allowedOrigins: string[]) =>
  LambdaRouter.build(
    rb =>
      rb
        .put('/approvals/questions/{questionId}/approve')(async req => {
          const response = await svc.approveQuestion(req.pathParams.questionId);
          return {
            statusCode: response == 'OK' ? 200 : 404,
            body: { result: response },
          };
        })
        .get('/approvals/questions/approved')(() =>
          svc.listApprovedQuestions().then(qs => ({
            statusCode: 200,
            body: qs,
          }))
        )
        .get('/approvals/questions/unapproved')(() =>
        svc.listQuestionsForApproval().then(qs => ({
          statusCode: 200,
          body: qs,
        }))
      ),
    {
      logConfig: {
        logRequestBody: true,
        logResponseBody: true,
        logRequests: true,
        logResponses: true,
        logger,
      },
      corsConfig: {
        allowHeaders: '*',
        allowMethods: '*',
        allowCredentials: true,
        allowOrigin: allowedOrigins,
      },
    }
  );
