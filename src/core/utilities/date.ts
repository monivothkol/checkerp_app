
import dayjs, { Dayjs } from "dayjs";
import UT from "./ut";

export default class DATE {
	/**
	 * Get difference month between two dates
	 *
	 * @param {string} startDate - Accept both YYYYMMDD or DDMMYYYY
	 * @param {string} endDate - Accept both YYYYMMDD or DDMMYYYY
	 * @returns {number}
	 */
	public static getDiffDay(startDate: string, endDate: string): number {
		const s: any = new Date(this.setDateFormat(startDate, "YYYY-MM-DD"));
		const e: any = new Date(this.setDateFormat(endDate, "YYYY-MM-DD"));

		const diff = e - s;

		return Math.floor(diff / (24 * 60 * 60 * 1000)); // oneDay
	}

	/**
	 * Get difference month between two dates
	 *
	 * @param {string} startDate - Accept both YYYYMMDD or DDMMYYYY
	 * @param {string} endDate - Accept both YYYYMMDD or DDMMYYYY
	 * @param {?boolean} [monthOnly] - This allow to ignore day
	 * @returns {number}
	 * @reviewer Muny
	 */
	public static getDiffMonth(startDate: string, endDate: string, monthOnly?: boolean): number {
		const s: any = new Date(this.setDateFormat(startDate, "YYYY-MM-DD"));
		const e: any = new Date(this.setDateFormat(endDate, "YYYY-MM-DD"));

		const years = e.getFullYear() - s.getFullYear();
		const months = e.getMonth() - s.getMonth();
		const days = e.getDate() - s.getDate();

		let diff = years * 12 + months + (days >= 0 ? 0 : -1);

		if (monthOnly) {
			diff = years * 12 + months;
		}

		return diff;
	}

	/**
	 * Get difference between two dates
	 *
	 * @param {*} startDate - Accept both YYYYMMDD or DDMMYYYY
	 * @param {*} endDate - Accept both YYYYMMDD or DDMMYYYY
	 * @returns {{ year: number; month: number; day: number; }}
	 * @reviewer Muny
	 */
	public static getDiff(
		startDate: string,
		endDate: string,
	): { year: number; month: number; day: number } {
		const s: any = new Date(this.setDateFormat(startDate, "YYYY-MM-DD"));
		const e: any = new Date(this.setDateFormat(endDate, "YYYY-MM-DD"));

		let years = e.getFullYear() - s.getFullYear();
		let months = e.getMonth() - s.getMonth();
		let days = e.getDate() - s.getDate();

		if (months < 0) {
			years -= 1;
			months += 12;
		}

		if (days < 0) {
			months -= 1;
			days *= -1;
		}

		return {
			year: years,
			month: months,
			day: days,
		};
	}

	/**
	 * Convert formatted date into raw CBS raw date format YYYYMMDDHHmmss accordingly
	 *
	 * @param {(string | Dayjs | Date)} date
	 * @returns {string} - Return empty string of no condition meet
	 * @reviewer Muny
	 */
	public static removeDateFormat(date: string | Dayjs | Date): string {
		if (dayjs.isDayjs(date)) {
			return date.format("YYYYMMDD");
		}

		// Handle JavaScript Date object
		if (date instanceof Date) {
			return dayjs(date).format("YYYYMMDD");
		}

		if (typeof date == "string") {
			date = date.replace(/\D/g, "");

			let dateFormat = this.getDateFormat(date) as any;

			if (dateFormat.startsWith("DDMMYYYY")) {
				dateFormat = dateFormat.replace("DDMMYYYY", "YYYYMMDD");
			}

			return this.setDateFormat(date, dateFormat);
		}

		return "";
	}


	/**
	 * Set date format
	 *
	 * @param {(string | Date)} date
	 * @param {string} format
	 * @param {any} options
	 * @param {boolean} options.hour12 - Available only the format include HHmmss
	 * @returns {string}
	 * @example
	 * DATE.setDateFormat("20241231", "DD MMM, YYYY"); // 31 Dec, 2024
	 * @reviewer Muny
	 */
	public static setDateFormat(
		date: string | Date,
		format: "DD MMM, YYYY" | "DD-MM-YYYY" | "DD MMMM YYYY" | "HH:mm:ss" | "DD-MM-YYYY HH:mm:ss" | "DD MMM, YYYY HH:mm:ss" | "YYYY-MM-DD" | "YYYY-MM-DD HH:mm:ss" | "YYYYMMDD" | "YYYYMMDDHHmmss" | "MMM, YYYY",
		options: any = {},
	): string {
		if (!date) {
			return "";
		}

		date = this.transformDateInput(date);
		const dateComponents = this.extractDateComponents(date);
		const processedComponents = this.processHour12Format(dateComponents, options);
		return this.applyFormat(format, processedComponents, options);
	}

	public static setDateYearMonthFormat(date: string | Date): string {
		if(!date) {
			return "";
		}

		if(typeof date === "string") {
			date = date.replace(/\D/g, "");
		}

		if(date instanceof Date) {
			date = dayjs(date).format("MMM, YYYY");
		}
		return dayjs(date, "YYYYMM").format("MMM, YYYY");
	}

	private static transformDateInput(date: string | Date): string | Date {
		if (typeof date === "string" && (date.includes(" AM") || date.includes(" PM"))) {
			return this.handleAmPmFormat(date);
		}

		if (typeof date === "string") {
			return date.replace(/\D/g, "");
		}

		return date;
	}

	private static handleAmPmFormat(date: string): Date {
		const splitDate = date.split(" ");
		if (splitDate.length === 3) {
			return new Date(
				this.setDateFormat(splitDate[0], "YYYY-MM-DD") +
					" " +
					splitDate[1] +
					" " +
					splitDate[2],
			);
		}
		if (splitDate.length === 2) {
			return new Date("1993-09-01" + " " + splitDate[1] + " " + splitDate[2]);
		}
		return new Date();
	}

	private static extractDateComponents(date: string | Date): any {
		const components = {
			year: "",
			month: "",
			day: "",
			hour: "00",
			minute: "00",
			second: "00",
			millisecond: "000"
		};

		if (date instanceof Date) {
			return this.extractFromDateObject(date);
		}

		const dateFormat = this.getDateFormat(date);
		if (dateFormat.startsWith("DDMMYYYY")) {
			return this.extractFromDDMMYYYY(date, components);
		}
		if (dateFormat.startsWith("YYYYMMDD")) {
			return this.extractFromYYYYMMDD(date, components);
		}
		if (dateFormat === "HHmmss") {
			return this.extractFromHHmmss(date, components);
		}
		return components;
	}

	private static extractFromDateObject(date: Date): any {
		return {
			year: date.getFullYear().toString(),
			month: (date.getMonth() + 1).toString().padStart(2, "0"),
			day: date.getDate().toString().padStart(2, "0"),
			hour: date.getHours().toString().padStart(2, "0"),
			minute: date.getMinutes().toString().padStart(2, "0"),
			second: date.getSeconds().toString().padStart(2, "0"),
			millisecond: date.getMilliseconds().toString().padStart(3, "0")
		};
	}

	private static extractFromDDMMYYYY(date: string, components: any): any {
		return {
			...components,
			year: date.substring(4, 8),
			month: date.substring(2, 4),
			day: date.substring(0, 2),
			hour: date.substring(8, 10) || components.hour,
			minute: date.substring(10, 12) || components.minute,
			second: date.substring(12, 14) || components.second
		};
	}

    private static extractFromYYYYMMDD(date: string, components: any): any {
        // build Date from YYYYMMDD
        const year = Number(date.substring(0, 4));
        const monthIndex = Number(date.substring(4, 6)) - 1; // 0-based
        const day = Number(date.substring(6, 8));

        const d = new Date(year, monthIndex, day);

        return {
          ...components,
          year: date.substring(0, 4),
          month: date.substring(4, 6),
          monthShort: d.toLocaleString("en-US", { month: "short" }), // MMM
          monthLong:  d.toLocaleString("en-US", { month: "long" }), // MMMM
          day: date.substring(6, 8),
          hour: date.length >= 10 ? date.substring(8, 10) : components.hour,
          minute: date.length >= 12 ? date.substring(10, 12) : components.minute,
          second: date.length >= 14 ? date.substring(12, 14) : components.second
        };
    }

	private static extractFromHHmmss(date: string, components: any): any {
		return {
			...components,
			hour: date.substring(0, 2) || components.hour,
			minute: date.substring(2, 4) || components.minute,
			second: date.substring(4, 6) || components.second
		};
	}

	private static processHour12Format(components: any, options: any): any {
		if (components.hour && options.hour12) {
			components.ampm = +components.hour >= 12 ? "PM" : "AM";
			components.hour = (+components.hour % 12 ? components.hour : 12).toString();
		}
		return components;
	}

    private static applyFormat(format: string, components: any, options: any): string {
        const formatReplacements = [
          { pattern: "MMMM", value: components.monthLong }, // "January"
          { pattern: "MMM",  value: components.monthShort }, // "Jan"
          { pattern: "MM",   value: components.month },      // "01"
          { pattern: "DD",   value: components.day },
          { pattern: "HH",   value: components.hour },
          { pattern: "mm",   value: components.minute },
          { pattern: "ss",   value: components.second },
          { pattern: "SSS",  value: components.millisecond },
          { pattern: "YYYY", value: components.year }
        ];

        for (const { pattern, value } of formatReplacements) {
          format = format.replace(new RegExp(pattern, "g"), value);
        }

        return format.trim();
      }

	/**
	 * Verify whether given value is a date format
	 *
	 * @param {(string | Date)} date
	 * @returns {boolean}
	 * @reviewer Muny
	 */
	public static isValidDate(date: string | Date): boolean {
		const fd = this.setDateFormat(date, "YYYY-MM-DD HH:mm:ss");

		if (UT.isNullOrEmpty(fd)) {
			return false;
		}

		const d = new Date(fd);

		if (d instanceof Date && isNaN(d.getTime())) {
			return false;
		}

		if (fd != this.setDateFormat(d, "YYYY-MM-DD HH:mm:ss")) {
			return false;
		}

		return true;
	}

	/**
	 * Get date format from given value
	 *
	 * @param {string} date
	 * @returns {string}
	 * @reviewer Muny
	 */
	public static getDateFormat(date: string): string {
		const formats = {
			YYYYMMDD: /^\d{4}[01]\d[0-3]\d$/,
			YYYYMMDDHHmm: /^\d{4}[01]\d[0-3]\d[0-2]\d[0-5]\d$/,
			YYYYMMDDHHmmss: /^\d{4}[01]\d[0-3]\d[0-2]\d[0-5]\d[0-5]\d$/,
			DDMMYYYY: /^[0-3]\d[01]\d\d{4}$/,
			DDMMYYYYHHmm: /^[0-3]\d[01]\d\d{4}[0-2]\d[0-5]\d$/,
			DDMMYYYYHHmmss: /^[0-3]\d[01]\d\d{4}[0-2]\d[0-5]\d[0-5]\d$/,
			HHmmss: /^([01]\d|2[0-3])[0-5]\d[0-5]\d$/,
		} as any;

		for (const format of Object.keys(formats)) {
			if (formats[format].test(date)) {
				return format;
			}
		}

		return "";
	}

	/**
	 * Get date span from input date by day/week/month
	 *
	 * @param {string} date
	 * @param {number} value
	 * @param {("day" | "week" | "month")} type
	 * @returns {string}
	 * DATE.getDateSpan("01112024", 1, "month"); // 01122024
	 * @reviewer Muny
	 */
	public static getDateSpan(date: string, value: number, type: "day" | "week" | "month"): string {
		const d = new Date(this.setDateFormat(date, "YYYY-MM-DD"));

		if (type == "day") {
			d.setDate(d.getDate() + value);
		}
		if (type == "week") {
			d.setDate(d.getDate() + 7 * value);
		}
		if (type == "month") {
			d.setMonth(d.getMonth() + value);
		}

		return this.setDateFormat(d, this.getDateFormat(date) as any);
	}

	/**
	 * Get business date, normally it's today date
	 * This fn is often use by business part
	 *
	 * @param {string} format - You can combine YYYY, MM, MMM, MMMM, DD, HH, mm, ss, SSS into anything you want
	 * @returns {string}
	 * DATE.getDate("YYYYMMDD"); // 20240805
	 * DATE.getDate("YYYY-MM-DD HH:mm:ss:SSS"); // 2024-08-05 20:12:22:142
	 * @reviewer Muny
	 */
	public static getDate(
		format: "YYYYMMDDHHmmss" | "YYYYMMDD",
		options: any = {},
	): string {
		let s = "";
		const CONST = { USER: { BizDate: "" } }; // TODO: get from real response

		if (!CONST.USER.BizDate) {
			s = this.getSystemDate(format, options);
		} else {
			s = this.setDateFormat(CONST.USER.BizDate, format, options);
		}

		return s;
	}

	/**
	 * Get system date, normally it's today date
	 * This fn is often use by core part
	 *
	 * @param {string} format - You can combine YYYY, MM, MMM, MMMM, DD, HH, mm, ss, SSS into anything you want
	 * @returns {string}
	 * DATE.getSystemDate("YYYYMMDD"); // 20240805
	 * DATE.getDate("YYYY-MM-DD HH:mm:ss:SSS"); // 2024-08-05 20:12:22:142
	 * @reviewer Muny
	 */
	public static getSystemDate(
		format: "YYYYMMDDHHmmss" | "YYYYMMDD",
		options: any = {},
	): string {
		return this.setDateFormat(new Date(), format, options);
	}

	/**
	 * Convert date string to an object which is readable by DatePicker
	 *
	 * @param {string} date
	 * @returns {*}
	 * @reviewer Muny
	 */
	public static toDatePicker(date: string) {
		if (!DATE.isValidDate(date)) {
			return null;
		}
		return dayjs(DATE.setDateFormat(date, "YYYYMMDDHHmmss"));
	}
}
