<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/EXP10000">
			<template v-if="store.detail" #end>
				<ion-button @click="onEdit">{{ $t("EDIT.EDIT") }}</ion-button>
			</template>
		</bm-header>
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<ion-list v-else-if="store.detail" class="scr_list" lines="full">
				<ion-item v-for="row in rows" :key="row.label">
					<ion-label>
						<p>{{ row.label }}</p>
						<h3 class="e15_value">{{ row.value }}</h3>
					</ion-label>
				</ion-item>
			</ion-list>
			<bm-empty-state v-else description="EXP15000.NOT_FOUND" />
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { EXP15000Store } from "@/store/POS/EXP/EXP15000Store";

/** Expense record detail. */
defineOptions({ name: "EXP15000" });

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const tr = (key: string) => t(`EXP15000.${key}`);
const store = EXP15000Store();
const expenseId = computed(() => String(route.query.expenseId ?? ""));

const rows = computed(() => {
	const d = store.detail;
	if (!d) return [];
	const ccy = d.currency || "USD";
	return [
		{ label: tr("CODE"), value: d.code ?? "—" },
		{ label: tr("DATE"), value: d.expenseDate ?? "—" },
		{ label: tr("CATEGORY"), value: d.categoryName ?? "—" },
		{ label: tr("LIST"), value: d.listName ?? "—" },
		{ label: tr("TYPE"), value: d.expenseType ?? "—" },
		{ label: tr("AMOUNT"), value: (ccy === "KHR" ? "៛ " : "$ ") + UT.currency(d.amount ?? 0, ccy) },
		{ label: tr("DESCRIPTION"), value: d.description || "—" },
		{ label: tr("NOTES"), value: d.notes || "—" }
	];
});

useViewEnter(() => {
	if (!expenseId.value) {
		router.replace("/EXP10000");
		return;
	}
	store.load(expenseId.value);
});

// The web reaches edit from the list row; a phone detail gets the same entry point.
function onEdit(): void {
	router.push(`/EXP11000?expenseId=${encodeURIComponent(expenseId.value)}`);
}
</script>

<style scoped>
.e15_value { font-size: 14px; white-space: normal; }
</style>
