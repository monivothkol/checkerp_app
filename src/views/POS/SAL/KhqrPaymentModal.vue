<template>
    <div class="khqr">
        <ion-progress-bar v-if="store.loading" type="indeterminate" />
        <div v-if="store.error" class="khqr_error">
            <ion-text color="danger"><p>{{ store.error }}</p></ion-text>
            <ion-button fill="outline" @click="generate">{{ t("RETRY") }}</ion-button>
        </div>
        <template v-else-if="!store.loading">
            <div class="khqr_amount">{{ money(store.amount) }}</div>
            <div class="khqr_card" :class="{ paid: store.paid }">
                <canvas ref="qrCanvas" class="khqr_canvas"></canvas>
                <div v-if="store.paid" class="khqr_paid_overlay"><ion-icon :icon="checkmarkCircle" class="khqr_paid_ico" /></div>
            </div>
            <div class="khqr_status">
                <span v-if="store.paid" class="khqr_paid_txt">{{ t("KHQR_PAID") }}</span>
                <template v-else>
                    <div>{{ t("KHQR_SCAN") }}</div>
                    <div class="khqr_expire">{{ t("KHQR_EXPIRES") }} {{ store.countdown }}</div>
                </template>
            </div>
            <ion-text v-if="!store.verifiable && !store.paid" color="warning"><p class="khqr_warn">{{ t("KHQR_NO_VERIFY") }}</p></ion-text>
        </template>

        <div class="khqr_actions">
            <ion-button fill="outline" :disabled="store.paid" @click="emit('cancel')">{{ t("CANCEL") }}</ion-button>
            <ion-button v-if="!store.paid && !store.error" :fill="store.verifiable ? 'outline' : 'solid'" @click="manualConfirm">{{ t("KHQR_MANUAL") }}</ion-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import QRCode from "qrcode";
import { checkmarkCircle } from "ionicons/icons";
import UT from "@/core/utilities/ut";
import { KhqrPaymentModalStore } from "@/store/POS/SAL/KhqrPaymentModalStore";

/** KHQR popup: generate the QR, poll (when verifiable) + countdown; ok on paid or manual confirm. */
defineOptions({ name: "KhqrPaymentModal" });

const props = withDefaults(defineProps<{ amount: number; billNumber?: string; customerName?: string }>(), { billNumber: "", customerName: "" });
const emit = defineEmits<{ ok: [{ transactionId: string; md5: string; paid: boolean; manual?: boolean }]; cancel: [] }>();
const { t: $t } = useI18n();
const t = (key: string) => $t(`POS11000.${key}`);
const store = KhqrPaymentModalStore();
const qrCanvas = ref<HTMLCanvasElement | null>(null);
let emitted = false;
let pollTimer: ReturnType<typeof setInterval> | 0 = 0;
let tickTimer: ReturnType<typeof setInterval> | 0 = 0;

const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");

// generate finished (success) → render the QR and start the poll/countdown timers
watch(() => store.loading, (v) => {
    if (v || store.error) return;
    void nextTick(() => renderQr(store.qr));
    startTimers();
});
watch(() => store.paid, (v) => { if (v && !emitted) onPaid(); });
watch(() => store.error, (msg) => { if (msg) stopTimers(); });

onMounted(() => {
    store.init(props.amount, props.billNumber, props.customerName);
    generate();
});
onBeforeUnmount(stopTimers);

function generate(): void {
    store.generate(t("KHQR_ERROR"));
}
function renderQr(qr: string): void {
    if (!qrCanvas.value || !qr) return;
    QRCode.toCanvas(qrCanvas.value, qr, { width: 240, margin: 1 }).catch(() => { store.error = t("KHQR_ERROR"); });
}
function stopTimers(): void {
    if (pollTimer) clearInterval(pollTimer);
    if (tickTimer) clearInterval(tickTimer);
    pollTimer = 0;
    tickTimer = 0;
}
function startTimers(): void {
    stopTimers();
    tick();
    tickTimer = setInterval(tick, 1000);
    if (store.verifiable) pollTimer = setInterval(() => store.poll(t("KHQR_EXPIRED")), 5000);
}
function tick(): void {
    store.tick(Date.now(), t("KHQR_EXPIRED"));
}
function onPaid(): void {
    emitted = true;
    stopTimers();
    setTimeout(() => emit("ok", { transactionId: store.transactionId, md5: store.md5, paid: true }), 800);
}
function manualConfirm(): void {
    emitted = true;
    stopTimers();
    store.markPaid();
    emit("ok", { transactionId: store.transactionId, md5: store.md5, paid: true, manual: true });
}
</script>

<style scoped>
.khqr { text-align: center; padding: 8px 4px; }
.khqr_amount { font-size: 16px; font-weight: 800; color: var(--ion-color-primary); margin: 8px 0 12px; }
.khqr_card { position: relative; display: inline-flex; padding: 12px; border: 1px solid var(--ion-color-light-shade, #e9e9ee); border-radius: 12px; background: #fff; }
.khqr_card.paid .khqr_canvas { opacity: 0.25; }
.khqr_canvas { display: block; }
.khqr_paid_overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.khqr_paid_ico { width: 72px; height: 72px; color: var(--ion-color-success); }
.khqr_status { margin-top: 12px; font-size: 14px; color: var(--ion-color-medium); }
.khqr_paid_txt { font-size: 16px; font-weight: 700; color: var(--ion-color-success); }
.khqr_expire { margin-top: 4px; color: var(--ion-text-color); }
.khqr_warn { font-size: 12px; margin: 12px 0 0; }
.khqr_error { padding: 12px 0; }
.khqr_actions { display: flex; justify-content: center; gap: 8px; margin-top: 16px; }
</style>
