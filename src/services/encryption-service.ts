import HttpNetwork from "@/modules/http-network";
import DialogUtil from "@/utilities/dialog-util";
import AppConfig, { BizCheckMobileApp, BizCheckMobileDevice, BizCheckMobileLogger, BizCheckMobileNetwork, BizCheckMobileProperties } from "@/shared/bizcheckmobile";

const subtle = window.crypto.subtle;

/** Standard LOS HTTP envelope for IAM-style responses */
interface LosHttpEnvelope {
	header?: { messageInfo?: { result?: boolean } };
	payload?: { keyId?: string; publicKey?: string; expiresAt?: string };
}

export default class EncryptionService {
	private static instance: EncryptionService;
	private static encryptInfo: any;
	private readonly httpNetwork: HttpNetwork;
	private static requestList: { [key: string]: { key: any } }[] = [];
	private request: { [key: string]: { key: any } } = {};

	private constructor() {
		this.httpNetwork = HttpNetwork.getInstance();
	}

	static getInstance(): EncryptionService {
		if (!this.instance) {
			this.instance = new EncryptionService();
		}
		return this.instance;
	}

	/** Normalize cached server key from BizCheckMobileProperties (string JSON or already-parsed object). */
	private static parseEncryptInfoFromProperties(): LosHttpEnvelope["payload"] | null {
		const raw = BizCheckMobileProperties.get("encryptInfo");
		if (raw == null || raw === "") {
			return null;
		}
		if (typeof raw === "string") {
			try {
				const parsed = JSON.parse(raw) as LosHttpEnvelope["payload"];
				return parsed && typeof parsed === "object" ? parsed : null;
			} catch {
				return null;
			}
		}
		if (typeof raw === "object") {
			return raw as LosHttpEnvelope["payload"];
		}
		return null;
	}

	private generateKeyPair(option: { callback: (response: any) => void }) {
		subtle.generateKey(
			{ name: "ECDH", namedCurve: "P-256" },
			true,
			["deriveKey"]
		).then((response: any) => {
			option.callback(response);
		});
	}

	private getClientPublicKey(option: { clientPublicKey: CryptoKey, callback: (response?: any) => void }) {
		subtle.exportKey("spki", option.clientPublicKey).then((clientKey) => {
			option.callback(this.arrayBufferToBase64(clientKey));
		});
	}

	encrypt(option: { data: any, callback: (response: any) => void, trCode: string }) {
		try {
			if (BizCheckMobileDevice.isApp() || !JSON.parse(import.meta.env.VITE_ENABLE_ENCRYPT || "false")) {
				option.callback(option.data);
				return;
			}

			const iv = window.crypto.getRandomValues(new Uint8Array(12));
			const dataString = JSON.stringify(option.data);
			const encodedData = new TextEncoder().encode(dataString);
			const shareKey = EncryptionService.requestList.filter((item) => (option.trCode in item))[0];

			subtle.encrypt(
				{ name: "AES-GCM", iv: iv },
				(shareKey as any)[option.trCode].key,
				encodedData
			).then((encrypted) => {
				const combined = new Uint8Array(iv.length + encrypted.byteLength);
				combined.set(iv, 0);
				combined.set(new Uint8Array(encrypted), iv.length);
				const result = this.arrayBufferToBase64(combined.buffer);
				option.callback({ encryptedData: result });
			});

		} catch (error) {
			BizCheckMobileLogger.info("encrypted error => ", error);
		}
	}

	decrypt(option: { data: any, callback: (response: any) => void, trCode: string }) {
		try {
			const encryptOff = !JSON.parse(import.meta.env.VITE_ENABLE_ENCRYPT || "false");
			const noPayload =
				!option.data.encryptedData || option.data.encryptedData === "";
			if (BizCheckMobileDevice.isApp() || (option.trCode && option.trCode === "") || encryptOff || noPayload) {
				option.callback(option.data);
				return;
			}

			const combined = this.base64ToArrayBuffer(option.data.encryptedData);
			const combinedArray = new Uint8Array(combined);
			const iv = combinedArray.slice(0, 12);
			const encryptedData = combinedArray.slice(12);
			const shareKey = EncryptionService.requestList.filter((item) => (option.trCode in item))[0];

			subtle.decrypt(
				{ name: "AES-GCM", iv: iv },
				(shareKey as any)[option.trCode].key,
				encryptedData
			).then((decrypted) => {
				const decryptedString = new TextDecoder().decode(decrypted);
				EncryptionService.requestList = EncryptionService.requestList.filter((item) => !(option.trCode in item));
				option.callback(JSON.parse(decryptedString));
			}).catch((error) => {
				BizCheckMobileLogger.error("decrypt error =>", error);
			});

		} catch (error) {
			BizCheckMobileLogger.error("decrypt error =>", error);
		}
	}

	private getServerPublicKey(option: { callback: (response: any) => void }) {
		Promise.resolve(EncryptionService.parseEncryptInfoFromProperties()).then((encryptInfo) => {
			if (!encryptInfo?.publicKey) {
				BizCheckMobileLogger.error("getServerPublicKey: missing encryptInfo or publicKey");
				return;
			}
			EncryptionService.encryptInfo = encryptInfo;
			const serverKey = this.base64ToArrayBuffer(EncryptionService.encryptInfo.publicKey);
			subtle.importKey(
				"spki",
				serverKey,
				{ name: "ECDH", namedCurve: "P-256" },
				true,
				[]
			).then((serverKey) => {
				option.callback(serverKey);
			});
		});
	}

	private generateShareKey(options: { clientPrivateKey: CryptoKey, serverPublicKey: CryptoKey, callback: (response?: any) => void, trCode: string }) {
		subtle.deriveKey(
			{ name: "ECDH", public: options.serverPublicKey },
			options.clientPrivateKey,
			{ name: "AES-GCM", length: 256 },
			true,
			["encrypt", "decrypt"]
		).then((response) => {
			const requestId =
				options.trCode + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 11);
			this.request = {};
			this.request[requestId] = { key: response };
			EncryptionService.requestList.push(this.request);
			options.callback({ requestId, shareKey: response });
		});
	}

	initServerKey(options: { callback: (response?: any) => void }) {
		BizCheckMobileLogger.info("initServerKey => ", import.meta.env.VITE_ENABLE_ENCRYPT);
		if (!JSON.parse(import.meta.env.VITE_ENABLE_ENCRYPT || "false")) {
			options.callback({});
			return;
		}

		const encryptInfo = EncryptionService.parseEncryptInfoFromProperties();
		let is1MinLeft = false;

		if (encryptInfo?.expiresAt) {
			const expiredAt = new Date(encryptInfo.expiresAt);
			const now = new Date();
			const remainMs = expiredAt.getTime() - now.getTime();
			is1MinLeft = !Number.isFinite(remainMs) || remainMs <= 60 * 1000;
		} else {
			is1MinLeft = true;
		}

		if (!is1MinLeft && encryptInfo?.keyId) {
			AppConfig.setNetwork({
				...AppConfig.network,
				headers: {
					...AppConfig.network.headers,
					"X-Server-KeyId": encryptInfo.keyId
				}
			});

			EncryptionService.encryptInfo = encryptInfo;
			options.callback(encryptInfo);
			return;
		}

		const subdomain =
			BizCheckMobileProperties.get("app_subdomain") ||
			import.meta.env.VITE_SERVER_SUB_DOMAIN ||
			"";
		// Web: same-origin /alias-server so Vite dynamicSubdomainProxy applies (X-Subdomain). Direct AppConfig.network.url causes status 0 / CORS in browser dev.
		const url = BizCheckMobileDevice.isApp()
			? `${AppConfig.network.url}/iam/enc/server-key`
			: "/alias-server/iam/enc/server-key";

		AppConfig.setNetwork({
			...AppConfig.network,
			method: "GET",
			headers: {
				...AppConfig.network.headers,
				"Content-Type": "application/json"
			}
		});

		const httpOptions = this.httpNetwork.getHttpOptions({ method: "GET" });
		if (subdomain && httpOptions.headers) {
			httpOptions.headers["X-Subdomain"] = subdomain;
		}

		BizCheckMobileNetwork.requestHttp({
			url,
			httpOptions,
			timeout: AppConfig.network.timeout,
			method: "GET"
		}).then((response: LosHttpEnvelope) => {
			if (response.header?.messageInfo && !response.header.messageInfo.result) {
				DialogUtil.showAlert({
					header: "Connection Issue",
					message: "We're having trouble connecting to the server"
				});
				return;
			}

			if (!response.payload) {
				DialogUtil.showAlert({
					header: "Connection Issue",
					message: "We're having trouble connecting to the server"
				});
				return;
			}

			const payload = response.payload;

			AppConfig.setNetwork({
				...AppConfig.network,
				headers: {
					...AppConfig.network.headers,
					"X-Server-KeyId": payload.keyId
				}
			});

			EncryptionService.encryptInfo = payload;
			BizCheckMobileProperties.set("encryptInfo", JSON.stringify(payload));
			options.callback(response);
		}).catch((error: unknown) => {
			BizCheckMobileLogger.error("initServerKey err => ", error);
			DialogUtil.showAlert({
				header: "Connection Issue",
				message: "We're having trouble connecting to the server"
			});
			// Still notify caller so bootstrap (e.g. app.mount) can complete; Ionic alerts may be limited before mount.
			options.callback({});
		});
	}

	initServerKeyWithPlugin(options: { callback: (response?: any) => void }) {
		BizCheckMobileLogger.info("on call initServerKeyWithPlugin => ", import.meta.env.VITE_ENABLE_ENCRYPT);
		if (!JSON.parse(import.meta.env.VITE_ENABLE_ENCRYPT || "false")) {
			options.callback({});
			return;
		}

		const encryptInfo = EncryptionService.parseEncryptInfoFromProperties();
		let is1MinLeft = false;

		if (encryptInfo?.expiresAt) {
			const expiredAt = new Date(encryptInfo.expiresAt);
			const now = new Date();
			const remainMs = expiredAt.getTime() - now.getTime();
			is1MinLeft = !Number.isFinite(remainMs) || remainMs <= 60 * 1000;
		} else {
			is1MinLeft = true;
		}

		if (!is1MinLeft && encryptInfo?.keyId) {
			AppConfig.setNetwork({
				...AppConfig.network,
				headers: {
					...AppConfig.network.headers,
					"X-Server-KeyId": encryptInfo.keyId
				}
			});

			EncryptionService.encryptInfo = encryptInfo;
			options.callback(encryptInfo);
			return;
		}

		// const serverKeyUrl = "https://kh-mcnc-001.mcnc.com.kh/iam/enc/server-key";
		const serverKeyUrl = "https://" + (import.meta.env.VITE_SERVER_SUB_DOMAIN ? import.meta.env.VITE_SERVER_SUB_DOMAIN + "." : "") + import.meta.env.VITE_SERVER_DOMAIN + "/iam/enc/server-key";
		BizCheckMobileLogger.log("on call BizmobApp Call Plugin Server Key => ", {
			url: serverKeyUrl,
			type: "request"
		});

		BizCheckMobileApp.callPlugin({
			pluginKey: "SERVER_KEY_PLUGIN",
			params: {
				header: {
					result: true,
					error_code: "",
					erro_message: "",
				},
				body: {
					url: serverKeyUrl,
					type: "request"
				},
			},
			callback: (response: any) => {
				// alert(JSON.stringify(response));
				BizCheckMobileLogger.log("BizmobApp Call Plugin Server Key response => ", response);
				const payload = response.payload;
				options.callback(payload);
			}
		});
	}

	prepareKeys(option: { callback: (response?: any) => void, trCode: string }) {
		if (!JSON.parse(import.meta.env.VITE_ENABLE_ENCRYPT || "false")) {
			const requestId =
				option.trCode + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 11);
			this.request = {};
			this.request[requestId] = { key: "" };
			option.callback({ requestId });
			return;
		}
		BizCheckMobileLogger.log("prepareKeys Function Called => ", BizCheckMobileDevice.isApp());

		if (BizCheckMobileDevice.isApp()) {
			this.initServerKeyWithPlugin({
				callback: (response) => {
					option.callback(response);
					BizCheckMobileLogger.log("initServerKeyWithPlugin response => ", response);
				}
			});
			return;
		}

		this.initServerKey({
			callback: (response) => {
				this.generateKeyPair({
					callback: (keyPair) => {
						this.getClientPublicKey({
							clientPublicKey: keyPair.publicKey,
							callback: (clientKey) => {
								this.getServerPublicKey({
									callback: (serverKey) => {
										this.generateShareKey({
											clientPrivateKey: keyPair.privateKey,
											serverPublicKey: serverKey,
											trCode: option.trCode,
											callback: (sharedKey) => {
												option.callback({ ...sharedKey, clientKey });
											}
										});
									}
								});
							}
						});
					}
				});
			}
		});
	}


	/**
	 * Convert an ArrayBuffer to a Base64 string.
	 */
	private arrayBufferToBase64(buffer: ArrayBuffer): string {
		const binary = String.fromCharCode(...new Uint8Array(buffer));
		return btoa(binary);
	}

	/**
	 * Convert a Base64 string to an ArrayBuffer.
	 */
	private base64ToArrayBuffer(base64: string): ArrayBuffer {
		const binary = atob(base64);
		const len = binary.length;
		const bytes = new Uint8Array(len);
		for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
		return bytes.buffer;
	}

}
