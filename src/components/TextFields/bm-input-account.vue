<template>
    <div class="inp_box">
		<ion-label v-if="slots.label !== undefined" class="lbl txt_ellipsis">
			<slot name="label"></slot>
		</ion-label>
		<div class="dflex">
			<ion-input
				v-model="localValue"
				class="inp"
				clear-input
				:placeholder="props.placeholder"
				:readonly="props.readonly"
				:disabled="props.disabled"
				:value="props.modelValue"
				type="text"
				:required="props.required"
				:class="{ required: props.required, 'error': errorMessage !== '' }"
				@ion-change="onChange"
				@input="onInput"
				@paste="onPaste"
				@keypress="onKeyPress"
				>
			</ion-input>
			<slot name="end"></slot>
		</div>
        <ion-label v-if="props.hasInfo !== undefined && props.hasInfo" class="lbl_note">
            <slot name="info"></slot>
        </ion-label>
        <ion-label v-if="props.hasError !== undefined && props.hasError" class="lbl_error">
            <slot name="error">
				{{ errorMessage }}
			</slot>
        </ion-label>
	</div>
</template>

<script setup lang="ts">

import { inputFocus as inputFocusDirective } from "@/directives/InputFocus";
import { func } from "@/utilities/func";
import { BizCheckMobileLogger, BizCheckMobileString } from "@/shared/bizcheckmobile";
import { nextTick, ref, watch, useSlots } from "vue";

defineOptions ({
	name: "BMInputAccount",
	description: "Input Account",
	directives: {
        inputFocusDirective,
    }
});

interface BMInputAccountProps {
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    hasError?: boolean;
    hasInfo?: boolean;
    modelValue?: string;
    pattern?: string;
    required?: boolean;
}

const props = withDefaults(defineProps<BMInputAccountProps>(), {
    placeholder: "Enter account number",
    disabled: false,
    readonly: false,
    hasError: false,
    hasInfo: false,
    modelValue: "",
    pattern: "customerNo",
    required: false
});


let regexFormat = /[^a-zA-Z0-9]/g;

const emit = defineEmits(["update:modelValue", "accountFormatterValue", "focus", "blur"]);
const errorMessage = ref<string>("");
const localValue = ref(props.modelValue? BizCheckMobileString.accountFormat(props.modelValue, props.pattern) : "");
const slots = useSlots();
const onInput = func((event: Event) => {
    const target = event.target as HTMLInputElement | null;
    if (!target) return;

    const start = target.selectionStart as any;

    let rawValue = target.value.replace(regexFormat, "");
    BizCheckMobileLogger.log("rawValue", rawValue);

    const formattedValue = BizCheckMobileString.accountFormat(rawValue, props.pattern);
    const oldFormattedValue = localValue.value;
    localValue.value = formattedValue;

    emit("update:modelValue", rawValue);
    emit("accountFormatterValue", localValue.value);

    // Adjust cursor position
    nextTick(() => {
        const diff = formattedValue.length - oldFormattedValue.length;
        let newPosition = start + diff;
        target.setSelectionRange(newPosition, newPosition);
    });
    const error = validateAccount(rawValue);
    errorMessage.value = error;
}, "onInput");

const validateAccount = (value: string): string => {
    if (props.required && !value) {
        return "This field is required";
    }
    return "";
};
const onChange = (event: any) => {
    BizCheckMobileLogger.log("onChange", event.target.value);
    const rawValue = event.target.value.replace(regexFormat, ""); //remove format
    emit("update:modelValue", rawValue);
    const error = validateAccount(rawValue);
    errorMessage.value = error;
};
const onPaste = func((event: ClipboardEvent) => {

    event.preventDefault();
    const pastedText = event.clipboardData ? event.clipboardData.getData("text") : "";
    let textPattern = pastedText.replace(regexFormat, "");

    const formattedValue = BizCheckMobileString.accountFormat(textPattern, props.pattern);
    localValue.value = formattedValue;
    emit("update:modelValue", textPattern);
    emit("accountFormatterValue", localValue.value);
    const error = validateAccount(textPattern);
    errorMessage.value = error;
}, "onPaste");

const onKeyPress = func((event: KeyboardEvent) => {
    if (regexFormat.test(event.key) && event.key !== "Backspace" && event.key !== "Delete" && event.key !== "Tab") {
		alert("event.key => " + event.key);
        event.preventDefault();
    }
}, "onKeyPress");

watch(() => props.modelValue, (newVal: string) => {
    localValue.value = newVal ? BizCheckMobileString.accountFormat(newVal, props.pattern) : "";
    emit("update:modelValue", newVal);
    const error = validateAccount(newVal);
    errorMessage.value = error;
}, { immediate: true });

</script>

<style scoped lang="scss">
.inp_box {
  .lbl { display: block; color: var(--fontColor02); font-size: var(--font12); font-weight: 600; line-height: 140%; margin-bottom: 4px;}
  ion-input { overflow: hidden; font-size: var(--font14); font-weight: 500; --padding-start: 0; --padding-end: 0; min-height: 44px; height: 44px; width: 100%; border: none; text-align: left; padding: 0 12px; border-radius: var(--radius8); border: 1px solid var(--borderinput); background: #FFFFFF;
        &:readonly {
            input { background-color: #DDDDDD;}
        }
        &:disabled { --background: #DDDDDD;}
        &.has-focus { border-color: var(--ion-color-primary);}
    &.input-disabled { --background: #DDDDDD; color: var(--fontColor03) !important;}
    }
    .lbl_note { display: block; color: var(--fontColor03); font-size: var(--font12); font-weight: 500; line-height: 140%; margin-top: 4px;}
    .lbl_error { display: block; color: var(--ion-color-danger); font-size: var(--font12); font-weight: 500; line-height: 140%; margin-top: 4px;}
    &:has(.lbl_error) {
        ion-input { border-color: var(--ion-color-danger); background-color: rgba(255, 0, 0, 0.05);}
    }
}
</style>
