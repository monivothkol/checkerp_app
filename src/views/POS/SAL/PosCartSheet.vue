<template>
    <div>
        <bm-empty-state v-if="!store.cart.length" description="POS10000.CART_EMPTY" />
        <ion-list v-else class="scr_list" lines="full">
            <ion-item v-for="(line, i) in store.cart" :key="line.productId + (line.variantId ?? '')">
                <ion-thumbnail slot="start">
                    <img v-if="line.imageUrl" :src="line.imageUrl" alt="" />
                    <ion-icon v-else :icon="imageOutline" class="pcs_ph" />
                </ion-thumbnail>
                <ion-label>
                    <h3>{{ line.productName }}</h3>
                    <p v-if="line.variantName">{{ line.variantName }}</p>
                    <div class="pcs_ctrl">
                        <ion-button size="small" fill="outline" @click="store.stepQty(i, -1)"><ion-icon slot="icon-only" :icon="remove" /></ion-button>
                        <input class="pcs_qty" type="number" inputmode="numeric" min="1" :value="line.quantity" @change="store.setQty(i, Number(($event.target as HTMLInputElement).value))" />
                        <ion-button size="small" fill="outline" @click="store.stepQty(i, 1)"><ion-icon slot="icon-only" :icon="add" /></ion-button>
                        <strong class="pcs_amt">{{ money(store.lineTotal(line)) }}</strong>
                    </div>
                    <div class="pcs_price">
                        <span>{{ line.isBundle ? tr("BUNDLE_PRICE") : tr("UNIT_PRICE") }}</span>
                        <input class="pcs_price_in" type="number" inputmode="decimal" min="0" step="0.01" :value="line.actualPrice" :disabled="line.isBundle" @change="store.setPrice(i, Number(($event.target as HTMLInputElement).value))" />
                    </div>
                </ion-label>
                <ion-button slot="end" fill="clear" color="medium" @click="store.removeLine(i)"><ion-icon slot="icon-only" :icon="close" /></ion-button>
            </ion-item>
        </ion-list>

        <div class="pcs_total"><span>{{ tr("TOTAL") }}</span><strong>{{ money(store.subtotal) }}</strong></div>
        <div class="pcs_btns">
            <ion-button fill="outline" color="danger" :disabled="!store.cart.length" @click="store.clearCart">{{ tr("CLEAR") }}</ion-button>
            <ion-button :disabled="!store.cart.length" @click="emit('ok', 'checkout')">{{ tr("CHECKOUT") }} · {{ store.cartCount }}</ion-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { add, close, imageOutline, remove } from "ionicons/icons";
import UT from "@/core/utilities/ut";
import { POS10000Store } from "@/store/POS/SAL/POS10000Store";

/** POS10000 cart sheet: edits the shared cart in place (qty / price / remove); ok("checkout") starts checkout. */
defineOptions({ name: "PosCartSheet" });

const emit = defineEmits<{ ok: [string]; cancel: [] }>();
const { t } = useI18n();
const tr = (key: string) => t(`POS10000.${key}`);
const store = POS10000Store();
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");
</script>

<style scoped>
ion-label h3 { font-size: 14px; font-weight: 600; white-space: normal; }
ion-label p { font-size: 12px; }
ion-thumbnail { --size: 48px; --border-radius: 8px; display: flex; align-items: center; justify-content: center; background: #f2f2f5; }
.pcs_ph { width: 24px; height: 24px; color: #cfd0d8; }
.pcs_ctrl { display: flex; align-items: center; gap: 4px; margin-top: 8px; }
.pcs_qty { width: 48px; text-align: center; }
.pcs_qty, .pcs_price_in { height: 32px; border: 1px solid var(--ion-color-light-shade, #ddd); border-radius: 4px; font-size: 14px; background: transparent; color: inherit; }
.pcs_amt { margin-left: auto; font-size: 14px; }
.pcs_price { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; font-size: 12px; color: var(--ion-color-medium); }
.pcs_price_in { width: 96px; text-align: right; padding: 0 4px; }
.pcs_total { display: flex; justify-content: space-between; align-items: center; padding: 16px; font-size: 16px; }
.pcs_total strong { color: var(--ion-color-primary); }
.pcs_btns { display: flex; gap: 8px; padding: 0 16px 16px; }
.pcs_btns ion-button { flex: 1; }
</style>
