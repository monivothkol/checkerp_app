<template>
	<div>
		<ion-note class="adm_note">{{ tr("DISPOSE_HINT", { nbv: money(nbv) }) }}</ion-note>
		<ion-list class="scr_list" lines="full">
			<ion-item>
				<ion-input v-model="store.disposalDate" type="date" :label="`${tr('DISPOSAL_DATE')} *`" label-placement="stacked" />
			</ion-item>
			<ion-item>
				<ion-input :value="store.disposalAmount" type="number" inputmode="decimal" min="0" step="0.01" :label="`${tr('DISPOSAL_AMOUNT')} *`" label-placement="stacked"
					@ion-input="store.disposalAmount = $event.detail.value === '' || $event.detail.value == null ? undefined : Number($event.detail.value)" />
			</ion-item>
			<ion-item>
				<ion-select v-model="store.receivedTo" :label="tr('RECEIVED_TO')" label-placement="stacked" interface="action-sheet">
					<ion-select-option v-for="v in ACCOUNTS" :key="v" :value="v">{{ $t(`AST20000.${v}`) }}</ion-select-option>
				</ion-select>
			</ion-item>
		</ion-list>
		<p class="adm_note" :class="gainLoss >= 0 ? 'adm_ok' : 'adm_bad'">{{ tr(gainLoss >= 0 ? "GAIN" : "LOSS") }}: {{ money(Math.abs(gainLoss)) }}</p>
		<div class="adm_btns">
			<ion-button fill="outline" @click="emit('cancel')">{{ tr("CANCEL") }}</ion-button>
			<ion-button color="danger" :disabled="store.submitting" @click="onSubmit">{{ tr("DISPOSE") }}</ion-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import UT from "@/core/utilities/ut";
import POP from "@/core/utilities/pop";
import { AST30000Store } from "@/store/POS/AST/AST30000Store";

/** Dispose/sell sheet for AST30000 (POP.showPopup body); gain/loss = proceeds − NBV; emits ok / cancel. */
defineOptions({ name: "AssetDisposeModal" });

const ACCOUNTS = ["CASH", "BANK"];
const emit = defineEmits<{ ok: []; cancel: [] }>();
const { t } = useI18n();
const tr = (k: string, args: Record<string, unknown> = {}) => t(`AST30000.${k}`, args);
const store = AST30000Store();
const money = (v: unknown) => "$ " + UT.currency(Number(v ?? 0), "USD");
const nbv = computed(() => Number(store.detail?.netBookValue ?? 0));
const gainLoss = computed(() => Number(store.disposalAmount ?? 0) - nbv.value);

onMounted(() => store.resetDispose());

function onSubmit(): void {
	if (!store.disposalDate) {
		POP.alert({ status: "error", title: tr("VALIDATION"), content: tr("DATE_REQUIRED") });
		return;
	}
	store.dispose((ok, _res, error) => {
		if (ok) {
			emit("ok");
		} else {
			const e = error as { message?: string; code?: string } | undefined;
			POP.apiError(e, tr("DISPOSE_FAILED"));
		}
	});
}
</script>

<style scoped>
.adm_note { display: block; margin: 0 0 12px; font-size: 12px; color: #6b6b76; }
.adm_ok { color: #2e7d32; }
.adm_bad { color: #c62828; }
.adm_btns { display: flex; gap: 8px; padding: 16px 0; }
.adm_btns ion-button { flex: 1; }
</style>
