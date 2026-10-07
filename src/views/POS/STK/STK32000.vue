<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/STK31000" />
		<ion-content>
			<bm-empty-state v-if="!store.draft" description="STK32000.NO_DRAFT" />
			<template v-else>
				<ion-list class="scr_list" lines="full">
					<ion-item><ion-label><p>{{ tr("INVENTORY") }}</p><h3>{{ d.inventoryName }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("REASON") }}</p><h3>{{ d.reason }}</h3></ion-label></ion-item>
				</ion-list>
				<ion-list class="scr_list" lines="full">
					<ion-list-header>{{ tr("PRODUCT") }}</ion-list-header>
					<ion-item v-for="(l, i) in d.lines" :key="i">
						<ion-label>
							<h3>{{ l.name }}<template v-if="l.variantName"> — {{ l.variantName }}</template></h3>
							<p>{{ l.code }}</p>
							<p>{{ tr("BEFORE") }} {{ l.before }} → {{ tr("AFTER") }} {{ l.after }}</p>
						</ion-label>
						<ion-note slot="end" :class="l.after - l.before > 0 ? 'up' : 'down'">{{ signed(l.after - l.before) }}</ion-note>
					</ion-item>
				</ion-list>
				<div class="stk_sum">
					<div><span>{{ tr("INCREASES") }}</span><span class="up">+{{ d.increases }}</span></div>
					<div class="total"><span>{{ tr("DECREASES") }}</span><strong class="down">-{{ d.decreases }}</strong></div>
				</div>
			</template>
		</ion-content>
		<ion-footer>
			<ion-toolbar>
				<div class="stk_btns">
					<ion-button fill="outline" :disabled="store.submitting" @click="router.push('/STK31000')">{{ tr("BACK") }}</ion-button>
					<ion-button :disabled="!store.draft || store.submitting" @click="store.submit(tr('FAILED'))">{{ tr("CONFIRM") }}</ion-button>
				</div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { STK32000Store } from "@/store/POS/STK/STK32000Store";
import type { AdjustmentDraftDisplay } from "@/models/POS/STK/STK31000";

/** Adjustment confirm: review the STK_ADJUST draft and apply it (idempotent). */
defineOptions({ name: "STK32000" });

const { t } = useI18n();
const tr = (k: string) => t(`STK32000.${k}`);
const router = useRouter();
const store = STK32000Store();
const d = computed(() => store.draft?.display as AdjustmentDraftDisplay);
const signed = (v: number) => (v > 0 ? `+${v}` : String(v));

watch(() => store.redirectTo, (to) => { if (to) router.replace(to); });
useViewEnter(() => { if (!store.loadDraft()) router.replace("/STK31000"); });
</script>

<style scoped>
ion-label h3 { font-size: 14px; font-weight: 600; white-space: normal; }
ion-label p { font-size: 12px; }
.up { color: var(--ion-color-success) !important; font-weight: 600; }
.down { color: var(--ion-color-danger) !important; font-weight: 600; }
.stk_sum { padding: 8px 16px; font-size: 14px; }
.stk_sum > div { display: flex; justify-content: space-between; padding: 4px 0; }
.stk_sum .total { font-size: 16px; border-top: 1px solid var(--ion-color-light-shade); padding-top: 8px; }
.stk_btns { display: flex; gap: 8px; padding: 8px 12px; }
.stk_btns ion-button { flex: 1; }
</style>
