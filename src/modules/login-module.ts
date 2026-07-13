/* eslint-disable no-unused-vars */
import { LOGINRequest } from "@/interfaces/LOG/LOGIN";
import LoginAPI from "@/services/api/login-api";
import LocalServices from "@/services/local-services";
import PushNotificationService from "@/services/push-notification-service";
import RouterServices from "@/services/router-services";
import { SharedDataStore } from "@/stores/shared-data";
import DialogUtil from "@/utilities/dialog-util";
import { PKCEUtil } from "@/utilities/pkce";
import { RequestOptions } from "@/services/network-servies";
import { BizCheckMobileApp, BizCheckMobileDevice, BizCheckMobileFStorage, BizCheckMobileLogger, BizCheckMobileProperties } from "@/shared/bizcheckmobile";
import * as OTPAuth from "otpauth";
import { LOG1200000Request, LOG1200000Response } from "@/interfaces/LOG/LOG1200000";

export default class LoginModule {
	private static instance: LoginModule;
	private routerService: RouterServices;
	private loginAPI: LoginAPI;
	private pushNotificationService: PushNotificationService;
	private localService = new LocalServices();

	private constructor() {
		this.loginAPI = LoginAPI.getInstance();
		this.routerService = new RouterServices();
		this.pushNotificationService = new PushNotificationService();
	}

	static getInstance(): LoginModule {

		if (!LoginModule.instance) {
			LoginModule.instance = new LoginModule();
		}
		return LoginModule.instance;
	}

	/**
	 *
	 * @param options
	 * options.user - User can be optinal within emtpy string or mapping with employyeeId
	 * @returns
	 */
	login(options: { userId: string, password: string, companyId: string }) {

		if (!options || !options.userId || !options.password || !options.companyId) {
			DialogUtil.showAlert({
				message: "Oops! The username or password is incorrect. Please try again."
			});
			return;
		}

		let d = new Date().getTime();
		const newGuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
			const r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
		});

		const macAddress = BizCheckMobileDevice.isApp() ? BizCheckMobileDevice.getInfo()["device_id"] : `emulator-${newGuid.substring(0, 8)}`;
		BizCheckMobileProperties.set("deviceId", macAddress);

		const request: LOGINRequest = {
			userId: options.userId,
			password: options.password,
			companyId: options.companyId,
			platformType: "02",
			deviceId: macAddress
		};

		this.loginAPI.login({
			body: request,
			enableLoading: true,
			endPoint: "login",
			onSuccess: (response: any) => {
				BizCheckMobileLogger.log("Login successful:", response);

				SharedDataStore().setItem("authenticationInfo", { ...response, userId: options.userId, companyId: options.companyId, deviceId: macAddress });

				this.routerService.push("/LOG1100000");
			},
			onFailed: (error) => {
				// Handle login failure
				BizCheckMobileLogger.log("Login failed:", error);
				DialogUtil.showAlert({ message: `${error.message} (${error.code})` });
			}
		});
	}

	logout() {
		const authInfo = JSON.parse(BizCheckMobileProperties.get("token"));
		this.loginAPI.logout({
			enableLoading: true,
			endPoint: "revoke-token",
			body: { refreshToken: authInfo.refreshToken },
			onSuccess: () => {
				BizCheckMobileLogger.info("success revoke.....");
				BizCheckMobileFStorage.init({
					callback: (response) => {
						BizCheckMobileProperties.clear({
							callback: () => {
								BizCheckMobileLogger.info("BizCheckMobileFStorage => ", response);
								if (!BizCheckMobileDevice.isApp()) {
									for (const element of Object.keys(response)) {
										response[element] = JSON.stringify(response[element]);
									}
								}

								if (response["userRegisterPushNotification"]) {
									BizCheckMobileProperties.set("userRegisterPushNotification", JSON.parse(response["userRegisterPushNotification"] || ""));
								}

								if (response["pushNotification"]) {
									BizCheckMobileProperties.set("pushNotification", JSON.parse(response["pushNotification"] || "false"));
								}

								BizCheckMobileProperties.set("app_subdomain", JSON.parse(response["app_subdomain"] || ""));
								BizCheckMobileProperties.set("languageReady", true);
								BizCheckMobileProperties.set("languageCode", JSON.parse(response["languageCode"] || "01"));
								BizCheckMobileProperties.set("alreadyConfirmTC", true);
								BizCheckMobileProperties.set("i18n", JSON.parse(response["i18n"]) || "en");
								BizCheckMobileProperties.set("appTheme", JSON.parse(response["appTheme"] || "{}"));


								DialogUtil.closeAllModals();
								DialogUtil.closeAllDialogs();
								DialogUtil.closeAllLoadings();
								DialogUtil.closeAllToasts();
								DialogUtil.closeAllAlerts();
								this.routerService.backToRoot("/LOG1000000");
							}
						});
					}
				});
			}
		});
	}

	async otpVerify(options: { otpCode: string, otpMethodType: string, onSuccess?: () => void }) {

		DialogUtil.showLoading();

		const authenticationInfo = SharedDataStore().getItem("authenticationInfo");
		const macAddress = BizCheckMobileProperties.get("deviceId");
		const pkceCode = await PKCEUtil.generatePKCEPair();

		BizCheckMobileProperties.set("pkceCode", JSON.stringify(pkceCode));
		const processId = authenticationInfo.sendProcessId ? authenticationInfo.sendProcessId : authenticationInfo.processId;
		const request = {
			userId: authenticationInfo.userId,
			authenticationCode: authenticationInfo.authenticationCode,
			processId: processId,
			otpMethodType: options.otpMethodType,
			platformType: "02",
			deviceId: macAddress,
			codeChallenge: pkceCode.codeChallenge,
			otpCode: options.otpCode
		};

		this.loginAPI.otpVerify({
			body: request,
			endPoint: "verify-otp",
			onSuccess: (response) => {
				SharedDataStore().setItem("authenticationInfo", { ...authenticationInfo, ...response, ...pkceCode, otpCode: options.otpCode });
				BizCheckMobileProperties.set("authInfo", JSON.stringify(response.authInfo));
				BizCheckMobileProperties.set("secretOTP", JSON.stringify({ secretKey: response.secretKeyValue, qrCodeURL: response.totpUrl }));
				const userInfo = { ...response.userInfo, userId: authenticationInfo.userId, authenticationMethod: response.authenticationMethod, authenticatorSetupYN: response.authenticatorSetupYN, passwordChangeRequiredYN: response.passwordChangeRequiredYN };
				BizCheckMobileLogger.info("User Info after OTP verification:", userInfo);
				BizCheckMobileProperties.set("userInfo", JSON.stringify(userInfo));
				const token = {
					clientId: response.authInfo.clientId,
					clientSecret: response.authInfo.clientSecret,
					code: response.authInfo.code,
					codeVerifier: pkceCode.codeVerifier
				};
				BizCheckMobileProperties.set("lastEventTime", new Date().getTime());
				BizCheckMobileProperties.set("token", JSON.stringify(token));

				this.authorizationCode({
					onSuccess: () => {
						BizCheckMobileLogger.log("Authorization code completed after OTP verification.");
					}
				});
			},
			onFailed: (error) => {
				BizCheckMobileLogger.log("OTP verify failed:", error);
				DialogUtil.showAlert({ message: `${error.message} (${error.code})` });
				DialogUtil.closeLoading();
			}
		});
	}

	sendOtp(options: { otpMethodType: string, onSuccess?: () => void }) {
		const authenticationInfo = SharedDataStore().getItem("authenticationInfo");
		const macAddress = BizCheckMobileProperties.get("deviceId");
		const request = {
			userId: authenticationInfo.userId,
			authenticationCode: authenticationInfo.authenticationCode,
			processId: authenticationInfo.processId,
			otpMethodType: options.otpMethodType,
			platformType: "02",
			deviceId: macAddress
		};
		this.loginAPI.sendOtp({
			body: request,
			enableLoading: true,
			endPoint: "send-otp",
			onSuccess: (response) => {
				BizCheckMobileLogger.log("Send OTP successful:", response);
				SharedDataStore().setItem("authenticationInfo", { ...authenticationInfo, sendProcessId: response.processId, ...response });
				if (options.onSuccess) options.onSuccess();
			},
			onFailed: (error) => {
				BizCheckMobileLogger.log("Send OTP failed:", error);
				DialogUtil.showAlert({ message: `${error.message} (${error.code})` });
			}
		});
	}

	authorizationCode(options: { onSuccess?: () => void }) {

		const authenticationInfo = SharedDataStore().getItem("authenticationInfo");

		this.loginAPI.authorizationCode({
			body: {
				grant_type: "authorization_code"
			},
			endPoint: "token",
			onSuccess: (response) => {

				const token = {
					accessToken: response.access_token,
					refreshToken: response.refresh_token,
					expiredTime: response.expires_in * 1000,
					clientId: authenticationInfo.authInfo.clientId,
					clientSecret: authenticationInfo.authInfo.clientSecret,
					code: authenticationInfo.authInfo.code,
					codeVerifier: authenticationInfo.codeVerifier
				};

				SharedDataStore().setItem("authenticationInfo", { ...authenticationInfo, ...token });
				BizCheckMobileProperties.set("lastEventTime", new Date().getTime());
				BizCheckMobileProperties.set("token", JSON.stringify(token));
				if (authenticationInfo.authenticatorSetupYN === "Y") {
					if (response.passwordChangeRequiredYN === "Y") {
						this.routerService.push("/LOG1200000");
					} else {
						BizCheckMobileLogger.info("Authorization calling.......");
						if (BizCheckMobileDevice.isApp()) {
							BizCheckMobileApp.callPlugin({
								pluginKey: "BIOMETRIC_PLUGIN",
								params: {
									type: "available",
									title: "Biometric Available"
								},
								callback: (response: any) => {
									BizCheckMobileLogger.log("Biometric Available result:", response);
									if (response && response.result) {
										if (options.onSuccess) options.onSuccess();
										this.routerService.push("/COM7000000");
										DialogUtil.closeLoading();
									} else {
										BizCheckMobileProperties.set("alreadyLogin", true);
										SharedDataStore().setItem("isSecondLogin", false);
										this.routerService.backToRoot();
										DialogUtil.closeLoading();
									}
								}
							});
						} else {
							BizCheckMobileProperties.set("alreadyLogin", true);
							SharedDataStore().setItem("isSecondLogin", false);
							if (options.onSuccess) options.onSuccess();
							this.routerService.backToRoot();
							DialogUtil.closeLoading();
						}
					}
				} else {
					this.createOTP({
						onSuccess: () => {
							BizCheckMobileLogger.log("Create OTP completed after OTP verification.");
						}
					});
				}
			},
			onFailed: (error) => {
				BizCheckMobileLogger.log("Authorization code failed:", error);
				DialogUtil.showAlert({ message: `${error.message} (${error.code})` });
				DialogUtil.closeLoading();
			}
		});
	}

	createOTP(options: { onSuccess?: () => void }) {
		const authenticationInfo = SharedDataStore().getItem("authenticationInfo");
		const macAddress = BizCheckMobileProperties.get("deviceId");
		const secret = authenticationInfo.secretKeyValue;
		const totp = new OTPAuth.TOTP({ algorithm: "SHA1", digits: 6, period: 30, secret: OTPAuth.Secret.fromBase32(secret) });
		const totpCode = totp.generate();
		const request = {
			userId: authenticationInfo.userId,
			platformType: "02",
			deviceId: macAddress,
			processId: authenticationInfo.processId,
			authenticationCode: authenticationInfo.authenticationCode,
			otpCode: totpCode
		};
		this.loginAPI.createOTP({
			body: request,
			enableLoading: true,
			endPoint: "create-totp",
			onSuccess: (response) => {
				BizCheckMobileLogger.log("Create OTP successful:", response);
				SharedDataStore().setItem("authenticationInfo", { ...authenticationInfo, ...response });

				this.pushNotificationService.registerPushNotification({
					userId: authenticationInfo.userId || "",
					callback: () => {
						BizCheckMobileLogger.log("register push notification success");
					}
				});

				if (response.passwordChangeRequiredYN === "Y") {
					this.routerService.push("/LOG1200000");
				} else {
					if (BizCheckMobileDevice.isApp()) {
						BizCheckMobileApp.callPlugin({
							pluginKey: "BIOMETRIC_PLUGIN",
							params: {
								type: "available",
								title: "Biometric Available"
							},
							callback: (response: any) => {
								BizCheckMobileLogger.log("Biometric Available result:", response);
								if (response && response.result) {
									if (options.onSuccess) options.onSuccess();
									this.routerService.push("/COM7000000");
									DialogUtil.closeLoading();
								} else {
									BizCheckMobileProperties.set("alreadyLogin", true);
									SharedDataStore().setItem("isSecondLogin", false);
									if (options.onSuccess) options.onSuccess();
									this.routerService.backToRoot();
									DialogUtil.closeLoading();
								}
							}
						});
					} else {
						BizCheckMobileProperties.set("alreadyLogin", true);
						SharedDataStore().setItem("isSecondLogin", false);
						if (options.onSuccess) options.onSuccess();
						this.routerService.backToRoot();
						DialogUtil.closeLoading();
					}
				}
			},
			onFailed: (error) => {
				BizCheckMobileLogger.log("Create OTP failed:", error);
				DialogUtil.showAlert({ message: `${error.message} (${error.code})` });
				DialogUtil.closeLoading();
			}
		});
	}

	passwordModified(options: { currentPassword: string, newPassword: string }) {

		const authenticationInfo = SharedDataStore().getItem("authenticationInfo");
		const macAddress = BizCheckMobileProperties.get("deviceId");
		const request = {
			newPassword: options.newPassword,
			currentPassword: options.currentPassword,
			platformType: "02",
			deviceId: macAddress,
			authenticationCode: authenticationInfo.authenticationCode,
			processId: authenticationInfo.processId,
			userId: authenticationInfo.userId
		};
		this.loginAPI.registerNewPassword({
			body: request,
			enableLoading: true,
			endPoint: "modify-password",
			onSuccess: (response) => {
				BizCheckMobileLogger.log("Register new password successful:", response);
				SharedDataStore().setItem("authenticationInfo", { ...authenticationInfo, ...response });
				if (SharedDataStore().getItem("fromSetting")) {
					SharedDataStore().removeItem("fromSetting");
					DialogUtil.showAlert({
						message: "Password has been changed successfully.",
						onDidDismiss: () => {
							this.routerService.back();
						},
					});
					return;
				}
				BizCheckMobileApp.callPlugin({
					pluginKey: "BIOMETRIC_PLUGIN",
					params: {
						type: "available",
						title: "Biometric Available"
					},
					callback: (response: any) => {
						BizCheckMobileLogger.log("Biometric Available result:", response);
						if (response && response.result) {
							this.routerService.push("/COM7000000");
						} else {
							BizCheckMobileLogger.log("push notification permission granted");
							BizCheckMobileProperties.set("alreadyLogin", true);
							SharedDataStore().setItem("isSecondLogin", false);
							this.routerService.backToRoot();
							BizCheckMobileLogger.log("register push notification success");
						}
					}
				});
			},
			onFailed: (error) => {
				BizCheckMobileLogger.log("Register new password failed:", error);
				DialogUtil.showAlert({ message: `${error.message} (${error.code})` });
			}
		});
	}

	verifyPassword(options: { userId: string, password: string, callback?: () => void }) {
		this.loginAPI.verifyPassword({
			body: {
				userId: options.userId,
				password: options.password,
				platformType: "02",
				deviceId: BizCheckMobileProperties.get("deviceId")
			},
			endPoint: "verify-password",
			enableLoading: true,
			onSuccess: (response) => {
				BizCheckMobileLogger.log("Verify password successful:", response);
				SharedDataStore().setItem("authenticationInfo", { ...response, userId: options.userId });
				if (options.callback) options.callback();
			},
			onFailed: (error) => {
				BizCheckMobileLogger.log("Verify password failed:", error);
				DialogUtil.showAlert({ message: `${error.message} (${error.code})` });
			}
		});
	}

	secondLogin(options: { password: string, callback?: () => void }) {
		const authInfo = SharedDataStore().getUserInfo();
		const tokenInfo = JSON.parse(BizCheckMobileProperties.get("token"));
		BizCheckMobileLogger.log("Second login with userId:", options.password);
		this.loginAPI.verifyPassword({
			body: {
				userId: authInfo.userId,
				password: options.password,
				platformType: "02",
				deviceId: BizCheckMobileProperties.get("deviceId"),
				refreshToken: tokenInfo.refreshToken
			},
			endPoint: "login-password",
			enableLoading: true,
			onSuccess: (response) => {
				BizCheckMobileLogger.log("Verify password successful:", response);
				SharedDataStore().setItem("authenticationInfo", { ...response, userId: authInfo.userId });
				SharedDataStore().setItem("isSecondLogin", false);
				const token = {
					accessToken: response.access_token,
					refreshToken: response.refresh_token,
					expiredTime: response.expires_in * 1000,
				};
				const saveToken = { ...tokenInfo, ...token };
				BizCheckMobileProperties.set("lastEventTime", new Date().getTime());
				BizCheckMobileProperties.set("token", JSON.stringify(saveToken));
				if (options.callback) options.callback();
			},
			onFailed: (error) => {
				BizCheckMobileLogger.log("Verify password failed:", error);
				DialogUtil.showAlert({ message: `${error.message} (${error.code})` });
			}
		});
	}

	registerBio() {
		const authInfo = SharedDataStore().getItem("authenticationInfo");
		const macAddress = BizCheckMobileProperties.get("deviceId");
		DialogUtil.showLoading();
		this.loginAPI.getBioKeyInfo({
			body: {
				userId: authInfo.userId,
				platformType: "02",
				deviceId: macAddress,
				processId: authInfo.processId,
				authenticationCode: authInfo.authenticationCode
			},
			endPoint: "start-register-bio",
			enableLoading: false,
			onSuccess: (response) => {
				BizCheckMobileLogger.log("Get biometric key info successful:", response.publicKey);
				SharedDataStore().setItem("authenticationInfo", { ...authInfo, processId: response.processId, authenticationCode: response.authenticationCode });
				setTimeout(() => {
					DialogUtil.closeLoading();
				}, 200);
				BizCheckMobileApp.callPlugin({
					pluginKey: "FIDO_REGISTER_PLUGIN",
					params: {
						header: {
							result: false
						},
						body: {
							publicKey: response.publicKey,
							userId: authInfo.userId
						}
					},
					callback: (result) => {
						BizCheckMobileLogger.log("FIDO register plugin result:", result);
						if (result && result.header && result.header.result) {
							this.loginAPI.registerBio({
								body: {
									challengId: response.challengId,
									userId: authInfo.userId,
									platformType: "02",
									deviceId: macAddress,
									credential: result.body
								},
								endPoint: "register-bio",
								enableLoading: true,
								onSuccess: (res) => {
									BizCheckMobileLogger.log("Register biometric successful:", res);
									BizCheckMobileProperties.set("isBiometric", true);
									BizCheckMobileProperties.set("credentialId", res.credentialId);
									if (SharedDataStore().getItem("fromSetting")) {
										SharedDataStore().removeItem("fromSetting");
										DialogUtil.showAlert({
											message: "Biometric authentication has been registered successfully.",
											onDidDismiss: () => {
												this.routerService.back();
											},
										});
									} else {

										BizCheckMobileLogger.log("register push notification success");
										BizCheckMobileProperties.set("alreadyLogin", true);
										SharedDataStore().setItem("isSecondLogin", false);
										this.routerService.backToRoot();
									}
								},
								onFailed: (err) => {
									DialogUtil.showAlert({ message: `${err.message} (${err.code})` });
								}
							});
						} else {
							const message = result && result.header && result.header.error_message ? result.header.error_message : result.error_message;
							const code = result && result.header && result.header.error_code ? result.header.error_code : result.error_code;
							if (!["LAN_PLU_E002", "LAN_PLU_E056"].includes(code)) {
								DialogUtil.showAlert({ message: `${message} (${code})` });
							}
						}
					}
				});
			},
			onFailed: (error) => {
				DialogUtil.showAlert({ message: `${error.message} (${error.code})` });
			},
		});
	}

	verifyBio(options?: { callback?: () => void }) {
		const authInfo = SharedDataStore().getUserInfo();
		const macAddress = BizCheckMobileProperties.get("deviceId");
		const tokenInfo = JSON.parse(BizCheckMobileProperties.get("token"));
		BizCheckMobileLogger.info("tokenInfo : ", tokenInfo);
		DialogUtil.showLoading();
		this.loginAPI.getVerifyBioKeyInfo({
			body: {
				userId: authInfo.userId,
				platformType: "02",
				deviceId: macAddress,
				refreshToken: tokenInfo.refreshToken
			},
			endPoint: "start-login-bio",
			enableLoading: false,
			onSuccess: (response) => {
				setTimeout(() => {
					DialogUtil.closeLoading();
				}, 200);
				BizCheckMobileApp.callPlugin({
					pluginKey: "FIDO_LOGIN_PLUGIN",
					params: {
						header: {
							result: false
						},
						body: {
							publicKey: response.publicKey,
							userId: authInfo.userId
						}
					},
					callback: (result) => {
						BizCheckMobileLogger.log("FIDO Login plugin result:", result);
						if (result && result.header && result.header.result) {
							this.loginAPI.loginBio({
								body: {
									userId: authInfo.userId,
									platformType: "02",
									deviceId: macAddress,
									credential: result.body,
									challengId: response.challengId,
									refreshToken: tokenInfo.refreshToken
								},
								endPoint: "login-bio",
								enableLoading: true,
								onSuccess: (res) => {
									BizCheckMobileLogger.log("Login biometric successful:", res);
									SharedDataStore().setItem("authenticationInfo", { ...res, userId: authInfo.userId });
									SharedDataStore().setItem("isSecondLogin", false);
									const token = {
										accessToken: res.access_token,
										refreshToken: res.refresh_token,
										expiredTime: res.expires_in * 1000,
									};
									const saveToken = { ...tokenInfo, ...token };

									BizCheckMobileLogger.info("saveToken : ", saveToken);
									BizCheckMobileProperties.set("lastEventTime", new Date().getTime());
									BizCheckMobileProperties.set("token", JSON.stringify(saveToken));
									BizCheckMobileLogger.info("saveToken : ", JSON.parse(BizCheckMobileProperties.get("token")));
									if (options?.callback) options.callback();
								}
							});
						} else {
							const message = result && result.header && result.header.error_message ? result.header.error_message : result.error_message;
							const code = result && result.header && result.header.error_code ? result.header.error_code : result.error_code;
							if (!["LAN_PLU_E002", "LAN_PLU_E056"].includes(code)) {
								DialogUtil.showAlert({ message: `${message} (${code})` });
							}
						}
					}
				});
			},
			onFailed: (error) => {
				DialogUtil.showAlert({ message: `${error.message} (${error.code})` });
			},
		});
	}

	unRegisterBio(options?: { callback?: () => void }) {
		const authInfo = SharedDataStore().getItem("authenticationInfo");
		const macAddress = BizCheckMobileProperties.get("deviceId");
		const credentialId = BizCheckMobileProperties.get("credentialId");
		this.loginAPI.unRegisterBio({
			body: {
				userId: authInfo.userId,
				platformType: "02",
				deviceId: macAddress,
				authenticationCode: authInfo.authenticationCode,
				processId: authInfo.processId,
				credentialId: credentialId
			},
			endPoint: "unregister-bio",
			enableLoading: true,
			onSuccess: (response) => {
				BizCheckMobileLogger.log("Unregister biometric successful:", response);
				BizCheckMobileProperties.set("isBiometric", false);
				if (options?.callback) options.callback();
			},
			onFailed: (error) => {
				DialogUtil.showAlert({ message: `${error.message} (${error.code})` });
			}
		});
	}

	refresh(options: { callback: () => void }) {
		this.loginAPI.refresh({
			body: {
				grant_type: "refresh_token"
			},
			endPoint: "token",
			enableLoading: false,
			onSuccess: (response) => {
				const token = BizCheckMobileProperties.get("token");
				const tokenInfo = {
					...JSON.parse(token),
					accessToken: response.access_token,
					refreshToken: response.refresh_token,
					expiredTime: response.expires_in * 1000,
				};

				const requiredFields = ["access_token", "refresh_token", "expires_in"];
				const hasAll = requiredFields.every(key => key in response);

				if (hasAll) {
					// all fields exist
					BizCheckMobileProperties.set("lastEventTime", new Date().getTime());
					BizCheckMobileProperties.set("token", JSON.stringify(tokenInfo));
					if (options && options.callback) options.callback();
				}
			},
			onFailed: (error) => {
				DialogUtil.showAlert({ message: `${error.message} (${error.code})` });
			}
		});
	}

	checkRefreshToken(options: { callback: () => void }) {
		const tokenInfo = JSON.parse(BizCheckMobileProperties.get("token"));
		this.loginAPI.refresh({
			body: {
				refreshToken: tokenInfo.refreshToken
			},
			endPoint: "check-token",
			enableLoading: false,
			onSuccess: (response) => {
				BizCheckMobileLogger.info("refreshToken healthy => ", response);
				if (options.callback) options.callback();
			},
			onFailed: (error) => {
				DialogUtil.showAlert({
					header: this.localService.translate("DAS1100000.TEXT.SECURITY_HEADER"),
					message: this.localService.translate("DAS1100000.TEXT.SECURITY_REACTIVATE"),
					onDidDismiss: () => {
						this.logout();
					}
				});
			}
		});
	}

	getUserPasswordPolicy(options: RequestOptions<LOG1200000Request, LOG1200000Response>) {
		this.loginAPI.userPasswordPolicy({
			body: options.body,
			enableLoading: options.enableLoading,
			onSuccess: (response: any) => {
				options.onSuccess(response);
			},
			onFailed: (error) => {
				DialogUtil.showAlert({ message: `${error.message} (${error.code})` });
			}
		});
	}
}
