<template>
    <ion-accordion :value="props.value">
        <ion-item slot="header" class="collapse_header">
            <ion-label class="collapse_title">{{ props.title }}</ion-label>
        </ion-item>
        <div slot="content" class="collapse_content">
            <slot name="content"></slot>
        </div>
    </ion-accordion>
</template>

<script setup lang="ts">
const props = defineProps<{
    title: string;
    value: string;
}>();
</script>

<style scoped lang="scss">
ion-accordion { background: transparent; margin-left: -16px; margin-right: -16px; width: auto;
    &:not(:first-child) { margin-top: 16px;}
    ion-item {--border-width: 0;}
    .collapse_header { height: 44px; border-bottom: 1px solid #D9D9D9; --background: transparent; margin-left: 16px; margin-right: 16px;
        .collapse_title { margin-right: 0; font-size: var(--font16); font-weight: 600; line-height: 140%; color: var(--fontColor01);}
    }
    .collapse_content { padding-top: 16px; padding-left: 16px; padding-right: 16px;
        > :not(:last-child):not(.lbl) { padding-bottom: 16px;}
    }
    &.accordion-expanded { overflow: unset;
        &::part(content) { overflow: unset;}
    }
}
</style>