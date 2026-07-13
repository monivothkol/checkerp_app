<template>
    <div class="wrap_card_account" v-bind="$attrs" :class="{ 'disabled': props.disabled }" @click="openAccountList()">
        <p v-if="props.accountType" class="account_type" >{{ props.accountType }}</p>
        <p class="account_no">{{ props.accountNumber }}</p>
        <h5><span class="account_balance">{{ props.accountBalance }}</span><span class="unit">{{ props.accountCurrency }}</span></h5>
    </div>

    <!-- Error (Slot) -->
    <slot name="error" class="txt_error"></slot>
</template>

<script setup lang="ts">
import DialogUtil from "@/utilities/dialog-util";
import BMSelectAccountList from "@/components/Selections/bm-select-account-list.vue";
import { BizCheckMobileLogger } from "@/shared/bizcheckmobile";

const emit = defineEmits(["onSelected"]);

defineOptions ({
	name: "BMSelectAccount",
	description: "Select Account",
});

interface Props {
    accountType: string,
    accountNumber: string,
    accountBalance: string,
    accountCurrency: string,
    disabled?: boolean,
    deafaultDailog?: boolean,
    accountList?: Array<{ accountType: string, accountNickname: string, endDate?: string, accountNumber: string, accountNoType: string,accountBalance: string, accountCurrency: string }>,

}

const props = withDefaults(defineProps<Props>(), {
    accountType: "",
    accountNumber: "00-0000-00000",
    accountBalance: "0.00",
    accountCurrency: "USD",
    disabled: false,
    deafaultDailog: false,
    accountList: () => [],
});

const openAccountList = () => {
    if(!props.deafaultDailog || props.disabled){
        return;
    }
    BizCheckMobileLogger.log("===========", props.accountList);
    DialogUtil.showDialog(BMSelectAccountList, {
		props: {
			accountList: props.accountList,
		},
		onDidDismiss: (result: any) => {
			BizCheckMobileLogger.log("bm-select-account-list==== ", result.data.accountNumber, result.role);
			if (result && result.role === "confirm") {
				emit("onSelected", result.data);
			}
		},
	});
};
</script>

<style scoped lang="scss">
.wrap_card_account { border-radius: var(--radius8); background: var(--ion-color-primary) url("@/assets/images/ico_arrow_down_w.svg") no-repeat right 16px center; padding: 16px; color: #FFFFFF;
    .account_type { font-size: var(--font14); font-weight: 500; line-height: 140%;}
    .account_no { font-size: var(--font14); font-weight: 600; line-height: 140%; margin-top: 4px;}
    h5 { margin-top: 8px;
        .account_balance { font-size: var(--font24); font-weight: 600; line-height: 140%;}
        .unit { font-size: var(--font14); font-weight: 600; line-height: 140%; padding-left: 5px;}
    }
    &.disabled { background: #D9D9D9 !important; color: var(--fontColor01);}
}
</style>
