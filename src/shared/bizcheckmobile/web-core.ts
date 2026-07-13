/**
 * Web (browser) implementations for the bizcheckmobile core API.
 * Used as the fallback by ./index.ts when the app is NOT running inside the
 * native bizCheckMobile container (window.bizCheckMobile is absent), e.g.
 * during local `npm run dev` in a plain browser.
 *
 * Do not import this file directly — import from "@/shared/bizcheckmobile".
 */

/* ============================== AppConfig ============================== */

export interface HttpHeaders {
	"Content-Type"?: "application/json" | "application/x-www-form-urlencoded; charset=UTF-8" | "multipart/form-data";
	"Accept-Language"?: string;
	[key: string]: any;
}

export interface HttpOptions {
	mode?: "cors" | "no-cors" | "same-origin";
	credentials?: "include" | "same-origin" | "omit";
	cache?: "default" | "no-store" | "reload" | "no-cache" | "force-cache" | "only-if-cached";
}

export interface NetworkConfigOption {
	url: string;
	mockUrl?: string;
	enableMock?: boolean;
	method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
	timeout?: number;
	option: Partial<HttpOptions>;
	headers: Partial<HttpHeaders>;
}

export interface LoggerConfigOption {
	enable: boolean;
	level: "log" | "debug" | "info" | "warn" | "error" | "all";
}

interface DatePattern { pattern: string; locale?: { [key: string]: string } }
interface TimePattern { pattern: string }
interface DateTimePattern { pattern: string; locale?: { [key: string]: string } }
interface DateTimeSystemPattern { date: string; time: string }
interface CurrencyPattern { currencyCode: { [key: string]: string } }
type DataPatternEntry = { pattern: string; prefix?: string; locale?: Record<string, any> };

class AppConfig {
	private static config = {
		logger: { enable: true, level: "all" } as LoggerConfigOption,
		network: {
			url: "",
			mockUrl: "",
			enableMock: false,
			method: "POST",
			timeout: 60000,
			option: {} as Partial<HttpOptions>,
			headers: {} as Partial<HttpHeaders>,
		} as NetworkConfigOption,
		locale: "en-US",
		datePattern: { pattern: "DD MMM, YYYY" } as DatePattern,
		timePattern: { pattern: "HH:mm:ss" } as TimePattern,
		dateTimePattern: { pattern: "DD MMM, YYYY HH:mm:ss" } as DateTimePattern,
		dateTimeSystemPattern: { date: "yyyymmdd", time: "hhmmssSSS" } as DateTimeSystemPattern,
		currencyPattern: { currencyCode: { USD: "#,###.00", KHR: "#,###" } } as CurrencyPattern,
	};

	static setLogger(option?: Partial<LoggerConfigOption>): void {
		this.config.logger = { ...this.config.logger, ...option };
	}

	static setNetwork(value?: Partial<NetworkConfigOption>): void {
		this.config.network = {
			...this.config.network,
			...value,
			option: { ...this.config.network.option, ...value?.option },
			headers: { ...this.config.network.headers, ...value?.headers },
		};
	}

	static get network(): NetworkConfigOption {
		return this.config.network;
	}

	static get getLogger(): LoggerConfigOption {
		return this.config.logger;
	}

	static setLocale(code: string): void {
		this.config.locale = code;
	}

	static get locale(): string {
		return this.config.locale;
	}

	static get getDatePattern(): DatePattern {
		return this.config.datePattern;
	}

	static setDatePattern(pattern: DatePattern): void {
		this.config.datePattern = pattern;
	}

	static setTimePattern(pattern: TimePattern): void {
		this.config.timePattern = pattern;
	}

	static get getTimePattern(): TimePattern {
		return this.config.timePattern;
	}

	static get getDateTimePattern(): DateTimePattern {
		return this.config.dateTimePattern;
	}

	static setDateTimePattern(pattern: DateTimePattern): void {
		this.config.dateTimePattern = pattern;
	}

	static setDateTimeSystemPattern(pattern: DateTimeSystemPattern): void {
		this.config.dateTimeSystemPattern = pattern;
	}

	static get getDateTimeSystemPattern(): DateTimeSystemPattern {
		return this.config.dateTimeSystemPattern;
	}

	static setCurrencyPattern(pattern: CurrencyPattern): void {
		this.config.currencyPattern = pattern;
	}

	static get getCurrencyPattern(): CurrencyPattern {
		return this.config.currencyPattern;
	}

	static dataPattern: Record<string, DataPatternEntry> = {};

	static setDataPattern<T extends Record<string, DataPatternEntry>>(config: T): void {
		this.dataPattern = { ...this.dataPattern, ...config };
	}

	static get getDataPattern(): Record<string, DataPatternEntry> {
		return this.dataPattern;
	}
}

/* ============================== Logger ============================== */

const LEVEL_ORDER: Record<string, number> = { all: 0, debug: 1, log: 2, info: 3, warn: 4, error: 5 };

function shouldLog(level: string): boolean {
	const cfg = AppConfig.getLogger;
	if (!cfg.enable) return false;
	return LEVEL_ORDER[level] >= LEVEL_ORDER[cfg.level === "all" ? "all" : cfg.level];
}

class WebLogger {
	log(message?: string, ...param: any[]): void {
		if (shouldLog("log")) console.log(message, ...param);
	}
	error(message?: string, ...param: any[]): void {
		if (shouldLog("error")) console.error(message, ...param);
	}
	warn(message?: string, ...param: any[]): void {
		if (shouldLog("warn")) console.warn(message, ...param);
	}
	info(message?: string, ...param: any[]): void {
		if (shouldLog("info")) console.info(message, ...param);
	}
	debug(message?: string, ...param: any[]): void {
		if (shouldLog("debug")) console.debug(message, ...param);
	}
}

/* ============================== Properties ============================== */

const PROPS_PREFIX = "bizcheckmobile.props.";

class WebProperties {
	get(key: string): any {
		const raw = localStorage.getItem(PROPS_PREFIX + key);
		if (raw === null) return null;
		try {
			return JSON.parse(raw);
		} catch {
			return raw;
		}
	}
	set(key: string, value: any): void {
		localStorage.setItem(PROPS_PREFIX + key, typeof value === "string" ? value : JSON.stringify(value));
	}
	remove(key: string): void {
		localStorage.removeItem(PROPS_PREFIX + key);
	}
	clear(option: Partial<{ callback: () => void }> = {}): void {
		for (const key of Object.keys(localStorage)) {
			if (key.startsWith(PROPS_PREFIX)) localStorage.removeItem(key);
		}
		option.callback?.();
	}
}

/* ============================== Network ============================== */

export interface HttpFetchParams {
	url: string;
	option?: Partial<HttpOptions> & { method?: string; headers?: HttpHeaders; body?: any };
	timeout: number;
}

export interface HttpResponse<T = any> {
	ok: boolean;
	status: number;
	statusText: string;
	data: T | null;
}

class WebNetwork {
	private readonly DEFAULT_TIMEOUT = 60000;
	private static AcceptLanguage = "en-US";
	private static HttpHeaders: Record<string, any> = {};
	private logger = new WebLogger();

	async changeLocale(locale: string): Promise<void> {
		WebNetwork.AcceptLanguage = locale;
	}

	async httpHeader(headers: Record<string, any>): Promise<void> {
		WebNetwork.HttpHeaders = { ...WebNetwork.HttpHeaders, ...headers };
	}

	async requestTr(options: {
		headers: Record<string, any>;
		body: Record<string, any>;
		callback?: (response: Record<string, any>) => void;
		progressEnable?: boolean;
		timeout?: number;
		trCode: string;
	}): Promise<Record<string, any>> {
		const net = AppConfig.network;
		const url = `${net.url}/${options.trCode}`;
		const response = await this.httpFetch({
			url,
			option: {
				...net.option,
				method: net.method,
				headers: { ...net.headers, ...WebNetwork.HttpHeaders, ...options.headers, "Accept-Language": WebNetwork.AcceptLanguage },
				body: options.body,
			},
			timeout: options.timeout ?? net.timeout ?? this.DEFAULT_TIMEOUT,
		});
		const result = (response.data ?? response) as Record<string, any>;
		options.callback?.(result);
		return result;
	}

	async requestLogin(options: {
		username: string;
		password: string;
		callback?: (response: Record<string, any>) => void;
		trCode: string;
		progressEnable?: boolean;
		timeout?: number;
	}): Promise<Record<string, any>> {
		return this.requestTr({
			headers: {},
			body: { username: options.username, password: options.password },
			callback: options.callback,
			timeout: options.timeout,
			trCode: options.trCode,
		});
	}

	async requestHttp(options: {
		url: string;
		method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
		headers?: HttpHeaders;
		httpHeaders?: HttpHeaders;
		httpOptions?: Partial<HttpOptions> & { headers?: HttpHeaders; body?: any };
		body?: any;
		callback?: (response: Record<string, any>) => void;
		timeout?: number;
		progressEnable?: boolean;
	}): Promise<Record<string, any>> {
		const headers = { ...options.httpOptions?.headers, ...options.httpHeaders, ...options.headers };
		const response = await this.httpFetch({
			url: options.url,
			option: {
				...options.httpOptions,
				method: options.method,
				headers,
				body: options.body ?? options.httpOptions?.body,
			},
			timeout: options.timeout ?? this.DEFAULT_TIMEOUT,
		});
		const result = (response.data ?? response) as Record<string, any>;
		options.callback?.(result);
		return result;
	}

	async requestMock(options: {
		trCode: string;
		url: string;
		callback?: (response: Record<string, any>) => void;
	}): Promise<Record<string, any>> {
		const response = await this.httpFetch({ url: options.url, option: { method: "GET" }, timeout: this.DEFAULT_TIMEOUT });
		const result = (response.data ?? {}) as Record<string, any>;
		options.callback?.(result);
		return result;
	}

	async httpFetch(param: HttpFetchParams): Promise<HttpResponse> {
		const { url, option = {}, timeout } = param;
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), timeout > 10000 ? timeout : timeout * 1000 || 60000);

		try {
			const isFormData = typeof FormData !== "undefined" && option.body instanceof FormData;
			const headers: Record<string, any> = { ...option.headers };
			if (!isFormData && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
			if (isFormData) delete headers["Content-Type"];

			const response = await fetch(url, {
				method: option.method || "GET",
				mode: option.mode,
				credentials: option.credentials,
				cache: option.cache,
				headers,
				body: option.body === undefined || option.method === "GET"
					? undefined
					: isFormData || typeof option.body === "string"
						? option.body
						: JSON.stringify(option.body),
				signal: controller.signal,
			});

			const contentType = response.headers.get("content-type") || "";
			const data = contentType.includes("application/json") ? await response.json() : await response.text();

			return { ok: response.ok, status: response.status, statusText: response.statusText, data };
		} catch (error: any) {
			this.logger.error("[bizcheckmobile-shim] httpFetch error:", error?.message || error);
			return { ok: false, status: 0, statusText: error?.name === "AbortError" ? "Request timeout" : String(error?.message || error), data: null };
		} finally {
			clearTimeout(timer);
		}
	}
}

/* ============================== Device ============================== */

class WebDevice {
	private info: Record<string, any> = {};

	getInfo(): any {
		const ua = navigator.userAgent;
		return {
			platform: this.isIOS() ? "iOS" : this.isAndroid() ? "Android" : "Web",
			userAgent: ua,
			language: navigator.language,
			...this.info,
		};
	}
	setInfo(option: { key: string; value: any }): void {
		this.info[option.key] = option.value;
	}
	isApp(): boolean {
		// Native container is never present in this web build.
		return false;
	}
	isWeb(): boolean {
		return true;
	}
	isDesktop(): boolean {
		return !this.isMobile() && !this.isTablet();
	}
	isTablet(): boolean {
		return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
	}
	isMobile(): boolean {
		return /iPhone|iPod|Android.*Mobile/i.test(navigator.userAgent);
	}
	isIOS(): boolean {
		return /iPad|iPhone|iPod/.test(navigator.userAgent);
	}
	isAndroid(): boolean {
		return /Android/i.test(navigator.userAgent);
	}
}

/* ============================== App ============================== */

const logger = new WebLogger();

class WebApp {
	private timeout: { seconds: number; message?: string } = { seconds: 0 };

	async init(_options: { callback?: (result: any) => void; statusBarAppearance?: string; statusBarBackgroundColorString?: string }): Promise<any> {
		const result = { success: true };
		_options.callback?.(result);
		return result;
	}
	async hideSplash(option: { callback?: () => void; timeout?: number }): Promise<{ success: boolean; message?: string }> {
		option.callback?.();
		return { success: true };
	}
	async getTimeout(): Promise<any> {
		return this.timeout.seconds;
	}
	async setTimeout(option: { seconds: number; message?: string; callback?: (result: any) => void }): Promise<any> {
		this.timeout = { seconds: option.seconds, message: option.message };
		option.callback?.({ success: true });
		return { success: true };
	}
	exit(): void {
		logger.warn("[bizcheckmobile-shim] App.exit() is not available on web.");
	}
	restart(): void {
		window.location.reload();
	}
	kill(): void {
		logger.warn("[bizcheckmobile-shim] App.kill() is not available on web.");
	}
	async callPlugin(option: { pluginKey: string; params?: Record<string, any>; callback?: (response: any) => void }): Promise<any> {
		logger.warn(`[bizcheckmobile-shim] Native plugin "${option.pluginKey}" is not available on web.`);
		option.callback?.(null);
		return null;
	}
	haptic(option: { sound?: boolean; vibration?: boolean; positive?: boolean }): void {
		if (option.vibration && "vibrate" in navigator) navigator.vibrate(option.positive ? 10 : 30);
	}
	async smsRetriever(option: { type: "register" | "unregister"; callback?: (response: Record<string, any>) => void }): Promise<any> {
		logger.warn("[bizcheckmobile-shim] smsRetriever is not available on web.");
		option.callback?.({ registered: false });
		return { registered: false };
	}
	async imagePicker(option: { callback?: (response: Record<string, any>) => void }): Promise<any> {
		logger.warn("[bizcheckmobile-shim] imagePicker is not available on web.");
		option.callback?.({ picked: false });
		return { picked: false };
	}
	async contactPicker(option: { callback?: (response: Record<string, any>) => void }): Promise<any> {
		logger.warn("[bizcheckmobile-shim] contactPicker is not available on web.");
		option.callback?.({ picked: false });
		return { picked: false };
	}
}

/* ============================== Events ============================== */

interface EventsRequest {
	eventName: string;
	callback?: (response: any) => void;
}

class WebEvents {
	private listeners = new Map<string, Set<(response: any) => void>>();

	async register(event: EventsRequest): Promise<{ success: boolean; message?: any; data?: any }> {
		if (event.callback) {
			if (!this.listeners.has(event.eventName)) this.listeners.set(event.eventName, new Set());
			this.listeners.get(event.eventName)!.add(event.callback);
		}
		return { success: true };
	}
	async removeAll(event: EventsRequest): Promise<void> {
		this.listeners.delete(event.eventName);
	}
	async clear(): Promise<void> {
		this.listeners.clear();
	}
	async remove(event: EventsRequest): Promise<void> {
		if (event.callback) this.listeners.get(event.eventName)?.delete(event.callback);
		else this.listeners.delete(event.eventName);
	}
	/** Shim helper: fire a registered event (not part of the original public API). */
	emit(eventName: string, payload?: any): void {
		this.listeners.get(eventName)?.forEach((cb) => cb(payload));
	}
}

/* ============================== Database ============================== */

class WebDatabase {
	private warned = false;

	private warnOnce() {
		if (!this.warned) {
			logger.warn("[bizcheckmobile-shim] Native SQLite database is not available on web; database calls return empty results.");
			this.warned = true;
		}
	}
	async openDatabase(options: { dbName: string; onSuccess?: (response: any) => void; onError?: (error: any) => void }): Promise<any> {
		this.warnOnce();
		const result = { db: options.dbName, opened: false };
		options.onSuccess?.(result);
		return result;
	}
	async closeDatabase(options: { onSuccess?: (response: any) => void; onError?: (error: any) => void }): Promise<any> {
		options.onSuccess?.({});
		return {};
	}
	async beginTransaction(options: { onSuccess?: (response: any) => void; onError?: (error: any) => void }): Promise<any> {
		options.onSuccess?.({});
		return {};
	}
	async commitTransaction(options: { onSuccess?: (response: any) => void; onError?: (error: any) => void }): Promise<any> {
		options.onSuccess?.({});
		return {};
	}
	async rollbackTransaction(options: { onSuccess?: (response: any) => void; onError?: (error: any) => void }): Promise<any> {
		options.onSuccess?.({});
		return {};
	}
	async executeSql(options: { sql: string; params?: any[]; onSuccess?: (result: any) => void; onError?: (error: any) => void }): Promise<any> {
		this.warnOnce();
		const result = { rowsAffected: 0 };
		options.onSuccess?.(result);
		return result;
	}
	async executeSelect(options: { sql: string; params?: any[]; onSuccess?: (result: any) => void; onError?: (error: any) => void }): Promise<any> {
		this.warnOnce();
		const result = { rows: [] as any[] };
		options.onSuccess?.(result);
		return result;
	}
	async executeBatchSql(options: { sql: string; params?: any[]; onSuccess?: (result: any) => void; onError?: (error: any) => void }): Promise<any> {
		this.warnOnce();
		const result = { batch: true, rowsAffected: 0 };
		options.onSuccess?.(result);
		return result;
	}
}

/* ============================== FStorage ============================== */

class WebFStorage {
	async init(options: { callback?: (result: any) => void }): Promise<any> {
		const result = { initialized: true };
		options.callback?.(result);
		return result;
	}
	getInfo(): any {
		return { available: true };
	}
}

/* ============================== System ============================== */

class WebSystem {
	async callGallery(option: { type: string[]; maxCount: number; callback?: (response: any) => void }): Promise<any> {
		logger.warn("[bizcheckmobile-shim] callGallery is not available on web.");
		option.callback?.({ images: [], files: [] });
		return { images: [], files: [] };
	}
	async callBrowser(option: { url: string }): Promise<void> {
		window.open(option.url, "_blank");
	}
	async callCamera(option: { directory: string; autoVerticalHorizontal: boolean; fileName: string; callback?: (response: any) => void; directoryType?: string }): Promise<any> {
		logger.warn("[bizcheckmobile-shim] callCamera is not available on web.");
		option.callback?.(null);
		return null;
	}
	async callMap(option: { location: string; callback?: (response: any) => void }): Promise<any> {
		window.open(`https://www.google.com/maps?q=${encodeURIComponent(option.location)}`, "_blank");
		const result = { opened: true };
		option.callback?.(result);
		return result;
	}
	async callSMS(option: { number: string; message: string; callback?: (response: any) => void }): Promise<any> {
		window.location.href = `sms:${option.number}?body=${encodeURIComponent(option.message)}`;
		const result = { sent: true };
		option.callback?.(result);
		return result;
	}
	async callTEL(option: { number: string; callback?: (response: any) => void }): Promise<any> {
		window.location.href = `tel:${option.number}`;
		const result = { called: true };
		option.callback?.(result);
		return result;
	}
	async getGPS(option: { callback?: (location: { latitude: number; longitude: number }) => void }): Promise<any> {
		return new Promise((resolve, reject) => {
			if (!("geolocation" in navigator)) {
				reject(new Error("Geolocation not supported"));
				return;
			}
			navigator.geolocation.getCurrentPosition(
				(pos) => {
					const location = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
					option.callback?.(location);
					resolve(location);
				},
				(err) => reject(err),
				{ enableHighAccuracy: true, timeout: 15000 }
			);
		});
	}
}

/* ============================== AppSocial ============================== */

class WebAppSocial {
	async shareImage(option: { title: string; imagePath: string; callback?: (response: Record<string, any>) => void }): Promise<any> {
		return this.share({ title: option.title, url: option.imagePath }, option.callback);
	}
	async shareFile(option: { title: string; filePath: string; callback?: (response: Record<string, any>) => void }): Promise<any> {
		return this.share({ title: option.title, url: option.filePath }, option.callback);
	}
	async shareText(option: { title: string; text: string; callback?: (response: Record<string, any>) => void }): Promise<any> {
		return this.share({ title: option.title, text: option.text }, option.callback);
	}
	private async share(data: ShareData, callback?: (response: Record<string, any>) => void): Promise<any> {
		let result: Record<string, any>;
		try {
			if (navigator.share) {
				await navigator.share(data);
				result = { shared: true };
			} else {
				logger.warn("[bizcheckmobile-shim] Web Share API is not available in this browser.");
				result = { shared: false };
			}
		} catch (e: any) {
			result = { shared: false, message: e?.message };
		}
		callback?.(result);
		return result;
	}
}

/* ============================== DateTime ============================== */

function pad(value: number, length = 2): string {
	return String(value).padStart(length, "0");
}

/** Formats a Date using a date-context pattern (yyyy/mm/dd, case-insensitive month=mm). */
function formatSystemDate(date: Date, pattern: string): string {
	return pattern
		.replace(/yyyy/gi, String(date.getFullYear()))
		.replace(/mm/g, pad(date.getMonth() + 1))
		.replace(/MM/g, pad(date.getMonth() + 1))
		.replace(/dd/gi, pad(date.getDate()));
}

/** Formats a Date using a time-context pattern (hh/mm/ss/SSS). */
function formatSystemTime(date: Date, pattern: string): string {
	return pattern
		.replace(/SSS/g, pad(date.getMilliseconds(), 3))
		.replace(/hh/gi, pad(date.getHours()))
		.replace(/HH/g, pad(date.getHours()))
		.replace(/mm/g, pad(date.getMinutes()))
		.replace(/ss/g, pad(date.getSeconds()));
}

/** Parses a system-format date string (yyyymmdd / yyyy-mm-dd / ISO) into a Date. */
function parseDate(dateStr?: string | Date): Date {
	if (dateStr instanceof Date) return new Date(dateStr.getTime());
	if (!dateStr) return new Date();
	const digits = dateStr.replace(/\D/g, "");
	if (/^\d{8}/.test(digits)) {
		const y = Number(digits.slice(0, 4));
		const m = Number(digits.slice(4, 6)) - 1;
		const d = Number(digits.slice(6, 8));
		const hh = Number(digits.slice(8, 10) || "0");
		const mi = Number(digits.slice(10, 12) || "0");
		const ss = Number(digits.slice(12, 14) || "0");
		return new Date(y, m, d, hh, mi, ss);
	}
	return new Date(dateStr);
}

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

class DateTimeUtil {
	private systemDate(): string {
		return AppConfig.getDateTimeSystemPattern.date;
	}
	private toSystem(date: Date): string {
		return formatSystemDate(date, this.systemDate());
	}

	getDate(dateStr?: string): Date {
		return parseDate(dateStr);
	}
	compareTo(startDate: string | Date, endDate: string | Date): number {
		const a = parseDate(startDate).getTime();
		const b = parseDate(endDate).getTime();
		return a < b ? -1 : a > b ? 1 : 0;
	}
	getCurrentDate(pattern?: string): string {
		return formatSystemDate(new Date(), pattern || this.systemDate());
	}
	getCurrentDateTime(pattern?: string): string {
		const now = new Date();
		if (pattern) return formatSystemTime(new Date(formatSystemDate(now, "yyyy-mm-dd") + "T" + now.toTimeString()), pattern);
		return this.toSystem(now) + formatSystemTime(now, AppConfig.getDateTimeSystemPattern.time);
	}
	getCurrentTime(pattern?: string): string {
		return formatSystemTime(new Date(), pattern || AppConfig.getDateTimeSystemPattern.time);
	}
	isToday(dateStr?: string | Date): boolean {
		const d = parseDate(dateStr);
		const now = new Date();
		return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
	}
	getMonth(): number {
		return new Date().getMonth() + 1;
	}
	getDay(): number {
		return new Date().getDate();
	}
	getYear(): number {
		return new Date().getFullYear();
	}
	getMinute(): number {
		return new Date().getMinutes();
	}
	getSecond(): number {
		return new Date().getSeconds();
	}
	getPreviousDay(): string {
		const d = new Date();
		d.setDate(d.getDate() - 1);
		return this.toSystem(d);
	}
	isFirstHalfMonth(dateStr: string): boolean {
		return parseDate(dateStr).getDate() <= 15;
	}
	getMiddleDayMonth(): string {
		const d = new Date();
		d.setDate(15);
		return this.toSystem(d);
	}
	isFirstOfMonthFirstDay(dateStr: string): boolean {
		return parseDate(dateStr).getDate() === 1;
	}
	isSecondHalfOfMonthFirstDay(dateStr: string): boolean {
		return parseDate(dateStr).getDate() === 16;
	}
	addDay(dateStr: string, day: number): string {
		const d = parseDate(dateStr);
		d.setDate(d.getDate() + day);
		return this.toSystem(d);
	}
	subtractDays(dateStr: string, day: number): string {
		return this.addDay(dateStr, -day);
	}
	addMonth(dateStr: string, month: number): string {
		const d = parseDate(dateStr);
		d.setMonth(d.getMonth() + month);
		return this.toSystem(d);
	}
	subtractMonth(dateStr: string, month: number): string {
		return this.addMonth(dateStr, -month);
	}
	addYear(dateStr: string, year: number): string {
		const d = parseDate(dateStr);
		d.setFullYear(d.getFullYear() + year);
		return this.toSystem(d);
	}
	subtractYear(dateStr: string, year: number): string {
		return this.addYear(dateStr, -year);
	}
	isValidDate(dateStr: string): boolean {
		return !isNaN(parseDate(dateStr).getTime());
	}
	getFirstDay(dateStr: string): string {
		const d = parseDate(dateStr);
		return this.toSystem(new Date(d.getFullYear(), d.getMonth(), 1));
	}
	getLastDay(dateStr: string): string {
		const d = parseDate(dateStr);
		return this.toSystem(new Date(d.getFullYear(), d.getMonth() + 1, 0));
	}
	getLastDayOfMonth(dateStr: string, month?: number, year?: number): number {
		const d = parseDate(dateStr);
		return new Date(year ?? d.getFullYear(), (month ?? d.getMonth() + 1), 0).getDate();
	}
	getLastDayOfYear(dateStr?: string): number {
		const y = parseDate(dateStr).getFullYear();
		return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 366 : 365;
	}
	getDiffMonthBetweenDates(fromDate: string, toDate: string): number {
		const a = parseDate(fromDate);
		const b = parseDate(toDate);
		return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
	}
	getDiffBetweenDates(fromDate: string, toDate: string): number {
		const a = parseDate(fromDate);
		const b = parseDate(toDate);
		a.setHours(0, 0, 0, 0);
		b.setHours(0, 0, 0, 0);
		return Math.round((b.getTime() - a.getTime()) / 86400000);
	}
	isGreaterThanTo(baseDate: string, compareDate: string): boolean {
		return this.compareTo(baseDate, compareDate) > 0;
	}
	isGreaterThanEqualTo(baseDate: string, compareDate: string): boolean {
		return this.compareTo(baseDate, compareDate) >= 0;
	}
	isLessThanTo(baseDate: string, compareDate: string): boolean {
		return this.compareTo(baseDate, compareDate) < 0;
	}
	isLessThanEqualTo(baseDate: string, compareDate: string): boolean {
		return this.compareTo(baseDate, compareDate) <= 0;
	}
	isBetweenWithinDate(date: string, fromDate: string, toDate: string): boolean {
		return this.isGreaterThanEqualTo(date, fromDate) && this.isLessThanEqualTo(date, toDate);
	}
	getCountDayOfMonth(dateStr: string): number {
		return this.getLastDayOfMonth(dateStr);
	}
	getCountDayOfYear(dateStr: string): number {
		return this.getLastDayOfYear(dateStr);
	}
	isNotNewMonthFirstDay(dateStr: string): boolean {
		return parseDate(dateStr).getDate() !== 1;
	}
	isNotNewYearFirstDay(dateStr: string): boolean {
		const d = parseDate(dateStr);
		return !(d.getMonth() === 0 && d.getDate() === 1);
	}
	isNotNewHalfYearFirstDay(dateStr: string): boolean {
		const d = parseDate(dateStr);
		return !((d.getMonth() === 0 || d.getMonth() === 6) && d.getDate() === 1);
	}
	getWeekRangeMonday(dateStr: string): { start: string; end: string } {
		const d = parseDate(dateStr);
		const day = d.getDay();
		const diffToMonday = day === 0 ? -6 : 1 - day;
		const monday = new Date(d);
		monday.setDate(d.getDate() + diffToMonday);
		const sunday = new Date(monday);
		sunday.setDate(monday.getDate() + 6);
		return { start: this.toSystem(monday), end: this.toSystem(sunday) };
	}
	getCalendarMatrix(year: number, indexMonth: number): Array<Array<{ dayIndex: number; date: number; year: number; month: number; day: string; status: string; dateString: string }>> {
		const firstDay = new Date(year, indexMonth, 1);
		const startOffset = firstDay.getDay();
		const matrix: Array<Array<{ dayIndex: number; date: number; year: number; month: number; day: string; status: string; dateString: string }>> = [];
		const cursor = new Date(year, indexMonth, 1 - startOffset);

		for (let week = 0; week < 6; week++) {
			const row: Array<{ dayIndex: number; date: number; year: number; month: number; day: string; status: string; dateString: string }> = [];
			for (let i = 0; i < 7; i++) {
				const inMonth = cursor.getMonth() === indexMonth;
				row.push({
					dayIndex: cursor.getDay(),
					date: cursor.getDate(),
					year: cursor.getFullYear(),
					month: cursor.getMonth() + 1,
					day: DAY_SHORT[cursor.getDay()],
					status: inMonth ? "current" : cursor.getMonth() < indexMonth || cursor.getFullYear() < year ? "previous" : "next",
					dateString: this.toSystem(cursor),
				});
				cursor.setDate(cursor.getDate() + 1);
			}
			matrix.push(row);
		}
		return matrix;
	}
}

/* ============================== DataObject ============================== */

class DataObject extends Map<string, any> {
	setString(key: string, value: string): void {
		this.set(key, value);
	}
	setBoolean(key: string, value: boolean): void {
		this.set(key, value);
	}
	setNumber(key: string, value: number): void {
		this.set(key, value);
	}
	getString(key: string): string {
		return this.get(key);
	}
	getBoolean(key: string): boolean {
		return this.get(key);
	}
	getNumber(key: string): number {
		return this.get(key);
	}
	getData(key: string): DataObject {
		return this.get(key);
	}
	setData(key: string, value: DataObject): void {
		this.set(key, value);
	}
	getDataList(key: string): Array<DataObject> {
		return this.get(key);
	}
	setDataList(key: string, value: Array<DataObject>): void {
		this.set(key, value);
	}
	appendData(data: DataObject): void {
		data.forEach((value, key) => this.set(key, value));
	}
	toJSON(): Record<string, any> {
		const obj: Record<string, any> = {};
		this.forEach((value, key) => {
			obj[key] = value instanceof DataObject ? value.toJSON() : value;
		});
		return obj;
	}
	toList(): Array<Record<string, any>> {
		return [this.toJSON()];
	}
	toString(): string {
		return JSON.stringify(this.toJSON());
	}
}

/* ============================== String ============================== */

class StringUtil {
	encodeBase64ByString(strValue: string): string {
		const bytes = new TextEncoder().encode(strValue);
		let binary = "";
		bytes.forEach((b) => (binary += String.fromCharCode(b)));
		return btoa(binary);
	}
	decodeBase64ToString(strValue: string): string {
		const binary = atob(strValue);
		const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
		return new TextDecoder().decode(bytes);
	}
	leftPad(strValue: string, length: number, padValue: string): string {
		let out = String(strValue);
		while (out.length < length) out = padValue + out;
		return out.slice(-length);
	}
	rightPad(strValue: string, length: number, padValue: string): string {
		let out = String(strValue);
		while (out.length < length) out = out + padValue;
		return out.slice(0, length);
	}
	isEmpty(strValue: string): boolean {
		return strValue == null || String(strValue).trim() === "";
	}
	isDigit(strValue: string): boolean {
		return /^\d+$/.test(strValue);
	}
	isNull(strValue: string): boolean {
		return strValue === null || strValue === undefined || strValue === "";
	}
	compareStringArray(compareValue: string, ...arg: string[]): boolean {
		return arg.includes(compareValue);
	}
	byteLength(strValue: string): number {
		return new TextEncoder().encode(strValue).length;
	}
	NVL(dataObj: DataObject, defaultValue: string): void {
		dataObj.forEach((value, key) => {
			if (value === null || value === undefined || value === "") dataObj.set(key, defaultValue);
		});
	}
	stringToBoolean(strValue: string): boolean {
		return ["true", "Y", "1"].includes(String(strValue));
	}
	nullToEmpty(strValue: string): string {
		return strValue == null ? "" : strValue;
	}
	lTrim(strValue: string): string {
		return String(strValue).replace(/^\s+/, "");
	}
	rTrim(strValue: string): string {
		return String(strValue).replace(/\s+$/, "");
	}
	trim(strValue: string): string {
		return String(strValue).trim();
	}

	numberFormat(value: string | number, pattern = "#,###"): string {
		const num = Number(String(value).replace(/[^0-9.-]/g, ""));
		if (isNaN(num)) return String(value);
		const decimalPart = pattern.split(".")[1];
		const decimals = decimalPart ? decimalPart.length : 0;
		return num.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
	}

	currencyFormat(value: string | number, options: Partial<{ currencyCode: string; pattern: string; showCurrencyCode: boolean; position: "start" | "end" }> = {}): string {
		const code = options.currencyCode || "USD";
		const pattern = options.pattern || AppConfig.getCurrencyPattern.currencyCode[code] || "#,###.00";
		const formatted = this.numberFormat(value, pattern);
		if (!options.showCurrencyCode) return formatted;
		return options.position === "start" ? `${code} ${formatted}` : `${formatted} ${code}`;
	}

	currencyUnFormat(value: string | number, options: Partial<{ currencyCode: string; pattern: string; showCurrencyCode: boolean; position: "start" | "end" }> = {}): string {
		void options;
		return String(value).replace(/[^0-9.-]/g, "");
	}

	dateFormat(value: string, pattern?: string): string {
		if (this.isEmpty(value)) return "";
		const date = parseDate(value);
		if (isNaN(date.getTime())) return value;
		return this._formatDisplay(date, pattern || AppConfig.getDatePattern.pattern);
	}
	dateUnFormat(value: string, pattern?: string): string {
		void pattern;
		const date = this._parseDisplay(value);
		return formatSystemDate(date, AppConfig.getDateTimeSystemPattern.date);
	}
	timeFormat(value: string, pattern?: string): string {
		if (this.isEmpty(value)) return "";
		const digits = value.replace(/\D/g, "");
		const d = new Date();
		d.setHours(Number(digits.slice(0, 2) || "0"), Number(digits.slice(2, 4) || "0"), Number(digits.slice(4, 6) || "0"), Number(digits.slice(6, 9) || "0"));
		return formatSystemTime(d, pattern || AppConfig.getTimePattern.pattern);
	}
	timeUnFormat(value: string, pattern?: string): string {
		void pattern;
		return value.replace(/\D/g, "");
	}
	dateTimeFormat(value: string, pattern?: string): string {
		if (this.isEmpty(value)) return "";
		const date = parseDate(value);
		if (isNaN(date.getTime())) return value;
		return this._formatDisplay(date, pattern || AppConfig.getDateTimePattern.pattern);
	}
	dateTimeUnFormat(value: string, pattern?: string): string {
		void pattern;
		const date = this._parseDisplay(value);
		const sys = AppConfig.getDateTimeSystemPattern;
		return formatSystemDate(date, sys.date) + formatSystemTime(date, sys.time);
	}

	phoneNumberFormat(value: string, pattern?: string): string {
		const digits = String(value).replace(/\D/g, "");
		const fmt = pattern || AppConfig.getDataPattern["phoneNo"]?.pattern || "### ### ####";
		return this._applyPattern(digits, fmt);
	}
	unFormatPhoneNumber(formatted: string): string {
		return String(formatted).replace(/\D/g, "");
	}

	accountFormat(accountNo: string, type = "accountNo", pattern?: string): string {
		const cfg = AppConfig.getDataPattern[type];
		let raw = String(accountNo).replace(/\D/g, "");
		if (cfg?.prefix && raw.startsWith(cfg.prefix)) raw = raw.slice(cfg.prefix.length);
		return this._applyPattern(raw, pattern || cfg?.pattern || "");
	}
	accountUnFormat(formatted: string, type = "accountNo", addPrefix = true): string {
		const cfg = AppConfig.getDataPattern[type];
		const raw = String(formatted).replace(/\D/g, "");
		return addPrefix && cfg?.prefix ? cfg.prefix + raw : raw;
	}

	/** Fills '#' placeholders in a pattern with the given digits. */
	private _applyPattern(digits: string, pattern: string): string {
		if (!pattern) return digits;
		let out = "";
		let idx = 0;
		for (const ch of pattern) {
			if (idx >= digits.length) break;
			if (ch === "#") out += digits[idx++];
			else out += ch;
		}
		out += digits.slice(idx);
		return out;
	}

	/** Formats a Date with display tokens: YYYY, YY, MMM, MM, DD, HH, mm, ss. */
	private _formatDisplay(date: Date, pattern: string): string {
		return pattern
			.replace(/YYYY/g, String(date.getFullYear()))
			.replace(/YY/g, String(date.getFullYear()).slice(-2))
			.replace(/MMM/g, MONTH_SHORT[date.getMonth()])
			.replace(/MM/g, pad(date.getMonth() + 1))
			.replace(/DD/g, pad(date.getDate()))
			.replace(/HH/g, pad(date.getHours()))
			.replace(/mm/g, pad(date.getMinutes()))
			.replace(/ss/g, pad(date.getSeconds()));
	}

	/** Best-effort parse of a display-formatted date string back into a Date. */
	private _parseDisplay(value: string): Date {
		const monthIdx = MONTH_SHORT.findIndex((m) => value.includes(m));
		if (monthIdx >= 0) {
			const nums = value.match(/\d+/g) || [];
			const day = Number(nums[0] || "1");
			const year = Number(nums.find((n) => n.length === 4) || new Date().getFullYear());
			const timeNums = nums.filter((n) => n.length <= 2).slice(1);
			return new Date(year, monthIdx, day, Number(timeNums[0] || "0"), Number(timeNums[1] || "0"), Number(timeNums[2] || "0"));
		}
		return parseDate(value);
	}
}

/* ============================== Localization ============================== */

class WebLocalization {
	private locale = "en-US";

	setLocale(options: { localeCode: string }): void {
		this.locale = options.localeCode;
		AppConfig.setLocale(options.localeCode);
	}
	async getLocale(options: { callback: (locale: string) => void }): Promise<any> {
		options.callback(this.locale);
		return this.locale;
	}
	getFullLocale(options: { localeCode: string }): string {
		const map: Record<string, string> = { en: "en-US", km: "km-KH", ko: "ko-KR" };
		return map[options.localeCode] || options.localeCode;
	}
}

/* ============================== Singletons + exports ============================== */

const BizCheckMobileWebSystem = new WebSystem();
const BizCheckMobileWebApp = new WebApp();
const BizCheckMobileWebEvents = new WebEvents();
const BizCheckMobileWebDevice = new WebDevice();
const BizCheckMobileWebFStorage = new WebFStorage();
const BizCheckMobileWebNetwork = new WebNetwork();
const BizCheckMobileWebDatabase = new WebDatabase();
const BizCheckMobileWebLocalization = new WebLocalization();
const BizCheckMobileWebLogger = new WebLogger();
const BizCheckMobileWebProperties = new WebProperties();
const BizCheckMobileWebAppSocial = new WebAppSocial();
const BizCheckMobileWebDataObject = new DataObject();
const BizCheckMobileWebDateTime = new DateTimeUtil();
const BizCheckMobileWebString = new StringUtil();

export {
	BizCheckMobileWebApp,
	BizCheckMobileWebAppSocial,
	BizCheckMobileWebDataObject,
	BizCheckMobileWebDatabase,
	BizCheckMobileWebDateTime,
	BizCheckMobileWebDevice,
	BizCheckMobileWebEvents,
	BizCheckMobileWebFStorage,
	BizCheckMobileWebLocalization,
	BizCheckMobileWebLogger,
	BizCheckMobileWebNetwork,
	BizCheckMobileWebProperties,
	BizCheckMobileWebString,
	BizCheckMobileWebSystem,
	AppConfig as default,
};
