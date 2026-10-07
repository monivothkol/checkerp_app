export interface LAP01001I01Request {
    loanApprovalApplicationNo: string;
    loanAccountNo: string;
    authorizationNo: string;
}

export interface LAP01001I01Response {
    applicationHandlerEmployeeNo: string;
    authorizationNo: number;
    applicationAmount: number;
    applyInterestRate: number;
    cBCReferenceNo: string;
    collateralLoanRatio: number;
    calculationCollateralLoanRatio: number;
    creditBureauCambodiaScore: string;
    fundSourceCode: string,
    fundSourceDesc: string,
    evaluateGrade: string,
    creditBureauCambodiaGrade: string,
    crrScore: number;
    currencyCode: string;
    customerName: string;
    customerNo: string;
    evaluateAuthorizationList: evaluateAuthorizationInfo[];
    approverList: approverInfo[]
    firstDisbursementAmount: number;
    handleFee: number;
    feeTypeCode: string;
    monthlyFeeAmount: number;
    monthlyFeeTypeCode: string;
    annualFeeAmount: number;
    annualFeeTypeCode: string;
    interestExemptionPeriod: number;
    listCoBorrowerGuarantor: coBorrowerInfo[];
    listCollateral: collateralInfo[];
    loanApplicationKindCode: string;
    loanApplicationProgressStatusCode: string;
    loanApplicationTypeCode: string;
    loanApprovalApplicationNo: string;
    listFundPurpose: ListFundPurpose[],
    loanGracePeriodMonths: number;
    loanHopeDate: string;
    loanPeriodMonthlyCount: number;
    loanProductCode: string;
    maturityDate: string;
    loanTermTypeCode: string;
    previousLoanAccountNo: string;
    principalRepayMethodCode: string;
    productName: string;
    remark: string;
    remark2: string;
    remark3: string;
    remark4: string;
    totalDebtPrincipalInterestAmountRatio: number;
    utilizationTypeCode: string;
    collateralLoanYn: string;
    downPaymentPercentage: number;
}

export interface ListFundPurpose {
    loanFundPurposeCode: string;
    loanFundPurposeName: string;
    loanFundPurposeAmount: number;
    loanFundPurposeRemark: string;
}

export interface collateralInfo {
    collateralNo: string;
    collateralCategoryCode: string;
    collateralTypeCode: string;
    collateralAmount: number;
    currencyCode: string;
}

export interface coBorrowerInfo {
    customerNo: string;
    customerName: string;
    coborrowerYn: string;
    customerRelationType: string;
}

export interface evaluateAuthorizationInfo {
    sequenceNo: number;
    authorizerEmployeeNo: string;
    authorizerEmployeeName: string;
    authorizationDate: string;
    authorizationTime: string;
    evaluateStatusCode: string;
    mandatoryApprovalYn: string;
    jobTitleCode: string;
    jobTitleName: string;
    remark: string;
}

export interface approverInfo {
    authorizationNo: number;
    sequenceNo: number;
    approverEmployeeNo: string;
    approverEmployeeName: string;
    approverEmployeeBranchCode: string;
    jobTitleCode: string;
    jobTitleName: string;
    approverEmployeeJobPositionCode: string;
    approverEmployeeJobPositionName: string;
    approvalStatusCode: string;
    authorizationDate: string;
    authorizationTime: string;
    approvalRejectReason: string;
    mandatoryApprovalYn: string;
    minAmount: number;
    maxAmount: number;
    memoContents: string;
}
