<template>
    <ion-accordion-group ref="accordionGroup" class="collapse_box" :multiple="props.multiple" :value="props.value">
        <slot></slot>
    </ion-accordion-group>
</template>

<script setup lang="ts">
    defineOptions({
        name: "BMCollapseBoxGroup",
        description: "Collapse Box Group",
    });

    const props = withDefaults(defineProps<{
        multiple?: boolean;
        value?: any;
    }>(), {
        multiple: true,
        value: "",
    });

</script>

<style scoped lang="scss">
.collapse_box {
	ion-accordion { background: transparent;
		.collapse_header { height: 44px; border-bottom: 1px solid #D9D9D9; --background: transparent;
            .collapse_title { margin-right: 0; font-size: var(--font16); font-weight: 600; line-height: 140%; color: var(--fontColor01);}
        }
		.collapse_content { padding-top: 16px; }
	}
}
</style>