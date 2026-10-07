export interface RequestOption<Req = Record<string, any>, Res = Record<string, any>> {
    listener: EventListener<Res>,
    dataBody: Req,
    stateProps?: Record<string, any>; // Additional properties for request context
    loadingBtn?: string[]; // Optional loading button identifiers
    dataFormat?: {
        pattern?: Array<{ type: PATTERN_TYPE; fields: Array<string>; currencyCode?: string }>;
    };
    enableLoading?: boolean;
    headers?: Record<string, string>; // extra headers, e.g. Idempotency-Key on create trCodes
}

interface EventListener<Res = Record<string, any>> {
    onSuccess: (response: Res) => void,
    onFail?: (error: Record<string, any>) => void
}

export interface IRequest<Req = Record<string, any>, Res = Record<string, any>>{
    request: (option: RequestOption<Req, Res>) => void;
}

type PATTERN_TYPE = "CustomerNumber" | "AccountNumber" | "LoanAccountNumber" | "Date" | "DateTime";
