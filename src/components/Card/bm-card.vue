<template>
    <div :class="props.cardType === 'transaction' ? 'card_cont' : 'dlist01'" @click="handleClick">

        <template v-if="props.cardType === 'payment'">
            <dl v-for="(value, index) in props.cardHeader" :key="index" class="align_center">
                <dt class="tit_no">#{{ value.index }}</dt>
                <dd v-if="value.statusKey && value.statusKey !== ''">
                    <ion-chip :class="getStatusColor(cardSource[value.statusKey])">{{ cardSource[value.statusKey]
                        }}</ion-chip>
                </dd>
            </dl>
            <dl v-for="(value, index) in props.cardBody" :key="index">
                <dt v-if="value.title && value.title !== ''">{{ value.title }}</dt>
                <dd v-if="value.key === 'statusCode' && cardSource['status'] !== ''"><ion-chip
                        :class="getStatusColor(cardSource[value.key])">{{ cardSource["status"] }}</ion-chip></dd>
                <dd v-else>{{ cardSource[value.key] }}</dd>
            </dl>
        </template>

        <template v-if="props.cardType === 'inquiry'">
            <dl v-for="(value, index) in props.cardHeader" :key="index" class="align_center">
                <dt><span class="ico_card">{{ cardSource[value.key] }}</span></dt>
                <dd v-if="value.statusKey && value.statusKey !== ''" class="detail"> <ion-chip :class="getStatusColor(cardSource[value.statusKey])">{{ capitalizeFirstChar(getStatusColor(cardSource[value.statusKey])) }}</ion-chip>
                </dd>
            </dl>
            <dl v-for="(value, index) in props.cardBody" :key="index">
                <dt>{{ value.title }}</dt>
                <dd>{{ cardSource[value.key] }}</dd>
            </dl>
        </template>

        <template v-if="props.cardType === 'detail'">
            <dl v-for="(value, index) in props.cardBody" :key="index">
                <dt v-if="value.title && value.title !== ''">{{ value.title }}</dt>
                <dd v-if="['statusCode', 'status'].includes(value.key) && cardSource[value.key] !== ''">
                    <ion-chip :class="getStatusColor(cardSource[value.key])">{{ getStatusColor(cardSource[value.key]) }}</ion-chip>
                </dd>
                <dd v-else>{{ cardSource[value.key] }}</dd>
            </dl>
        </template>

        <template v-if="props.cardType === 'debtor'">
            <dl v-for="(value, index) in props.cardHeader" :key="index" class="align_center">
                <dt class="txt_ellipsis"><strong class="font16">{{ cardSource[value.key] }}</strong></dt>
                <dd class="wrap">
                    <span v-if="value.debtorKey && value.debtorKey !== ''"
                        :class="value.debtorKey && cardSource[value.debtorKey] !== '' ? 'ico_location' : ''">{{
                            cardSource[value.debtorKey] }}</span>
                    <ion-chip v-if="value.statusKey && value.statusKey !== ''"
                        :class="getStatusColor(cardSource[value.statusKey])">{{
                            getStatusDebtor(cardSource[value.statusKey]) }}</ion-chip>
                </dd>
            </dl>

            <dl v-for="(value, index) in props.cardBody" :key="index">
                <dt class=""><span>{{ cardSource[value.key] }}</span></dt>
            </dl>

            <dl v-for="(value, index) in props.cardFooter" :key="index" class="align_center">
                <dt><span class="ico_phone">{{ cardSource[value.key] }}</span></dt>
                <dd>
                    <ion-button class="btn_txt"><span class="ico_direction">Direction</span></ion-button>
                </dd>
            </dl>
        </template>

        <template v-if="props.cardType === 'history'">

            <dl v-for="(value, index) in props.cardHeader" :key="index" class="align_center">
                <dt class="txt_ellipsis"><strong class="font16">{{ cardSource[value.key] }}</strong></dt>
            </dl>

            <dl v-for="(value, index) in props.cardBody" :key="index" class="align_center">
                <dt><span class="ico_phone">{{ cardSource[value.key] }}</span></dt>
            </dl>

            <dl v-for="(value, index) in props.cardFooter" :key="index" class="align_center">
                <dd class="detail"><span>{{ cardSource[value.key] }}</span></dd>
            </dl>

        </template>

        <template v-if="props.cardType === 'contact'">

            <dl v-for="(value, index) in props.cardHeader" :key="index" class="align_center">
                <dt><span class="ico_concat">{{ cardSource[value.key] }}</span></dt>
                <dd v-if="value.contactKey && value.contactKey !== ''">
                    <span>{{ cardSource[value.contactKey] }}</span>
                </dd>
            </dl>

            <dl v-for="(value, index) in props.cardBodyTitle" :key="index" class="align_center">
                <dt class="txt_ellipsis"><strong class="font16">{{ cardSource[value.key] }}</strong></dt>
            </dl>

            <dl v-for="(value, index) in props.cardBody" :key="index" class="align_center">
                <dt class="txt_ellipsis"><span>{{ cardSource[value.key] }}</span></dt>
            </dl>

            <dl v-for="(value, index) in props.cardFooter" :key="index" class="align_center">
                <dt><span class="ico_phone">{{ cardSource[value.key] }}</span></dt>
                <dd> <span class="ico_calendar">{{ cardSource[value.key] }}</span> </dd>
            </dl>

        </template>

        <template v-if="props.cardType === 'transaction'">
            <dl v-for="(value, index) in props.cardHeader" :key="index">
                <dt>Type</dt>
                <dd v-if="value.transactionKey && value.transactionKey !== ''"><ion-button fill="clear">{{
                    getTransactionType(cardSource[value.transactionKey]) }}</ion-button></dd>
            </dl>
            <dl v-for="(value, index) in props.cardBody" :key="index" class="col">
                <dt>Params</dt>
                <dd class="txt_ellipse_2_lines">{{ cardSource[value.key] }} </dd>
            </dl>
        </template>
        <template v-if="props.cardType === 'profile'">
            <b-profile-image size="large" />
            <dl v-for="(value, index) in props.cardBody" :key="index">
                <dt v-if="value.title && value.title !== ''">{{ value.title }}</dt>
                <dd>{{ cardSource[value.key] }}</dd>
            </dl>
        </template>
        <template v-if="props.cardType === 'custom'">
            <dl v-for="(value, index) in props.cardBody" :key="index" @click="handleClick">
                <dt v-if="value.icon"  class="icon_custom"> <ion-icon class="mr-2" size="large" :icon="value.icon"></ion-icon></dt>
                <dt v-if="value.title && value.title !== ''" >
                    <span v-safe-html="value.title"></span>
                </dt>
                <dd v-if=" value.key!== 'custom'" class="detail"><span>{{ value.key }}</span></dd>
                <dd v-else><slot :name="value.key"></slot></dd>
            </dl>
        </template>
    </div>
</template>
<script setup lang="ts">
import { func } from "@/utilities/func";
import { computed } from "vue";

defineOptions({
    name: "BContentCard",
    description: "BContentCard component"
});

const emit = defineEmits(["onCardClick"]);

const props = withDefaults(defineProps<{
    cardHeader?: { index?: number, key: string, statusKey?: string, debtorKey?: string, contactKey?: string, transactionKey?: string }[],
    cardBody: { title?: string, key: string, icon?: any, image?: any }[],
    cardFooter?: { key: string }[],
    cardBodyTitle?: { key: string }[],
    cardSource: Record<string, any>,
    cardType: "payment" | "inquiry" | "detail" | "transaction" | "history" | "debtor" | "contact" | "profile" | "custom"
}>(), {
    cardType: "detail",
    cardHeader: () => [] as { index?: number, key: string, statusKey?: string, debtorKey?: string, contactKey?: string, transactionKey?: string }[],
    cardBody: () => [] as { title?: string, key: string, icon?: any, image?: any }[],
    cardFooter: () => [] as { key: string }[],
    cardBodyTitle: () => [] as { key: string }[],
    cardSource: () => ({}) as Record<string, any>,
});

const getStatusColor = computed(() => {
    return (status: string) => {
        switch (status) {
            case "00":
                return "sucess";
            case "01":
                return "upcoming";
            case "02":
                return "late";
            case "03":
                return "visit";
            default:
                return "";
        }
    };
});

const getStatusDebtor = computed(() => {
    return (status: string) => {
        switch (status) {
            case "00":
                return "high";
            case "01":
                return "medium";
            case "02":
                return "low";
            case "03":
                return "high";
            default:
                return "";
        }
    };
});

const capitalizeFirstChar = func((str: string): string => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
});

const getTransactionType = computed(() => {
    return (type: string) => {
        switch (type) {
            case "00":
                return "Edit Profile";
            case "01":
                return "Visit Report";
            default:
                return "";
        }
    };
});

const handleClick = () => {
    emit("onCardClick", { source: props.cardSource, type: props.cardType, header: props.cardHeader, body: props.cardBody, footer: props.cardFooter, bodyTitle: props.cardBodyTitle });
};
</script>
