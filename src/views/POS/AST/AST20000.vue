<template>
	<ion-page>
		<bm-header :title="store.isEdit ? tr('PAGE_TITLE_EDIT') : tr('PAGE_TITLE')" default-href="/AST10000" />
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<ion-list v-else class="scr_list" lines="full">
				<ion-item>
					<ion-input v-model="store.assetName" :label="`${tr('NAME')} *`" label-placement="stacked" :placeholder="tr('NAME_PH')" :clear-input="true" />
				</ion-item>
				<ion-item>
					<ion-select :value="store.assetType" :label="`${tr('TYPE')} *`" label-placement="stacked" interface="action-sheet" :disabled="store.isEdit"
						@ion-change="store.assetType = $event.detail.value; store.onTypeChange()">
						<ion-select-option v-for="v in ASSET_TYPES" :key="v" :value="v">{{ $t(`AST10000.${v}`) }}</ion-select-option>
					</ion-select>
				</ion-item>
				<ion-item>
					<ion-input :value="store.cost" type="number" inputmode="decimal" min="0.01" step="0.01" :label="`${tr('COST')} *`" label-placement="stacked"
						:placeholder="tr('AMOUNT_PH')" :disabled="store.isEdit" @ion-input="store.cost = num($event.detail.value)" />
				</ion-item>
				<ion-item>
					<ion-input v-model="store.purchaseDate" type="date" :label="`${tr('PURCHASE_DATE')} *`" label-placement="stacked" :disabled="store.isEdit" />
				</ion-item>
				<ion-item>
					<ion-select v-model="store.paidFrom" :label="tr('PAID_FROM')" label-placement="stacked" interface="action-sheet" :disabled="store.isEdit">
						<ion-select-option v-for="v in PAID_FROM" :key="v" :value="v">{{ tr(v) }}</ion-select-option>
					</ion-select>
				</ion-item>
				<template v-if="store.depreciable">
					<ion-item>
						<ion-select v-model="store.depreciationMethod" :label="`${tr('METHOD')} *`" label-placement="stacked" interface="action-sheet">
							<ion-select-option v-for="v in METHODS" :key="v" :value="v">{{ tr(v) }}</ion-select-option>
						</ion-select>
					</ion-item>
					<ion-item>
						<ion-input :value="store.usefulLifeMonths" type="number" inputmode="numeric" min="1" step="1" :label="`${tr('LIFE_MONTHS')} *`" label-placement="stacked"
							@ion-input="store.usefulLifeMonths = int($event.detail.value)" />
					</ion-item>
					<ion-item>
						<ion-input :value="store.salvageValue" type="number" inputmode="decimal" min="0" step="0.01" :label="tr('SALVAGE')" label-placement="stacked"
							@ion-input="store.salvageValue = num($event.detail.value)" />
					</ion-item>
				</template>
				<ion-item v-else><ion-note class="ast_note">{{ tr("NO_DEPRECIATION") }}</ion-note></ion-item>
				<ion-item><ion-input v-model="store.serialNo" :label="tr('SERIAL')" label-placement="stacked" :clear-input="true" /></ion-item>
				<ion-item><ion-input v-model="store.location" :label="tr('LOCATION')" label-placement="stacked" :clear-input="true" /></ion-item>
				<ion-item><ion-input v-model="store.supplierName" :label="tr('SUPPLIER')" label-placement="stacked" :clear-input="true" /></ion-item>
				<ion-item><ion-textarea v-model="store.remark" :label="tr('REMARK')" label-placement="stacked" :rows="2" auto-grow /></ion-item>
			</ion-list>
		</ion-content>
		<ion-footer>
			<ion-toolbar>
				<div class="act_btns">
					<ion-button fill="outline" @click="onCancel">{{ tr("CANCEL") }}</ion-button>
					<ion-button :disabled="store.submitting || store.loading" @click="onSubmit">{{ store.isEdit ? tr("SAVE") : tr("RECORD") }}</ion-button>
				</div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import POP from "@/core/utilities/pop";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { ASSET_TYPES } from "@/models/POS/AST/AST10000";
import { AST20000Store } from "@/store/POS/AST/AST20000Store";

/**
 * Record an asset, or edit one opened with ?assetId= (cost, date and paid-from are frozen once posted).
 * Saving opens the asset's detail (AST30000).
 */
defineOptions({ name: "AST20000" });

const METHODS = ["STRAIGHT_LINE", "DECLINING_150", "DECLINING_200"];
const PAID_FROM = ["CASH", "BANK", "CREDIT"];
const { t } = useI18n();
const tr = (k: string) => t(`AST20000.${k}`);
const route = useRoute();
const router = useRouter();
const store = AST20000Store();
const num = (v?: string | null) => (v === "" || v == null ? undefined : Number(v));
const int = (v?: string | null) => (v === "" || v == null ? undefined : Math.trunc(Number(v)));
const detailRoute = (assetId: string) => `/AST30000?assetId=${encodeURIComponent(assetId)}`;

useViewEnter(() => store.load(String(route.query.assetId ?? "")));

function onCancel(): void {
	router.push(store.isEdit ? detailRoute(store.assetId) : "/AST10000");
}
function onSubmit(): void {
	const missingPosted = !store.isEdit && ((Number(store.cost) || 0) <= 0 || !store.purchaseDate);
	if (!store.assetName.trim() || missingPosted) {
		POP.alert({ status: "error", title: tr("VALIDATION"), content: tr("REQUIRED_MSG") });
		return;
	}
	store.submit((ok, assetId, error) => {
		if (ok) {
			POP.alert({ status: "success", title: tr("SAVED"), content: tr("SAVED_MSG") });
			router.replace(assetId ? detailRoute(assetId) : "/AST10000");
		} else {
			const e = error as { message?: string; code?: string } | undefined;
			POP.alert({ status: "error", title: tr("SAVE_FAILED"), content: e?.message, errorCode: e?.code });
		}
	});
}
</script>

<style scoped src="../../ACT/act-report.css"></style>
<style scoped>
.ast_note { font-size: 12px; padding: 8px 0; }
</style>
