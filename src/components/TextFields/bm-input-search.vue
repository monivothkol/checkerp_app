<template>
    <div class="inp_box">
        <ion-label class="lbl txt_ellipsis">
            <slot name="label"></slot>
        </ion-label>
        <ion-searchbar
            ref="searchbarRef"
            :value="props.modelValue"
            :placeholder="props.placeholder"
            :read-only="props.readonly" :disabled="props.disabled"
            :show-cancel-button="props.showCancelButton === 'never' ? false : true"
            :show-clear-button="shouldShowClearButton"
            :class="{ 'no_border': props.showCancelButton === 'never', outline: props.outline }"
            @ion-input="emit('update:modelValue', $event.target.value)"
            @ion-focus="emit('focus')" @ion-blur="emit('blur')" @ion-clear="emit('clear')"
            @ion-cancel="emit('cancel')"></ion-searchbar>
    </div>
    <ion-label class="lbl_note">
        <slot name="info"></slot>
    </ion-label>
    <ion-label class="lbl_error">
        <slot name="error"></slot>
    </ion-label>
</template>

<script setup lang="ts">
import { ref , computed } from "vue";

defineOptions({
    name: "BMInputSearch",
    description: "Input Search",
});

interface BMInputSearchProps {
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    showCancelButton?: "auto" | "always" | "never";
    showClearButton?: "auto" | "always" | "never";
    modelValue?: string;
    outline?: boolean;
}

const props = withDefaults(defineProps<BMInputSearchProps>(), {
    placeholder: "Search",
    disabled: false,
    readonly: false,
    showCancelButton: "never",
    showClearButton: "never",
    modelValue: "",
    outline: true
});

const emit = defineEmits<{
    // eslint-disable-next-line no-unused-vars
    (e: "focus"): void;
    // eslint-disable-next-line no-unused-vars
    (e: "blur"): void;
    // eslint-disable-next-line no-unused-vars
    (e: "clear"): void;
    // eslint-disable-next-line no-unused-vars
    (e: "cancel"): void;
    // eslint-disable-next-line no-unused-vars
    (e: "update:modelValue", value: string): void;
}>();



const searchbarRef = ref<any>(null);

const shouldShowClearButton = computed(() => {
    if (props.showClearButton === "always") return true;
    if (props.showClearButton === "never") return false;
    // auto mode: show when there's a value
    return props.modelValue.length > 0;
});

const focus = async () => {
    if (searchbarRef.value?.$el) {
        await searchbarRef.value.$el.setFocus();
    } else if (searchbarRef.value?.setFocus) {
        await searchbarRef.value.setFocus();
    }
};

defineExpose({ focus });

</script>

<style scoped lang="scss">
 .no_border {
        .searchbar-input-container.sc-ion-searchbar-ios { border: none !important; }
    }
    .outline { border: 1px solid #D9D9D9; border-radius: var(--radius8); padding: 12px; min-height: 44px;
        .searchbar-cancel-button { display: none !important;}
        .searchbar-input-container { height: 44px !important; min-height: 44px !important;}
    }
</style>