<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" :default-href="`/SAL34000?packagingId=${encodeURIComponent(store.packagingId)}`" />
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<bm-empty-state v-else-if="!store.header" :description="'SAL35000.NOT_FOUND'" />
			<template v-else>
				<p class="pk_head">
					<strong>{{ store.header.packagingCode }}</strong><span v-if="store.header.saleCode"> · {{ store.header.saleCode }}</span>
					<ion-badge :color="statusColor">{{ statusLabel(store.header.status) }}</ion-badge>
				</p>

				<!-- Scan bar: a USB/Bluetooth scanner types the code + Enter; the camera is the fallback. -->
				<div class="pk_scan">
					<ion-input
						ref="scanInput" v-model="scan" class="pk_scan_input" fill="outline" :placeholder="tr('SCAN_HINT')" :aria-label="tr('SCAN_HINT')"
						:disabled="!store.editable" :clear-input="true" enterkeyhint="done" @keyup.enter="onScan" />
					<ion-button v-if="cameraSupported" :disabled="!store.editable" :aria-label="camera ? tr('STOP_CAMERA') : tr('SCAN_CAMERA')" @click="toggleCamera">
						<ion-icon slot="icon-only" :icon="camera ? stopCircleOutline : cameraOutline" />
					</ion-button>
				</div>
				<p v-if="lastScan" class="pk_scan_msg" :class="lastScan.ok ? 'ok' : 'bad'">{{ lastScan.text }}</p>
				<video v-show="camera" ref="video" class="pk_video" muted playsinline></video>

				<ion-list class="scr_list" lines="full">
					<ion-item v-for="it in store.items" :key="it.itemId" :class="{ pk_done: store.isDone(it) }">
						<div class="pk_row">
							<div class="pk_info">
								<h3>{{ it.productName }}</h3>
								<p>{{ it.productCode }}<span v-if="it.barcode"> · {{ it.barcode }}</span></p>
							</div>
							<ion-input
								class="pk_qty" :value="it.quantityRequired" :label="tr('REQUIRED')" label-placement="stacked" type="number" min="0" inputmode="numeric"
								:disabled="!store.editable" @ion-change="store.setRequired(it.itemId, Number($event.detail.value ?? 0))" />
							<ion-input
								class="pk_qty" :value="it.quantityPackaged" :label="tr('PACKED')" label-placement="stacked" type="number" min="0" inputmode="numeric"
								:disabled="!store.editable" @ion-change="store.setPacked(it.itemId, Number($event.detail.value ?? 0))" />
							<ion-icon v-if="store.isDone(it)" class="pk_check" color="success" :icon="checkmarkCircle" />
							<ion-checkbox v-else-if="store.editable" class="pk_tick" :checked="false" :aria-label="tr('MARK_DONE_TITLE')" @click.prevent="onTick(it)" />
						</div>
					</ion-item>
				</ion-list>

				<p class="pk_progress">
					{{ tr("PROGRESS") }}: <strong>{{ store.doneCount }} / {{ store.items.length }}</strong>
					<span v-if="store.header.status === 'DONE'" class="pk_all_done">✓ {{ tr("ALL_PACKED") }}</span>
					<span v-else-if="store.hasChanges" class="pk_unsaved">{{ tr("UNSAVED_HINT") }}</span>
				</p>
			</template>
		</ion-content>
		<ion-footer v-if="store.header && store.editable && !store.loading">
			<ion-toolbar class="sal_btns">
				<ion-button fill="outline" :disabled="!store.hasChanges || store.saving" @click="store.discard()">{{ tr("DISCARD") }}</ion-button>
				<ion-button :disabled="!store.hasChanges || store.saving" @click="onSave">{{ tr("SAVE") }}</ion-button>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import NATIVE from "@/core/utilities/native-bridge";
import { computed, nextTick, onBeforeUnmount, ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { onIonViewWillLeave } from "@ionic/vue";
import { cameraOutline, checkmarkCircle, stopCircleOutline } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import type { PackagingItem } from "@/models/POS/SAL/SAL30000";
import { SAL35000Store } from "@/store/POS/SAL/SAL35000Store";

/** Continue packing: scan (scanner / camera) or type packed qty locally; Save commits every changed row. */
defineOptions({ name: "SAL35000" });

const SCAN_FORMATS = ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "qr_code"];

const { t } = useI18n();
const tr = (k: string) => t(`SAL35000.${k}`);
const route = useRoute();
const store = SAL35000Store();

const scan = ref("");
const lastScan = ref<{ ok: boolean; text: string } | null>(null);
// Native shell scanner first (one scan per tap), else the WebView camera with BarcodeDetector.
const cameraSupported = ref(NATIVE.canScanBarcode() || (typeof navigator !== "undefined" && !!navigator.mediaDevices && "BarcodeDetector" in window));
const camera = ref(false);
const scanInput = ref<{ $el: HTMLIonInputElement } | null>(null);
const video = ref<HTMLVideoElement | null>(null);
let stream: MediaStream | null = null;
let scanTimer: ReturnType<typeof setInterval> | 0 = 0;

const statusColor = computed(() => ({ DONE: "success", IN_PROGRESS: "primary" } as Record<string, string>)[String(store.header?.status)] ?? "medium");
function statusLabel(s?: string): string {
	const k = String(s ?? "").toUpperCase();
	return ["PENDING", "IN_PROGRESS", "DONE", "CANCELLED"].includes(k) ? tr("STATUS_" + k) : String(s ?? "");
}
const focusScan = () => void scanInput.value?.$el.setFocus();

// Ionic reuses this page: reload only when ?packagingId changed (keeps scan progress otherwise).
let appliedId: string | null = null;
useViewEnter(() => {
	const id = String(route.query.packagingId ?? "");
	if (id !== appliedId) { appliedId = id; store.load(id, tr("FAILED")); }
	void nextTick(focusScan);
});
onIonViewWillLeave(stopCamera);
onBeforeUnmount(stopCamera);

/** Ask before committing — saving finalizes packed quantities. */
function onSave(): void {
	POP.confirm({
		title: tr("SAVE_CONFIRM_TITLE"),
		content: tr("SAVE_CONFIRM_MSG"),
		okBtn: { btnText: tr("SAVE"), onClick: () => store.confirm(tr("FAILED")) }
	});
}
/** Tick a not-yet-full row: confirm, then fill packed to required LOCALLY (still needs Save). */
function onTick(it: PackagingItem): void {
	POP.confirm({
		title: tr("MARK_DONE_TITLE"),
		content: tr("MARK_DONE_MSG").replace("{name}", it.productName ?? ""),
		okBtn: { btnText: tr("CONFIRM"), onClick: () => store.setPacked(it.itemId, Number(it.quantityRequired)) }
	});
}
function onScan(): void {
	handleCode(scan.value);
	scan.value = "";
	focusScan();
}
/** Match a scanned code to an item and +1 packed; show a non-blocking result. */
function handleCode(raw: string): void {
	const code = (raw || "").trim();
	if (!code) return;
	const item = store.scanPack(code);
	lastScan.value = item ? { ok: true, text: `+1 ${item.productName}` } : { ok: false, text: `${tr("NOT_FOUND_CODE")}: ${code}` };
}
async function toggleCamera(): Promise<void> {
	if (camera.value) { stopCamera(); return; }
	if (NATIVE.canScanBarcode()) {
		const code = await NATIVE.scanBarcode();
		if (code) handleCode(code);
		return;
	}
	try {
		stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
		const v = video.value as HTMLVideoElement;
		v.srcObject = stream;
		await v.play();
		camera.value = true;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const detector = new (window as any).BarcodeDetector({ formats: SCAN_FORMATS });
		scanTimer = setInterval(async () => {
			try {
				const codes = await detector.detect(v);
				if (codes.length) handleCode(codes[0].rawValue);
			} catch { /* frame not ready */ }
		}, 500);
	} catch {
		stopCamera();
		cameraSupported.value = false;
	}
}
function stopCamera(): void {
	if (scanTimer) clearInterval(scanTimer);
	scanTimer = 0;
	stream?.getTracks().forEach((tr) => tr.stop());
	stream = null;
	camera.value = false;
}
</script>

<style scoped>
.pk_head { display: flex; align-items: center; gap: 8px; padding: 8px 16px 0; font-size: 14px; margin: 0; }
.pk_scan { display: flex; gap: 8px; align-items: center; padding: 8px 16px; }
.pk_scan_input { flex: 1; }
.pk_scan_msg { font-size: 12px; margin: 0; padding: 0 16px 8px; }
.pk_scan_msg.ok { color: var(--ion-color-success); }
.pk_scan_msg.bad { color: var(--ion-color-danger); }
.pk_video { width: calc(100% - 32px); margin: 0 16px 8px; border-radius: 8px; }
.pk_row { display: flex; align-items: center; gap: 8px; width: 100%; padding: 4px 0; }
.pk_info { flex: 1; min-width: 0; }
.pk_info h3 { font-size: 14px; font-weight: 600; margin: 0; }
.pk_info p { font-size: 12px; color: var(--ion-color-medium); margin: 2px 0 0; }
.pk_qty { max-width: 64px; }
.pk_check { width: 24px; height: 24px; }
.pk_tick { width: 24px; }
.pk_done { --background: rgba(var(--ion-color-success-rgb), .08); }
.pk_progress { padding: 8px 16px; font-size: 14px; }
.pk_all_done { color: var(--ion-color-success); font-weight: 700; margin-left: 8px; }
.pk_unsaved { color: var(--ion-color-warning-shade); font-weight: 600; margin-left: 8px; }
.sal_btns { --padding-start: 16px; --padding-end: 16px; }
.sal_btns ion-button { width: calc(50% - 4px); }
</style>
