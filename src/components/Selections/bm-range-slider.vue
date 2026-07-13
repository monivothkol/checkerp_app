<template>
    <div v-if="type == 'single'">
        <!-- <label>
            <slot name="label"></slot> ({{ rangeSliderValue }})
        </label>
        <bm-range v-model="rangeSliderValue" :min="props.min" :max="props.max" :step="props.step" color="primary">
            <ion-icon icon="volume-low-outline" slot="start"></ion-icon>
            <ion-icon icon="volume-high-outline" slot="end"></ion-icon>
        </ion-range> -->
            <ion-range v-model="rangeSliderValue" :min="sliderMin" :max="sliderMax" :snaps="true" :step="sliderStep" color="primary"></ion-range>
    </div>
    <div v-else-if="type == 'dual'">
        <label>
            <slot name="label"></slot> ({{ dualRangeSlider.lower }} - {{ dualRangeSlider.upper }})
        </label>
        <bm-range v-model="dualRangeSlider" dual-knobs :min="props.min" :max="props.max" :step="props.step" color="primary">
            <ion-label slot="start">${{ dualRangeSlider.lower }}</ion-label>
            <ion-label slot="end">${{ dualRangeSlider.upper }}</ion-label>
        </bm-range>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

/**
 * Description:
 *   type: There are two options for the range slider: "single" or "dual'.
 *   rangeValue: The model value of a range slider type "single"
 *   dualRangeValue: The model value of a range slider type "dual"
 *   min: The minimum of range slider (used when customSteps is not provided)
 *   max: The maximum of range slider (used when customSteps is not provided)
 *   step: The move value of the range slider determines how much the value increases with each step (used when customSteps is not provided)
 *   customSteps: An array of custom step values (e.g., [1, 3, 6, 12, 24]). When provided, the slider will use these specific values instead of linear progression
 *   color: Color can be "primary" or "secondary"
*/
interface DualRangeInFo {
    lower: number
    upper: number
};

interface CInputPhoneProps {
    type: string
    rangeValue?: number
    dualRangeValue?: DualRangeInFo
    min?: number,
    max?: number,
    step?: number,
    customSteps?: number[]
};

const props = withDefaults(defineProps<CInputPhoneProps>(), {
    type: "single",
    rangeValue: 0,
    dualRangeValue: () => ({ lower: 0, upper: 0 }),
    min: 0,
    max: 100,
    step: 1,
    customSteps: () => []
});

const emit = defineEmits(["update:rangeValue", "update:dualRangeValue"]);

// Computed properties for slider configuration
const sliderMin = computed(() => {
    return props.customSteps && props.customSteps.length > 0 ? 0 : props.min;
});

const sliderMax = computed(() => {
    return props.customSteps && props.customSteps.length > 0
        ? props.customSteps.length - 1
        : props.max;
});

const sliderStep = computed(() => {
    return props.customSteps && props.customSteps.length > 0 ? 1 : props.step;
});

// Helper function to get custom value by index
const getCustomValueByIndex = (index: number): number => {
    if (props.customSteps && props.customSteps.length > 0) {
        return props.customSteps[Math.max(0, Math.min(index, props.customSteps.length - 1))];
    }
    return index;
};

// Helper function to get index by custom value
const getIndexByCustomValue = (value: number): number => {
    if (props.customSteps && props.customSteps.length > 0) {
        const index = props.customSteps.indexOf(value);
        return index >= 0 ? index : 0;
    }
    return value;
};

const rangeSliderValue = computed({
    get: () => {
        if (props.customSteps && props.customSteps.length > 0) {
            return getIndexByCustomValue(props.rangeValue || 0);
        }
        return props.rangeValue;
    },
    set: (value: number) => {
        const actualValue = props.customSteps && props.customSteps.length > 0
            ? getCustomValueByIndex(value)
            : value;

        if (actualValue !== props.rangeValue) {
            emit("update:rangeValue", actualValue);
        }
    },
});

const dualRangeSlider = computed({
    get: () => props.dualRangeValue,
    set: (value: DualRangeInFo) => {
        if (
            value.lower !== props.dualRangeValue.lower ||
            value.upper !== props.dualRangeValue.upper
        ) {
            emit("update:dualRangeValue", value);
        }
    },
});
</script>

<style scoped lang="scss">

</style>
