import { HeaderMessage } from "@/interfaces/server-message/header-message";
import { BizCheckMobileLogger, BizCheckMobileProperties } from "@/shared/bizcheckmobile";
import { SharedDataStore } from "@/stores/shared-data";
import { useRouter } from "vue-router";

/**
 * Builds the slim CHECK ERP request header (correlation + audit fields).
 * Replaces the DBCS banking envelope (teller cash, approvals, branch codes).
 */
export default class CheckErpHeader {
	public getHeader(trCode: string): HeaderMessage {
		const now = new Date();
		const userInfo = SharedDataStore().getUserInfo();
		return {
			uuid: this.generateUUID(),
			serviceId: trCode,
			screenId: this.getScreenId(trCode),
			userId: userInfo?.userId ?? "",
			locale: this.getLocale(),
			businessDate: this.formatDate(now),
			transactionTime: this.formatTime(now),
			messageInfo: {
				result: false,
				code: "",
				message: "",
				detailMessage: ""
			}
		};
	}

	/**
	 * Gets current locale
	 * @private
	 * @returns {string} Locale string
	 */
	private getLocale(): string {
		return BizCheckMobileProperties.get("i18n") || "en-US";
	}

	/**
	 * Generates a UUID for the message
	 * @private
	 * @returns {string} UUID string
	 */
	private generateUUID(): string {
		return crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
			const r = Math.random() * 16 | 0;
			const v = c === "x" ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}

	private getScreenId(trCode: string): string {
		try {
			return trCode !== "" ? (useRouter()?.currentRoute?.value?.name as string) || (useRouter()?.currentRoute?.value?.path as string) || "" : "";
		} catch (error) {
			BizCheckMobileLogger.error("getScreenId", error);
			return "";
		}
	}

	/**
	 * Formats date to YYYYMMDD
	 * @private
	 * @param {Date} date - Date to format
	 * @returns {string} Formatted date string
	 */
	private formatDate(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}${month}${day}`;
	}

	/**
	 * Formats time to HHmmssSSS
	 * @private
	 * @param {Date} date - Date to format
	 * @returns {string} Formatted time string
	 */
	private formatTime(date: Date): string {
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		const seconds = String(date.getSeconds()).padStart(2, "0");
		const milliseconds = String(date.getMilliseconds()).padStart(3, "0");
		return `${hours}${minutes}${seconds}${milliseconds}`;
	}
}
