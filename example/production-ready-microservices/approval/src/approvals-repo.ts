import { Table } from 'funamots';
import { DynamoDB } from 'aws-sdk';
import { Question, ApprovalsRepo } from './approvals-service';

type ApprovalsDto = {
  hash: string;
  range: string;
  lsiRange: string;
  question: Question;
};

const buildHashKey = (approved: boolean, talkId: string) => `${approved ? 'APPROVED' : 'UNAPPROVED'}:${talkId}`;
const buildDateRangeKey = (q: Question) => `${q.createDateIso}:${q.id}`;
const buildDto = (approved: boolean, q: Question): ApprovalsDto => ({
  hash: `${approved ? 'APPROVED' : 'UNAPPROVED'}:${q.talkId}`,
  range: q.id,
  lsiRange: buildDateRangeKey(q),
  question: q,
});

export const dynamoApprovalsRepo = (tableName: string, lsiByDateName: string, client: DynamoDB): ApprovalsRepo => {
  const table = Table<ApprovalsDto>(tableName, { onEmpty: 'omit' }, client)('hash', 'range');
  const indexedByData = table.lsi(lsiByDateName, 'lsiRange');
  return {
    saveApprovedQuestion: q => {
      return table.put(buildDto(true, q));
    },
    saveUnapprovedQuestion: q => {
      return table.put(buildDto(false, q));
    },
    listApprovedQuestions: talkId =>
      indexedByData.query(`APPROVED:${talkId}`).then(r => r.records.map(r => r.question)),
    listUnapprovedQuestions: talkId =>
      indexedByData.query(`UNAPPROVED:${talkId}`).then(r => r.records.map(r => r.question)),
    getUnapprovedQuestion: (talkId, qId) =>
      table.get({ hash: buildHashKey(false, talkId), range: qId }).then(r => r?.question),
    deleteUnApprovedQuestion: q => table.delete({ hash: buildHashKey(false, q.talkId), range: q.id }),
  };
};
