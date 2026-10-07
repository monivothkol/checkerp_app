/** Check-in QR display (ATD20000/ATD21000) and the staff scanner (ATD40000/ATD41000). */

export interface ATD20000Response {
    token?: string;
    expiresInSeconds?: number;
    renewalTime?: string;
}

export interface ATD21000Request {
    time: string;
}

export interface ATD41000Request {
    token: string;
}

export interface ATD41000Response {
    action?: string;
    staffName?: string;
    time?: string;
    workedMinutes?: number;
}
