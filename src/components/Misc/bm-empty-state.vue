<template>
    <div class="wrap_nodata">
        <p>{{ $t(props.description) }}</p>
    </div>
</template>

<script lang="ts" setup>
interface Props {
    description?: string;
}

const props = withDefaults(defineProps<Props>(), {
    description: "MISC.EMPTY_STATE.NO_DATA",
});
</script>

<style scoped lang="scss">
    .wrap_nodata { width: 100%; background: url("@/assets/images/ico_nodata.png") no-repeat top center; background-size: auto 96px; padding-top: 104px; margin: 64px 0 32px;
        p { color: var(--fontColor04); font-size: var(--font16); font-weight: 500; line-height: 140%; text-align: center;}
    }
</style>
