<template>
    <ion-page>
        <bm-header :title="tr('PAGE_TITLE')" default-href="/SIV11000" />
        <ion-content>
            <bm-empty-state v-if="!store.draft" description="SIV12000.NO_DRAFT" />
            <template v-else>
                <ion-list class="scr_list" lines="full">
                    <ion-item>
                        <ion-label><p>{{ tr("CUSTOMER") }}</p><h3>{{ store.draft.display.customerName }}</h3></ion-label>
                    </ion-item>
                    <ion-list-header>{{ tr("PRODUCT") }}</ion-list-header>
                    <ion-item v-for="(l, i) in store.draft.display.lines" :key="i">
                        <ion-label>
                            <h3>{{ l.name }} <ion-badge v-if="l.free" color="success">{{ tr("FREE") }}</ion-badge></h3>
                            <p>{{ tr("QTY") }}: {{ l.qty }}</p>
                        </ion-label>
                        <ion-note slot="end">{{ l.free ? tr("FREE") : money(l.amount) }}</ion-note>
                    </ion-item>
                </ion-list>
                <div class="siv_sum"><span>{{ tr("SUBTOTAL") }}</span><span>{{ money(store.draft.display.subtotal) }}</span></div>
                <div v-if="store.draft.display.invoiceDiscount" class="siv_sum"><span>{{ tr("INVOICE_DISCOUNT") }}</span><span>-{{ money(store.draft.display.invoiceDiscount) }}</span></div>
                <div class="siv_sum total"><span>{{ tr("TOTAL") }}</span><strong>{{ money(store.draft.display.total) }}</strong></div>
                <div class="siv_sum"><span>{{ tr("PAID") }}</span><span>{{ money(store.draft.display.paid) }}</span></div>
                <div class="siv_sum"><span>{{ tr("BALANCE") }}</span><span>{{ money(store.draft.display.balance) }}</span></div>
            </template>
        </ion-content>
        <ion-footer>
            <ion-toolbar>
                <div class="siv_foot">
                    <ion-button fill="outline" :disabled="store.submitting" @click="router.push('/SIV11000')">{{ tr("BACK") }}</ion-button>
                    <ion-button :disabled="!store.draft || store.submitting" @click="store.submit(tr('FAILED'))">
                        <ion-spinner v-if="store.submitting" name="crescent" />
                        <template v-else>{{ tr("CONFIRM") }}</template>
                    </ion-button>
                </div>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { SIV12000Store } from "@/store/POS/SIV/SIV12000Store";

/** Invoice create confirm: shows the SIV11000 draft and submits it (→ SIV13000). No draft → back to the form. */
defineOptions({ name: "SIV12000" });

const { t } = useI18n();
const tr = (key: string) => t(`SIV12000.${key}`);
const router = useRouter();
const store = SIV12000Store();
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");

watch(() => store.redirectTo, (to) => { if (to) void router.replace(to); });
useViewEnter(() => { if (!store.loadDraft()) void router.replace("/SIV11000"); });
</script>

<style scoped>
ion-list-header { font-size: 14px; }
ion-label h3 { font-size: 14px; font-weight: 600; }
.siv_sum { display: flex; justify-content: space-between; padding: 8px 16px; font-size: 14px; }
.siv_sum.total { font-size: 16px; border-top: 2px solid var(--ion-color-light-shade, #e9e9ee); }
.siv_sum.total strong { color: var(--ion-color-primary); }
.siv_foot { display: flex; gap: 8px; padding: 4px 12px; }
.siv_foot ion-button { flex: 1; }
</style>
