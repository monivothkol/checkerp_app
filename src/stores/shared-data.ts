import { BizCheckMobileProperties } from "@/shared/bizcheckmobile";
import { acceptHMRUpdate, defineStore } from "pinia";
import { reactive } from "vue";

export const SharedDataStore = defineStore("sharedData", () => {
	const storeData = reactive(new Map<string, any>());

	const setItem = (key: string, value: any) => {
		storeData.set(key, value);
	};

	const getItem = (key: string) => {
		return storeData.get(key);
	};

	const removeItem = (key: string) => {
		storeData.delete(key);
	};

	const clearItems = () => {
		storeData.clear();
	};

	const getUserInfo = () => {
		try {
			const userInfo = BizCheckMobileProperties.get("userInfo");
			if (typeof userInfo === "string" && typeof userInfo !== "object" && userInfo) {
				return JSON.parse(userInfo as any);
			} else {
				return userInfo as any;
			}
		} catch {
			return {};
		}
	};


	const getNetworkStatus = () => {
		if (storeData.has("networkStatus")) {
			return storeData.get("networkStatus");
		} else {
			return "online";
		}
	};

	return { setItem, getItem, removeItem, clearItems, getUserInfo, getNetworkStatus };
});

// HMR support for the store
if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(SharedDataStore, import.meta.hot));
}
