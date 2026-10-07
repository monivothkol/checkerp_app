<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/STK21000" />
		<ion-content>
			<bm-empty-state v-if="!store.draft" description="STK22000.NO_DRAFT" />
			<template v-else>
				<div class="stk_route">
					<div><span>{{ tr("FROM") }}</span><strong>{{ d.fromName }}</strong></div>
					<ion-icon :icon="arrowForward" color="primary" />
					<div><span>{{ tr("TO") }}</span><strong>{{ d.toName }}</strong></div>
				</div>
				<ion-list class="scr_list" lines="full">
					<ion-list-header>{{ tr("PRODUCT") }}</ion-list-header>
					<ion-item v-for="(l, i) in d.lines" :key="i">
						<ion-label>
							<h3>{{ l.name }}<template v-if="l.variantName"> — {{ l.variantName }}</template></h3>
							<p>{{ l.code }}</p>
						</ion-label>
						<ion-note slot="end">{{ tr("QTY") }} {{ l.qty }}</ion-note>
					</ion-item>
				</ion-list>
				<div class="stk_total"><span>{{ tr("TOTAL_QTY") }}</span><strong>{{ d.totalQty }}</strong></div>
			</template>
		</ion-content>
		<ion-footer>
			<ion-toolbar>
				<div class="stk_btns">
					<ion-button fill="outline" :disabled="store.submitting" @click="router.push('/STK21000')">{{ tr("BACK") }}</ion-button>
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
import { arrowForward } from "ionicons/icons";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { STK22000Store } from "@/store/POS/STK/STK22000Store";
import type { TransferDraftDisplay } from "@/models/POS/STK/STK21000";

/** Transfer confirm: review the STK_TRANSFER draft and execute it (idempotent). */
defineOptions({ name: "STK22000" });

const { t } = useI18n();
const tr = (k: string) => t(`STK22000.${k}`);
const router = useRouter();
const store = STK22000Store();
const d = computed(() => store.draft?.display as TransferDraftDisplay);

watch(() => store.redirectTo, (to) => { if (to) router.replace(to); });
useViewEnter(() => { if (!store.loadDraft()) router.replace("/STK21000"); });
</script>

<style scoped>
ion-label h3 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
.stk_route { display: flex; align-items: center; gap: 8px; padding: 16px; }
.stk_route > div { flex: 1; display: flex; flex-direction: column; gap: 2px; padding: 12px; border-radius: 8px; background: var(--ion-color-light); }
.stk_route span { font-size: 12px; color: var(--ion-color-medium); }
.stk_route strong { font-size: 14px; }
.stk_total { display: flex; justify-content: space-between; padding: 12px 16px; font-size: 16px; }
.stk_btns { display: flex; gap: 8px; padding: 8px 12px; }
.stk_btns ion-button { flex: 1; }
</style>
