<template>
    <div class="inp_box">
		<ion-label class="lbl txt_ellipsis">
			<slot name="label"></slot>
		</ion-label>
		<ion-input
            v-model="localValue"
            clear-input
            :placeholder="props.placeholder"
            :readonly="props.readonly"
            :disabled="props.disabled"
            :value="props.modelValue"
            type="tel"
            inputmode="numeric"
            :required="props.required"
            :class="{ required: props.required, 'error': errorMessage !== '' }"
            @ion-change="onChange"
            @input="onInput"
            @paste="onPaste"
            @keypress="onKeyPress"
            ></ion-input>
        <ion-label v-if="props.hasInfo !== undefined && props.hasInfo" class="lbl_note">
            <slot name="info"></slot>
        </ion-label>
        <ion-label v-if="(props.hasError !== undefined && props.hasError) || errorMessage !== ''" class="lbl_error">
            <slot name="error">
				{{ errorMessage }}
			</slot>
        </ion-label>
	</div>
</template>

<script setup lang="ts">

import { inputFocus as inputFocusDirective } from "@/directives/InputFocus";
// import { numberOnly as numberOnlyDirective } from "@/directives/NumberOnly";
import { func } from "@/utilities/func";
import { BizCheckMobileLogger, BizCheckMobileString } from "@/shared/bizcheckmobile";
import { nextTick, ref, watch } from "vue";

defineOptions ({
	name: "BMInputPhone",
	description: "Input Phone",
	directives: {
        inputFocusDirective,
        // numberOnlyDirective, //this directive auto remove 0 for fist degit
    }
});

interface BMInputPhoneProps {
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    hasError?: boolean;
    hasInfo?: boolean;
    modelValue?: string;
    showPrefix?: boolean
    required?: boolean
}

const props = withDefaults(defineProps<BMInputPhoneProps>(), {
    placeholder: "Enter phone number",
    disabled: false,
    readonly: false,
    hasError: false,
    hasInfo: false,
    modelValue: "",
    showPrefix: false,
    required: false
});

const emit = defineEmits(["update:modelValue", "getPhoneFormatterValue", "focus", "blur"]);

const localValue = ref(props.modelValue? BizCheckMobileString.phoneNumberFormat(props.modelValue) : "");
const errorMessage = ref<string>("");

const validatePhone = (value: string): string => {
    if (props.required && !value) {
        return "This field is required";
    }
    if (props.required && value.length <= 8) {
        return "Phone number must be 8 digits or more";
    }
    return "";
};

const onInput = func((event: Event) => {
    const target = event.target as HTMLInputElement | null;
    if (!target) return;

    const start = target.selectionStart as any;

    let rawValue = target.value.replace(/\D/g, "");
    BizCheckMobileLogger.log("rawValue", rawValue);
    if(props.showPrefix){
        if (rawValue[0] !== "0") {
            rawValue = "0" + rawValue;
        }
    }


    const formattedValue = BizCheckMobileString.phoneNumberFormat(rawValue);
    const oldFormattedValue = localValue.value;
    localValue.value = formattedValue;

    emit("update:modelValue", rawValue);
    emit("getPhoneFormatterValue", localValue.value);

    // Adjust cursor position
    nextTick(() => {
        const diff = formattedValue.length - oldFormattedValue.length;
        let newPosition = start + diff;
        target.setSelectionRange(newPosition, newPosition);
    });
    const error = validatePhone(rawValue);
    errorMessage.value = error;
	BizCheckMobileLogger.log("errorMessage", errorMessage.value);
}, "onInput");

const onChange = (event: any) => {
    BizCheckMobileLogger.log("onChange", event.target.value);
    const rawValue = event.target.value.replace(/\D/g, ""); //remove format
    emit("update:modelValue", rawValue);
    const error = validatePhone(rawValue);
    errorMessage.value = error;
};
const onPaste = func((event: ClipboardEvent) => {

    event.preventDefault();
    const pastedText = event.clipboardData ? event.clipboardData.getData("text") : "";
    let digitsOnly = pastedText.replace(/\D/g, "");

    if(props.showPrefix){
        if (digitsOnly.length > 0 && digitsOnly[0] !== "0") {
            digitsOnly = "0" + digitsOnly;
        }
    }


    const formattedValue = BizCheckMobileString.phoneNumberFormat(digitsOnly);
    localValue.value = formattedValue;
    emit("update:modelValue", digitsOnly);
    emit("getPhoneFormatterValue", localValue.value);
    const error = validatePhone(digitsOnly);
    errorMessage.value = error;
}, "onPaste");

const onKeyPress = func((event: KeyboardEvent) => {
    if (!/\d/.test(event.key)) {
        event.preventDefault();
    }
}, "onKeyPress");

watch(() => props.modelValue, (newVal: string) => {
    localValue.value = newVal ? BizCheckMobileString.phoneNumberFormat(newVal) : "";
    emit("update:modelValue", newVal);
}, { immediate: true });

</script>

<style scoped lang="scss">

.inp_box {
	.lbl { display: block; color: var(--fontColor02); font-size: var(--font12); font-weight: 600; line-height: 140%; margin-bottom: 4px;}
	ion-input { overflow: hidden; font-size: var(--font14); font-weight: 500; --padding-start: 0; --padding-end: 0; min-height: 44px; height: 44px; width: 100%; border: none; text-align: left; padding: 0 12px; border-radius: var(--radius8); border: 1px solid var(--borderinput); background: #FFFFFF;
        &:readonly {
            input { background-color: #DDDDDD;}
        }
        &:disabled { --background: var(--bgG100);}
        &.has-focus { border-color: var(--ion-color-primary);}
        &.required { border-color: var(--ion-color-primary);}
        &.error { border-color: var(--ion-color-danger);}
    }
    .lbl_note { display: block; color: var(--fontColor03); font-size: var(--font12); font-weight: 500; line-height: 140%; margin-top: 4px;}
    .lbl_error { display: block; color: var(--ion-color-danger); font-size: var(--font12); font-weight: 500; line-height: 140%; margin-top: 4px;}
    &:has(.lbl_error) {
        ion-input { border-color: var(--ion-color-danger); background-color: rgba(255, 0, 0, 0.05);}
    }
}
</style>
