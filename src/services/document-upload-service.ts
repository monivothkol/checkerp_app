import { BizCheckMobileApp, BizCheckMobileAppSocial, BizCheckMobileDateTime, BizCheckMobileDevice, BizCheckMobileLogger, BizCheckMobileProperties, BizCheckMobileSystem } from "@/shared/bizcheckmobile";
import CheckErpHeader from "./checkerp-header";
import DialogUtil from "@/utilities/dialog-util";
import LoginModule from "@/modules/login-module";
import { getTokenSync } from "@/services/token-store";

export interface UploadResult {
	path: string;
	base64: string;
}

export interface UploadCallback {
	onSuccess: (result: UploadResult, docTypeCode: string, docFileType: string, isImage: boolean) => void;
	onError?: () => void;
}

export default class DocumentUploadService {
	private checkErpHeader: CheckErpHeader;
	private loginModule: LoginModule;
	constructor() {
		this.checkErpHeader = new CheckErpHeader();
		this.loginModule = LoginModule.getInstance();
	}

	public upload(options: { fileList: string[], trcode: string, callback?: (response: any) => void }) {
		DialogUtil.showLoading();
		const token = getTokenSync();

		// this.loginModule.checkRefreshToken({
		// 	callback: () => {
		// 	}
		// });
		BizCheckMobileApp.callPlugin({
			pluginKey: "UPLOAD_FILES_PLUGIN",
			params: {
				header: {
					result: false,
					error_code: "",
					error_message: "",
				},
				body: {
					url: `${import.meta.env.VITE_SERVER_PROTOCOL}://${BizCheckMobileProperties.get("app_subdomain") ? BizCheckMobileProperties.get("app_subdomain") + "." : ""}${import.meta.env.VITE_SERVER_DOMAIN}/${import.meta.env.VITE_SERVER_CONTENT}/${options.trcode}`,
					file_paths: options.fileList,
					body: {
						header: this.checkErpHeader.getHeader(options.trcode),
						payload: {
							sourceSystemCode: "CHECKERP",
							businessCategoryLevel1: "LOSAPP",
							businessCategoryLevel2: "",
							expireDateTime: "",
							remark: "",
						}
					},
					accessToken: token?.accessToken ?? ""
				}
			},
			callback: (response) => {
				BizCheckMobileLogger.info("Uploaded Response: ", response, options);
				if (response.header.messageInfo && response.header.messageInfo.result) {
					if (options.callback) options.callback({ ...response.payload, filePaths: options.fileList });

				} else {
					if (response.header.messageInfo.code === "FRW_SEC_E004") {
						this.loginModule.refresh({
							callback: () => {
								this.upload(options);
							}
						});
					} else {
						DialogUtil.closeLoading();
						DialogUtil.showAlert({ header: "Failed", message: `${response.header.messageInfo.message} (${response.header.messageInfo.code})` });
					}
				}
			}
		});

	}

	public reSize(options: { imagePaths: string[], callback?: (response: any) => void, fileSize: number, width: number, height: number }) {
		BizCheckMobileApp.callPlugin({
			pluginKey: "RESIZE_IMAGE",
			params: {
				header: {
					result: false,
					error_code: "",
					error_message: "",
				},
				body: {
					progress: true,
					image_paths: options.imagePaths,
					compress_rate: 0.9,
					copy_flag: true,
					file_size: options.fileSize * 1024 * 1024,
					target_path_type: "internal",
					target_path: "/LOSAPP/",
					width: options.width || 700,
					height: options.height || 700,
				}
			},
			callback(res) {
				BizCheckMobileLogger.info("resize image1: ", res, options);
				if (options.callback) options.callback(res);
			}
		});
	}
	public download(options: { fileId: string, trcode: string, expiredDate: string, extension: string, type?: string, viewMode?: string, callback?: (response: any) => void }) {
		const subdomain = BizCheckMobileProperties.get("app_subdomain") || "kh-mcnc-001";
		let urlDomain = `${import.meta.env.VITE_SERVER_PROTOCOL}://${BizCheckMobileProperties.get("app_subdomain") ? BizCheckMobileProperties.get("app_subdomain") + "." : ""}${import.meta.env.VITE_SERVER_DOMAIN}/${import.meta.env.VITE_SERVER_CONTENT}/${options.trcode}`;
		if (options.type === "other") {
			urlDomain = `${import.meta.env.VITE_SERVER_PROTOCOL}://${subdomain ? subdomain + "." : ""}${import.meta.env.VITE_SERVER_DOMAIN}/tenants/${subdomain}/${options.fileId}`;
		}
		const token = getTokenSync();
		BizCheckMobileApp.callPlugin({
			pluginKey: "DOWNLOAD_FILES_PLUGIN",
			params: {
				header: {
					result: false,
					error_code: "",
					error_message: "",
				},
				body: {
					url_list: [{
						url: urlDomain,
						expired_date: options.expiredDate,
						extension: options.extension,
						fileNameFromServer: false,
						compress: 90,
						body: {
							header: this.checkErpHeader.getHeader(options.trcode),
							payload: {
								fileId: options.fileId,
								viewMode: options.viewMode || "view",
							}
						}
					}],
					accessToken: token?.accessToken ?? ""
				}
			},
			callback: (response) => {
				BizCheckMobileLogger.info("Download Response: ", response, options);
				const message = (response.header && response.header.messageInfo) ? response.header.messageInfo : response.header;
				if (message.result) {
					if (options.callback) options.callback(response.body);
				} else {
					if (response.header.messageInfo.code === "FRW_SEC_E004") {
						this.loginModule.refresh({
							callback: () => {
								this.download(options);
							}
						});
					} else {
						BizCheckMobileLogger.info("Download failed => ", response);
					}
				}
			}
		});
	}

	public pickFile(options: { callback: (response: any) => void }) {
		BizCheckMobileSystem.callGallery({
			type: ["image"],
			maxCount: 1,
			callback: (response) => {
				BizCheckMobileLogger.info("response: ", response);
				if (response && Array.isArray(response.images) && response.images.length > 0) {
					options.callback(response.images[0]);
				} else {
					BizCheckMobileLogger.error("No images found in response", response);
					options.callback(null);
				}
			},
		});
	}

	public viewImage(fileId: string): Promise<{ filePath: string, base64: string }> {
		return new Promise((resolve) => {
			if (BizCheckMobileDevice.isApp()) {
				this.download({
					fileId: fileId,
					trcode: "DFD01001I01",
					expiredDate: BizCheckMobileDateTime.getCurrentDate(),
					extension: "jpg",
					callback: (response: any) => {
						BizCheckMobileLogger.log("viewImage response: ", response);
						const imageBase64 = (response?.url_list[0].base_64) ? `data:image/jpeg;base64,${response?.url_list[0].base_64}` : "";
						resolve({ base64: imageBase64, filePath: response.url_list[0].file_path });
					}
				});
			} else {
				resolve({ base64: "", filePath: "" });
			}
		});
	}

	public saveBase64Image(option: { base64: string, fileName: string }): Promise<any> {
		return new Promise((resolve) => {
			BizCheckMobileApp.callPlugin({
				pluginKey: "SAVE_IMAGE_BASE_64",
				params: {
					image_base_64: option.base64,
					source_path: "internal",
					source_path_type: "jpg",
					file_name: option.fileName
				},
				callback: (response) => {
					this.upload({
						fileList: [response.path],
						trcode: "DFD01001A01",
						callback: (result) => {
							result.base64 = this.toBase64DataUri(response.base64);
							BizCheckMobileLogger.info("response => ", response);
							resolve(result);
						}
					});
				}
			});
		});
	}

	public uploadImage(options: { callback?: (response: any) => void }) {
		this.pickFile({
			callback: (response: any) => {
				BizCheckMobileLogger.info("response=====>: ", response);
				if (response) {
					const imagePath = response.uri;
					this.reSize({
						imagePaths: [imagePath],
						fileSize: response.size,
						width: response.width,
						height: response.height,
						callback: (res: any) => {
							BizCheckMobileLogger.info("resize image: ", res);
							this.upload({
								fileList: [imagePath],
								trcode: "DFD01001A01",
								callback: (result: any) => {
									result.base64 = this.toBase64DataUri(response.base64);
									if (options.callback) {
										options.callback(result);
									}
								}
							});
						}
					});
				} else {
					BizCheckMobileLogger.error("No image found in response", response);
					if (options.callback) options.callback({});
				}
			}
		});
	}

	public uploadImageByPath(options: { path: string[], callback?: (response: any) => void }): void {
		BizCheckMobileLogger.info("uploadImageByPath: ", options);
		this.upload({
			fileList: options.path,
			trcode: "DFD01001A01",
			callback: (result: any) => {
				const mappedList = result.fileList.map((file: any) => ({
					fileId: file.fileId,
					fileName: file.originalFileName,
					fileContentType: file.fileContentType
				}));
				if (options.callback) options.callback(mappedList);
			}
		});
	}

	public takePhoto = (options: { callback?: (response: any) => void }) => {
		BizCheckMobileSystem.callCamera({
			directory: "camera",
			autoVerticalHorizontal: false,
			fileName: "profile_image.jpg",
			callback: (response: any) => {
				BizCheckMobileLogger.info("response:====== ", response);
				let imagePath = "";
				let base64 = "";
				imagePath = response.path;
				base64 = response.base64;
				if (!response.result && response.error && response.error.error_code === "LAN_PLU_E002") {
					if (options.callback) options.callback({});
					return;
				} else if (response.result && response.path && response.base64) {
					this.upload({
						fileList: [imagePath],
						trcode: "DFD01001A01",
						callback: (result: any) => {
							result.base64 = this.toBase64DataUri(base64);
							if (options.callback) {
								options.callback(result);
							}
						}
					});
				}
			}
		});
	};

	public toBase64DataUri = (base64: string): string => {
		if (base64.startsWith("iVBOR")) return `data:image/png;base64,${base64}`;
		if (base64.startsWith("/9j/")) return `data:image/jpeg;base64,${base64}`;
		if (base64.startsWith("UklGR")) return `data:image/webp;base64,${base64}`;
		if (base64.startsWith("data:image")) return `${base64}`;
		if (base64.startsWith("http") || base64.startsWith("https")) return base64;
		return `data:image/png;base64,${base64}`;
	};

	public callImageScanner = (options: { callback?: (response: any) => void }) => {
		BizCheckMobileApp.callPlugin({
			pluginKey: "IMAGE_SCANNER_PLUGIN",
			params: {
				header: {
					result: false,
					// eslint-disable-next-line camelcase
					error_code: "",
					// eslint-disable-next-line camelcase
					error_message: "",
				},
				body: {
					// eslint-disable-next-line camelcase
					file_name: "id_card.jpg",
					// eslint-disable-next-line camelcase
					file_size: 1 * 1024 * 1024,
					// eslint-disable-next-line camelcase
					directory_path: "los/photo",
					// eslint-disable-next-line camelcase
					directory_type: "internal",
					// eslint-disable-next-line camelcase
					save_to_gallery: false,
				}
			},
			callback: (response: any) => {
				BizCheckMobileLogger.info("response: ", response);
				BizCheckMobileApp.callPlugin({
					pluginKey: "NATIONAL_ID_CARD_SCANNER_PLUGIN",
					params: {
						header: {
							result: false,
							// eslint-disable-next-line camelcase
							error_code: "",
							// eslint-disable-next-line camelcase
							error_message: "",
						},
						body: {
							// eslint-disable-next-line camelcase
							file_path: response.body.file_path,
						}
					},
					callback: (result: any) => {
						BizCheckMobileLogger.info("response: ", result);
						result.base64 = `data:image/png;base64,${response.base64}`;
						if (options.callback) options.callback(result);
					}
				});
			}
		});
	};


	public downloadCompanyLogo(options: { fileId: string, callback?: (response: any) => void }) {
		const subdomain = BizCheckMobileProperties.get("app_subdomain");
		const token = getTokenSync();
		let accessToken = "";

		if (token?.accessToken) {
			accessToken = token.accessToken;
		}

		BizCheckMobileApp.callPlugin({
			pluginKey: "DOWNLOAD_COMPANY_LOGO_PLUGIN",
			params: {
				header: {
					result: false,
					error_code: "",
					error_message: "",
				},
				body: {
					image_url: `https://${subdomain ? subdomain + "." : ""}${import.meta.env.VITE_SERVER_DOMAIN}/tenants/${subdomain}/${options.fileId}`,
					file_name: "sample.png",
					directory_name: "LOSApp",
					accessToken: accessToken
				}
			},
			callback: (response: any) => {
				BizCheckMobileLogger.info("response: ", response);
				const result = response.body;
				if (!BizCheckMobileDevice.isApp()) {
					return "";
				}
				if (response.header.result) {
					const imageBase64 = `data:image/png;base64,${result.image_base64}`;
					if (imageBase64) {
						if (options.callback) options.callback(imageBase64);
					} else {
						BizCheckMobileLogger.error("No image found in response", result);
						if (options.callback) options.callback({});
					}
				} else {
					BizCheckMobileLogger.error("Download Error: ", result);
					if (options.callback) options.callback({});
				}
			}
		});
	}

	public downloadFile(options: { fileId: string, viewMode?: string, callback?: (response: any) => void }) {
		this.download({
			fileId: options.fileId,
			trcode: "DFD01001I01",
			expiredDate: BizCheckMobileDateTime.getCurrentDate(),
			extension: "pdf",
			viewMode: options.viewMode || "download",
			callback: (response: any) => {
				if (response.url_list && response.url_list.length > 0) {
					BizCheckMobileLogger.info("file path: ", response.url_list[0].file_path);
					BizCheckMobileApp.callPlugin({
						pluginKey: "PDF_PREVIEW_PLUGIN",
						params: {
							header: {
								result: false,
								error_code: "",
								error_message: "",
							},
							body: {
								file_path: response.url_list[0].file_path,
								title: "PDF Preview",
							},
						},
						callback: (response: any) => {
							BizCheckMobileLogger.info("response ====: ", response);
							if (options.callback) options.callback(response);
						}
					});
				} else {
					BizCheckMobileLogger.error("No file path found in response", response);
					if (options.callback) options.callback({});
					DialogUtil.showAlert({ header: "Error", message: "No file path found in response" });
				}
			}
		});
	}


	public uploadFileImage(options: { callback?: (response: any) => void }) {
		BizCheckMobileApp.callPlugin({
			pluginKey: "CALL_FILE_BROWSER",
			params: {
				types: ["pdf", "image"],
				maxCount: 1,
			},
			callback: (response: any) => {
				BizCheckMobileLogger.info("uploadPDF: ", response);
				if (response && response.file_path && response.file_path.length > 0) {
					this.upload({
						fileList: [response.file_path[0]],
						trcode: "DFD01001A01",
						callback: options.callback
					});
					BizCheckMobileLogger.info("response: ", response);
				} else {
					BizCheckMobileLogger.error("No file found in response", response);
					if (options.callback) options.callback({});
					DialogUtil.showAlert({ header: "Error", message: "No file found in response" });
				}
			}
		});
	}

	/** Downloads the file, then PDF preview or native social share (non-PDF). */
	public previewOrSocialShareByFileId(options: { fileId: string, fileName: string, extension: string, callback?: (response: any) => void }) {
		this.download({
			fileId: options.fileId,
			trcode: "DFD01001I01",
			expiredDate: BizCheckMobileDateTime.getCurrentDate(),
			extension: options.extension,
			viewMode: "download",
			callback: (response: any) => {
				if (!response?.url_list?.length) {
					DialogUtil.showToast({ message: "Failed to download the file." });
					return;
				}
				const filePath = response.url_list[0].file_path;
				if (options.extension === "pdf") {
					BizCheckMobileApp.callPlugin({
						pluginKey: "PDF_PREVIEW_PLUGIN",
						params: {
							header: {
								result: false,
								// eslint-disable-next-line camelcase
								error_code: "",
								// eslint-disable-next-line camelcase
								error_message: "",
							},
							body: {
								// eslint-disable-next-line camelcase
								file_path: filePath,
								title: options.fileName,
							},
						},
						callback: () => {
							BizCheckMobileLogger.log("DocumentUploadService: PDF_PREVIEW_PLUGIN closed");
						},
					});
				} else {
					BizCheckMobileAppSocial.shareFile({
						filePath,
						title: options.fileName,
						callback: (shareResponse: any) => {
							BizCheckMobileLogger.log("DocumentUploadService: shareFile response: ", shareResponse);
						},
					});
				}
			},
		});
	}
}
