/* eslint-disable no-unused-vars */
export enum PICKER_TYPE {
    General = "general",
    DisablePast = "disablePast",
    DisablePastAndToday = "disablePastAndToday",
    DisableFuture = "disableFuture",
    DisableFutureAndToday = "disableFutureAndToday",
    EnableBetween = "enableBetween",
    Recurring = "recurring"
}

export enum TIME_PICKER_TYPE {
    General = "general", // for general
    Schedule = "schedule",  // for schedule pasted time not available
    Recurring = "recurring" // for recurring available every hour
}

export const DATE_TYPE = {
    ServerDateType: "YYYYMMDDHHmmss",      // Full server datetime format (e.g., "20241124123456")
    ClientDateType: "DD MMM YYYY · HH:mm", // Full client datetime format (e.g., "24 Nov 2024 · 12:34")
    ServerDateTimeFormat: "YYYYMMDDHHmmss",
    ServerDateFormat: "YYYYMMDD",          // Server date format (e.g., "20241124")
    ClientDateFormat: "DD MMM YYYY",       // Client date format (e.g., "24 Nov 2024")
    ServerTimeFormat: "HHmmss",            // Server time format (e.g., "123456")
    ClientTimeFormat: "HH:mm"              // Client time format (e.g., "12:34")
};