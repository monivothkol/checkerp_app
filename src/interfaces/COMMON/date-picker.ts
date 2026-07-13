import { PICKER_TYPE, TIME_PICKER_TYPE } from "@/enum/date-type-enum";

/* eslint-disable no-unused-vars */
export interface IDay {
  day: number;
  month: number;
  year: number;
  isDisabled: boolean;
  isPrevMonth: boolean;
  isNextMonth: boolean;
}
export interface IDate {
  day: number,
  month: number,
  year: number
}
interface ITimePicker {
  role: string;
  data: {
    hour: string;
    minute: string;
  }
}
export interface IMonthYear {
  month: number;
  year: number;
}

interface IOpenTimePicker {
  title?: string,
  time?: { hour: string, minute: string },
  date?: string,
  is24Hour?: boolean,
  pickerType?: TIME_PICKER_TYPE,
  footerBtns?: Array<{ label: string, type: "negative" | "positive" }>,
  onDismiss: (result: ITimePicker) => void;
}

interface IOpenMonthYearPicker {
  title?: string,
  month?: string,
  year?: string,
  message?: string,
  pickerType?: PICKER_TYPE,
  footerBtns?: { label: string, type: "negative" | "positive" }[],
  onDismiss: (result: IMonthYearPicker) => void
}

interface IMonthYearPicker {
  month: unknown;
  role: string,
  data: {
    month: string;
    year: string;
  }
}

export interface IOpenDateRangePicker {
  selectedRange: { fromDate: string; toDate: string },
  selectOn: string,
  title: string,
  calendarType: PICKER_TYPE,
  headerBtnLabel: string,
  positiveBtnLabel: string,
  enableDateBetween: { fromDate: string, toDate: string },  // format YYYYMMDD and this field is combo with PICKER_TYPE.Recurring
  disableWeekends?: boolean,
  onDismiss: (result: IDateRangePicker) => void;
}

interface IOpenDatePicker {
  title: string;
  selectedDate: string,
  calendarType: PICKER_TYPE;
  headerBtn: { label: string, type: "reset" | "today" };
  footerButtons: { label: string, type: "negative" | "positive" }[];
  disabledDates: string[] // format YYYYMMDD ex: ["20241104", "20241105"]
  enableDateBetween: { fromDate: string, toDate: string },  // format YYYYMMDD and this field is combo with PICKER_TYPE.Recurring
  disableWeekends?: boolean,
  onDismiss: (result: IDatePicker) => void;
}

interface IDatePicker {
  role: string;
  data: { datePicker: string };
}

interface IDateRangePicker {
  role: string;
  data: {
    datePicker: { fromDate: string, toDate: string },
    stepper: { key: string, label: string }
  }
  onDismiss: (result: IDateRangePicker) => void;
}

export interface IDateRangePickerLabel {
  key: string;
  label: string;
}

export interface IDateRangePickerAutoFill {
  count: number;
  type: "NextDate" | "PrevDate";
}