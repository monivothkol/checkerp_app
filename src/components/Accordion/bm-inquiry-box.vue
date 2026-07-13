<template>
    <div class="inquiry_box">
        <ion-accordion-group ref="accordionGroup" >
            <ion-accordion >
                <ion-item slot="header">
                    <ion-label class="inquiry_title">{{ $t(props.title) }}</ion-label>
                </ion-item>
                <div slot="content" class="inquiry_box_content">
                    <div class="wrap_content">
                        <slot name="content" />
                    </div>
                </div>
            </ion-accordion>
        </ion-accordion-group>
    </div>
</template>
<script setup lang="ts">

const props = withDefaults(defineProps<{
    title?: string
}>(), {
    title: "MISC.ACCORDION.INQUIRY_CONDITION"
});

</script>
<style scoped lang="scss">
/* Inquiry Box */
.inquiry_box { margin: 0 -16px; position: sticky; top: 0; z-index: 9999;
	ion-accordion { padding: 0 16px; border-radius: 0 0 8px 8px; box-shadow: 0 8px 24px 0 rgba(149, 157, 165, 0.20);
		ion-item { --background: transparent; margin-bottom: 10px; max-width: 536px; margin: 0 auto 10px;}
		.inquiry_title { font-size: var(--font16); font-weight: 600; line-height: 140%; color: var(--fontColor01);}
	}
    .inquiry_box_content { padding-bottom: 16px;}
}

/* end of Inquiry Box */
</style>
