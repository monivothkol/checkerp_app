/** ACT43000 posting rules: per-company account override for each posting slot. */

export interface PostingRuleRow {
    ruleKey: string;
    label?: string;
    group?: string;
    defaultCode?: string;
    defaultName?: string;
    accountCode?: string | null; // override ('' = none)
    accountName?: string | null;
    effectiveCode?: string;
    effectiveName?: string;
}

export interface PostingAccountOption {
    accountCode: string;
    accountName: string;
    accountType?: string;
}

export interface PostingRuleResponse {
    ruleList: PostingRuleRow[];
    accountList: PostingAccountOption[];
}

export interface SavePostingRuleRequest {
    rules: { ruleKey: string; accountCode: string }[];
}

export interface SavePostingRuleResponse {
    saved: number;
    cleared: number;
}
