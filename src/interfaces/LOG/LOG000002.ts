export interface LOG000002Request {
    companyId: string,
    biometric: string,
}
export interface LOG000002Response {
    status: string,
    message: string,
    userId?: string,
    companyId?: string,
    token?: string,
}

export interface LOG000021Request {
    userId: string,
    companyId: string,
}
export interface LOG000021Response {
    status: string,
    message: string,
    result?: boolean,
}