<template>
	<ion-page>
		<bm-header :title="store.isEdit ? tr('PAGE_TITLE_EDIT') : tr('PAGE_TITLE')" default-href="/EXP10000" />
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<ion-list v-else class="scr_list" lines="full">
				<ion-item>
					<ion-select v-model="store.categoryId" :label="`${tr('CATEGORY')} *`" label-placement="stacked" :placeholder="tr('CATEGORY_PH')"
						interface="action-sheet" @ion-change="store.loadLists()">
						<ion-select-option v-for="c in store.categories" :key="c.categoryId" :value="c.categoryId">{{ c.name }}</ion-select-option>
					</ion-select>
				</ion-item>
				<ion-item>
					<ion-select v-model="store.listId" :label="`${tr('LIST')} *`" label-placement="stacked" :placeholder="tr('LIST_PH')"
						:disabled="!store.categoryId" interface="action-sheet">
						<ion-select-option v-for="l in store.lists" :key="l.listId" :value="l.listId">{{ l.name }}</ion-select-option>
					</ion-select>
				</ion-item>
				<ion-item>
					<ion-input v-model.number="store.amount" :label="`${tr('AMOUNT')} *`" label-placement="stacked" :placeholder="tr('AMOUNT_PH')"
						type="number" inputmode="decimal" min="0.01" step="1" />
				</ion-item>
				<ion-item>
					<ion-select v-model="store.currency" :label="tr('CURRENCY')" label-placement="stacked" interface="action-sheet">
						<ion-select-option value="USD">USD</ion-select-option>
						<ion-select-option value="KHR">KHR</ion-select-option>
					</ion-select>
				</ion-item>
				<ion-item>
					<ion-input v-model="store.expenseDate" :label="`${tr('DATE')} *`" label-placement="stacked" type="date" :placeholder="tr('DATE_PH')" />
				</ion-item>
				<ion-item>
					<ion-select v-model="store.expenseType" :label="tr('TYPE')" label-placement="stacked" interface="action-sheet">
						<ion-select-option v-for="ty in TYPES" :key="ty" :value="ty">{{ tr(ty) }}</ion-select-option>
					</ion-select>
				</ion-item>
				<ion-item>
					<ion-input v-model="store.description" :label="tr('DESCRIPTION_FIELD')" label-placement="stacked" :placeholder="tr('DESCRIPTION_PH')" clear-input />
				</ion-item>
				<ion-item>
					<ion-textarea v-model="store.notes" :label="tr('NOTES')" label-placement="stacked" :placeholder="tr('NOTES_PH')" :rows="2" auto-grow />
				</ion-item>
			</ion-list>
		</ion-content>
		<ion-footer>
			<ion-toolbar class="e11_btns">
				<ion-button fill="outline" @click="router.push('/EXP10000')">{{ tr("CANCEL") }}</ion-button>
				<ion-button :disabled="store.submitting" @click="onNext">{{ store.isEdit ? tr("SAVE") : tr("NEXT") }}</ion-button>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import POP from "@/core/utilities/pop";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { EXP11000Store } from "@/store/POS/EXP/EXP11000Store";

/**
 * Expense create/edit. A create hands off to the confirm step (EXP12000) so nothing is written
 * until reviewed; an edit (?expenseId=) saves straight away and returns to the detail.
 */
defineOptions({ name: "EXP11000" });

const TYPES = ["DAILY", "MONTHLY", "YEARLY", "OTHER"];
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const tr = (key: string) => t(`EXP11000.${key}`);
const store = EXP11000Store();
const editId = computed(() => String(route.query.expenseId ?? ""));

/** Fresh form on entry, except when coming Back from the confirm step (the draft lives in the store). */
useViewEnter(() => {
	const fromConfirm = String(router.options.history.state.back ?? "").startsWith("/EXP12000");
	if (!(fromConfirm && !editId.value && store.isComplete && !store.saved)) {
		store.reset(editId.value || undefined, new Date().toISOString().slice(0, 10));
	}
});

function validate(): boolean {
	const fail = (key: string) => { POP.alert({ status: "error", title: tr("VALIDATION"), content: tr(key) }); return false; };
	if (!store.categoryId || !store.listId) return fail("CATEGORY_REQUIRED");
	if (!Number(store.amount) || Number(store.amount) <= 0) return fail("AMOUNT_REQUIRED");
	if (!store.expenseDate) return fail("DATE_REQUIRED");
	return true;
}

function onNext(): void {
	if (!validate()) return;
	if (!store.isEdit) {
		router.push("/EXP12000");
		return;
	}
	// Editing an existing row needs no confirm step — save and show it.
	store.submit((ok, _res, error) => {
		if (ok) router.replace(`/EXP15000?expenseId=${encodeURIComponent(editId.value)}`);
		else POP.apiError(error, tr("SAVE_FAILED"));
	});
}
</script>

<style scoped>
.e11_btns { --padding-start: 16px; --padding-end: 16px; }
.e11_btns ion-button { width: calc(50% - 4px); }
</style>
