/**
 * bizcheckmobile — unified core API for the app.
 *
 * Combines two layers:
 *  - Native layer: the bizcheckmobile-*.ts files (copied from NivotsApp) that
 *    talk to the native container through window.bizCheckMobile.gateway(...).
 *  - Web layer: ./web-core.ts browser implementations used when the app runs
 *    outside the native container (plain browser / npm run dev).
 *
 * Every exported module keeps the option-object API the service layer already
 *  uses (services/, modules/, utilities/) and delegates per call:
 *  native container present → native gateway, otherwise → web implementation.
 */
import NativeApp from "./bizcheckmobile-app";
import NativeDatabase from "./bizcheckmobile-database";
import NativeDevice from "./bizcheckmobile-device";
import NativeEvent from "./bizcheckmobile-event";
import type { EVENTS_TYPE } from "./bizcheckmobile-event";
import NativeLocale from "./bizcheckmobile-locale";
import NativeLogger from "./bizcheckmobile-logger";
import NativeNetwork from "./bizcheckmobile-network";
import NativeProperties from "./bizcheckmobile-properties";
import NativeSystem from "./bizcheckmobile-system";
import WebAppConfig, {
	BizCheckMobileWebApp as WebApp,
	BizCheckMobileWebAppSocial as WebAppSocial,
	BizCheckMobileWebDataObject as WebDataObject,
	BizCheckMobileWebDatabase as WebDatabase,
	BizCheckMobileWebDateTime as WebDateTime,
	BizCheckMobileWebDevice as WebDevice,
	BizCheckMobileWebEvents as WebEvents,
	BizCheckMobileWebFStorage as WebFStorage,
	BizCheckMobileWebLocalization as WebLocalization,
	BizCheckMobileWebLogger as WebLogger,
	BizCheckMobileWebNetwork as WebNetwork,
	BizCheckMobileWebProperties as WebProperties,
	BizCheckMobileWebString as WebString,
	BizCheckMobileWebSystem as WebSystem,
} from "./web-core";

export type { HttpFetchParams, HttpHeaders, HttpOptions, HttpResponse, LoggerConfigOption, NetworkConfigOption } from "./web-core";

/** True when running inside the native bizCheckMobile container. */
export const isNativeContainer = (): boolean => typeof window !== "undefined" && !!window.bizCheckMobile;

/* ============================== AppConfig (web only) ============================== */

const AppConfig = WebAppConfig;

/* ============================== Logger ============================== */

const BizCheckMobileLogger = {
	log: (message?: string, ...param: any[]) => (isNativeContainer() ? NativeLogger.log(message, ...param) : WebLogger.log(message, ...param)),
	error: (message?: string, ...param: any[]) => (isNativeContainer() ? NativeLogger.error(message, ...param) : WebLogger.error(message, ...param)),
	warn: (message?: string, ...param: any[]) => (isNativeContainer() ? NativeLogger.warn(message, ...param) : WebLogger.warn(message, ...param)),
	info: (message?: string, ...param: any[]) => (isNativeContainer() ? NativeLogger.info(message, ...param) : WebLogger.info(message, ...param)),
	debug: (message?: string, ...param: any[]) => (isNativeContainer() ? NativeLogger.debug(message, ...param) : WebLogger.debug(message, ...param)),
};

/* ============================== Properties ============================== */

const BizCheckMobileProperties = {
	get: (key: string): any => (isNativeContainer() ? NativeProperties.get(key) : WebProperties.get(key)),
	set: (key: string, value: any): void => (isNativeContainer() ? NativeProperties.set(key, value) : WebProperties.set(key, value)),
	remove: (key: string): void => (isNativeContainer() ? NativeProperties.remove(key) : WebProperties.remove(key)),
	clear: (option: Partial<{ callback: () => void }> = {}): void => (isNativeContainer() ? NativeProperties.clear(option) : WebProperties.clear(option)),
};

/* ============================== Device ============================== */

const BizCheckMobileDevice = {
	getInfo: (): any => (isNativeContainer() ? NativeDevice.getInfo() : WebDevice.getInfo()),
	setInfo: (option: { key: string; value: any }): void => WebDevice.setInfo(option),
	isApp: (): boolean => (isNativeContainer() ? NativeDevice.isApp() : false),
	isWeb: (): boolean => !(isNativeContainer() && NativeDevice.isApp()),
	isDesktop: (): boolean => WebDevice.isDesktop(),
	isTablet: (): boolean => WebDevice.isTablet(),
	isMobile: (): boolean => WebDevice.isMobile(),
	isIOS: (): boolean => (isNativeContainer() ? !!NativeDevice.isIOS() : WebDevice.isIOS()),
	isAndroid: (): boolean => (isNativeContainer() ? !!NativeDevice.isAndroid() : WebDevice.isAndroid()),
};

/* ============================== App ============================== */

const BizCheckMobileApp = {
	init(options: { callback?: (result: any) => void; statusBarAppearance?: string; statusBarBackgroundColorString?: string }): Promise<any> {
		// The native container has no explicit init; it is ready once the bridge exists.
		return WebApp.init(options);
	},
	hideSplash(option: { callback?: () => void; timeout?: number } = {}): Promise<any> {
		if (isNativeContainer()) {
			return new Promise((resolve) => {
				NativeApp.hideSplash({
					callback: () => {
						option.callback?.();
						resolve({ success: true });
					}
				});
			});
		}
		return WebApp.hideSplash(option);
	},
	getTimeout(): Promise<any> {
		if (isNativeContainer()) {
			return new Promise((resolve) => NativeApp.getTimeout((res: any) => resolve(res)));
		}
		return WebApp.getTimeout();
	},
	setTimeout(option: { seconds: number; message?: string; callback?: (result: any) => void }): Promise<any> {
		if (isNativeContainer()) {
			NativeApp.setAppTimeout({ seconds: option.seconds, message: option.message });
			option.callback?.({ success: true });
			return Promise.resolve({ success: true });
		}
		return WebApp.setTimeout(option);
	},
	exit(): void {
		isNativeContainer() ? NativeApp.exit() : WebApp.exit();
	},
	restart(): void {
		isNativeContainer() ? NativeApp.restart() : WebApp.restart();
	},
	kill(): void {
		isNativeContainer() ? NativeApp.kill() : WebApp.kill();
	},
	callPlugin(option: { pluginKey: string; params?: Record<string, any>; callback?: (response: any) => void }): Promise<any> {
		if (isNativeContainer()) {
			return new Promise((resolve) => {
				NativeApp.callPlugIn(option.pluginKey, {
					param: option.params,
					callback: (res: any) => {
						option.callback?.(res);
						resolve(res);
					}
				});
			});
		}
		return WebApp.callPlugin(option);
	},
	haptic(option: { sound?: boolean; vibration?: boolean; positive?: boolean }): void {
		isNativeContainer() ? NativeApp.playHaptic(option) : WebApp.haptic(option);
	},
	smsRetriever(option: { type: "register" | "unregister"; callback?: (response: Record<string, any>) => void }): Promise<any> {
		if (isNativeContainer()) {
			return new Promise((resolve) => {
				NativeApp.smsRetriever(option.type, (res: any) => {
					option.callback?.(res);
					resolve(res);
				});
			});
		}
		return WebApp.smsRetriever(option);
	},
	imagePicker(option: { callback?: (response: Record<string, any>) => void }): Promise<any> {
		if (isNativeContainer()) {
			return new Promise((resolve) => {
				NativeApp.pickerImage((res: any) => {
					option.callback?.(res);
					resolve(res);
				});
			});
		}
		return WebApp.imagePicker(option);
	},
	contactPicker(option: { callback?: (response: Record<string, any>) => void }): Promise<any> {
		if (isNativeContainer()) {
			return new Promise((resolve) => {
				NativeApp.contactPicker((res: any) => {
					option.callback?.(res);
					resolve(res);
				});
			});
		}
		return WebApp.contactPicker(option);
	},
};

/* ============================== Events ============================== */

/** Maps service-layer event names ("onSessionTimeout") to native EVENTS_TYPE ("sessiontimeout"). */
const toNativeEventName = (eventName: string): EVENTS_TYPE => eventName.replace(/^on/, "").toLowerCase() as EVENTS_TYPE;

const BizCheckMobileEvents = {
	register(event: { eventName: string; callback?: (response: any) => void }): Promise<any> {
		if (isNativeContainer()) {
			NativeEvent.setEvent(toNativeEventName(event.eventName), event.callback ?? (() => undefined));
			return Promise.resolve({ success: true });
		}
		return WebEvents.register(event);
	},
	remove(event: { eventName: string; callback?: (response: any) => void }): Promise<void> {
		if (isNativeContainer()) {
			NativeEvent.clearEvent(toNativeEventName(event.eventName));
			return Promise.resolve();
		}
		return WebEvents.remove(event);
	},
	removeAll(event: { eventName: string; callback?: (response: any) => void }): Promise<void> {
		if (isNativeContainer()) {
			NativeEvent.clearEvent(toNativeEventName(event.eventName));
			return Promise.resolve();
		}
		return WebEvents.removeAll(event);
	},
	clear(): Promise<void> {
		return WebEvents.clear();
	},
};

/* ============================== Database ============================== */

const BizCheckMobileDatabase = {
	openDatabase(options: { dbName: string; onSuccess?: (response: any) => void; onError?: (error: any) => void }): Promise<any> {
		if (isNativeContainer()) {
			return new Promise((resolve, reject) => {
				NativeDatabase.open(
					(res: any) => {
						options.onSuccess?.(res);
						resolve(res);
					},
					(err: any) => {
						options.onError?.(err);
						reject(err);
					}
				);
			});
		}
		return WebDatabase.openDatabase(options);
	},
	closeDatabase(options: { onSuccess?: (response: any) => void; onError?: (error: any) => void } = {}): Promise<any> {
		if (isNativeContainer()) {
			return new Promise((resolve, reject) => {
				NativeDatabase.close(
					(res: any) => {
						options.onSuccess?.(res);
						resolve(res);
					},
					(err: any) => {
						options.onError?.(err);
						reject(err);
					}
				);
			});
		}
		return WebDatabase.closeDatabase(options);
	},
	beginTransaction(options: { onSuccess?: (response: any) => void; onError?: (error: any) => void } = {}): Promise<any> {
		return WebDatabase.beginTransaction(options);
	},
	commitTransaction(options: { onSuccess?: (response: any) => void; onError?: (error: any) => void } = {}): Promise<any> {
		return WebDatabase.commitTransaction(options);
	},
	rollbackTransaction(options: { onSuccess?: (response: any) => void; onError?: (error: any) => void } = {}): Promise<any> {
		return WebDatabase.rollbackTransaction(options);
	},
	executeSql(options: { sql: string; params?: any[]; onSuccess?: (result: any) => void; onError?: (error: any) => void }): Promise<any> {
		if (isNativeContainer()) {
			return new Promise((resolve) => {
				NativeDatabase.executeSql({
					sqlStatement: options.sql,
					values: (options.params ?? []).map(String),
					callback: (result: any) => {
						options.onSuccess?.(result);
						resolve(result);
					}
				});
			});
		}
		return WebDatabase.executeSql(options);
	},
	executeSelect(options: { sql: string; params?: any[]; onSuccess?: (result: any) => void; onError?: (error: any) => void }): Promise<any> {
		if (isNativeContainer()) {
			return new Promise((resolve) => {
				NativeDatabase.select({
					selectStatement: options.sql,
					values: (options.params ?? []).map(String),
					callback: (result: any) => {
						options.onSuccess?.(result);
						resolve(result);
					}
				});
			});
		}
		return WebDatabase.executeSelect(options);
	},
	executeBatchSql(options: { sql: string; params?: any[]; onSuccess?: (result: any) => void; onError?: (error: any) => void }): Promise<any> {
		if (isNativeContainer()) {
			return new Promise((resolve) => {
				NativeDatabase.insertBatchSQL({
					insertStatement: options.sql,
					values: (options.params ?? []).map(String),
					callback: (result: any) => {
						options.onSuccess?.(result);
						resolve(result);
					}
				});
			});
		}
		return WebDatabase.executeBatchSql(options);
	},
};

/* ============================== Network ============================== */

const BizCheckMobileNetwork = {
	changeLocale(locale: string): Promise<void> {
		if (isNativeContainer()) {
			NativeNetwork.changeLocale(locale);
			return Promise.resolve();
		}
		return WebNetwork.changeLocale(locale);
	},
	httpHeader(headers: Record<string, any>): Promise<void> {
		return WebNetwork.httpHeader(headers);
	},
	requestTr(options: {
		headers: Record<string, any>;
		body: Record<string, any>;
		callback?: (response: Record<string, any>) => void;
		progressEnable?: boolean;
		timeout?: number;
		trCode: string;
	}): Promise<Record<string, any>> {
		if (isNativeContainer()) {
			return new Promise((resolve) => {
				NativeNetwork.requestTr(options.trCode, options.headers, options.body, false, options.timeout ?? 60000, (response: any) => {
					options.callback?.(response);
					resolve(response);
				});
			});
		}
		return WebNetwork.requestTr(options);
	},
	requestLogin(options: {
		username: string;
		password: string;
		callback?: (response: Record<string, any>) => void;
		trCode: string;
		progressEnable?: boolean;
		timeout?: number;
	}): Promise<Record<string, any>> {
		if (isNativeContainer()) {
			return new Promise((resolve) => {
				NativeNetwork.requestLogin(options.trCode, options.username, options.password, {}, (response: any) => {
					options.callback?.(response);
					resolve(response);
				});
			});
		}
		return WebNetwork.requestLogin(options);
	},
	requestHttp(options: {
		url: string;
		method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
		headers?: Record<string, any>;
		httpHeaders?: Record<string, any>;
		httpOptions?: Record<string, any>;
		body?: any;
		callback?: (response: Record<string, any>) => void;
		timeout?: number;
		progressEnable?: boolean;
	}): Promise<Record<string, any>> {
		if (isNativeContainer() && (options.method === "GET" || options.method === "POST")) {
			return new Promise((resolve) => {
				NativeNetwork.requestHttp(
					options.url,
					options.method as "GET" | "POST",
					{
						header: { ...options.httpOptions?.headers, ...options.httpHeaders, ...options.headers },
						body: options.body ?? options.httpOptions?.body
					},
					options.timeout ?? 60000,
					(response: any) => {
						options.callback?.(response);
						resolve(response);
					}
				);
			});
		}
		return WebNetwork.requestHttp(options);
	},
	requestMock(options: { trCode: string; url: string; callback?: (response: Record<string, any>) => void }): Promise<Record<string, any>> {
		return WebNetwork.requestMock(options);
	},
};

/* ============================== FStorage ============================== */

const BizCheckMobileFStorage = {
	init(options: { callback?: (result: any) => void } = {}): Promise<any> {
		if (isNativeContainer()) {
			return new Promise((resolve) => {
				NativeProperties.initFStorage({
					callback: () => {
						options.callback?.({ initialized: true });
						resolve({ initialized: true });
					}
				});
			});
		}
		return WebFStorage.init(options);
	},
	getInfo(): any {
		return WebFStorage.getInfo();
	},
};

/* ============================== System ============================== */

const BizCheckMobileSystem = {
	callGallery(option: { type?: string[]; maxCount?: number; callback?: (response: any) => void } = {}): Promise<any> {
		if (isNativeContainer()) {
			return new Promise((resolve) => {
				NativeSystem.callGallery({
					maxSelect: option.maxCount,
					callback: (response: any) => {
						option.callback?.(response);
						resolve(response);
					}
				});
			});
		}
		return WebSystem.callGallery({ type: option.type ?? ["image"], maxCount: option.maxCount ?? 1, callback: option.callback });
	},
	callBrowser(option: { url: string }): Promise<void> {
		if (isNativeContainer()) {
			NativeSystem.callBrowser(option.url);
			return Promise.resolve();
		}
		return WebSystem.callBrowser(option);
	},
	callCamera(option: { directory?: string; autoVerticalHorizontal?: boolean; fileName?: string; callback?: (response: any) => void; directoryType?: string } = {}): Promise<any> {
		if (isNativeContainer()) {
			return new Promise((resolve) => {
				NativeSystem.callCamera((response: any) => {
					option.callback?.(response);
					resolve(response);
				});
			});
		}
		return WebSystem.callCamera({ directory: option.directory ?? "", autoVerticalHorizontal: option.autoVerticalHorizontal ?? true, fileName: option.fileName ?? "", callback: option.callback });
	},
	callMap(option: { location: string; callback?: (response: any) => void }): Promise<any> {
		if (isNativeContainer()) {
			const [lat = "", long = ""] = option.location.split(",").map((s) => s.trim());
			NativeSystem.callMap(lat, long);
			option.callback?.({ opened: true });
			return Promise.resolve({ opened: true });
		}
		return WebSystem.callMap(option);
	},
	callSMS(option: { number: string; message: string; callback?: (response: any) => void }): Promise<any> {
		if (isNativeContainer()) {
			return new Promise((resolve) => {
				NativeSystem.callSMS({
					phoneNumbers: [option.number],
					message: option.message,
					callback: (response: any) => {
						option.callback?.(response);
						resolve(response);
					}
				});
			});
		}
		return WebSystem.callSMS(option);
	},
	callTEL(option: { number: string; callback?: (response: any) => void }): Promise<any> {
		if (isNativeContainer()) {
			return new Promise((resolve) => {
				NativeSystem.callTEL(option.number, (response: any) => {
					option.callback?.(response);
					resolve(response);
				});
			});
		}
		return WebSystem.callTEL(option);
	},
	getGPS(option: { callback?: (location: { latitude: number; longitude: number }) => void } = {}): Promise<any> {
		if (isNativeContainer()) {
			return new Promise((resolve) => {
				NativeSystem.getGPS({
					callback: (response: any) => {
						option.callback?.(response);
						resolve(response);
					}
				});
			});
		}
		return WebSystem.getGPS(option);
	},
};

/* ============================== Localization ============================== */

const BizCheckMobileLocalization = {
	setLocale(options: { localeCode: string }): void {
		if (isNativeContainer()) {
			NativeLocale.setLocale(options.localeCode);
			return;
		}
		WebLocalization.setLocale(options);
	},
	async getLocale(options: { callback: (locale: string) => void }): Promise<any> {
		if (isNativeContainer()) {
			const locale = await NativeLocale.getLocale();
			options.callback(locale);
			return locale;
		}
		return WebLocalization.getLocale(options);
	},
	getFullLocale(options: { localeCode: string }): string {
		return WebLocalization.getFullLocale(options);
	},
};

/* ============================== Web-only modules ============================== */

const BizCheckMobileAppSocial = WebAppSocial;
const BizCheckMobileDateTime = WebDateTime;
const BizCheckMobileString = WebString;
const BizCheckMobileDataObject = WebDataObject;

export {
	BizCheckMobileApp,
	BizCheckMobileAppSocial,
	BizCheckMobileDataObject,
	BizCheckMobileDatabase,
	BizCheckMobileDateTime,
	BizCheckMobileDevice,
	BizCheckMobileEvents,
	BizCheckMobileFStorage,
	BizCheckMobileLocalization,
	BizCheckMobileLogger,
	BizCheckMobileNetwork,
	BizCheckMobileProperties,
	BizCheckMobileString,
	BizCheckMobileSystem,
	AppConfig as default,
};
