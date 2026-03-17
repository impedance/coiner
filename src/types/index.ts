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

export interface Category {
    id: string;
    name: string;
    kind: 'expense' | 'income';
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
    created_at: string;
    updated_at: string;
}
