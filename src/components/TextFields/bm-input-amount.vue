<template>
	<div class="inp_box">
		<ion-label class="lbl txt_ellipsis">
			<slot name="label"></slot>
		</ion-label>
		<div class="wrap_inp_amount" :class="{ 'readonly': props.readonly, 'disabled': props.disabled, 'required': props.required, 'error': errorMessage !== '' }">
			<ion-input ref="inputRef"
				v-model="localValue"
				type="tel"
				:inputmode="props.currencyCode === 'USD' ? 'decimal' : 'numeric'"
				:placeholder="props.placeholder"
				:readonly="props.readonly"
				:disabled="props.disabled"
				:required="props.required"
				:maxlength="props.length"
				@ion-focus="onFocus"
				@ion-blur="onBlur"
				@keydown="onKeydown($event)"
				@paste="onPaste($event)"
				@ion-input="onInput"
			></ion-input>
			<span class="currency">{{props.currencyCode }}</span>
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
import { BizCheckMobileLogger, BizCheckMobileString } from "@/shared/bizcheckmobile";
import { nextTick, ref, watch } from "vue";

defineOptions ({
	name: "BMInputAmount",
	description: "Input Amount",
	directives: {
        inputFocusDirective,
        numberOnlyDirective,
    }
});

interface BMInputAmountProps {
	currencyCode?: string;
	placeholder?: string;
	disabled?: boolean;
	readonly?: boolean;
	hasError?: boolean;
	hasInfo?: boolean;
	modelValue: number;
	length?: number;
	required?: boolean;
}

const props = withDefaults(defineProps<BMInputAmountProps>(), {
	currencyCode: "USD",
	placeholder: "Enter Amount",
	disabled: false,
	readonly: false,
	hasError: false,
	hasInfo: false,
	modelValue: 0,
	length: 12,
	required: false
});

const emit = defineEmits(["update:modelValue", "focus", "blur","reset"]);
const errorMessage = ref<string>("");
// ============== Utils ==============
const formatter = func((value: number): string => {
    // Format as integer with thousands separator (no decimals)
    const integerValue = props.currencyCode !== "USD" ? Math.floor(value) : value;
    return BizCheckMobileString.currencyFormat(integerValue, {currencyCode: props.currencyCode});// integerValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}, "formatter");

const unFormatter = func((value: string): string => {
    return value.replace(/,/g, "");
}, "unFormatter");

// ============== States ==============
const localValue = ref<string>(props.modelValue ? formatter(props.modelValue) : "");
const isUserInputting = ref<boolean>(false); // Flag to prevent circular updates
const inputRef = ref<HTMLInputElement>();
// ============== Length Limit ==============
const validateAmount = (value: string): string => {
    if (props.required && !value) {
        return "This field is required";
    }
    return "";
};

/** USD: keep at most one dot and two digits after it (integer part may include commas). */
const capUsdFractionDigits = func((raw: string): string => {
    const v = raw.replace(/[^0-9,.]/g, "");
    const firstDot = v.indexOf(".");
    if (firstDot === -1) return v;
    const intPart = v.slice(0, firstDot);
    const fracDigits = v.slice(firstDot + 1).replace(/\D/g, "").slice(0, 2);
    return intPart + "." + fracDigits;
}, "capUsdFractionDigits");

const handlePrefixDigit = func((event: KeyboardEvent) => {
    // USD: block typed comma (thousands separators are applied by formatSeperator). Non-USD: block dot only; comma is thousands separator.
    const isDecimalKey =
        props.currencyCode === "USD" ? event.key === "," : event.key === ".";
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
    const isNumberKey = props.currencyCode === "USD" ? /^[0-9.]$/.test(event.key) : /^[0-9,]$/.test(event.key);
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

/** USD: block typing a third digit after the decimal point (selection replacement allowed). */
const wouldExceedUsdFractionDigits = func((event: KeyboardEvent): boolean => {
    if (props.currencyCode !== "USD") return false;
    if (!/^\d$/.test(event.key)) return false;
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const val = localValue.value;
    const next = val.slice(0, start) + event.key + val.slice(end);
    const d = next.indexOf(".");
    if (d === -1) return false;
    const fracDigits = next.slice(d + 1).replace(/\D/g, "");
    return fracDigits.length > 2;
}, "wouldExceedUsdFractionDigits");

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
	if( props.currencyCode === "USD" ) {
		let v = localValue.value.replace(/[^0-9,.]/g, "");
		const firstDot = v.indexOf(".");
		if (firstDot !== -1) {
			v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, "");
		}
		filteredValue = capUsdFractionDigits(v);
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
    localValue.value = unformattedValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

}, "formatSeperator");

const processClipboardText = func((inputText: string): string => {
    // Remove all non-numeric characters except comma separator
	let sanitizedText = "";
	if( props.currencyCode === "USD" ) {
		sanitizedText = inputText.replace(/[^0-9,.]/g, "");
	} else {
		sanitizedText = inputText.replace(/[^0-9,]/g, "");
	}

    if (!sanitizedText) return "";

    // Remove any decimal points and decimal parts
    let processedText = "";
	if( props.currencyCode === "USD" ) {
		processedText = sanitizedText;
	} else {
		processedText = sanitizedText.replace(/\./g, "");
	}

    // Apply length limit
    const unformattedLength = processedText.replace(/,/g, "").length;
    if (unformattedLength > props.length) {
        processedText = processedText.replace(/,/g, "").substring(0, props.length);
    }

    if (props.currencyCode === "USD") {
        processedText = capUsdFractionDigits(processedText);
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

// ============== Events ==============
const onFocus = func(() => {
    isUserInputting.value = true;
	// Add thousands separator formatting
    formatSeperator();
    emit("focus");
}, "onFocus");

const onBlur = func(() => {
    isUserInputting.value = false; // Reset flag on blur

    const unformattedValue = unFormatter(localValue.value);
    const numericValue = Number(unformattedValue);

    if (numericValue) {
        // Format as integer with thousands separator
		let formattedValue: number | string = numericValue;
		if( props.currencyCode !== "USD" ) {
			formattedValue = Math.floor(numericValue).toString();
		}
        localValue.value = BizCheckMobileString.currencyFormat(formattedValue, {currencyCode: props.currencyCode, pattern: "#,###.00"}); // formattedValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    } else {
        localValue.value = "";
    }

    emit("blur");
    emit("update:modelValue", unFormatter(localValue.value));
	const error = validateAmount(localValue.value);
    errorMessage.value = error;
}, "onBlur");

const onKeydown = func((event: KeyboardEvent) => {
    // Prevent all input when disabled
    if (props.disabled) {
        event.preventDefault();
        return;
    }
    isUserInputting.value = true;

    // Non-USD: no decimal separator (native / numpad can still send ".")
    if (props.currencyCode !== "USD" && (event.key === "." || event.code === "NumpadDecimal")) {
        event.preventDefault();
        return;
    }

    // Prevent input if not allowed
    if (!isAllowedKey(event)) {
        event.preventDefault();
        return;
    }

	if(event.key === "." && (event.target as HTMLInputElement).value === "") {
		event.preventDefault(); // Already has a comma, block this one
		return;
	}

	if (event.key === "." && props.currencyCode === "USD") {
		if ((event.target as HTMLInputElement).value.includes(".")) {
			event.preventDefault(); // Already has a dot, block this one
		}
		return;
	}

    // Handle prefix validation
    handlePrefixDigit(event);

    if (wouldExceedUsdFractionDigits(event)) {
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

    // Restore cursor position after formatting
    handleCursorPosition(inputElement, oldValue, oldLength, cursorPosition);

    emit("update:modelValue", unFormatter(localValue.value));
	const error = validateAmount(localValue.value);
    errorMessage.value = error;
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

    emit("update:modelValue", unFormatter(localValue.value));
}, "onPaste");

watch(() => props.modelValue, (newValue: number) => {
    // This prevents circular updates when parent updates value based on emitted input
    if (!isUserInputting.value) {
        localValue.value = newValue ? formatter(newValue) : "";
    }
}, { immediate: true, deep: true });
watch(() => props.currencyCode, () => {
    localValue.value = props.modelValue ? formatter(props.modelValue) : "";
}, { immediate: true, deep: true });

const onClickClear = func(() => {
    localValue.value = "";
    emit("update:modelValue", unFormatter(localValue.value));
    emit("reset");
	const error = validateAmount(localValue.value);
    errorMessage.value = error;
}, "onClickClear");




</script>

<style lang="scss" scoped>
	.inp_box {
		.lbl { display: block; color: var(--fontColor02); font-size: var(--font12); font-weight: 600; line-height: 140%; margin-bottom: 4px;}
		.wrap_inp_amount { display: flex; height: 44px; padding: 0 12px 0 0; justify-content: flex-end; align-items: center; border-radius: var(--radius8); border: 1px solid var(--borderinput); background: #FFFFFF;
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
