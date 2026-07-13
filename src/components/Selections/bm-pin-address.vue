<template>
    <!-- Label (Slot) -->
    <ion-label class="lbl txt_ellipsis" :class="labelClass">
        <slot name="label"></slot>
    </ion-label>
    <div class="wrap_pin_address">
        <div v-if="props.showType === 'detail'" class="address_wrapper">
            <p class="address">{{ addressDetail }}</p>
        </div>
        <div v-if="props.showType !== 'detail'" class="address_wrapper">
            <p class="address">Latitude: {{ location.latitude }}</p>
            <p class="address">Longitude: {{ location.longitude }}</p>
        </div>
        <bm-button :disabled="isOffline" class="btn01" @click="openMap">Pin</bm-button>
    </div>
    <!-- Note (Slot) -->
    <slot name="note" class="lbl_note"></slot>
    <!-- Error (Slot) -->
    <slot name="error" class="txt_error"></slot>
</template>
<script setup lang="ts">
import DialogUtil from "@/utilities/dialog-util";
import { func } from "@/utilities/func";
import { computed, ref, useSlots } from "vue";
import BmMap from "../Map/bm-map.vue";
import { BizCheckMobileLogger } from "@/shared/bizcheckmobile";
import OfflineModeUpdate from "@/utilities/offline-mode-update";
import GoogleService from "@/services/google-service";

const labelClass = computed(() => {
    return slots?.error !== undefined ? "error" : "" + (slots?.note !== undefined ? "note" : "");
});

const slots = useSlots();
const props = defineProps({
    showType: {
        type: String,
        required: true,
        default: "detail"
    },
    location: {
        type: Object,
        required: false,
        default: () => ({latitude: 0, longitude: 0})
    },
    addressDetail: {
        type: String,
        required: true,
        default: ""
    }
});

const emit = defineEmits(["update:modelValue"]);
const addressDetail = ref<string>(props.addressDetail);
const location = ref<any>(props.location);
const isOffline = ref<boolean>(false);

new OfflineModeUpdate().subscribe({
    onUpdate: (status) => {
        BizCheckMobileLogger.log("OfflineModeUpdate status : ", status);
        isOffline.value = status;
    }
});

new GoogleService().getMyCurrentLocation().then((response) => {
    location.value = response;
    addressDetail.value = response.displayName;
    emit("update:modelValue", response);
});

const openMap = func( () => {
    DialogUtil.showModal(BmMap, {
        onDidDismiss: (response) => {
            BizCheckMobileLogger.info("onDidDismiss: => ", response);
            emit("update:modelValue", response.data);
            addressDetail.value = response.data.displayName;
            location.value.latitude = response.data.latitude;
            location.value.longitude = response.data.longitude;
        }
    });
});

</script>
<style scoped lang="scss">
.lbl {
    display: block;
    color: var(--fontColor02);
    font-size: var(--font12);
    font-weight: 600;
    line-height: 140%;
    margin-bottom: 4px;
}

.wrap_pin_address {
    display: flex;
    height: 80px;

    .address_wrapper {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 100%;
        border-radius: var(--radius8);
        padding: 16px;
        border: 1px solid #D9D9D9;
        background: #FFFFFF;
        padding: 16px;

        .address {
            font-size: var(--font14);
            font-weight: 600;
            line-height: 140%;
            color: var(--fontColor02);
        }
    }

    ion-button {
        width: 64px;
        height: 80px;
        border-radius: var(--radius8);
        --background: transparent;
        background: var(--colorPrimary) url("@/assets/images/ico_pin_map.svg") no-repeat center;
        margin-left: 8px;
        text-indent: -9999rem;
    }
}
</style>
