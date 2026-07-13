<template>
    <div class="inp_box">
        <ion-label class="lbl">
            <slot name="label"></slot>
        </ion-label>
        <ion-input-otp v-if="!showRequestBtn" :length="props.length" :value="props.modelValue" type="number" pattern="[0-9]*" inputmode="numeric" @ion-input="onInputOTP"> </ion-input-otp>
        <ion-input-otp v-if="showRequestBtn" :length="props.length" :disabled="!isCounting" :value="props.modelValue" type="number" pattern="[0-9]*" inputmode="numeric" @ion-input="onInputOTP">
            <bm-button :disabled-button="isCounting" class="btn01 btn_md" @click="emit('requestCode')">{{ isOtpExpired ? t('LOG1100000.LABEL.RESEND_OTP') + ' ' + t('LOG1100000.LABEL.REQUEST_VERIFICATION_CODE') :t('LOG1100000.LABEL.REQUEST_VERIFICATION_CODE') }}</bm-button>
        </ion-input-otp>
        <ion-label class="lbl_note">
            <slot name="info"></slot>
        </ion-label>
        <ion-label class="lbl_error">
            <slot name="error"></slot>
        </ion-label>
        <ion-label v-if="isCounting && showCounting" class="lbl_countdown">
            <span>{{ $t('LOG1100000.LABEL.OTP_EXPIRED_IN') }}</span><em class="countdown_time">{{ formattedTime }}</em>
        </ion-label>
    </div>
</template>
<script setup lang="ts">
import { func } from "@/utilities/func";
import { BizCheckMobileLogger } from "@/shared/bizcheckmobile";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
interface BMInputOtpProps {
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    hasError?: boolean;
    hasInfo?: boolean;
    length?: number;
    hasCountdown?: boolean;
    countdownTime?: number;
    modelValue: any,
    showRequestCode?: boolean,
    showCounting?: boolean
}

const props = withDefaults(defineProps<BMInputOtpProps>(), {
    placeholder: "Enter OTP",
    disabled: false,
    readonly: false,
    hasError: false,
    hasInfo: false,
    length: 6,
    hasCountdown: false,
    countdownTime: 30,
    modelValue: "",
    showRequestCode: true,
    showCounting: true
});

const emit = defineEmits(["requestCode", "expired", "counting", "complete", "update:modelValue"]);

const timer = ref(props.countdownTime); // 2 minutes in seconds
const isCounting = ref(false);
const intervalId = ref<any>(null);
const isOtpExpired = ref<boolean>(false);
const showRequestBtn = ref<boolean>(props.showRequestCode);

const formattedTime = computed(() => {
    const min = Math.floor(timer.value / 60).toString().padStart(2, "0");
    const sec = (timer.value % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
});

watch( () => props.showRequestCode, (newVal) => {
    BizCheckMobileLogger.info("/..", newVal);
    showRequestBtn.value = newVal;
    BizCheckMobileLogger.info("/..", showRequestBtn.value);

});

const startTimer = () => {
    if (isCounting.value) return;
    isCounting.value = true;
    emit("counting", true);
    intervalId.value = setInterval(() => {
        if (timer.value > 0) {
            timer.value--;
        } else {
            isCounting.value = false;
            isOtpExpired.value = true;
            emit("update:modelValue", "");
            emit("expired", true);
        }
    }, 1000);
};

const startCountdown = () => {
    startTimer();
};

const resetTimer = () => {
    if (intervalId.value) {
        clearInterval(intervalId.value);
        intervalId.value = null;
    }
    isOtpExpired.value = false;
    isCounting.value = false;
    timer.value = 180;
};

const stopCountdown = () => {
    resetTimer();
};

const onInputOTP = func( (event) => {
    BizCheckMobileLogger.info("otp", event.detail.value);
    if (event.detail.value.length === 6) {
        emit("complete", event.detail.value);
    }
    emit("update:modelValue", event.detail.value);
});

defineExpose({startCountdown, stopCountdown});

</script>
<style lang="scss" scoped>
.lbl {
    display: block;
    color: var(--fontColor02);
    font-size: var(--font14);
    font-weight: 400;
    line-height: 140%;

    strong {
        font-weight: 600;
        color: var(--fontColor01);
    }
}

.sc-ion-input-otp-ios-h {
    --padding-top: 16px;
    --padding-bottom: 16px;
}

.lbl_countdown {
    margin-top: 16px;
    display: block;
    text-align: center;
    color: var(--fontColor02);
    font-size: var(--font14);
    font-weight: 400;
    line-height: 140%;

    .countdown_time {
        color: #FF0000;
        font-weight: 600;
        padding-left: 4px;
    }
}

.lbl_note {
    background: url("@/assets/images/ico_info.svg") left top no-repeat;
    display: block;
    color: var(--fontColor03);
    font-size: var(--font12);
    font-weight: 500;
    line-height: 140%;
    margin-top: 16px;
    padding-left: 20px;

    &:empty {
        display: none;
    }
}

.lbl_error {
    text-align: center;
    display: block;
    color: var(--ion-color-danger);
    font-size: var(--font14);
    font-weight: 500;
    line-height: 140%;
    margin-top: 16px;

    &:empty {
        display: none;
    }
}
</style>