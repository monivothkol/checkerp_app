<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/CUS30000" />
		<ion-content>
			<ion-list class="scr_list" lines="full">
				<ion-item>
					<ion-input v-model="store.form.conditionName" :label="`${tr('NAME')} *`" label-placement="stacked" :placeholder="tr('NAME_PH')" />
				</ion-item>
				<ion-item>
					<ion-select v-model="store.form.conditionType" :label="`${tr('TYPE')} *`" label-placement="stacked" interface="action-sheet" @ion-change="onTypeChange">
						<ion-select-option v-for="ty in store.types" :key="ty" :value="ty">{{ tr("TYPE_" + ty) }}</ion-select-option>
					</ion-select>
				</ion-item>

				<template v-if="store.isAmount">
					<ion-item>
						<NumberInput v-model="store.amount" :label="`${tr('MIN_AMOUNT')} *`" label-placement="stacked" min="0" step="0.01" />
					</ion-item>
					<ion-item>
						<ion-select v-model="store.currency" :label="tr('CURRENCY')" label-placement="stacked" interface="action-sheet">
							<ion-select-option value="USD">USD</ion-select-option>
							<ion-select-option value="KHR">KHR</ion-select-option>
						</ion-select>
					</ion-item>
				</template>

				<template v-if="store.isTarget">
					<ion-item v-if="store.targetScope === 'PRODUCT'" lines="none">
						<ion-searchbar :placeholder="tr('SEARCH_TARGET')" @ion-input="store.onTargetSearch(String($event.detail.value ?? ''))" />
					</ion-item>
					<ion-item>
						<ion-select v-model="store.targetId" :label="`${targetLabel} *`" label-placement="stacked" :placeholder="tr('SEARCH_TARGET')"
							interface="action-sheet" @ion-change="store.targetId && store.onPickTarget(store.targetId)">
							<ion-select-option v-for="o in store.targetOptions" :key="o.id" :value="o.id">{{ o.name }}</ion-select-option>
						</ion-select>
					</ion-item>
				</template>

				<ion-item>
					<NumberInput v-model="store.form.pointReward" :label="`${tr('POINTS')} *`" label-placement="stacked" min="0" step="0.1" :helper-text="tr('POINTS_HINT')" />
				</ion-item>
			</ion-list>
		</ion-content>
		<ion-footer>
			<ion-toolbar class="c31_btns">
				<ion-button fill="outline" @click="router.push('/CUS30000')">{{ tr("CANCEL") }}</ion-button>
				<ion-button :disabled="!store.canConfirm" @click="confirm">{{ tr("NEXT") }}</ion-button>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import NumberInput from "@/core/components/NumberInput.vue";
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { CUS31000Store } from "@/store/POS/CUS/CUS31000Store";

/** Loyalty condition create (step 1): type-aware rule (amount threshold or product/category/brand target). */
defineOptions({ name: "CUS31000" });

const { t } = useI18n();
const router = useRouter();
const tr = (key: string) => t(`CUS31000.${key}`);
const store = CUS31000Store();

const targetLabel = computed(() => {
	if (store.targetScope === "CATEGORY") return tr("SEL_CATEGORY");
	return tr(store.targetScope === "BRAND" ? "SEL_BRAND" : "SEL_PRODUCT");
});

// No type-ahead dropdown on a phone: preload the first products so the picker isn't empty.
function onTypeChange(): void {
	store.onTypeChange();
	if (store.isTarget && store.targetScope === "PRODUCT") store.onTargetSearch("");
}
function confirm(): void {
	if (store.buildAndSaveDraft(tr("TYPE_" + store.form.conditionType))) router.push("/CUS32000");
}

useViewEnter(() => {
	store.loadCategories();
	store.loadBrands();
});
</script>

<style scoped>
.c31_btns { --padding-start: 16px; --padding-end: 16px; }
.c31_btns ion-button { width: calc(50% - 4px); }
</style>
