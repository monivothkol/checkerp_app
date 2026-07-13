<template>
    <div mode="modal" class="modal_wrapper">
        <div class="modal_header">
            <ion-label>{{ displayTitle }}</ion-label>
            <bm-button class="btn_head_close type02" @click="onClose">{{ t('COMMON.BM_SELECT_ACCOUNT_LIST.CLOSE') }}</bm-button>
        </div>
        <div class="modal_content">
            <div class="wrap_content">
                <bm-list :list="props.accountList">
                    <template #item="{ item }">
                        <div class="wrap_card_account" :class="{ 'disabled': props.disabled }" @click="onSelectAccount(item)">
                            <div class="dflex">
                                <ion-chip v-if="['Current Account', 'Loan Against Deposit'].includes(item.accountType)"
                                    :class="{ 'warning': ['Current Account', 'Loan Against Deposit'].includes(item.accountType) }">
                                    {{ getAccountTypeLabel(item.accountType) }}
                                </ion-chip>
                                <ion-chip
                                    v-else-if="['Saving Account', 'Housing Loan', 'Auto Loan'].includes(item.accountType)"
                                    :class="{ '': ['Saving Account', 'Housing Loan', 'Auto Loan'].includes(item.accountType) }">
                                    {{ getAccountTypeLabel(item.accountType) }}
                                </ion-chip>
                                <ion-chip v-else :class="{}">
                                    {{ getAccountTypeLabel(item.accountType) }}
                                </ion-chip>
                                <div class="option">
                                    <p v-if="item.endDate" class="end_date"> <span>{{ t('COMMON.BM_SELECT_ACCOUNT_LIST.END_DATE') }}</span> {{ dateFormat(item.endDate) }}
                                    </p>
                                </div>
                            </div>
                            <p class="account_nickname">{{ item.accountNickname }}</p>
                            <div class="wrap_account_no">
                                <p class="account_no">{{ formatAccountNo(item.accountNumber, item.accountNoType) }}</p>
                                <bm-button class="btn_copy"
                                    @click.stop="() => onCopyAccountNumber(item.accountNumber)"></bm-button>
                            </div>
                            <h5><span class="account_balance">{{ formatCurrency(item.accountBalance, item.accountCurrency) }}</span><span class="unit">{{
                                    item.accountCurrency }}</span></h5>
                        </div>
                    </template>
                </bm-list>
            </div>
        </div>
    </div>

    <!-- Error (Slot) -->
    <slot name="error" class="txt_error"></slot>
</template>

<script setup lang="ts">
import DialogUtil from "@/utilities/dialog-util";
import { BizCheckMobileLogger, BizCheckMobileString } from "@/shared/bizcheckmobile";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineOptions({
    name: "BMSelectAccountList",
    desciption: "Select Account List",
});

const ACCOUNT_TYPE_KEYS: Record<string, string> = {
    "Current Account": "CURRENT_ACCOUNT",
    "Loan Against Deposit": "LOAN_AGAINST_DEPOSIT",
    "Saving Account": "SAVING_ACCOUNT",
    "Housing Loan": "HOUSING_LOAN",
    "Auto Loan": "AUTO_LOAN",
};

interface Props {
    disabled?: boolean,
    title?: string,
    accountList?: Array<{ accountType: string, accountNickname: string, endDate: string, accountNumber: string, accountNoType: string,accountBalance: string, accountCurrency: string }>,
}

const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    title: "",
    accountList: () => [],
});

const displayTitle = computed(() => props.title || t("COMMON.BM_SELECT_ACCOUNT_LIST.TITLE"));

function getAccountTypeLabel(accountType: string): string {
    const key = ACCOUNT_TYPE_KEYS[accountType];
    return key ? t(`COMMON.BM_SELECT_ACCOUNT_LIST.${key}`) : accountType;
}

const formatCurrency = (amount: any, currencyCode: string) => {
	return BizCheckMobileString.currencyFormat(amount, { currencyCode: currencyCode, showCurrencyCode: false, position: "end" });
};
const formatAccountNo = (accountNo: string, type: string) => {
	return BizCheckMobileString.accountFormat(accountNo, type || "accountNo");
};
const dateFormat = (date: string) => {
    return BizCheckMobileString.dateFormat(date);
};
const onCopyAccountNumber = (accountNumber: string) => {
    BizCheckMobileLogger.info("onCopyAccountNumber", props.accountList);

    const numberToCopy = accountNumber;
    navigator.clipboard.writeText(numberToCopy);
    DialogUtil.showToast({
        message: t("COMMON.BM_SELECT_ACCOUNT_LIST.TOAST_ACCOUNT_COPIED"),
        duration: 1000,
    });
};

const onClose = () => {
    DialogUtil.closeDialog({role: "close"});
};

const onSelectAccount = (item: any) => {
    DialogUtil.closeDialog({role: "confirm", data: item});
};
</script>

<style scoped lang="scss">
ion-chip { min-height: 20px;
    + :not(dl) { margin-left: 0; }
}
.wrap_card_account { width: 100%; border-radius: var(--radius8); background: var(--ion-color-primary); padding: 16px; color: #FFFFFF;
    .end_date { font-size: var(--font12); font-weight: 600; line-height: 140%; color: #FFFFFF;
        span { font-size: var(--font12); font-weight: 600; line-height: 140%; color: #FFFFFF; margin-right: 4px; }
    }
    .account_type { font-size: var(--font14); font-weight: 500; line-height: 140%; }
    .account_nickname { margin: 8px 0 0; font-size: var(--font14); font-weight: 500; line-height: 140%; }
    .wrap_account_no { margin: 8px 0 0; height: 20px; display: flex;
        .account_no { margin: 0; font-size: var(--font14); font-weight: 600; line-height: 140%; text-decoration: underline; }
        .btn_copy { margin-left: 8px; min-height: 18px; width: 18px; height: 18px; --background: transparent; background: transparent url("@/assets/images/ico_btn_copy_w.svg") no-repeat center center; background-size: 18px auto; }
    }
    h5 { margin-top: 8px; text-align: right;
        .account_balance { font-size: var(--font24); font-weight: 600; line-height: 140%; }
        .unit { font-size: var(--font14); font-weight: 600; line-height: 140%; padding-left: 5px; }
    }
    &.disabled { background: #D9D9D9 !important; color: var(--fontColor01); }
}
</style>
