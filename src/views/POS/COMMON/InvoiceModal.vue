<template>
    <div class="inv_modal_body">
        <ion-progress-bar v-if="store.loading" type="indeterminate" />
        <InvoiceDocument v-else-if="store.invoice" :invoice="store.invoice" />
        <bm-empty-state v-else description="POS12000.NOT_FOUND" />
    </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import InvoiceDocument from "@/views/POS/COMMON/InvoiceDocument.vue";
import { InvoiceModalStore } from "@/store/POS/COMMON/InvoiceModalStore";

/** Invoice preview popup body (POS checkout result, lists): loads by sale code. */
defineOptions({ name: "InvoiceModal" });

const props = defineProps<{ saleCode: string }>();
defineEmits<{ ok: [unknown]; cancel: [] }>();
const store = InvoiceModalStore();
onMounted(() => store.load(props.saleCode));
</script>
