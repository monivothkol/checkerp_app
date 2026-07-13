<template>
    <div class="inp_box">
		<ion-label class="lbl txt_ellipsis">
			<slot name="label"></slot>
		</ion-label>
		<ion-textarea clear-input auto-grow  :placeholder="placeholderDisplay" :readonly="props.readonly" :disabled="props.disabled" :value="props.modelValue" :required="props.required" :class="{ required: props.required }" @ion-input="onInput"></ion-textarea>

        <ion-label v-if="props.hasInfo !== undefined && props.hasInfo" class="lbl_note">
			<slot name="info"></slot>
		</ion-label>
		<ion-label v-if="props.hasError !== undefined && props.hasError" class="lbl_error">
			<slot name="error"></slot>
		</ion-label>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

defineOptions ({
	name: "BMTextarea",
	description: "Textarea",
});

const { t } = useI18n();

interface BMTextareaProps {
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    hasError?: boolean;
	required?: boolean;
    hasInfo?: boolean;
    modelValue?: string;
}

const props = withDefaults(defineProps<BMTextareaProps>(), {
    placeholder: undefined,
    disabled: false,
    readonly: false,
    hasError: false,
    required: false,
    hasInfo: false,
    modelValue: "",
});

const placeholderDisplay = computed(() => props.placeholder ?? t("COMMON.BM_TEXTAREA.PLACEHOLDER_ENTER_DESCRIPTION"));

const emit = defineEmits(["update:modelValue"]);

const onInput = (event: any) => {
    emit("update:modelValue", event.target.value);
};

</script>

<style lang="scss" scoped>
    .inp_box {

		.lbl { display: block; color: var(--fontColor02); font-size: var(--font12); font-weight: 600; line-height: 140%; margin-bottom: 4px;}
		ion-textarea { overflow: hidden; font-size: var(--font14); font-weight: 500; --padding-start: 0; --padding-end: 0; min-height: 82px; width: 100%; border: none; text-align: left; padding: 0; border-radius: var(--radius8); border: 1px solid var(--borderinput); background: #FFFFFF;

			&:readonly {
				input { background-color: #DDDDDD;}
			}
			&:disabled { --background: #DDDDDD;}
			&.has-focus { border-color: var(--ion-color-primary);}
			&.required { border-color: var(--ion-color-primary);}
		}
		.lbl_note { display: block; color: var(--fontColor03); font-size: var(--font12); font-weight: 500; line-height: 140%; margin-top: 4px;}
		.lbl_error { display: block; color: var(--ion-color-danger); font-size: var(--font12); font-weight: 500; line-height: 140%; margin-top: 4px;}
		&:has(.lbl_error) {
			ion-textarea { border-color: var(--ion-color-danger); background-color: rgba(255, 0, 0, 0.05);}
		}
	}

	.textarea-disabled.sc-ion-textarea-ios-h { opacity: 1; background: #DDDDDD !important;}
	textarea:readonly { background-color: #DDDDDD !important;}
</style>
