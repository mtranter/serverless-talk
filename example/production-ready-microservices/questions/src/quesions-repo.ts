import crypto from 'crypto';
import { Table } from 'funamots';
import { DynamoDB } from 'aws-sdk';
import { Question, QuestionsRepo } from './questions-service';
import { logger } from './logging';

type QuestionDto = {
  hash: string;
  range: string;
  question: Question;
};

const hashValue = (val: string) => crypto.createHash('md5').update(val).digest('hex');
const questionByUsernameHashKey = (q: Question) => ({ hash: `QUESTION_BY_USERNAME:${q.talkId}` });
const buildPrimaryKey = (q: Question): Pick<QuestionDto, 'hash' | 'range'> => ({
  ...questionByUsernameHashKey(q),
  range: `username:${q.username}:timestamp:${q.createDateIso}:id:${hashValue(q.text)}`,
});

const buildDto = (q: Question): QuestionDto => ({
  ...buildPrimaryKey(q),
  question: q,
});

export const dynamoQuestionsRepo = (tableName: string, client: DynamoDB): QuestionsRepo => {
  const table = Table<QuestionDto>(tableName, { onEmpty: 'omit' }, client)('hash', 'range');
  return {
    saveQuestion: q => {
      logger.info(`Saving question`, q);
      return table.put(buildDto(q));
    },
    listQuestionsForUser: (talkId: string, username: string) =>
      table
        .query(talkId, {
          sortKeyExpression: { begins_with: `username:${username}:` },
        })
        .then(r => r.records.map(r => r.question)),
  };
};
