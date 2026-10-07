<template>
    <ion-page>
        <bm-header :title="tr('PAGE_TITLE')" default-href="/SIV10000" />
        <ion-content class="ion-padding">
            <ion-progress-bar v-if="store.loading" type="indeterminate" />
            <InvoiceDocument v-else-if="store.invoice" :invoice="store.invoice" />
            <bm-empty-state v-else description="POS12000.NOT_FOUND" />
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useViewEnter } from "@/core/modules/use-view-enter";
import InvoiceDocument from "@/views/POS/COMMON/InvoiceDocument.vue";
import { POS12000Store } from "@/store/POS/SAL/POS12000Store";

/** POS invoice view by ?saleCode= (A4 document; print on web only). */
defineOptions({ name: "POS12000" });

const { t } = useI18n();
const tr = (key: string) => t(`POS12000.${key}`);
const route = useRoute();
const store = POS12000Store();
useViewEnter(() => store.load(String(route.query.saleCode ?? "")));
</script>
