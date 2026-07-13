import { CrashlyticsPluginService } from "@/services/crashlytics-plugin-service";
import { BizCheckMobileLogger } from "@/shared/bizcheckmobile";

/* eslint-disable no-unused-vars */
export function func<T extends (...args: any[]) => any>(func: T, funName?: string,): (...args: Parameters<T>) => ReturnType<T> {
	return (...args: Parameters<T>): ReturnType<T> => {
		try {

			const result = func(...args); // Call the original function
			// Return the result from the original function
			return result;

		} catch (err: any) {
			const label = funName != null && String(funName).length > 0 ? `${funName}: ` : "";
			CrashlyticsPluginService.recordNonFatal(
				err.message,
				"error",
				[
					{ key: "funName", value: funName != null ? String(funName) : "" },
					{ key: "message", value: String(err?.message ?? err) },
				]
			);
			BizCheckMobileLogger.log("Error in function: ",
				{ key: "funName", value: funName != null ? String(funName) : "" },
				{ key: "message", value: String(err?.message ?? err) }
			);
			throw new Error(`${label}${err.message}`);
		}
	};
}


