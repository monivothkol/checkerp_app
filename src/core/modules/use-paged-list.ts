import { ref, type Ref } from "vue";

export interface PagedResult<T> { list: T[]; totalCount?: number | null }

/**
 * Infinite-scroll paging shared by every list: latest request wins (an older, slower response is
 * dropped), the page only advances on success, and with no totalCount a short page ends the list.
 */
export function usePagedList<T>(fetch: (pageNo: number, pageSize: number) => Promise<PagedResult<T>>, pageSize = 20) {
	const rows = ref([]) as Ref<T[]>;
	const totalCount = ref(0);
	const loading = ref(false);
	const hasMore = ref(false);
	let pageNo = 0;
	let seq = 0;

	async function load(reset: boolean): Promise<void> {
		const mine = ++seq;
		const page = reset ? 1 : pageNo + 1;
		loading.value = true;
		try {
			const r = await fetch(page, pageSize);
			if (mine !== seq) return;
			rows.value = reset ? r.list : [...rows.value, ...r.list];
			pageNo = page;
			totalCount.value = Number(r.totalCount ?? rows.value.length);
			hasMore.value = r.totalCount != null ? rows.value.length < totalCount.value : r.list.length === pageSize;
		} catch {
			// A failed new query must not leave the previous query's rows on screen; a failed
			// "more" keeps them and the next scroll retries the same page.
			if (reset && mine === seq) {
				rows.value = [];
				totalCount.value = 0;
				hasMore.value = false;
			}
		} finally {
			if (mine === seq) loading.value = false;
		}
	}

	return { rows, totalCount, loading, hasMore, reload: () => load(true), more: () => load(false) };
}

/** ModuleApi-style listener call → promise, for use as a usePagedList fetcher. */
export function requestAsync<T>(call: (listener: { onSuccess: (r: T) => void; onFail: (e: unknown) => void }) => void): Promise<T> {
	return new Promise((resolve, reject) => call({ onSuccess: resolve, onFail: reject }));
}
