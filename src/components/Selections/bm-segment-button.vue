<template>
    <ion-segment-button v-bind="$attrs" :value="props.value">
        <slot>{{ props.label }}</slot>
    </ion-segment-button>
</template>
<script setup lang="ts">
    interface Props {
        label: string;
        value?: string;
    }

    const props = withDefaults(defineProps<Props>(), {
        label: "",
        value: "",
    });
</script>
<style scoped lang="scss">
    ion-segment-button { --indicator-transition: none; --background: transparent; --indicator-color: transparent; height: 34px; margin: 0; font-weight: 500; font-size: var(--font14); line-height: 140%;
        &.segment-button-checked { background-color: var(--colorPrimary); color: #FFFFFF; }
    }
    ion-segment.segment01 { border-radius: var(--radius8) var(--radius8) 0 0;
        ion-segment-button {  --padding-start: 10px; --padding-end: 10px; --background: transparent; --indicator-color: transparent; margin: 0 !important; --border-radius: var(--radius8) var(--radius8) 0 0; min-height: 38px;
            &.segment-button-checked {  background: var(--colorPrimary); color: #FFFFFF; }
            &:before { display: none;}

        }
    }
</style>