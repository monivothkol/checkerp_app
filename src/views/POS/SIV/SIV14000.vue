<template>
    <ExportModal :config="config" @ok="emit('ok', $event)" @cancel="emit('cancel')" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import ExportModal from "@/core/components/module/ExportModal.vue";
import { EXPORT_CONFIGS, type ExportConfig } from "@/core/modules/export-config";

/** SIV14000 invoice export popup: shared ExportModal; Total Cost offered only with INVOICE:VIEW_PURCHASE_COST. */
defineOptions({ name: "SIV14000" });

const props = withDefaults(defineProps<{ costVisible?: boolean }>(), { costVisible: false });
const emit = defineEmits<{ ok: [unknown]; cancel: [] }>();
const config = computed<ExportConfig>(() => {
    const base = EXPORT_CONFIGS.SIV;
    return props.costVisible ? base : { ...base, fields: base.fields.filter((f) => f.field !== "totalCost") };
});
</script>
