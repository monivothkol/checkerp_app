<template>
    <ion-label class="lbl txt_ellipsis">
        <slot name="label"></slot>
    </ion-label>

    <div class="address_wrapper" :class="{ 'disabled': props.disabled }">
        <span v-if="address !== ''" class="value">{{ address }}</span>
        <span v-else class="placeholder">{{ $t('COMMON.BM_ADDRESS_SELECT.SELECT_ADDRESS') }}</span>
        <bm-button :disabled="props.disabled" @click="openAddressPicker">{{ $t('COMMON.BM_ADDRESS_SELECT.SELECT_ADDRESS') }}</bm-button>
    </div>

    <!-- Error (Slot) -->
    <slot name="error" class="txt_error"></slot>
</template>

<script setup lang="ts">
import DialogUtil from "@/utilities/dialog-util";
import { func } from "@/utilities/func";
import BmAddressSelectionDetail from "./bm-address-selection-detail.vue";
import { ref, watch } from "vue";
import COM1000000 from "@/views/COM/COM1000000.vue";

interface Props {
	modelValue: string;
    disabled?: boolean;
    address: string,
	showType: boolean
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: "",
    address: "",
	showType: false,
	disabled: false
});

const emit = defineEmits(["onSelected"]);
const address = ref<string>(props.modelValue);

watch(() => props.modelValue, (newModelValue) => {
	address.value = newModelValue;
});

const openAddressPicker = func( () => {
	if(props.showType) {
		DialogUtil.showModal(COM1000000, {
			onDidDismiss: (result) => {
				address.value = `${result.data.villageNameEn}, ${result.data.communeNameEn}, ${result.data.districtNameEn}, ${result.data.provinceNameEn}`;
				emit("onSelected", result.data);
			},
		});
	} else  {
		DialogUtil.showModal(BmAddressSelectionDetail,{
        onDidDismiss: (result) => {
            address.value = result.data.label;
            emit("onSelected", result.data);
            },
        });
	}

});

</script>

<style scoped lang="scss">
    .lbl { display: block; color: var(--fontColor02); font-size: var(--font12); font-weight: 600; line-height: 140%; margin-bottom: 4px;}
    .address_wrapper { background: #FFFFFF; position: relative; height: 80px; font-size: var(--font14); font-weight: 500; line-height: 18px; display: flex; gap: 8px; align-items: center; justify-content: space-between; padding:  16px 42px 16px 12px; border-radius: var(--radius8); --border-width: 0; border: 1px solid #D9D9D9;
        .placeholder { color: var(--fontColor03); font-size: var(--font14); line-height: 140%; font-weight: 500;}
        .value {
            &:empty { display: none;}
        }
        .value:not(:empty) + .placeholder { display: none;}
        ion-button { position: absolute; left: 0; width: 100%; margin-left: auto; text-indent: -9999rem; min-height: 24px; --background-activated: transparent; --background: transparent; background-size: 18px auto;; --border-radius: 0; --background-activated-opacity: 0; --background-focused-opacity: 0; --background-hover-opacity: 0;
            &::part(native) { background: transparent url("@/assets/images/ico_btn_search.svg") right 12px center no-repeat; background-size: 20px;}
        }
    }
    .lbl + .address_wrapper { margin-top: 8px;}

    .address_wrapper.disabled {
        background-color: #DDDDDD;
        color: var(--fontColor03);
    }
</style>
