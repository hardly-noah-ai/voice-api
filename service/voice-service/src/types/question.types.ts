import { ObjectId } from "mongodb";

export enum Criteria {
    ATTACHMENT_STYLE = "Attachment Style",
    CONFLICT_RESOLUTION_STYLE = "Conflict Resolution Style",
    EMOTIONAL_AVAILABILITY = "Emotional Availability",
    COMMUNICATION_DIRECTNESS = "Communication Directness",
    CORE_VALUES_HIERARCHY = "Core Values Hierarchy",
    ENERGY_LIFESTYLE_PACE = "Energy & Lifestyle Pace",
    SOCIAL_BATTERY_TYPE = "Social Battery Type",
    LOVE_LANGUAGE = "Love Language",
    GROWTH_MINDSET = "Growth Mindset",
    STRESS_RESPONSE_PATTERN = "Stress Response Pattern",
    TRUST_BUILDING_SPEED = "Trust Building Speed",
    INDEPENDENCE_VS_TOGETHERNESS = "Independence vs. Togetherness Need",
    EMOTIONAL_REGULATION_ABILITY = "Emotional Regulation Ability",
    LIFE_DIRECTION_CLARITY = "Life Direction Clarity",
    ACCOUNTABILITY_LEVEL = "Accountability Level",
    CHANGE_ADAPTABILITY = "Change Adaptability",
    RELATIONSHIP_PATTERN_AWARENESS = "Relationship Pattern Awareness",
    BOUNDARY_STYLE = "Boundary Style",
    FAMILY_PLANNING_STANCE = "Family Planning Stance",
    UNRESOLVED_EMOTIONAL_WOUNDS = "Unresolved Emotional Wounds",
    HOBBIES = "Hobbies"
}

export type CriteriaStatus = {
    criteria: Criteria;
    status: "fully_explored" | "mostly_explored" | "partially_explored" | "unexplored" | "currently_active";
    signals: string[];
};

export type CriteriaPriority = {
    selected_criteria: Criteria;
    priority_score: number;
    rationale: string;
    conversation_bridge: string;
    exploration_depth: "light" | "medium" | "deep";
    alternative_criteria: Criteria;
};


export type RawCriteriaStatus = {
    criteria: string;
    status: CriteriaStatus['status'];
    signals: string[];
};

export type InjectedQuestion = {
    target_criteria: Criteria;
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