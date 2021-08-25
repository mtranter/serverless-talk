import { EventBridge } from 'aws-sdk';
import { QuestionsEventsPublisher } from './questions-service';

export const eventBridgePubliser = (
  eb: Pick<EventBridge, 'putEvents'>,
  eventBusName: string
): QuestionsEventsPublisher => ({
  publishQuestionCreated: q =>
    eb
      .putEvents({
        Entries: [
          {
            Detail: JSON.stringify(q),
            DetailType: 'com.mtranter.serverless-talk.QuestionCreated',
            EventBusName: eventBusName,
            Source: 'com.mtranter.serverless-talk.Questions',
          },
        ],
      })
      .promise()
      .then(() => undefined),
});
