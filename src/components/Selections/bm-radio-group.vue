<template>
    <!-- Label -->
    <ion-label v-if="slots?.label !== undefined" class="lbl txt_ellipsis" :class="labelClass">
        <slot name="label"></slot>
    </ion-label>
    <div class="wrap_radio_group">
        <ion-radio-group v-bind="$attrs" :class="props.groupClass">
            <slot></slot>
        </ion-radio-group>
    </div>

    <!-- Error (Slot) -->   
    <slot name="error" class="txt_error"></slot>
</template>
<script setup lang="ts">
import { computed, useSlots } from "vue";

defineOptions({
    name: "CRadioGroup",
    description: "Radio Group Component"
});

const slots = useSlots();

const labelClass = computed(() => {
    return slots?.error !== undefined ? "error" : "";
});

interface Props {
    groupClass?: string;
}
const props = withDefaults(defineProps<Props>(), {
    groupClass: "",
});
</script>
<style scoped lang="scss">
    .lbl { display: block; color: var(--fontColor02); font-size: var(--font12); font-weight: 600; line-height: 140%; margin-bottom: 4px;}
    ion-radio-group { width: max-content; display: block;
        &:has(.radio_card) { width: 100%;}
        &.line_top { padding-top: 16px; margin-top: 16px; border-top: 1px solid #D9D9D9;}
    }
    .wrap_radio_group { overflow: auto; 
        &::-webkit-scrollbar { display: none;}
        &:has(.list_rdo03) { padding-left: 16px; padding-right: 16px; margin: 0 -16px;}
        &:has(.rdo_lang) { margin: 0 -16px; padding: 0 16px 24px;}
    }
    .rdo_lang { width: 100%; padding-top: 16px;}
</style>
