import i18n from "@/locale/i18n";
import DOMPurify from "dompurify";

/** Strict subset of checkerp_web's UT (identical bodies) for the pure helpers ported screens use. */
export default class UT {
	static currency(value: string | number, currency: string): string {
		if (!value) return "0";

		const unformatValue = this.unformatCurrency(value.toString());
		const [integerPart, decimalPart = ""] = unformatValue.toString().split(".");

		// Format the integer part with commas as thousand separators
		const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const formattedDecimal = decimalPart.substring(0, 2).padEnd(2, "0");
    return `${formattedIntegerPart}.${formattedDecimal}`;
	}

	static unformatCurrency(value: string): number {
		if (!value) return 0;

		const isNegative = value.trim().startsWith("-"); // Check if the value is negative

		const [integerPart, decimalPart] = value.replace("-", "").split(".");
		const formattedIntegerPart = integerPart.replace(/[^\d]/g, "");

		const result = decimalPart
			? Number(`${formattedIntegerPart}.${decimalPart}`)
			: Number(formattedIntegerPart);

		return isNegative ? -result : result; // Add back the negative sign if needed
	}

	static phone(phoneNo: string, ISD = "855", displayISD = true): string {
		if (!phoneNo) return "";
		if (ISD === "855") {
			const phone = phoneNo.startsWith("855") ? phoneNo.slice(3) : phoneNo;
			const trimPhoneNo = phone.trim().replace(/^0+/, "");
			// Extract the first two digits
			const firstGroup = trimPhoneNo.slice(0, 2);
			// Extract remaining digits after the first two
			const remainingDigits = trimPhoneNo.slice(2);

			// Group the remaining digits into chunks of 3
			const groups = remainingDigits.match(/\d{1,3}/g) || [];

			// If there's only one leftover digit, append it to the last group
			if (groups.length > 1 && groups[groups.length - 1].length === 1) {
				groups[groups.length - 2] += groups.pop();
			}
			if (displayISD) {
				return [`+${ISD}`, firstGroup, ...groups].join(" ");
			}
			return [firstGroup, ...groups].join(" ");
		}

		return phoneNo;
	}

	static unformattedPhoneWithISD(phoneNo: string, ISD = "855"): string {
		// escape special characters in the ISD
		const escapedISD = ISD.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

		// create a regex to match the ISD
		const reg = new RegExp(escapedISD, "g");

		// remove the ISD from the Phone No
		const rawPhoneNo = phoneNo.replace(reg, "");

		// remove all non-digit characters from the Phone No
		return rawPhoneNo.replace(/\D/g, "");
	}

	static unformattedPhone(phoneNo: string): string {
		// remove all non-digit characters from the Phone No
		return phoneNo.replace(/\D/g, "");
	}

	static localDateTime(value?: string | null): string {
		if (!value) return "";
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) return value; // not a parseable timestamp — show as-is
		const p = (n: number): string => String(n).padStart(2, "0");
		return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
	}

	static isValidEmail(value: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(value);
	}

	static isValidPhone(value: string): boolean {
		const regEx =
			/^(0\d{2})(\d{3})(\d{3,4})$/.test(value) ||
			/^(0\d{2}) (\d{3}) (\d{3,4})$/.test(value);
		return regEx;
	}

	static number(value: string | number) {
		if (!value) return "0";
		if (typeof value === "number") {
			return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		}
		return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	static rate(value: string | number): string {
		if (typeof value === "string") {
			return Number(value) + " %";
		}
		return value + " %";
	}

	static translate(key: string) {
        const localeRef = i18n.global.locale as any;
        void localeRef.value;
        const t = (i18n as any).global.t;
        return t(key);
    }

	static filesize(size: number): string {
		if (size) {
			const units = ["B", "KB", "MB", "GB", "TB"];
			let unitIndex = 0;

			while (size >= 1024 && unitIndex < units.length - 1) {
				size /= 1024;
				unitIndex++;
			}

			const roundedSize = Math.round(size * 10) / 10;
			return `${roundedSize}${units[unitIndex]}`;
		}
		return "";
	}

	static isNullOrEmpty(val: any) {

		if ( (val == null || val == undefined || val.toString().trim() == "" || (typeof val == "object" && Object.keys(val).length < 1)) ) {
			return true;
		}

		return false;
	}

	public static purifyHTML(html: string): string {
		return DOMPurify.sanitize(html);
	}
}
