<template>
	<div class="inp_box">
		<ion-label class="lbl txt_ellipsis">
			<slot name="label"></slot>
		</ion-label>
		<div class="wrap_inp_amount" :class="{ 'readonly': props.readonly, 'disabled': props.disabled, 'required': props.required, 'error': errorMessage !== '' }">
			<ion-input ref="inputRef"
				v-model="localValue"
				type="tel"
				inputmode="decimal"
				:placeholder="props.placeholder"
				:readonly="props.readonly"
				:disabled="props.disabled"
				:required="props.required"
				:maxlength="props.length"
				@ion-focus="onFocus"
				@ion-blur="onBlur"
				@keydown="onKeydown($event)"
				@paste="onPaste"
				@ion-input="onInput"
			 ></ion-input>
			<ion-button v-if="props.modelValue > 0" class="btn_clear" @click="onClickClear">Clear</ion-button>
		</div>
		<ion-label v-if="props.hasInfo !== undefined && props.hasInfo" class="lbl_note">
			<slot name="info"></slot>
		</ion-label>
		<ion-label v-if="props.hasError !== undefined && props.hasError" class="lbl_error">
			<slot name="error"></slot>
		</ion-label>
	</div>
</template>

<script setup lang="ts">

import { inputFocus as inputFocusDirective } from "@/directives/InputFocus";
import { numberOnly as numberOnlyDirective } from "@/directives/NumberOnly";
import { func } from "@/utilities/func";
import { BizCheckMobileLogger } from "@/shared/bizcheckmobile";
import { nextTick, ref, watch } from "vue";

defineOptions ({
	name: "BMInputNumber",
	description: "Input Number",
	directives: {
        inputFocusDirective,
        numberOnlyDirective,
    }
});

interface BMInputAmountProps {
	isDecimal: boolean;
	isPercentage: boolean;
	placeholder?: string;
	disabled?: boolean;
	readonly?: boolean;
	hasError?: boolean;
	required?: boolean;
	hasInfo?: boolean;
	modelValue: number;
	length?: number
}

const props = withDefaults(defineProps<BMInputAmountProps>(), {
	isDecimal: true,
	isPercentage: false,
	placeholder: "Enter Number",
	disabled: false,
	readonly: false,
	hasError: false,
	required: false,
	hasInfo: false,
	modelValue: 0,
	length: 12
});

const emit = defineEmits(["update:modelValue", "focus", "blur","reset" ,"onBlur" ,"onInput"]);

const unFormatter = func((value: string): string => {
    return value.replace(/,/g, "");
}, "unFormatter");

// ============== States ==============
const localValue = ref<string>(props.modelValue.toString());
const isUserInputting = ref<boolean>(false); // Flag to prevent circular updates
const inputRef = ref<HTMLInputElement>();
const errorMessage = ref<string>("");
// ============== Length Limit ==============
const handlePrefixDigit = func((event: KeyboardEvent) => {
    const isDecimalKey = props.isDecimal ? event.key === "." || event.key === "," : (event.key === "." || event.key === ",");
    const isCursorKey = event.key === "ArrowLeft" || event.key === "ArrowRight";
    const isDeleteKey = event.key === "Backspace" || event.key === "Delete";
    const isCtrlKey = event.ctrlKey;
    const unformattedValue = unFormatter(localValue.value);

    // Prevent decimal input
    if (isDecimalKey && !isCtrlKey) {
        event.preventDefault();
        return;
    }

    // Prevent exceeding length limit
    if (!isDecimalKey && !isDeleteKey && !isCursorKey && !isCtrlKey &&
        unformattedValue && unformattedValue.length >= props.length) {
        event.preventDefault();
    }
}, "handlePrefixDigit");

// ============== Helper Functions ==============
const isAllowedKey = func((event: KeyboardEvent): boolean => {
    const isNumberKey = props.isDecimal ? /^[0-9.]$/.test(event.key) : /^[0-9,]$/.test(event.key);
    const isDeleteKey = event.key === "Backspace";
    const isCursorKey = event.key === "ArrowLeft" || event.key === "ArrowRight";
    const isCtrlKey = event.ctrlKey;
    return isNumberKey || isDeleteKey || isCtrlKey || isCursorKey;
}, "isAllowedKey");

const isLengthExceeded = func((event: KeyboardEvent): boolean => {
    const isDeleteKey = event.key === "Backspace";
    const isCursorKey = event.key === "ArrowLeft" || event.key === "ArrowRight";
    const isCtrlKey = event.ctrlKey;

    return  !isDeleteKey && !isCursorKey && !isCtrlKey &&
            localValue.value.replace(/,/g, "").length >= props.length;
}, "isLengthExceeded");

const handleBackspaceComma = func((event: KeyboardEvent): void => {
    const cursorPosition = (event.target as HTMLInputElement).selectionStart;
    if (cursorPosition && cursorPosition > 0) {
        const valueArray = localValue.value.split("");
        if (valueArray[cursorPosition - 1] === ",") {
            valueArray.splice(cursorPosition - 2, 1);
            localValue.value = valueArray.join("");
            onInput(event);
            event.preventDefault();
        }
    }
}, "handleBackspaceComma");

const sanitizeInput = func(() => {
	let filteredValue = "";
    // Filter out invalid characters (only allow numbers and comma separator)
	if( props.isDecimal ) {
		filteredValue =  localValue.value.replace(/[^0-9,.]/g, "").replace(/(\..{2}).*/g, "$1");
	} else {
		filteredValue = localValue.value.replace(/[^0-9,]/g, "");
	}
    if (filteredValue !== localValue.value) {
        localValue.value = filteredValue;
    }

}, "sanitizeInput");

const formatDecimalValue = func(() => {
    // Clean up leading zeros
    localValue.value = localValue.value.replace(/^0+(?=\d)/, "");
    BizCheckMobileLogger.log("formatDecimalValue => ", localValue.value);
    if (!localValue.value) {
        localValue.value = "";
    }
}, "formatDecimalValue");

const formatSeperator = func(() => {
    const unformattedValue = localValue.value.includes(".00") ? unFormatter(localValue.value.split(".00")[0]) : unFormatter(localValue.value);
    localValue.value = unformattedValue;
}, "formatSeperator");

const processClipboardText = func((inputText: string): string => {
    // Remove all non-numeric characters except comma separator
	let sanitizedText = "";
	if( props.isDecimal ) {
		sanitizedText = inputText.replace(/[^0-9,.]/g, "");
	} else {
		sanitizedText = inputText.replace(/[^0-9,]/g, "");
	}

    if (!sanitizedText) return "";

    // Remove any decimal points and decimal parts
    let processedText = "";
	if( props.isDecimal ) {
		processedText = sanitizedText;
	} else {
		processedText = sanitizedText.replace(/\./g, "");
	}

    // Apply length limit
    const unformattedLength = processedText.replace(/,/g, "").length;
    if (unformattedLength > props.length) {
        processedText = processedText.replace(/,/g, "").substring(0, props.length);
    }

    return processedText;
}, "processClipboardText");

const handleCursorPosition = func((inputElement: HTMLInputElement, oldValue: string, oldLength: number, cursorPosition: number) => {
    const commasBeforeCursor = (oldValue.substring(0, cursorPosition).match(/,/g) || []).length;
    const newLength = localValue.value.length;
    const lengthDifference = newLength - oldLength;
    const commasAfterCursor = (localValue.value.substring(0, cursorPosition + lengthDifference).match(/,/g) || []).length;
    const newCursorPosition = cursorPosition + (commasAfterCursor - commasBeforeCursor);

    nextTick(() => {
		const nativeInput = (inputElement as any).getInputElement();
		if (nativeInput && typeof nativeInput.setSelectionRange === "function") {
			nativeInput.setSelectionRange(newCursorPosition, newCursorPosition);
		}
	});
}, "handleCursorPosition");

/** When isPercentage is true, clamp displayed value to max 100. */
const clampPercentage = func(() => {
    if (!props.isPercentage) return;
    const num = Number(unFormatter(localValue.value));
    if (!Number.isNaN(num) && num > 100) {
        localValue.value = props.isDecimal ? "100.00" : "100";
    }
}, "clampPercentage");

/** When isPercentage, prevent key if the resulting value would exceed 100. */
const wouldExceedPercentageMax = func((event: KeyboardEvent): boolean => {
    if (!props.isPercentage) return false;
    const key = event.key;
    const isDigitOrDot = /^[0-9.]$/.test(key);
    if (!isDigitOrDot) return false;
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const nextStr = localValue.value.slice(0, start) + key + localValue.value.slice(end);
    const nextNum = parseFloat(nextStr.replace(/,/g, "")) || 0;
    return nextNum > 100;
}, "wouldExceedPercentageMax");

// ============== Events ==============
const onFocus = func(() => {
    isUserInputting.value = true;
	// Add thousands separator formatting
    formatSeperator();
    emit("focus");
}, "onFocus");

const onBlur = func((event: any) => {
    isUserInputting.value = false; // Reset flag on blur

    const unformattedValue = unFormatter(localValue.value);
    const numericValue = Number(unformattedValue);

    if (numericValue) {
        // When isPercentage, clamp to max 100
        let valueToShow = numericValue;
        if (props.isPercentage && valueToShow > 100) {
            valueToShow = 100;
        }
        // Format as integer with thousands separator
        let formattedValue: number | string = valueToShow;
        if (!props.isDecimal) {
            formattedValue = Math.floor(valueToShow).toString();
        }
        localValue.value = formattedValue.toString();
    } else {
        localValue.value = "";
    }

    emit("onBlur", event);
    emit("update:modelValue", unFormatter(localValue.value));
    const error = validateNumber(unFormatter(localValue.value));
    errorMessage.value = error;
}, "onBlur");

const onKeydown = func((event: KeyboardEvent) => {
    // Prevent all input when disabled
    if (props.disabled) {
        event.preventDefault();
        return;
    }

    isUserInputting.value = true;

    // Prevent input if not allowed
    if (!isAllowedKey(event)) {
        event.preventDefault();
    }
	if(event.key === "." && (event.target as HTMLInputElement).value === "") {
		event.preventDefault(); // Already has a comma, block this one
		return;
	}

	if (event.key === "." && props.isDecimal) {
		if ((event.target as HTMLInputElement).value.includes(".")) {
			event.preventDefault(); // Already has a dot, block this one
		}
		return;
	}

    // Handle prefix validation
    handlePrefixDigit(event);

    // When isPercentage, block input that would make value > 100
    if (wouldExceedPercentageMax(event)) {
        event.preventDefault();
        return;
    }

    // Prevent exceeding length
    if (isLengthExceeded(event)) {
        event.preventDefault();
    }

    // Handle Backspace for comma removal
    if (event.key === "Backspace") {
        handleBackspaceComma(event);
    }
}, "onKeydown");

const onInput = func((event: any) => {
    // Prevent all input when disabled
    if (props.disabled) {
        event.preventDefault();
        return;
    }

    isUserInputting.value = true;
	BizCheckMobileLogger.log("onIeeenput => ", event.target.value);
    const inputElement = event.target as HTMLInputElement;
    const cursorPosition = inputElement.selectionStart || 0;
    const oldValue = event.target.value;
    const oldLength = oldValue.length;
    const currentInputValue = inputElement.value;
    const newLength = currentInputValue.length;

    // Update localValue with current input value
    localValue.value = currentInputValue;

    // Handle paste from clipboard (Android clipboard insertion)
    // Check for: large text insertion, invalid chars
    const lengthDifference = newLength - oldLength;
    const hasInvalidChars = /[^0-9,.]/.test(currentInputValue);
    const hasDecimals = /[.]/.test(currentInputValue);
    const isPastelikeOperation = lengthDifference > 1 || hasInvalidChars || hasDecimals;
    if (isPastelikeOperation) {
        // Apply clipboard validation using helper function
        const processedText = processClipboardText(localValue.value);
        BizCheckMobileLogger.log("processedText => ", processedText);
        localValue.value = processedText;
    }

    // Sanitize input (remove invalid chars & multiple decimals)
    sanitizeInput();

    // Format decimal values and handle leading zeros
    formatDecimalValue();

    // Add thousands separator formatting
    formatSeperator();

    // Clamp to 100 when isPercentage
    clampPercentage();

    // Restore cursor position after formatting
    handleCursorPosition(inputElement, oldValue, oldLength, cursorPosition);
    BizCheckMobileLogger.log("onInput => ", localValue.value);
    emit("update:modelValue", unFormatter(localValue.value));
	const error = validateNumber(unFormatter(localValue.value));
    errorMessage.value = error;
    emit("onInput", event);
}, "onInput");

const onPaste = func((event: ClipboardEvent) => {
    // Prevent pasting when disabled
    if (props.disabled) {
        event.preventDefault();
        return;
    }

    event.preventDefault();

    const pastedText = event.clipboardData?.getData("text") || "";
    if (!pastedText) return;

    // Process clipboard text using helper function
    const processedText = processClipboardText(pastedText);
    if (!processedText) return;

    // Format and update value
    localValue.value = processedText;
    sanitizeInput();
    formatDecimalValue();
    formatSeperator();
    clampPercentage();

    emit("update:modelValue", unFormatter(localValue.value));
}, "onPaste");

watch(() => props.modelValue, (newValue: number) => {
    // This prevents circular updates when parent updates value based on emitted input
    if (!isUserInputting.value) {
        localValue.value = newValue ? newValue.toString() : "";
    }
}, { immediate: true, deep: true });
watch(() => props.isDecimal, () => {
    localValue.value = props.modelValue ? props.modelValue.toString() : "";
}, { immediate: true, deep: true });

const onClickClear = func(() => {
    localValue.value = "";
    emit("update:modelValue", unFormatter(localValue.value));
    emit("reset");
}, "onClickClear");

const validateNumber = (value: string): string => {
    if (props.required && !value) {
        return "This field is required";
    }
    if (props.required && value.length > props.length) {
        return "Number must be less than " + props.length + " digits";
    }
    return "";
};

</script>

<style lang="scss" scoped>
	.inp_box {
		.lbl { display: block; color: var(--fontColor02); font-size: var(--font12); font-weight: 600; line-height: 140%; margin-bottom: 4px;}
		.wrap_inp_amount { display: flex; height: 44px; justify-content: flex-end; align-items: center; border-radius: var(--radius8); border: 1px solid var(--borderinput); background: #FFFFFF;
			> div { width: 100%; display: flex; align-items: center;}
			.currency { color: var(--fontColor01); font-size: var(--font14); font-weight: 500; line-height: 100%; padding-left: 8px;}
			input { height: 44px; width: 100%; border: none; text-align: right; padding: 0; font-size: var(--font14); font-weight: 500; line-height: 140%;}
			&.readonly { background-color: #DDDDDD; padding-right: 12px !important;
				.btn_clear { display: none;}
			}
			&.disabled { background-color: #DDDDDD; padding-right: 12px !important;
				.currency { color: #666666;}
				input { color: #666666;}
				.btn_clear { display: none;}
			}
			&:has(input:focus) { border-color: var(--ion-color-primary);}
			&:has(.btn_clear) { padding-right: 0;}
			&.required { border-color: var(--ion-color-primary);}
			&.error{ border-color: var(--ion-color-danger);}
		}
		.lbl_note { display: block; color: var(--fontColor03); font-size: var(--font12); font-weight: 500; line-height: 140%; margin-top: 4px;}
		.lbl_error { display: block; color: var(--ion-color-danger); font-size: var(--font12); font-weight: 500; line-height: 140%; margin-top: 4px;}
		&:has(.lbl_error) {
			.wrap_inp_amount { border-color: var(--ion-color-danger); background-color: rgba(255, 0, 0, 0.05);}
		}
		.btn_clear { width: 30px; height: 30px; --background: transparent; text-indent: -9999rem; background: url("@/assets/images/ico_btn_clear_input.svg") center no-repeat;}
	}
	input:disabled { background-color: #DDDDDD;}
</style>
