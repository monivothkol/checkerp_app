/**
 * Staff cash balance information
 */
export interface StaffCash {
    /** Currency code (e.g., USD, KHR) */
    currency: string;
    /** Cash amount in the specified currency */
    cashAmount: number;
    /** Amount from other bank transactions */
    otherBankAmount: number;
    /** Alternative transfer amount */
    altTransferAmount: number;
}

/**
 * Approval workflow information
 */
export interface Approval {
    /** ID of the user who requested the approval */
    requesterId: string;
    /** ID of the approver */
    approverId: string;
    /** Approver number identifier */
    approverNo: number;
    /** Approval sequence number */
    approverSeq: number;
    /** Status code of the approval (e.g., PENDING, APPROVED, REJECTED) */
    approverStatusCode: string;
    /** Additional remarks from the approver */
    approverRemark: string;
}

/**
 * Message response information
 */
export interface MessageInfo {
    /** Result status (e.g., SUCCESS, ERROR) */
    result: string;
    /** Response code */
    code: string;
    /** Main message text */
    message: string;
    /** Detailed message description */
    detailMessage: string;
}

/**
 * Message payload header for login response
 */
export interface MessageHeaderLogin {
    code: string;
    message: string;
    result: boolean;
}

/**
 * Message payload header containing all transaction metadata
 */
export interface MessageHeader {
    // ── checkerp-native header: only what the app actually uses. ──
    /** Correlation id for tracing one request end-to-end */
    uuid: string;
    /** Service identifier (trCode) */
    serviceId: string;
    /** Screen the request originated from (audit) */
    screenId: string;
    /** UI locale (e.g., en, km) */
    locale: string;
    /** Result envelope — the server fills this on the response */
    messageInfo: MessageInfo;

    // ── legacy leftovers — optional, no longer sent by checkerp; the backend
    //    ignores the request header entirely (echoes it only). Kept optional
    //    so any stray reference still compiles. ──
    /** @deprecated legacy: banking message type */
    messageTypeCode?: string;
    /** @deprecated legacy: message format version */
    messageVersion?: string;
    /** @deprecated legacy: system version */
    systemVersion?: string;
    /** @deprecated legacy: client-sent IP (server records the real one) */
    requestIpAddress?: string;
    systemTypeCode?: string;
    /** @deprecated legacy: client session id (auth uses the JWT) */
    sessionId?: string;
    /** @deprecated legacy: component id */
    compId?: string;
    /** @deprecated legacy: business date */
    businessDate?: string;
    /** @deprecated legacy: staff id (server trusts the token) */
    staffId?: string;
    /** @deprecated legacy: client transaction date */
    transactionDate?: string;
    /** @deprecated legacy: client transaction time */
    transactionTime?: string;
    /** @deprecated legacy: client system date */
    systemDate?: string;
    /** @deprecated legacy: client system time */
    systemTime?: string;
    /** @deprecated banking: channel (Branch/etc.) */
    channelTypeCode?: string;
    /** @deprecated banking: source core system */
    sourceSystemTypeCode?: string;
    /** @deprecated banking: transaction branch */
    trxBranchCode?: string;
    /** @deprecated banking: actual transaction branch */
    actualTrxBranchCode?: string;
    /** @deprecated banking: account posting flag */
    accountProcessYn?: string;
    /** @deprecated banking: teller cash-drawer apply flag */
    staffCashBalanceApplyYn?: string;
    /** @deprecated banking: slip transaction flag */
    slipTransactionYn?: string;
    /** @deprecated banking: slip number */
    slipNo?: string;
    /** @deprecated banking: teller cash drawer */
    staffCash?: Array<StaffCash>;
    /** @deprecated banking: maker-checker (dual control), not leave approval */
    approval?: Approval;
}
