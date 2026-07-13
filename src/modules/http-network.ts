import AppConfig from "@/shared/bizcheckmobile";

/**
 * Custom HTTP headers interface
 * Allows standard headers as well as custom keys
 */
export interface HttpHeaders {
	"Content-Type"?: "application/json" | "application/x-www-form-urlencoded; charset=UTF-8" | "multipart/form-data";
	"Accept-Language"?: string;
	[key: string]: any;
}

/**
 * HTTP fetch options interface
 * Extends native fetch options with additional configurations
 */
export interface HttpOptions {
	headers?: HttpHeaders;
	method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
	body?: any;
	mode?: "cors" | "no-cors" | "same-origin";
	credentials?: "include" | "same-origin" | "omit";
	cache?: "default" | "no-store" | "reload" | "no-cache" | "force-cache" | "only-if-cached";
	[key: string]: any;
}

/**
 * HTTP fetch parameters interface
 */
export interface HttpFetchParams {
	/** The URL to fetch */
	url: string;
	/** Fetch options */
	option: HttpOptions;
	/** Request timeout in milliseconds */
	timeout: number;
}

/**
 * HTTP response interface
 */
export interface HttpResponse<T = any> {
	/** Whether the request was successful */
	ok: boolean;
	/** HTTP status code */
	status: number;
	/** HTTP status text */
	statusText: string;
	/** Response data */
	data: T | null;
}

/**
 * HTTP request options input interface
 */
export interface HttpRequestInput {
	/** Request body data */
	body?: any;
	/** HTTP method */
	method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
}

/**
 * HTTP Network module for handling HTTP requests
 * @description Provides low-level HTTP functionality with retry logic and timeout handling
 */
export default class HttpNetwork {
	private readonly DEFAULT_TIMEOUT = 5000;
	private readonly MAX_RETRY_ATTEMPTS = 1;
	private static instance: HttpNetwork;

	private constructor() {
		this.DEFAULT_TIMEOUT = 5000;
		this.MAX_RETRY_ATTEMPTS = 1;
	}

	static getInstance(): HttpNetwork {
		if (!this.instance) {
			this.instance = new HttpNetwork();
		}
		return this.instance;
	}

	/**
	 * Builds HTTP options for fetch requests
	 * @param {HttpRequestInput} param - Request parameters
	 * @returns {HttpOptions} Complete HTTP options object
	 */
	getHttpOptions(param: HttpRequestInput): HttpOptions {
		const defaultOptions: HttpOptions = {
			headers: {
				"Content-Type": "application/json",
				"Accept": "*/*",
				"Accept-Language": "en-US,en;q=0.9,km-KH;q=0.8,fr-FR;q=0.7,de-DE;q=0.6,es-ES;q=0.5,it-IT;q=0.4,ja-JP;q=0.3,zh-CN;q=0.2,zh-TW;q=0.1,ko-KR;q=0.05,th-TH;q=0.01",
				"Accept-Encoding": "gzip, deflate, br, zstd",
				"Accept-Charset": "utf-8",
			},
			credentials: "include",
			mode: "cors",
			cache: "no-cache",
			body: param.body,
			method: param.method
		};

		// Merge with app configuration if available
		if (AppConfig.network && AppConfig.network.option) {
			return {
				...defaultOptions,
				headers: {
					...defaultOptions.headers,
					...AppConfig.network.headers
				},
				...AppConfig.network.option
			};
		}

		return defaultOptions;
	}
}
