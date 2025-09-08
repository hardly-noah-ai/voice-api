import { BaseDocument } from '../client/dbClient';

export type Question = BaseDocument & {
    userId: string;
    question: string;
    context?: string;
    category?: string;
    tags?: string[];
    checklist?: ChecklistCriteria[];
};

export type QuestionChecklist = BaseDocument & {
    userId: string;
    criteria: string[];
    lastUpdated: Date;
};

export type ChecklistCriteria = {
    id: string;
    description: string;
    category: string;
    isMet: boolean;
};
