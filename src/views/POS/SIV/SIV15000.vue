<template>
    <ion-page>
        <bm-header :title="`${tr('PAGE_TITLE')} ${store.saleCode}`" default-href="/SIV10000" />
        <ion-content>
            <ion-progress-bar v-if="store.loading" type="indeterminate" />
            <bm-empty-state v-else-if="store.notFound" description="SIV15000.NOT_FOUND" />
            <template v-else>
                <ion-item v-if="store.paidAmount > 0" color="light" lines="none">
                    <ion-label class="ion-text-wrap"><p>{{ tr("PARTIAL_NOTE").replace("{paid}", money(store.paidAmount)) }}</p></ion-label>
                </ion-item>
                <ion-list class="scr_list" lines="full">
                    <ion-item>
                        <ion-select v-model="store.customerName" :label="tr('CUSTOMER')" label-placement="stacked" interface="action-sheet" :placeholder="tr('WALK_IN')">
                            <ion-select-option :value="undefined">{{ tr("WALK_IN") }}</ion-select-option>
                            <ion-select-option v-for="c in store.customers" :key="c.customerCode" :value="c.customerName">{{ c.customerName }}</ion-select-option>
                        </ion-select>
                    </ion-item>
                    <ion-item>
                        <ion-select v-model="store.salePersonId" :label="tr('SALE_PERSON')" label-placement="stacked" interface="action-sheet" :placeholder="tr('SELECT')">
                            <ion-select-option :value="undefined">—</ion-select-option>
                            <ion-select-option v-for="s in store.salePersons" :key="s.salePersonId" :value="s.salePersonId">{{ s.name }}</ion-select-option>
                        </ion-select>
                    </ion-item>
                </ion-list>

                <InvoiceLinesEditor :form="store" tr-key="SIV15000" @pick="store.onPickProduct" />

                <ion-list class="scr_list" lines="full">
                    <ion-item><ion-textarea v-model="store.note" :label="tr('NOTE')" label-placement="stacked" auto-grow :rows="2" /></ion-item>
                    <div class="siv_sum"><span>{{ tr("SUBTOTAL") }}</span><span>{{ money(store.subtotal) }}</span></div>
                    <div class="siv_sum"><span>{{ tr("LINE_DISCOUNT") }}</span><span>-{{ money(store.lineDiscountTotal) }}</span></div>
                    <ion-item><ion-input v-model.number="store.invoiceDiscount" :label="tr('INVOICE_DISCOUNT')" label-placement="stacked" type="number" inputmode="decimal" min="0" step="0.01" /></ion-item>
                    <div class="siv_sum total"><span>{{ tr("NEW_TOTAL") }}</span><strong>{{ money(store.total) }}</strong></div>
                    <div class="siv_sum"><span>{{ tr("ALREADY_PAID") }}</span><span>{{ money(store.settled) }}</span></div>
                    <div class="siv_sum"><span>{{ tr("BALANCE") }}</span><span>{{ money(store.balance) }}</span></div>
                    <ion-item v-if="store.belowPaid" color="danger" lines="none"><ion-label class="ion-text-wrap">{{ tr("BELOW_PAID") }}</ion-label></ion-item>
                </ion-list>
            </template>
        </ion-content>
        <ion-footer v-if="!store.loading && !store.notFound">
            <ion-toolbar>
                <div class="siv_foot">
                    <ion-button fill="outline" @click="router.push('/SIV10000')">{{ tr("CANCEL") }}</ion-button>
                    <ion-button :disabled="!store.canSave" @click="store.submit(tr('SAVE_FAILED'))">
                        <ion-spinner v-if="store.submitting" name="crescent" />
                        <template v-else>{{ tr("SAVE") }}</template>
                    </ion-button>
                </div>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import InvoiceLinesEditor from "@/views/POS/SIV/InvoiceLinesEditor.vue";
import { SIV15000Store } from "@/store/POS/SIV/SIV15000Store";

/** Invoice edit (?saleCode=): lines/discount/customer; the new total may not drop below what is settled. */
defineOptions({ name: "SIV15000" });

const { t } = useI18n();
const tr = (key: string) => t(`SIV15000.${key}`);
const route = useRoute();
const router = useRouter();
const store = SIV15000Store();
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");

watch(() => store.redirectTo, (to) => { if (to) void router.replace(to); });
onMounted(() => store.loadLookups());
useViewEnter(() => {
    store.redirectTo = null;
    store.load(String(route.query.saleCode ?? ""));
});
</script>

<style scoped>
.siv_sum { display: flex; justify-content: space-between; padding: 8px 16px; font-size: 14px; }
.siv_sum.total { font-size: 16px; border-top: 2px solid var(--ion-color-light-shade, #e9e9ee); }
.siv_sum.total strong { color: var(--ion-color-primary); }
.siv_foot { display: flex; gap: 8px; padding: 4px 12px; }
.siv_foot ion-button { flex: 1; }
</style>
