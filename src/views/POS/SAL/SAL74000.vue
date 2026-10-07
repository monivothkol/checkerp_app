<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/SAL40000">
			<template v-if="store.header && !store.loading" #end>
				<ion-button @click="openDocument"><ion-icon slot="icon-only" :icon="documentTextOutline" /></ion-button>
			</template>
		</bm-header>
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<template v-else-if="store.header">
				<ion-list class="scr_list" lines="full">
					<ion-item>
						<ion-label><p>{{ store.header.deliveryCode }} · {{ tr("SALE_CODE") }} {{ store.header.saleCode || "—" }}</p><h3>{{ store.header.customerName || "—" }}</h3><p v-if="store.header.customerPhone">{{ store.header.customerPhone }}</p></ion-label>
						<ion-badge slot="end" :color="statusColor">{{ statusLabel }}</ion-badge>
					</ion-item>
					<ion-item>
						<ion-label><p>{{ tr("DELIVERY_ADDRESS") }}</p><h3>{{ store.header.deliveryAddress || "—" }}</h3></ion-label>
						<ion-button v-if="mapUrl" slot="end" fill="clear" size="small" @click="openMap">📍 {{ tr("VIEW_ON_MAP") }}</ion-button>
					</ion-item>
					<ion-item v-if="store.header.driverName"><ion-label><p>{{ tr("DRIVER") }}</p><h3>{{ store.header.driverName }}</h3></ion-label></ion-item>
					<ion-item v-if="store.header.scheduledDate"><ion-label><p>{{ tr("SCHEDULED_DATE") }}</p><h3>{{ store.header.scheduledDate }}</h3></ion-label></ion-item>
					<ion-item v-if="store.header.pickedUpAt"><ion-label><p>{{ tr("PICKED_UP_AT") }}</p><h3>{{ store.header.pickedUpAt }}</h3></ion-label></ion-item>
					<ion-item v-if="store.header.deliveredAt"><ion-label><p>{{ tr("DELIVERED_AT") }}</p><h3>{{ store.header.deliveredAt }}</h3></ion-label></ion-item>
					<ion-item v-if="store.header.notes"><ion-label><p>{{ tr("NOTES") }}</p><h3>{{ store.header.notes }}</h3></ion-label></ion-item>
				</ion-list>
				<ion-list class="scr_list" lines="full">
					<ion-list-header>{{ tr("COL_PRODUCT") }}</ion-list-header>
					<ion-item v-for="(it, i) in store.items" :key="i">
						<ion-label><h3>{{ it.productName }}</h3><p>{{ it.productCode }} · {{ tr("COL_UNIT") }}: {{ it.unitName || "—" }}</p></ion-label>
						<ion-note slot="end">{{ tr("COL_QTY") }} {{ it.quantity }}</ion-note>
					</ion-item>
					<ion-item v-if="!store.items.length" lines="none"><ion-note>{{ tr("NO_ITEMS") }}</ion-note></ion-item>
				</ion-list>
				<AuditHistoryList :audit-list="store.auditList" :title="tr('CHANGE_HISTORY')" />
			</template>
			<bm-empty-state v-else :description="'SAL74000.NOT_FOUND'" />
		</ion-content>
		<!-- PENDING → PICKED_UP → DELIVERED; either open state can be cancelled. -->
		<ion-footer v-if="store.header && !store.loading && (statusKey === 'PENDING' || statusKey === 'PICKED_UP')">
			<ion-toolbar class="dl_btns">
				<ion-button v-if="statusKey === 'PENDING'" fill="outline" @click="router.push(`/SAL47000?deliveryId=${encodeURIComponent(deliveryId)}`)">{{ tr("EDIT") }}</ion-button>
				<ion-button fill="outline" color="danger" :disabled="store.acting" @click="advance('CANCELLED')">{{ tr("CANCEL") }}</ion-button>
				<ion-button v-if="statusKey === 'PENDING'" :disabled="store.acting" @click="advance('PICKED_UP')">{{ tr("MARK_PICKED_UP") }}</ion-button>
				<ion-button v-else :disabled="store.acting" @click="advance('DELIVERED')">{{ tr("MARK_DELIVERED") }}</ion-button>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { documentTextOutline } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import { BizCheckMobileSystem } from "@/shared/bizcheckmobile";
import { useViewEnter } from "@/core/modules/use-view-enter";
import DeliveryDocument from "@/views/POS/COMMON/DeliveryDocument.vue";
import AuditHistoryList from "@/views/POS/SAL/AuditHistoryList.vue";
import { SAL74000Store } from "@/store/POS/SAL/SAL74000Store";

/** Delivery detail: status transitions, map link, items, change history. */
defineOptions({ name: "SAL74000" });

const { t } = useI18n();
const tr = (k: string) => t(`SAL74000.${k}`);
const route = useRoute();
const router = useRouter();
const store = SAL74000Store();
const deliveryId = computed(() => String(route.query.deliveryId ?? ""));
const statusKey = computed(() => String(store.header?.status ?? "").trim().toUpperCase());
const statusLabel = computed(() => (["PENDING", "PICKED_UP", "DELIVERED", "CANCELLED"].includes(statusKey.value) ? tr("STATUS_" + statusKey.value) : store.header?.status));
const statusColor = computed(() => ({ DELIVERED: "success", PICKED_UP: "primary" } as Record<string, string>)[statusKey.value] ?? "medium");
const mapUrl = computed(() => {
	const h = store.header;
	if (h?.deliveryLatitude == null || h?.deliveryLongitude == null) return "";
	return `https://maps.google.com/?q=${h.deliveryLatitude},${h.deliveryLongitude}`;
});

useViewEnter(() => store.load(deliveryId.value, tr("FAILED")));

const advance = (status: string) => store.advanceStatus(status, tr("STATUS_FAILED"));
const openMap = () => void BizCheckMobileSystem.callBrowser({ url: mapUrl.value });
function openDocument(): void {
	if (!store.header) return;
	POP.showPopup(DeliveryDocument, { title: tr("PAGE_TITLE"), props: { dlv: store.header, items: store.items } }).promise.catch(() => undefined);
}
</script>

<style scoped>
.dl_btns { --padding-start: 8px; --padding-end: 8px; }
.dl_btns ion-button { margin: 0 2px; }
ion-label h3 { font-size: 14px; font-weight: 600; white-space: normal; }
ion-label p { font-size: 12px; }
</style>
