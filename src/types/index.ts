export interface Account {
    id: string;
    name: string;
    type: string;
    currency: string;
    opening_balance_cents: number;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
}

export interface CategoryGroup {
    id: string;
    name: string;
    sort_order: number;
    is_system: boolean;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: string;
    name: string;
    kind: 'expense' | 'income';
    group_id?: string;
    bucket_type?: 'reserve' | 'joy' | 'income' | 'expense';
    icon?: string;
    sort_order: number;
    is_system: boolean;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
}

export interface Transaction {
    id: string;
    type: 'expense' | 'income' | 'transfer' | 'adjustment';
    account_id: string;
    to_account_id?: string;
    category_id?: string;
    amount_cents: number;
    happened_at: string;
    note?: string;
    goal_id?: string;
    money_step_id?: string;
    created_at: string;
    updated_at: string;
}
export interface MonthlyBucketPlan {
    id: string;
    month_key: string; // 'YYYY-MM'
    category_id: string;
    planned_cents: number;
    assigned_cents: number;
    carryover_mode: 'carry' | 'reset';
    created_at: string;
    updated_at: string;
}

export interface Goal {
    id: string;
    name: string;
    goal_type: 'reserve' | 'purchase' | 'freedom' | 'custom';
    target_cents: number;
    current_cents: number;
    due_date?: string;
    status: 'active' | 'achieved' | 'archived';
    note?: string;
    created_at: string;
    updated_at: string;
}

export interface GoalContribution {
    id: string;
    goal_id: string;
    transaction_id?: string;
    amount_cents: number;
    happened_at: string;
    note?: string;
    created_at: string;
}

export interface WeeklyReview {
    id: string;
    week_key: string; // 'YYYY-WW'
    period_start: string;
    period_end: string;
    income_cents: number;
    expense_cents: number;
    reserve_delta_cents: number;
    joy_delta_cents: number;
    reflection?: string;
    next_focus?: string;
    celebrations?: string;
    created_at: string;
    updated_at: string;
}

export interface Artifact {
    id: string;
    goal_id?: string;
    title: string;
    description?: string;
    image_uri?: string;
    unlock_rule_type: 'amount_reached' | 'manual';
    unlock_amount_cents?: number;
    unlocked_at?: string;
    created_at: string;
    updated_at: string;
}

export interface PracticeDefinition {
    id: string;
    code: string;
    title: string;
    scope: 'daily' | 'weekly' | 'monthly';
    is_system: boolean;
    created_at: string;
}

export interface Cycle {
    id: string;
    title: string;
    duration_days: number;
    mode: 'soft' | 'hard';
    start_date: string;
    end_date: string;
    status: 'active' | 'completed' | 'failed';
    target_level: 'minimum' | 'target' | 'hero';
    created_at: string;
    updated_at: string;
}

export interface CyclePractice {
    id: string;
    cycle_id: string;
    practice_definition_id: string;
    required: boolean;
}

export interface PracticeCheckin {
    id: string;
    cycle_id?: string;
    practice_definition_id: string;
    checkin_date: string; // 'YYYY-MM-DD'
    status: 'missed' | 'minimum' | 'optimum' | 'maximum';
    note?: string;
    created_at: string;
}

export interface AppSetting {
    key: string;
    value: string;
    updated_at: string;
}

export interface MoneyStep {
    id: string;
    title: string;
    description?: string;
    step_type: string;
    status: 'active' | 'achieved' | 'archived';
    started_at: string;
    achieved_at?: string;
    created_at: string;
    updated_at: string;
}
