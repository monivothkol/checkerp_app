<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/PMM10000" />

		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<template v-else-if="store.detail">
				<p v-if="code" class="pmd_code">{{ code }}</p>
				<ion-list class="scr_list" lines="full">
					<ion-item><ion-label><p>{{ tr("NAME") }}</p><h3 class="pmd_value">{{ store.detail.promotionName }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("TYPE") }}</p><h3 class="pmd_value">{{ tr("TYPE_" + store.detail.promotionType) }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("REWARD") }}</p><h3 class="pmd_value">{{ rewardText }}</h3></ion-label></ion-item>
					<ion-item v-if="store.detail.description"><ion-label><p>{{ tr("DESCRIPTION") }}</p><h3 class="pmd_value">{{ store.detail.description }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("PERIOD") }}</p><h3 class="pmd_value">{{ period }}</h3></ion-label></ion-item>
					<ion-item v-if="store.detail.maxUse"><ion-label><p>{{ tr("MAX_USE") }}</p><h3 class="pmd_value">{{ store.detail.maxUse }}</h3></ion-label></ion-item>
					<ion-item>
						<ion-label><p>{{ tr("STATUS") }}</p></ion-label>
						<ion-badge slot="end" :color="store.detail.isActive ? 'success' : 'medium'">{{ store.detail.isActive ? tr("ACTIVE") : tr("INACTIVE") }}</ion-badge>
					</ion-item>
				</ion-list>

				<template v-if="store.detail.targets?.length">
					<ion-list-header>{{ tr("TARGETS") }}</ion-list-header>
					<div class="pmd_chips">
						<ion-chip v-for="(tg, i) in store.detail.targets" :key="i" color="primary">
							<ion-label>{{ tr("SCOPE_" + tg.targetType) }}: {{ tg.targetName || tg.targetId }}</ion-label>
						</ion-chip>
					</div>
				</template>

				<ion-list v-if="store.detail.bundleItems?.length" class="scr_list" lines="full">
					<ion-list-header>{{ tr("BUNDLE_ITEMS") }}</ion-list-header>
					<ion-item v-for="b in store.detail.bundleItems" :key="b.productId">
						<ion-label>
							<p class="pmd_code_sm">{{ b.productCode }}</p>
							<h3>{{ b.productName }}</h3>
							<p>{{ tr("QTY") }}: {{ b.quantity }} · {{ tr("BUNDLE_PRICE") }}: {{ UT.currency(b.bundlePrice, "USD") }}</p>
						</ion-label>
					</ion-item>
				</ion-list>
			</template>
			<bm-empty-state v-else description="PMM50000.NOT_FOUND" />
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { PMM50000Store } from "@/store/POS/PMM/PMM50000Store";

/** PMM50000 — promotion detail: header, reward, period, targets and bundle items. */
defineOptions({ name: "PMM50000" });

const { t } = useI18n();
const route = useRoute();
const tr = (key: string) => t(`PMM50000.${key}`);
const store = PMM50000Store();
const code = computed(() => String(route.query.promotionCode ?? ""));

useViewEnter(() => store.load(code.value));

const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");
const rewardText = computed(() => {
	const d = store.detail;
	if (!d) return "—";
	switch (d.promotionType) {
		case "PERCENTAGE_DISCOUNT": return `${Number(d.discountPercentage ?? 0)}%` + (d.maxDiscountAmount ? ` (${tr("MAX")} ${money(d.maxDiscountAmount)})` : "");
		case "PRICE_OVERRIDE": return money(d.discountPrice);
		case "BUY_X_GET_Y": return `${tr("BUY")} ${d.buyQuantity ?? 0} ${tr("GET")} ${d.freeQuantity ?? 0}`;
		case "BUNDLED_PACKAGE": return tr("BUNDLE");
		default: return "—";
	}
});
const period = computed(() => {
	const d = store.detail;
	const f = (x?: string) => (x ? String(x).slice(0, 10) : "");
	if (!d?.startDate && !d?.endDate) return tr("ALWAYS");
	return `${f(d.startDate) || "…"} → ${f(d.endDate) || "…"}`;
});
</script>

<style scoped>
.pmd_code { font-size: 12px; font-weight: 600; padding: 8px 16px 0; margin: 0; }
.pmd_code_sm { font-size: 10px; }
.pmd_value { font-size: 14px; white-space: normal; }
.pmd_chips { display: flex; flex-wrap: wrap; gap: 4px; padding: 0 16px 8px; }
ion-label h3 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
