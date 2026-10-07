<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/STK20000" />
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<template v-else-if="store.detail">
				<div class="stk_route">
					<div><span>{{ tr("FROM") }}</span><strong>{{ store.detail.fromInventoryName }}</strong></div>
					<ion-icon :icon="arrowForward" color="primary" />
					<div><span>{{ tr("TO") }}</span><strong>{{ store.detail.toInventoryName }}</strong></div>
				</div>
				<ion-list class="scr_list" lines="full">
					<ion-item>
						<ion-label><p>{{ code }}</p><h3>{{ tr("STATUS") }}</h3></ion-label>
						<ion-badge slot="end" :color="stColor(store.detail.status)">{{ stLabel(store.detail.status) }}</ion-badge>
					</ion-item>
					<ion-item><ion-label><p>{{ tr("DATE") }}</p><h3>{{ store.detail.createdAt }}</h3></ion-label></ion-item>
					<ion-item v-if="store.detail.notes"><ion-label><p>{{ tr("NOTE") }}</p><h3>{{ store.detail.notes }}</h3></ion-label></ion-item>
				</ion-list>
				<ion-list class="scr_list" lines="full">
					<ion-list-header>{{ tr("COL_NAME") }}</ion-list-header>
					<ion-item v-for="(it, i) in store.detail.items ?? []" :key="i">
						<ion-label>
							<p>{{ it.productCode }}</p>
							<h3>{{ it.productName }}</h3>
							<p>{{ tr("COL_UNIT_COST") }} {{ money(it.unitCost) }}</p>
						</ion-label>
						<ion-note slot="end">{{ tr("COL_QTY") }} {{ num(it.quantity) }}</ion-note>
					</ion-item>
				</ion-list>
			</template>
			<bm-empty-state v-else description="STK23000.NOT_FOUND" />
		</ion-content>
		<ion-footer v-if="isPending">
			<ion-toolbar>
				<div class="stk_btns">
					<ion-button color="danger" fill="outline" :disabled="store.acting" @click="confirmAct('reject')">{{ tr("REJECT") }}</ion-button>
					<ion-button fill="outline" :disabled="store.acting" @click="confirmAct('cancel')">{{ tr("CANCEL") }}</ion-button>
					<ion-button :disabled="store.acting" @click="confirmAct('approve')">{{ tr("APPROVE") }}</ion-button>
				</div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { arrowForward } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { STK23000Store } from "@/store/POS/STK/STK23000Store";

/** Transfer detail; a PENDING transfer can be approved, cancelled or rejected. */
defineOptions({ name: "STK23000" });

const { t } = useI18n();
const tr = (k: string) => t(`STK23000.${k}`);
const route = useRoute();
const store = STK23000Store();
const code = computed(() => String(route.query.transferCode ?? ""));
const isPending = computed(() => String(store.detail?.status ?? "").toUpperCase() === "PENDING");
const num = (v: unknown) => String(Number(v ?? 0));
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");

function confirmAct(kind: "approve" | "cancel" | "reject"): void {
	const prefix = kind.toUpperCase();
	POP.confirm({ title: tr(`${prefix}_TITLE`), content: tr(`${prefix}_MSG`), okBtn: { btnText: tr(prefix), onClick: () => store.act(kind, tr("ACTION_FAILED")) } });
}
function stColor(s?: string): string {
	const k = String(s ?? "").toUpperCase();
	if (k === "COMPLETED") return "success";
	return k === "PENDING" ? "primary" : "medium";
}
function stLabel(s?: string): string {
	const k = String(s ?? "").toUpperCase();
	return ["COMPLETED", "PENDING", "REJECTED", "CANCELLED"].includes(k) ? tr("STATUS_" + k) : String(s ?? "");
}

useViewEnter(() => store.load(code.value));
</script>

<style scoped>
ion-label h3 { font-size: 14px; font-weight: 600; white-space: normal; }
ion-label p { font-size: 12px; }
.stk_route { display: flex; align-items: center; gap: 8px; padding: 16px; }
.stk_route > div { flex: 1; display: flex; flex-direction: column; gap: 2px; padding: 12px; border-radius: 8px; background: var(--ion-color-light); }
.stk_route span { font-size: 12px; color: var(--ion-color-medium); }
.stk_route strong { font-size: 14px; }
.stk_btns { display: flex; gap: 8px; padding: 8px 12px; }
.stk_btns ion-button { flex: 1; }
</style>
