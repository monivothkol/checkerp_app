import { TableTrackingStatement } from "@/enum/table-statement";
import { BizCheckMobileApp, BizCheckMobileDatabase, BizCheckMobileLogger } from "@/shared/bizcheckmobile";
import NetworkServices from "./network-servies";
import SyncTrxFailedAPI from "./api/sync-api";

export default class TrackingGPSService {
	static syncDataTrackingTimeout: any;
	private sycAPI: SyncTrxFailedAPI;
	private static instance: TrackingGPSService;

	private constructor() {
		this.sycAPI = SyncTrxFailedAPI.getInstance();
	}

	static getInstance(): TrackingGPSService {

		if (!this.instance) {
			this.instance = new TrackingGPSService();
		}
		return this.instance;
	}

	public register(option: { interval: number }) {
		BizCheckMobileApp.callPlugin({
			pluginKey: "GPS_TRACKING_PLUGIN",
			params: {
				body: {
					type: "register",
					interval: option.interval,
					tracking_time_interval: option.interval
				},
				header: {
					result: false,
					error_code: "",
					error_message: ""
				}
			},
			callback: (response) => {
				BizCheckMobileLogger.log("Registered Tracking: ", response);
			},
		});

	}

	public unRegister() {
		BizCheckMobileApp.callPlugin({
			pluginKey: "GPS_TRACKING_PLUGIN",
			params: {
				body: {
					type: "unregister"
				},
				header: {
					result: false,
					error_code: "",
					error_message: ""
				}
			},
			callback: (response) => {
				BizCheckMobileLogger.log("unregister tracking", response);
			}
		});
	}

	public syncDataTracking(option: { interval: number, onSync: (result: any) => void }) {

		TrackingGPSService.syncDataTrackingTimeout = setInterval(() => {
			BizCheckMobileDatabase.executeSelect({
				sql: TableTrackingStatement.SELECT_GPS_TRACKING,
				params: ["00", "09"],
				onError: (error) => {
					BizCheckMobileLogger.error("execute Select Sync Data Tracking error: ", error);
				},
				onSuccess: (result) => {

					BizCheckMobileLogger.info("execute Select Sync Data Tracking success: ", result);

					if (result && result.length > 0) {
						option.onSync(result);
					} else {
						clearInterval(TrackingGPSService.syncDataTrackingTimeout);
					}
				}
			});
		}, option.interval);
	}

	public removeDataTracking(option: { ids: string[] }) {
		const placeholders = option.ids.map(() => "?").join(",");
		const sql = `DELETE FROM kpl_co_tracking_detail WHERE seq_no IN (${placeholders})`;
		const params = [...option.ids.map(Number)];
		BizCheckMobileDatabase.executeSql({
			sql: sql,
			params: params,
			onError: (error) => {
				BizCheckMobileLogger.error("executeSql Remove Data Tracking error: ", error);
			},
			onSuccess: (result) => {
				BizCheckMobileLogger.info("executeSql Remove Data Tracking success: ", result);
			}
		});
	}

	public updateDataTracking(option: { ids: string[], status: string }) {
		const placeholders = option.ids.map(() => "?").join(",");
		const sql = `UPDATE kpl_co_tracking_detail SET processing_status = ? WHERE seq_no IN (${placeholders})`;
		const params = [option.status, ...option.ids.map(Number)];
		BizCheckMobileLogger.info("updateDataTracking", sql, params);
		BizCheckMobileDatabase.executeSql({
			sql: sql,
			params: params,
			onError: (error) => {
				BizCheckMobileLogger.error("executeSql", error);
			},
			onSuccess: () => {
				BizCheckMobileLogger.info("executeSql Update success");
			}
		});
	}

	public syncDataToServer(gpsData: any[]) {
		// To be implemented
		const trackingData: Array<{
			creditOfficerId: string,
			trackingDate: string,
			trackingTime: string,
			latitude: number,
			longitude: number,
			branchCode: string,
			teamId: string
		}> = [];

		gpsData.forEach((data) => {
			trackingData.push({
				creditOfficerId: data.credit_officer_id,
				trackingDate: data.tracking_date,
				trackingTime: data.tracking_time,
				latitude: Number(data.latitude),
				longitude: Number(data.longitude),
				branchCode: data.branchCode,
				teamId: data.teamId
			});
		});


		if (trackingData.length === 0) {
			BizCheckMobileLogger.log("No Tracking Data: ", trackingData);
			return;
		}

		BizCheckMobileLogger.log("Prepared Tracking Data: ", trackingData);
		if (trackingData.length > 0) {
			this.sycAPI.sync("KPL01002A01", {
				body: { trackingData: trackingData },
				onSuccess: (response) => {
					this.removeDataTracking({ ids: gpsData.map(data => data.seq_no) });
					BizCheckMobileLogger.log("Sync Data To Server Success: ", response);
				},
				onFailed: (error) => {
					this.updateDataTracking({ ids: gpsData.map(data => data.seq_no), status: "09" });
					BizCheckMobileLogger.log("Sync Data To Server Failed", error);
				}
			});
		}
	}
}
