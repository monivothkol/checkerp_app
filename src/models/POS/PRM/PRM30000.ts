/** Payroll settings — PRM30000I01 (load) / PRM30000I02 (save). Attendance day rules live in ATD50000. */

export interface PayrollSettings {
    currency?: string;
    exchangeRate?: number;
}

export type PRM30000Response = PayrollSettings;
