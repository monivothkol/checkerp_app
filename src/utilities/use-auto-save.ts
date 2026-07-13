import { ref, watch, onMounted, onUnmounted, toRaw, isRef } from "vue";
import DraftService from "@/services/draft-service";
import DialogUtil from "@/utilities/dialog-util";
import { BizCheckMobileDateTime, BizCheckMobileLogger, BizCheckMobileString } from "@/shared/bizcheckmobile";
import BmSelectMenu from "@/components/Modals/bm-select-menu.vue";

/**
 * Composable for automatic form draft saving.
 * @param key Unique key for the draft storage
 * @param formData Reactive form object or ref
 * @param excludeKeys Array of keys to exclude from saving
 * @param maxLength Maximum number of draft records to keep (default: 1)
 */
// eslint-disable-next-line no-unused-vars
export function useAutoSave(key: string, formData: any, excludeKeys: string[] = [], maxLength: number = 2, callback?: () => void) {
	const draftService = DraftService.getInstance();
	const hasDraft = ref(false);
	let isInitialized = false;
	let isRestoring = false;
	let sessionTimestamp = BizCheckMobileDateTime.getCurrentDateTime();

	// Save helper
	const save = (data: any) => {
		draftService.save(key, toRaw(data), maxLength, sessionTimestamp);
	};

	const clearDraft = () => {
		draftService.clear(key);
		hasDraft.value = false;
		BizCheckMobileLogger.log("Draft remain after clear: ", draftService.getAll(key));
	};

	const restoreDraft = (timestamp?: string) => {
		const drafts = draftService.getAll(key);
		const record = timestamp
			? drafts.find(d => d.timestamp === timestamp)
			: drafts[0]; // Default to latest

		if (record) {
			isRestoring = true;

			// Adopt the timestamp of the restored draft
			sessionTimestamp = record.timestamp;

			const target = isRef(formData) ? formData.value : formData;
			Object.assign(target, record.data);
			hasDraft.value = false;
			if (callback) {
				callback();
			}
			// Reset flag after current tick to ensure watcher ignores this change
			setTimeout(() => {
				isRestoring = false;
			}, 500);
		}
	};

	// Auto-save logic
	watch(formData, (newVal) => {
		if (!isInitialized || isRestoring) return;

		// Filter excluded keys
		const filteredData = Object.keys(newVal).reduce((acc, k) => {
			if (!excludeKeys.includes(k)) {
				acc[k] = newVal[k];
			}
			return acc;
		}, {} as any);

		save(filteredData);
	}, { deep: true });

	onMounted(() => {
		const draftList = draftService.getAll(key);

		if (draftList.length > 0) {
			hasDraft.value = true;

			const options = draftList.map(draft => ({
				label: BizCheckMobileString.dateTimeFormat(draft.timestamp),
				value: draft.timestamp
			}));

			DialogUtil.showDialog(BmSelectMenu, {
				props: {
					disabled: false,
					title: "Select Draft Record",
					message: "Choose a draft to restore",
					searchable: options.length > 10,
					options: options,
					selected: "",
					isFocus: false,
					isFooter: true,
				},
				onDidDismiss: (result: any) => {
					if (result && result.role === "confirm") {
						const selectedOption = result.data?.option;
						const selectedTimestamp = selectedOption?.value;
						if (selectedTimestamp) {
							BizCheckMobileLogger.log("Selected draft to restore: ", selectedOption);
							restoreDraft(selectedTimestamp);
							draftService.removeRecord(key, selectedTimestamp);
						}
					}
				},
			});
		}

		// Delay initialization to avoid capturing initial data population
		setTimeout(() => {
			isInitialized = true;
		}, 800);
	});

	onUnmounted(() => {
		draftService.cancelSave();
	});

	return {
		hasDraft,
		clearDraft,
		restoreDraft,
		draftService // Expose service for direct access to getAll etc. if needed
	};
}
