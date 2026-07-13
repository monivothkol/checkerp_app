<template>
    <div>
		<ion-label v-if="slots.label !== undefined" class="lbl txt_ellipsis">
			<slot name="label"></slot>
		</ion-label>
        <ion-segment :scrollable="true" :swipe-gesture="false" v-bind="$attrs" :value="props.value" :class="props.class">
            <slot></slot>
        </ion-segment>
    </div>
</template>

<script setup lang="ts">
import { useSlots } from "vue";
const slots = useSlots();
interface Props {
    value?: string;
    class?: string;
}

const props = withDefaults(defineProps<Props>(), {
    value: "",
    class: "",
});
</script>

<style scoped lang="scss">
.lbl { display: block; color: var(--fontColor02); font-size: var(--font12); font-weight: 600; line-height: 140%; margin-bottom: 4px;}
    ion-segment { --height: 44px; background: #FFFFFF; border: 1px solid #D9D9D9; border-radius: var(--radius8); padding: 4px;
        ion-segment-button {  --border-width: 0 !important;
            &::before { display: none !important;}
        }
    }
    /* segment with border bottom to the edge of the screen */
    ion-segment.segment01 { border: none; background: transparent; border-radius: 0; width: max-content; padding: 0; min-width: 100%; margin-top: 4px;
        ion-segment-button {  --padding-start: 10px; --padding-end: 10px; --background: transparent; --indicator-color: transparent; margin: 0 !important; --border-radius: 8px 8px 0 0; min-height: 38px;
            &.segment-button-checked {  background: var(--colorPrimary); color: #FFFFFF; }
            &:before { display: none;}

        }
    }
</style>