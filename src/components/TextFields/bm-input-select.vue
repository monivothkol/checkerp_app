<template>
    <ion-label class="lbl txt_ellipsis">
        <slot name="label"></slot>
    </ion-label>

    <div class="address_wrapper" :class="{ 'required': props.required, 'error': errorMessage !== '' }">
        <span v-if="modelValue !== ''" class="value txt_ellipsis">{{ modelValue }}</span>
        <span v-else class="placeholder">{{ placeholder }}</span>
        <bm-button @click="openSelectPicker">Select option</bm-button>
    </div>

    <!-- Error (Slot) -->
    <slot v-if="errorMessage !== ''" name="error" class="txt_error"></slot>
</template>

<script setup lang="ts">
import { func } from "@/utilities/func";
import { ref, watch } from "vue";

interface Props {
    modelValue: string,
	options?: { label: string, value: string }[],
	placeholder?: string,
	required?: boolean
}
const errorMessage = ref<string>("");


const props = withDefaults(defineProps<Props>(), {
    modelValue: "",
	options: () => [],
	placeholder: "",
	required: false
});

const emit = defineEmits(["onSelected"]);
const modelValue = ref<string>(props.modelValue);
const openSelectPicker = func( () => {
	emit("onSelected");
});

const validateSelect = (value: string): string => {
	if (props.required && !value) {
		return "This field is required";
	}
	return "";
};

watch(() => props.modelValue, (newModelValue) => {
	modelValue.value = newModelValue;
	const error = validateSelect(newModelValue);
	errorMessage.value = error;
});

</script>

<style scoped lang="scss">
    .lbl { display: block; color: var(--fontColor02); font-size: var(--font12); font-weight: 600; line-height: 140%; margin-bottom: 4px;}
    .address_wrapper { background: #FFFFFF; position: relative; height: 48px; font-size: var(--font14); font-weight: 500; line-height: 18px; display: flex; gap: 8px; align-items: center; justify-content: space-between; padding:  16px 42px 16px 12px; border-radius: var(--radius8); --border-width: 0; border: 1px solid #D9D9D9;
        .placeholder { color: var(--fontColor03); font-size: var(--font14); line-height: 140%; font-weight: 500;}
        .value {
            &:empty { display: none;}
        }
        .value:not(:empty) + .placeholder { display: none;}
        ion-button { position: absolute; left: 0; width: 100%; margin-left: auto; text-indent: -9999rem; min-height: 24px; --background-activated: transparent; --background: transparent; background-size: 18px auto;; --border-radius: 0; --background-activated-opacity: 0; --background-focused-opacity: 0; --background-hover-opacity: 0;
            &::part(native) { background: transparent url("@/assets/images/ico_btn_search.svg") right 12px center no-repeat; background-size: 20px;}
        }
		&.required { border-color: var(--ion-color-primary);}
		&.error { border-color: var(--ion-color-danger);}
    }
    .lbl + .address_wrapper { margin-top: 8px;}
</style>
