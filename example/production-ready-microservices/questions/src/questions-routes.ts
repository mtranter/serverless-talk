import { LambdaRouter } from 'ts-lambda-router';
import { QuestionsService } from './questions-service';
import { Static, Type } from '@sinclair/typebox';
import { logger } from './logging';

const CreateQuestionRequestSchema = Type.Object({
  text: Type.String({ minLength: 5, maxLength: 1000 }),
  username: Type.String({ minLength: 1, maxLength: 250 }),
});

export type CreateQuestionRequest = Static<typeof CreateQuestionRequestSchema>;

export const routes = (svc: QuestionsService, allowedOrigins: string[]) =>
  LambdaRouter.build(
    rb =>
      rb
        .post(
          '/questions',
          CreateQuestionRequestSchema
        )(async req => {
          await svc.saveQuestion(req.body);
          return {
            statusCode: 201,
            body: { result: 'Created' },
          };
        })
        .get('/questions/{username}')(r =>
        svc.listQuestionsForUser(r.pathParams.username).then(qs => ({
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
