<template>
    <ion-page>
        <bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
            <template #bottom>
                <ion-toolbar>
                    <ion-searchbar v-model="store.keyword" :placeholder="tr('SEARCH')" @ion-input="store.onSearch" />
                </ion-toolbar>
                <ion-toolbar v-if="store.inventories.length > 1" class="pos_inv_bar">
                    <ion-select v-model="store.inventoryId" :label="tr('INVENTORY')" interface="action-sheet" @ion-change="store.onInventoryChange">
                        <ion-select-option v-for="i in store.inventories" :key="i.inventoryId" :value="i.inventoryId">{{ i.inventoryName || i.name }}</ion-select-option>
                    </ion-select>
                </ion-toolbar>
            </template>
        </bm-header>

        <ion-content>
            <ion-refresher slot="fixed" @ion-refresh="onRefresh($event)">
                <ion-refresher-content />
            </ion-refresher>

            <div v-if="store.bundles.length" class="pos_bundles">
                <p class="pos_bundles_label">{{ tr("BUNDLES") }}</p>
                <div class="pos_bundles_row">
                    <ion-chip v-for="b in store.bundles" :key="b.promotionId" color="primary" @click="store.addBundle(b)">
                        <ion-label>{{ b.promotionName }} · {{ money(b.bundleTotal) }}</ion-label>
                    </ion-chip>
                </div>
            </div>

            <ion-progress-bar v-if="store.loading" type="indeterminate" />
            <bm-empty-state v-else-if="!store.products.length" />
            <div v-else class="pos_grid">
                <button
                    v-for="p in store.products"
                    :key="p.productId"
                    type="button"
                    class="prd_card"
                    :class="{ prd_card_off: !store.canSell(p) }"
                    :disabled="!store.canSell(p)"
                    @click="onPickProduct(p)">
                    <div class="prd_card_media">
                        <img v-if="p.imageUrl" :src="p.imageUrl" alt="" />
                        <ion-icon v-else :icon="imageOutline" class="prd_card_ph" />
                        <span v-if="p.isTrackInventory" class="prd_card_stock" :class="{ prd_card_stock_out: p.stockQuantity <= 0 }">
                            {{ p.stockQuantity <= 0 ? tr("OUT_OF_STOCK") : tr("IN_STOCK") + " " + Number(p.stockQuantity ?? 0) }}
                        </span>
                    </div>
                    <div class="prd_card_body">
                        <div class="prd_card_name">{{ p.productName }}</div>
                        <div class="prd_card_code">{{ p.sku }}</div>
                        <div v-if="p.promotionPrice != null">
                            <span class="prd_price_was">{{ money(p.sellingPrice) }}</span>
                            <span class="prd_price prd_price_promo">{{ money(p.promotionPrice) }}</span>
                        </div>
                        <span v-else class="prd_price">{{ money(p.sellingPrice) }}</span>
                    </div>
                </button>
            </div>

            <ion-infinite-scroll :disabled="!store.hasMore" @ion-infinite="onMore($event)">
                <ion-infinite-scroll-content />
            </ion-infinite-scroll>
        </ion-content>

        <ion-footer>
            <ion-toolbar>
                <div class="pos_foot">
                    <button type="button" class="pos_foot_cart" :disabled="!store.cart.length" @click="openCart">
                        <ion-icon :icon="cartOutline" />
                        <span>{{ tr("CART") }} · {{ store.cartCount }}</span>
                        <strong>{{ money(store.subtotal) }}</strong>
                    </button>
                    <ion-button :disabled="!store.cart.length" @click="checkout">{{ tr("CHECKOUT") }}</ion-button>
                </div>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import type { InfiniteScrollCustomEvent, RefresherCustomEvent } from "@ionic/vue";
import { cartOutline, imageOutline } from "ionicons/icons";
import UT from "@/core/utilities/ut";
import POP from "@/core/utilities/pop";
import VariantPickerModal from "@/views/POS/SAL/VariantPickerModal.vue";
import PosCartSheet from "@/views/POS/SAL/PosCartSheet.vue";
import PosCheckoutModal from "@/views/POS/SAL/POS11000.vue";
import InvoiceModal from "@/views/POS/COMMON/InvoiceModal.vue";
import { POS10000Store } from "@/store/POS/SAL/POS10000Store";
import type { SellableVariant } from "@/models/POS/SAL/SellableVariant";
import type { PosProductRow } from "@/models/POS/SAL/POS10000";

/** POS terminal: inventory-scoped product grid (stock + promo + bundles), cart sheet, checkout popup. */
defineOptions({ name: "POS10000" });

const { t } = useI18n();
const tr = (key: string) => t(`POS10000.${key}`);
const store = POS10000Store();
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");

// Loads the sell-without-stock flag, inventories (assigned ones only, primary first) and the first page.
onMounted(() => void store.init());

async function onRefresh(ev: RefresherCustomEvent): Promise<void> {
    store.loadProducts();
    await ev.target.complete();
}
// The store's loadMore is callback-based; complete the spinner once it settles.
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> {
    store.loadMore();
    while (store.loadingMore) await new Promise((r) => setTimeout(r, 100));
    await ev.target.complete();
}

/** A product with variants asks which one first; everything else goes straight in. */
function onPickProduct(p: PosProductRow): void {
    if (!p.hasVariants) { store.addToCart(p); return; }
    if (p.scannedVariantId) { store.addScannedVariant(p); return; }
    POP.showPopup<SellableVariant>(VariantPickerModal, {
        title: `${tr("VARIANT_TITLE")} — ${p.productName}`,
        props: { productId: p.productId, inventoryId: store.inventoryId }
    }).promise.then((res) => { if (res.data) store.addToCart(p, res.data); }).catch(() => undefined);
}

function openCart(): void {
    POP.showPopup<string>(PosCartSheet, { title: tr("CART") }).promise
        .then((res) => { if (res.data === "checkout") checkout(); })
        .catch(() => undefined);
}

function checkout(): void {
    if (!store.cart.length) return;
    // actualPrice = STANDARD price sent to the backend (it applies the promotion once);
    // displayPrice = promo price shown/collected. Bundle lines carry their items.
    const lines = store.cart.map((l) => ({
        productId: l.productId,
        variantId: l.variantId,
        variantName: l.variantName,
        productName: l.productName,
        actualPrice: l.actualPrice,
        displayPrice: store.effectivePrice(l),
        quantity: l.quantity,
        taxRate: l.taxRate,
        bundleItems: l.bundleItems
    }));
    POP.showPopup<{ saleCode?: string }>(PosCheckoutModal, {
        title: tr("CHECKOUT"),
        props: { cartLines: lines, subtotal: store.subtotal, inventoryId: store.inventoryId }
    }).promise.then((res) => {
        store.clearCart();
        if (res?.data?.saleCode) openInvoice(res.data.saleCode);
    }).catch(() => undefined);
}

function openInvoice(saleCode: string): void {
    POP.showPopup(InvoiceModal, { title: `${tr("INVOICE")} ${saleCode}`, props: { saleCode } }).promise.catch(() => undefined);
}
</script>

<style scoped>
.pos_inv_bar ion-select { padding: 0 16px; font-size: 14px; }
.pos_bundles { padding: 8px 12px 0; }
.pos_bundles_label { margin: 0 4px 4px; font-size: 10px; text-transform: uppercase; color: var(--ion-color-medium); }
.pos_bundles_row { display: flex; overflow-x: auto; }
.pos_bundles_row ion-chip { flex-shrink: 0; font-size: 12px; }
.pos_grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; padding: 12px; }
.prd_card { display: block; padding: 0; text-align: left; border: 1px solid var(--ion-color-light-shade, #e9e9ee); border-radius: 12px; overflow: hidden; background: var(--ion-background-color, #fff); color: inherit; }
.prd_card_off { opacity: 0.5; }
.prd_card_media { position: relative; aspect-ratio: 4 / 3; background: #f2f2f5; display: flex; align-items: center; justify-content: center; }
.prd_card_media img { width: 100%; height: 100%; object-fit: cover; }
.prd_card_ph { width: 32px; height: 32px; color: #cfd0d8; }
.prd_card_stock { position: absolute; top: 4px; left: 4px; font-size: 10px; font-weight: 600; color: #1b6b3a; background: #e7f4ec; padding: 2px 4px; border-radius: 4px; }
.prd_card_stock_out { color: var(--ion-color-danger); background: #fce8e8; }
.prd_card_body { padding: 8px; }
.prd_card_name { font-size: 14px; font-weight: 600; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.prd_card_code { font-size: 10px; color: var(--ion-color-medium); margin: 2px 0 4px; }
.prd_price { font-size: 14px; font-weight: 600; }
.prd_price_was { font-size: 12px; color: var(--ion-color-medium); text-decoration: line-through; margin-right: 4px; }
.prd_price_promo { color: var(--ion-color-danger); }
.pos_foot { display: flex; align-items: center; gap: 8px; padding: 4px 12px; }
.pos_foot_cart { flex: 1; display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 8px; background: var(--ion-color-light, #f4f5f8); color: inherit; font-size: 14px; }
.pos_foot_cart strong { margin-left: auto; font-size: 16px; color: var(--ion-color-primary); }
.pos_foot_cart:disabled { opacity: 0.6; }
</style>
