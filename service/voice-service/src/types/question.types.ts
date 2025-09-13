import { ObjectId } from "mongodb";

export type CriteriaStatus = {
    criteria: string;
    status: "fully_explored" | "mostly_explored" | "partially_explored" | "unexplored" | "currently_active";
    signals: string[];
};

export type CriteriaPriority = {
    selected_criteria: string;
    priority_score: number;
    rationale: string;
    conversation_bridge: string;
    exploration_depth: "light" | "medium" | "deep";
    alternative_criteria: string;
};

export type InjectedQuestion = {
    target_criteria: string;
    criteria_evaluation_goal: string;
    suggested_question: string;
    follow_up_prompts: string[];
    listening_markers: string[];
};

export type QuestionCache = {
    _id: ObjectId;
    uid: string;
    userId: string;
    question: InjectedQuestion;
    consumed: boolean;
    createdAt: Date;
    updatedAt: Date;
};