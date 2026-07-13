<template>
    <bm-content class="bg_white">
        <div class="wrap_error">
            <h1>{{ props.title ?? $t('COMMON.BM_ERROR.TITLE') }}</h1>
            <p>{{ props.message ?? $t('COMMON.BM_ERROR.MESSAGE') }}</p>
            <bm-button v-if="displayActionLabel" class="btn01" fill="outline" @click="emit('report')">{{ displayActionLabel }}</bm-button>
        </div>
    </bm-content>
    <bm-footer>
        <bm-button class="btn01" @click="emit('close')">{{ $t('COMMON.BM_ERROR.OKAY') }}</bm-button>
    </bm-footer>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

interface Props {
    title?: string;
    message?: string;
    actionButtonLabel?: string;
}
const props = withDefaults(defineProps<Props>(), {
    title: undefined,
    message: undefined,
    actionButtonLabel: undefined,
});

const { t } = useI18n();
const displayActionLabel = computed(() => props.actionButtonLabel ?? t("COMMON.BM_ERROR.REPORT_BUG"));

const emit = defineEmits(["close", "report"]);
</script>
<style scoped lang="scss">
    .wrap_error { text-align: center; margin-top: 92px; padding-top: 136px; position: relative;
        &::before { content: ""; position: absolute; top: 0; left: calc(50% - 60px); width: 120px; height: 120px; background: var(--colorPrimary) url("@/assets/images/ico_info_setting.svg") no-repeat center; border-radius: 50%;}
        h1 { margin-bottom: 8px; color: var(--fontColor01); font-size: var(--font18); font-weight: 700; line-height: 140%; /* 25.2px */}
        p { margin-bottom: 16px; color: var(--fontColor03); font-size: var(--font14); font-weight: 400; line-height: 140%; /* 19.6px */}
    }
</style>