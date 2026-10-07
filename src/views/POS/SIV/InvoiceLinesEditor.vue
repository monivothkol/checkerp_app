<template>
    <div>
        <ion-list-header>{{ tr("ADD_PRODUCT") }}</ion-list-header>
        <ion-searchbar v-model="keyword" :placeholder="tr('SEARCH_PRODUCT')" :debounce="0" @ion-input="form.searchProducts(keyword)" />
        <ion-progress-bar v-if="keyword && form.searching" type="indeterminate" />
        <ion-list v-if="keyword && form.productResults.length" class="scr_list ile_results" lines="full">
            <ion-item v-for="p in form.productResults" :key="p.productId" button :detail="false" @click="pick(p.productId)">
                <ion-label>
                    <h3>{{ p.productName }}</h3>
                    <p>{{ p.productCode }} · {{ money(p.sellingPrice) }}</p>
                </ion-label>
                <!-- free item: a real product at price 0 (still deducts stock) -->
                <ion-button slot="end" size="small" fill="outline" color="success" @click.stop="pickFree(p.productId)">{{ tr("FREE") }}</ion-button>
            </ion-item>
        </ion-list>

        <ion-list class="scr_list" lines="full">
            <ion-item v-for="(l, i) in form.lines" :key="i">
                <ion-label>
                    <h3>
                        {{ l.productName }}
                        <ion-badge v-if="l.isFree" color="success">{{ tr("FREE") }}</ion-badge>
                    </h3>
                    <p v-if="l.variantName">{{ l.variantName }}</p>
                    <p class="ile_code">{{ l.productCode }}</p>
                    <div class="ile_row">
                        <label>{{ tr("QTY") }}<input type="number" inputmode="numeric" min="1" :value="l.quantity" @change="form.setQty(i, val($event))" /></label>
                        <label v-if="!l.isFree">{{ tr("PRICE") }}<input type="number" inputmode="decimal" min="0" step="0.01" :value="l.actualPrice" @change="form.setPrice(i, val($event))" /></label>
                        <label v-else>{{ tr("PRICE") }}<s class="ile_free_price">{{ money(l.standardPrice) }}</s></label>
                        <label v-if="!l.isFree">{{ tr("DISCOUNT") }}<input type="number" inputmode="decimal" min="0" step="0.01" :value="l.discount" @change="form.setDiscount(i, val($event))" /></label>
                    </div>
                    <p class="ile_amt">{{ tr("AMOUNT") }}: <strong>{{ money(form.lineTotal(l)) }}</strong></p>
                </ion-label>
                <ion-button slot="end" fill="clear" color="danger" @click="form.removeLine(i)"><ion-icon slot="icon-only" :icon="close" /></ion-button>
            </ion-item>
            <ion-item v-if="!form.lines.length" lines="none"><ion-label color="medium" class="ion-text-center">{{ tr("NO_LINES") }}</ion-label></ion-item>
        </ion-list>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { close } from "ionicons/icons";
import UT from "@/core/utilities/ut";
import type { InvoiceLine } from "@/models/POS/SIV/SIV11000";
import type { ProductListItem } from "@/models/PRD/PRD10000";

/** Invoice line editor shared by SIV11000 (create) and SIV15000 (edit): product search, free items, qty/price/discount. */
defineOptions({ name: "InvoiceLinesEditor" });

/** The part of SIV11000Store / SIV15000Store this editor drives. */
export interface InvoiceLinesForm {
    lines: InvoiceLine[];
    productResults: ProductListItem[];
    searching: boolean;
    searchProducts(kw: string): void;
    onPickFree(productId: string): void;
    setQty(i: number, v: number): void;
    setPrice(i: number, v: number): void;
    setDiscount(i: number, v: number): void;
    removeLine(i: number): void;
    lineTotal(l: InvoiceLine): number;
}

const props = defineProps<{ form: InvoiceLinesForm; trKey: string }>();
// The screen adds the product (SIV11000 asks for the variant first).
const emit = defineEmits<{ pick: [string] }>();
const { t } = useI18n();
const tr = (key: string) => t(`${props.trKey}.${key}`);
const keyword = ref("");
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");
const val = (e: Event) => Number((e.target as HTMLInputElement).value);

function pick(productId: string): void {
    emit("pick", productId);
    keyword.value = "";
}
function pickFree(productId: string): void {
    props.form.onPickFree(productId);
    keyword.value = "";
}
</script>

<style scoped>
ion-list-header { font-size: 14px; }
ion-label h3 { font-size: 14px; font-weight: 600; white-space: normal; }
ion-label p { font-size: 12px; }
.ile_results { max-height: 280px; overflow-y: auto; }
.ile_code { font-size: 10px; }
.ile_row { display: flex; gap: 8px; margin-top: 8px; }
.ile_row label { display: flex; flex-direction: column; gap: 2px; font-size: 10px; color: var(--ion-color-medium); flex: 1; }
.ile_row input { height: 32px; width: 100%; border: 1px solid var(--ion-color-light-shade, #ddd); border-radius: 4px; font-size: 14px; padding: 0 4px; background: transparent; color: var(--ion-text-color); }
.ile_free_price { font-size: 12px; line-height: 32px; }
.ile_amt { margin-top: 4px; text-align: right; }
</style>
