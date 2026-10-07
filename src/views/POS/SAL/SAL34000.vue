<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/SAL30000">
			<template v-if="store.header && !store.loading" #end>
				<ion-button @click="openDocument"><ion-icon slot="icon-only" :icon="documentTextOutline" /></ion-button>
			</template>
		</bm-header>
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<template v-else-if="store.header">
				<ion-list class="scr_list" lines="full">
					<ion-item>
						<ion-label><p>{{ store.header.packagingCode }}</p><h3>{{ tr("SALE_CODE") }}: {{ store.header.saleCode || "—" }}</h3></ion-label>
						<ion-badge slot="end" :color="statusColor">{{ statusLabel }}</ion-badge>
					</ion-item>
					<ion-item><ion-label><p>{{ tr("SOURCE") }}</p><h3>{{ store.header.sourceType }}</h3></ion-label></ion-item>
					<ion-item v-if="store.header.packerName"><ion-label><p>{{ tr("PACKER") }}</p><h3>{{ store.header.packerName }}</h3></ion-label></ion-item>
					<ion-item v-if="store.header.referenceNumber"><ion-label><p>{{ tr("REFERENCE") }}</p><h3>{{ store.header.referenceNumber }}</h3></ion-label></ion-item>
					<ion-item v-if="store.header.packagedBy"><ion-label><p>{{ tr("PACKAGED_BY") }}</p><h3>{{ store.header.packagedBy }}<template v-if="store.header.packagedByCode"> ({{ store.header.packagedByCode }})</template></h3></ion-label></ion-item>
					<ion-item v-if="store.header.packagedAt"><ion-label><p>{{ tr("PACKAGED_AT") }}</p><h3>{{ fmtDate(store.header.packagedAt) }}</h3></ion-label></ion-item>
					<ion-item v-if="store.header.createdAt"><ion-label><p>{{ tr("CREATED_AT") }}</p><h3>{{ fmtDate(store.header.createdAt) }}</h3></ion-label></ion-item>
					<ion-item v-if="store.header.notes"><ion-label><p>{{ tr("NOTES") }}</p><h3>{{ store.header.notes }}</h3></ion-label></ion-item>
				</ion-list>
				<ion-list class="scr_list" lines="full">
					<ion-list-header>{{ tr("COL_PRODUCT") }}</ion-list-header>
					<ion-item v-for="it in store.items" :key="it.itemId">
						<ion-label><h3>{{ it.productName }}</h3><p>{{ it.productCode || it.barcode || "—" }}</p></ion-label>
						<ion-note slot="end" :color="Number(it.quantityPackaged) >= Number(it.quantityRequired) ? 'success' : undefined">
							{{ it.quantityPackaged }} / {{ it.quantityRequired }}
						</ion-note>
					</ion-item>
				</ion-list>
				<!-- Sale-linked actions (web parity: a manual packing has none). -->
				<div v-if="store.header.saleCode" class="pk_actions">
					<ion-button v-if="canPack" @click="router.push(`/SAL35000?packagingId=${encodeURIComponent(code)}`)">{{ tr("CONTINUE_PACKING") }}</ion-button>
					<ion-button v-if="statusKey === 'PENDING'" fill="outline" @click="router.push(`/SAL37000?packagingId=${encodeURIComponent(code)}`)">{{ tr("EDIT") }}</ion-button>
					<ion-button fill="outline" @click="goSale('/SIV13000')">{{ tr("VIEW_INVOICE") }}</ion-button>
					<ion-button fill="outline" :disabled="!allPacked" @click="goSale('/SAL41000')">{{ tr("CREATE_DELIVERY") }}</ion-button>
					<ion-button v-if="canPack" fill="outline" color="danger" @click="store.cancel(tr('CANCEL_FAILED'))">{{ tr("CANCEL") }}</ion-button>
				</div>
				<p v-if="store.header.saleCode && !allPacked" class="pk_hint">{{ tr("DELIVERY_NEEDS_PACKED") }}</p>
			</template>
			<bm-empty-state v-else :description="'SAL34000.NOT_FOUND'" />
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { documentTextOutline } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import { useViewEnter } from "@/core/modules/use-view-enter";
import PackingDocument from "@/views/POS/COMMON/PackingDocument.vue";
import { SAL34000Store } from "@/store/POS/SAL/SAL34000Store";

/** Packing detail: continue packing / edit / cancel while open; delivery only once every item is packed. */
defineOptions({ name: "SAL34000" });

const { t } = useI18n();
const tr = (k: string) => t(`SAL34000.${k}`);
const route = useRoute();
const router = useRouter();
const store = SAL34000Store();
const code = computed(() => String(route.query.packagingId ?? ""));
const statusKey = computed(() => String(store.header?.status ?? "").trim().toUpperCase());
const canPack = computed(() => statusKey.value === "PENDING" || statusKey.value === "IN_PROGRESS");
const allPacked = computed(() => store.items.length > 0 && store.items.every((i) => Number(i.quantityPackaged) >= Number(i.quantityRequired)));
const statusLabel = computed(() => (["PENDING", "IN_PROGRESS", "DONE", "CANCELLED"].includes(statusKey.value) ? tr("STATUS_" + statusKey.value) : store.header?.status));
const statusColor = computed(() => ({ DONE: "success", IN_PROGRESS: "primary" } as Record<string, string>)[statusKey.value] ?? "medium");
const fmtDate = (d?: string) => (d ? String(d).replace("T", " ").slice(0, 16) : "—");

useViewEnter(() => store.load(code.value));

function goSale(path: string): void {
	router.push(`${path}?saleCode=${encodeURIComponent(store.header?.saleCode ?? "")}`);
}
function openDocument(): void {
	if (!store.header) return;
	POP.showPopup(PackingDocument, { title: tr("PAGE_TITLE"), props: { pkg: store.header, items: store.items } }).promise.catch(() => undefined);
}
</script>

<style scoped>
.pk_actions { display: flex; flex-wrap: wrap; gap: 8px; padding: 8px 16px; }
.pk_hint { font-size: 12px; color: var(--ion-color-medium); padding: 0 16px; }
ion-label h3 { font-size: 14px; font-weight: 600; white-space: normal; }
ion-label p { font-size: 12px; }
</style>
