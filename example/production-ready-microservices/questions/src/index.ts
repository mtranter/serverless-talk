import AWS from 'aws-sdk';
import * as XRay from 'aws-xray-sdk-core';
import { routes } from './questions-routes';
import { QuestionsService } from './questions-service';
import { dynamoQuestionsRepo } from './quesions-repo';
import { eventBridgePubliser } from './questions-event-publisher';

const dynamoClient = XRay.captureAWSClient(new AWS.DynamoDB());
const eventBridge = XRay.captureAWSClient(new AWS.EventBridge());

export const apiHandler = routes(
  QuestionsService(
    dynamoQuestionsRepo(process.env.QUESTIONS_TABLE!, dynamoClient),
    eventBridgePubliser(eventBridge, process.env.EVENT_BUS_NAME!)
  ),
  process.env.CORS_ALLOWED_ORIGINS!.split(',').map(o => o.trim())
);
