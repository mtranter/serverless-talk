import AWS from 'aws-sdk';
import * as XRay from 'aws-xray-sdk-core';
import { routes } from './approvals-routes';
import { ApprovalsService, Question } from './approvals-service';
import { dynamoApprovalsRepo } from './approvals-repo';
import { EventBridgeHandler } from 'aws-lambda';

const dynamoClient = XRay.captureAWSClient(new AWS.DynamoDB());

export const apiHandler = routes(
  ApprovalsService(
    dynamoApprovalsRepo(process.env.APPROVALS_TABLE!, process.env.APPROVALS_BY_DATE_INDEX_NAME!, dynamoClient)
  ),
  process.env.CORS_ALLOWED_ORIGINS!.split(',').map(o => o.trim())
);

export const questionCreatedHandler: EventBridgeHandler<'com.whatever', Question, void> = e => {
  const repo = dynamoApprovalsRepo(
    process.env.APPROVALS_TABLE!,
    process.env.APPROVALS_BY_DATE_INDEX_NAME!,
    dynamoClient
  );
  return repo.saveUnapprovedQuestion(e.detail);
};
