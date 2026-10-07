<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/EXP11000" />
		<ion-content>
			<ion-list class="scr_list" lines="full">
				<ion-item v-for="row in rows" :key="row.label">
					<ion-label>
						<p>{{ row.label }}</p>
						<h3 class="e12_value">{{ row.value }}</h3>
					</ion-label>
				</ion-item>
			</ion-list>
		</ion-content>
		<ion-footer>
			<ion-toolbar class="e12_btns">
				<ion-button fill="outline" :disabled="store.submitting" @click="router.push('/EXP11000')">{{ tr("BACK") }}</ion-button>
				<ion-button :disabled="store.submitting" @click="onConfirm">{{ tr("CONFIRM") }}</ion-button>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import POP from "@/core/utilities/pop";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { EXP11000Store } from "@/store/POS/EXP/EXP11000Store";

/** Review step for a new expense: nothing is written until Confirm. */
defineOptions({ name: "EXP12000" });

const { t } = useI18n();
const router = useRouter();
const tr = (key: string) => t(`EXP12000.${key}`);
const store = EXP11000Store();

const rows = computed(() => {
	const ccy = store.currency || "USD";
	return [
		{ label: tr("CATEGORY"), value: store.categoryName || "—" },
		{ label: tr("LIST"), value: store.listName || "—" },
		{ label: tr("AMOUNT"), value: (ccy === "KHR" ? "៛ " : "$ ") + UT.currency(store.amount ?? 0, ccy) },
		{ label: tr("DATE"), value: store.expenseDate || "—" },
		{ label: tr("TYPE"), value: t(`EXP11000.${store.expenseType}`) },
		{ label: tr("DESCRIPTION_FIELD"), value: store.description || "—" },
		{ label: tr("NOTES"), value: store.notes || "—" }
	];
});

// Deep link / refresh with an empty form: start the flow over.
useViewEnter(() => {
	if (!store.isComplete || store.isEdit) router.replace("/EXP11000");
});

function onConfirm(): void {
	if (store.submitting) return;
	store.submit((ok, _res, error) => {
		if (ok) router.replace("/EXP13000");
		else POP.apiError(error, tr("SAVE_FAILED"));
	});
}
</script>

<style scoped>
.e12_value { font-size: 14px; white-space: normal; }
.e12_btns { --padding-start: 16px; --padding-end: 16px; }
.e12_btns ion-button { width: calc(50% - 4px); }
</style>
