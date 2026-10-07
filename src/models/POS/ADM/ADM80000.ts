/** Failed (outbox) events list — ADM80000. */

export interface FailedEventRow {
    eventId: string;
    eventType: string;
    errorMessage?: string;
    retryCount?: number;
    status: string;
    createdAt?: string;
    resolvedAt?: string;
}

export interface ADM80000Request {
    status?: string;
    pageNo?: number;
    pageSize?: number;
}

export interface ADM80000Response {
    totalCount: number;
    pendingCount: number;
    eventList: FailedEventRow[];
}
