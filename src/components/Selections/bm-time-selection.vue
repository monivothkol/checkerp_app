<template>
    <ion-label class="lbl txt_ellipsis">
        <slot name="label"></slot>
    </ion-label>
    <div class="inp_date" :class="{ disabled: props.disabled, readonly: props.readonly }">
        <span class="value">{{time?.hour}}: {{ time?.minute }}</span>
        <ion-button @click="openTimePicker">Time Picker</ion-button>
    </div>
    <ion-label v-if="props.hasInfo !== undefined && props.hasInfo" class="lbl_note">
        <slot name="info"></slot>
    </ion-label>
    <ion-label v-if="props.hasError !== undefined && props.hasError" class="lbl_error">
        <slot name="error"></slot>
    </ion-label>
</template>

<script setup lang="ts">
import bmTimePicker from "@/components/Pickers/bm-time-picker.vue";
import DialogUtil from "@/utilities/dialog-util";
import { onMounted, watch } from "vue";

defineOptions ({
    name: "BMTimeSelection",
    description: "Time Selection",
});

interface Props {
    disabled?: boolean,
    readonly?: boolean,
    hasInfo?: boolean,
    hasError?: boolean,
    modelValue: any
}

const time = defineModel<{ hour: string, minute: string }>("time", { required: false });
const now = new Date();
time.value = {
    hour: String(now.getHours()).padStart(2, "0"),
    minute: String(now.getMinutes()).padStart(2, "0")
};
const emit = defineEmits(["update:modelValue"]);

const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    readonly: false,
    hasInfo: false,
    hasError: false,
});

watch(() => props.modelValue, (newVal) => {
    time.value = newVal;
    emit("update:modelValue", time.value);
});

const getCurrentTime24 = () => {
    const now = new Date();
    return {
        hour: String(now.getHours()).padStart(2, "0"),   // 00–23
        minute: String(now.getMinutes()).padStart(2, "0") // 00–59
    };
};

onMounted(() => {
    const current = getCurrentTime24();
    if(props.modelValue){
        time.value = {
            hour: String(props.modelValue.hour).padStart(2, "0"),
            minute: String(props.modelValue.minute).padStart(2, "0")
        };
    } else {
        time.value = {
            hour: current.hour,
            minute: current.minute
        };
    }
    emit("update:modelValue", time.value);
});

const openTimePicker = () => {

    if (props.disabled) return;

    DialogUtil.showDialog(bmTimePicker, {
        props: {
            time: time.value
        },
        onDidDismiss: (result) => {
            if (result.role === "apply") {
                time.value = { hour: result.data.hour, minute: result.data.minute };
                emit("update:modelValue", time.value);
            }
        }
    });
};
</script>

<style scoped lang="scss">
.lbl { display: block; color: var(--fontColor02); font-size: var(--font12); font-weight: 600; line-height: 140%; margin-bottom: 4px;}
.inp_date { position: relative; height: 44px; display: flex; gap: 8px; align-items: center; justify-content: space-between; background-color: #FFFFFF; padding: 0 12px; border-radius: var(--radius8); --border-width: 0; border: 1px solid #DDDDDD;
    .placeholder { font-size: var(--font14); font-weight: 500; line-height: 18px; color: #999999;}
    .value { font-size: var(--font14); font-weight: 500; line-height: 18px; color: #000000;
        &:empty { display: none;}
    }
    .value:not(:empty) + .placeholder { display: none;}
    ion-button { position: absolute; left: 0; width: 100%; margin-left: auto; text-indent: -9999rem; min-height: 24px; --background-activated: transparent; --background: transparent; background: transparent url("@/assets/images/ico_btn_time.svg") no-repeat right 10px center; background-size: 18px auto; --border-radius: 0;}
    &.disabled { background-color: #DDDDDD;
        .value { color: var(--fontColor03);}
        ion-button { background-image: url("@/assets/images/ico_btn_time_disabled.svg"); }
    }
    &.readonly { background-color: #DDDDDD; color: var(--fontColor01);}
}
.lbl_note { display: block; color: var(--fontColor03); font-size: var(--font12); font-weight: 500; line-height: 140%; margin-top: 4px;
    &:empty { display: none;}
}
.lbl_error { display: block; color: var(--ion-color-danger); font-size: var(--font12); font-weight: 500; line-height: 140%; margin-top: 4px;
    &:empty { display: none;}
}
</style>
