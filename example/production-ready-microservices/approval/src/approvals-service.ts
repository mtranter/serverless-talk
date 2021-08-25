export type Question = {
  id: string;
  talkId: string;
  text: string;
  username: string;
  createDateIso: string;
};

export const TalkId = 'ServerlessTalk-2021-08-26';

type ApproveQuestResponse = 'OK' | 'NotFound';

export type ApprovalsRepo = {
  saveApprovedQuestion: (question: Question) => Promise<void>;
  saveUnapprovedQuestion: (question: Question) => Promise<void>;
  deleteUnApprovedQuestion: (question: Question) => Promise<void>;
  getUnapprovedQuestion: (talkId: string, questionId: string) => Promise<Question | undefined>;
  listUnapprovedQuestions: (talkId: string) => Promise<Question[]>;
  listApprovedQuestions: (talkId: string) => Promise<Question[]>;
};

export type ApprovalsService = {
  approveQuestion: (questionId: string) => Promise<ApproveQuestResponse>;
  listQuestionsForApproval: () => Promise<Question[]>;
  listApprovedQuestions: () => Promise<Question[]>;
};

export const ApprovalsService = (repo: ApprovalsRepo): ApprovalsService => ({
  approveQuestion: async id => {
    const question = await repo.getUnapprovedQuestion(TalkId, id);
    if (question) {
      const savePromise = repo.saveApprovedQuestion(question);
      const deletePromise = repo.deleteUnApprovedQuestion(question);
      await Promise.all([savePromise, deletePromise]);
      return 'OK';
    } else {
      return 'NotFound';
    }
  },
  listQuestionsForApproval: () => repo.listUnapprovedQuestions(TalkId),
  listApprovedQuestions: () => repo.listApprovedQuestions(TalkId),
});
