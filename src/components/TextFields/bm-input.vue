<template>
    <div class="inp_box">
        <ion-label v-if="slots.label !== undefined" class="lbl txt_ellipsis">
            <slot name="label"></slot>
        </ion-label>
        <div class="dflex">
            <ion-input
                :ref="computedInputRef(props.label)"
                v-restrict-emoji="props.restrictEmoji"
                class="inp"
                :clear-input="props.clearInput"
                :value="props.modelValue"
                :debounce="props.debounce"
                :placeholder="props.placeholder"
                :type="inputType"
                :inputmode="props.inputmode"
                :readonly="props.readonly"
                :disabled="props.disabled"
                :maxlength="props.max"
				:required="props.required"
                :clear-on-edit="props.clearEdit"
                :class="{ required: props.required, 'error': errorMessage !== '' }"
                @ion-input="onInput"
                @ion-change="onChange"
                @ion-blur="onBlur"
                @ion-focus="onFocus(computedInputRef(props.label))"
                >
                <ion-button v-if="props.type === 'password'" slot="end" class="btn_hide" :class="{show: inputType === 'text'}" @click="onShowPassword"/>
            </ion-input>
            <slot name="end"></slot>
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
import { restrictEmoji as restrictEmojiDirective } from "@/directives/RestrictEmoji";
import { BizCheckMobileLogger } from "@/shared/bizcheckmobile";
import { nextTick, ref, useSlots, useTemplateRef, watch } from "vue";
defineOptions({
    name: "BMInput",
    description: "Input",
    directives: {
        restrictEmoji: restrictEmojiDirective,
    }
});

interface BMInputProps {
    disabled?: boolean;
    readonly?: boolean;
    hasError?: boolean;
	debounce?: number;
    hasInfo?: boolean;
    placeholder?: string;
    modelValue: any;
    clearInput?: boolean;
    max?: number;
    required?: boolean;
    label?: string;
    type?: string;
    restrictEmoji?: boolean;
    inputmode?: string;
    clearEdit?: boolean;
}

const props = withDefaults(defineProps<BMInputProps>(), {
    placeholder: "Enter text",
    disabled: false,
    readonly: false,
    hasError: false,
    hasInfo: false,
	clearInput: true,
    debounce: 0,
    modelValue: "",
    type: "text",
    label: "",
    restrictEmoji: false,
    max: 250,
    inputmode: "text",
    clearEdit: false,
    required: false
});

const slots = useSlots();
const emit = defineEmits(["update:modelValue", "onInput", "onBlur", "onFocus"]);

const errorMessage = ref<string>("");

const onInput = (event: any) => {
	let maxLength = props.max;
	if (props.type === "number" && props.max) {
		if((/\./).test(event.target.value)) {
			maxLength = maxLength +2; // 1 for the decimal point
		}
		event.target.value = event.target.value.slice(0, maxLength);
	}
    emit("update:modelValue", event.target.value);
	emit("onInput", event);
    const error = validateInput(event.target.value);
    errorMessage.value = error;
};


const onChange = (event: any) => {
    emit("update:modelValue", event.target.value);
    const error = validateInput(event.target.value);
    errorMessage.value = error;
};

const computedInputRef = (label?: string): string => {
    const labelData = label?.replace(/[^a-zA-Z0-9]/g, "") || "";
    return "inputRef" + labelData;
};

const refInput = useTemplateRef<any>(computedInputRef(props.label));
const isBlurring = ref(false);

const onFocus = async (event: any) => {
    // Prevent scroll if we're in the middle of blurring
    if (isBlurring.value) {
        return;
    }

    emit("onFocus", event);
    await nextTick();
    scrollToViewElement(refInput.value, "nearest", "nearest");
};



const onBlur = async (event: any) => {
    isBlurring.value = true;
    const error = validateInput(event.target.value);
    errorMessage.value = error;
    emit("onBlur", event);
    // Reset the flag after a short delay to allow blur to complete
    await nextTick();
    setTimeout(() => {
        isBlurring.value = false;
    }, 100);
};

const validateInput = (value: string): string => {
    if (props.required && !value) {
        return "This field is required";
    }
    return "";
};

const scrollToViewElement = (refElement: any, block: Partial<"center" | "end" | "nearest" | "start"> = "nearest", inline: Partial<"center" | "end" | "nearest" | "start"> = "nearest") => {
    try {
        if (!refElement) return;
        const dom: HTMLElement | null = refElement instanceof HTMLElement
            ? refElement
            : (() => {
                const element = refElement.$el;
                return element instanceof HTMLElement ? element : null;
            })();

        if (!dom) return;
        setTimeout(() => {
            // BizCheckMobileLogger.log("scrollToViewElement: scrollIntoView", dom, refElement);
            dom.scrollIntoView({
                behavior: "smooth",
                block: block,
                inline: inline
            });
        }, 600);
    } catch (error) {
        BizCheckMobileLogger.error("Error scrolling to view element:", error);
    }
};

const inputType = ref(props.type);

const onShowPassword = () => {
    inputType.value = inputType.value === "password" ? "text" : "password";
};

watch(() => props.modelValue, (newValue) => {
    if (newValue) {
        emit("update:modelValue", newValue);
    }
}, { immediate: true });


</script>

<style lang="scss" scoped>
.btn_hide { --background: transparent; background: url("@/assets/images/ico_eyes_close.svg") no-repeat center; height: 24px; width: 24px; min-height: 24px; margin: 0 8px !important;
    &.show { background: url("@/assets/images/ico_eyes.svg") no-repeat center;}
}
.inp_box {
	.lbl { display: block; color: var(--fontColor02); font-size: var(--font12); font-weight: 600; line-height: 140%; margin-bottom: 4px;}
	ion-input { overflow: hidden; font-size: var(--font14); font-weight: 500; --padding-start: 0; --padding-end: 0; min-height: 44px; height: 44px; width: 100%; border: none; text-align: left; padding: 0 12px; border-radius: var(--radius8); border: 1px solid var(--borderinput); background: #FFFFFF;
        &:readonly {
            input { background-color: #DDDDDD;}
        }
        &:disabled { --background: #DDDDDD;}
        &.has-focus { border-color: var(--ion-color-primary);}
		&.input-disabled { --background: #DDDDDD; color: var(--fontColor03) !important;}
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
