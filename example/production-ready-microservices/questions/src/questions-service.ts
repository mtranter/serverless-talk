import { v4 as uuidv4 } from 'uuid';

const TALK_ID = 'ServerlessTalk-2021-08-26';

export type Question = {
  id: string;
  talkId: string;
  text: string;
  username: string;
  createDateIso: string;
};

export type QuestionsRepo = {
  saveQuestion: (q: Question) => Promise<void>;
  listQuestionsForUser: (talkId: string, username: string) => Promise<Question[]>;
};

export type QuestionsEventsPublisher = {
  publishQuestionCreated: (q: Question) => Promise<void>;
};

export type QuestionsService = {
  saveQuestion: (question: { text: string; username: string }) => Promise<void>;
  listQuestionsForUser: (username: string) => Promise<Question[]>;
};

export const QuestionsService = (repo: QuestionsRepo, eventPublisher: QuestionsEventsPublisher): QuestionsService => ({
  saveQuestion: q => {
    const question: Question = {
      id: uuidv4(),
      ...q,
      talkId: TALK_ID,
      createDateIso: new Date().toISOString(),
    };

    const savePromise = repo.saveQuestion(question);
    const publishProise = eventPublisher.publishQuestionCreated(question);
    return Promise.all([savePromise, publishProise]).then(() => undefined);
  },
  listQuestionsForUser: u => repo.listQuestionsForUser(TALK_ID, u),
});
