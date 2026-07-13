<template>
    <div class="scroll_container">
        <div ref="wrapperRef" class="wrapper">
            <div v-if="isFadeTop" class="top-gradient"></div>

            <div
                ref="boxWrapperRef"
                class="box_wrapper"
                :style="{ transform: `translateY(${translateY}px)` }"
            >
                <div
                    v-for="(item, index) in items"
                    :key="index"
                    :class="['box_style', { 'is-selected': index === currentScrollIndex }]"
                >
                    <slot name="item" :item="item" :index="index">
                        {{ item }}
                    </slot>
                </div>
            </div>

            <div v-if="isFadeBottom" class="bottom-gradient"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, watch, nextTick } from "vue";
import gsap from "gsap";
import { Draggable } from "gsap/all";
import { func } from "@/utilities/func";

gsap.registerPlugin(Draggable);

interface Props {
    initialValue?: string | number;
    items: any[];
    enableDrag?: boolean;
    boxHeight?: number;
    wrapperWidth?: number;
    wrapperHeight?: number;
    isFadeTop?: boolean;
    isFadeBottom?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    initialValue: undefined,
    items: () => [],
    enableDrag: true,
    boxHeight: 56,
    wrapperWidth: 140,
    wrapperHeight: 300,
    isFadeTop: true,
    isFadeBottom: true
});

const emit = defineEmits<{
    scrollChange: [index: number, item: any];
}>();

const wrapperRef = ref<HTMLElement | null>(null);
const boxWrapperRef = ref<HTMLElement | null>(null);

const translateY = ref(0);
const currentScrollIndex = ref(0);
const isInitialSetup = ref(true);

let draggableInstance: any = null;
let startY = 0;
let startTranslateY = 0;
let lastEmittedIndex = -1;

/* -------------------- calculations -------------------- */

const centerOffset = computed(() => {
    return (props.wrapperHeight - props.boxHeight) / 2;
});

const maxTranslateY = computed(() => centerOffset.value);

const minTranslateY = computed(() => {
    const totalHeight = props.items.length * props.boxHeight;
    return centerOffset.value - totalHeight + props.boxHeight;
});

const getTranslateYForIndex = (index: number) => {
    return centerOffset.value - index * props.boxHeight;
};

/* -------------------- scaling & index detection -------------------- */

const applyScalingEffect = func(() => {
    if (!boxWrapperRef.value) return;

    const boxes = boxWrapperRef.value.querySelectorAll(".box_style");
    const wrapperCenter = props.wrapperHeight / 2;
    const maxDistance = props.wrapperHeight / 2;

    let closestIndex = 0;
    let closestDistance = Infinity;

    boxes.forEach((box: Element, index: number) => {
        const boxCenter =
            index * props.boxHeight +
            props.boxHeight / 2 +
            translateY.value;

        const distance = Math.abs(wrapperCenter - boxCenter);

        if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
        }

        gsap.set(box, {
            scale: gsap.utils.mapRange(0, maxDistance, 1, 0.85, distance),
            opacity: gsap.utils.mapRange(0, maxDistance, 1, 0.4, distance),
            fontSize: gsap.utils.mapRange(0, maxDistance, 34, 16, distance),
            fontWeight: distance < props.boxHeight / 2 ? 800 : 700
        });
    });

    currentScrollIndex.value = closestIndex;
}, "applyScalingEffect");

/* -------------------- snap logic -------------------- */

const bounceToIndex = func((index: number, instant = false) => {
    const targetIndex = Math.max(0, Math.min(props.items.length - 1, index));
    const targetY = getTranslateYForIndex(targetIndex);

    gsap.killTweensOf(translateY);

    if (instant) {
        translateY.value = targetY;
        applyScalingEffect();
        return;
    }

    gsap.to(translateY, {
        value: targetY,
        duration: 0.35,
        ease: "back.out(1.7)",
        onUpdate: applyScalingEffect,
        onComplete: () => {
            if (!isInitialSetup.value && lastEmittedIndex !== targetIndex) {
                lastEmittedIndex = targetIndex;
                emit("scrollChange", targetIndex, props.items[targetIndex]);
            }
        }
    });
}, "bounceToIndex");

/* -------------------- draggable -------------------- */

const initDraggable = func(() => {
    if (!wrapperRef.value || !props.enableDrag) return;

    const proxy = document.createElement("div");

    draggableInstance = Draggable.create(proxy, {
        trigger: wrapperRef.value,
        type: "y",
        inertia: false,
        overshootTolerance: 0,

        onPress: () => {
            startY = draggableInstance.y;
            startTranslateY = translateY.value;
            gsap.killTweensOf(translateY);
        },

        onDrag: () => {
            const dragDelta = draggableInstance.y - startY;
            let newY = startTranslateY + dragDelta;

            if (newY > maxTranslateY.value) {
                newY = maxTranslateY.value + (newY - maxTranslateY.value) * 0.3;
            } else if (newY < minTranslateY.value) {
                newY = minTranslateY.value - (minTranslateY.value - newY) * 0.3;
            }

            translateY.value = newY;
            applyScalingEffect();
        },

        onRelease: () => {
            // 🔑 KEY FIX: snap to visually closest item
            bounceToIndex(currentScrollIndex.value);
            gsap.set(proxy, { y: 0 });
        }
    })[0];
}, "initDraggable");

/* -------------------- initial setup -------------------- */

const setupInitialPosition = func(() => {
    if (!props.items.length) return;

    let index = 0;

    if (props.initialValue !== undefined) {
        const found = props.items.findIndex(
            (item: any) =>
                item === props.initialValue ||
                item?.value === props.initialValue ||
                item?.key === props.initialValue
        );
        if (found !== -1) index = found;
    }

    bounceToIndex(index, true);

    setTimeout(() => {
        isInitialSetup.value = false;
    }, 50);
}, "setupInitialPosition");

/* -------------------- lifecycle -------------------- */

onMounted(() => {
    nextTick(() => {
        initDraggable();
        setupInitialPosition();
    });
});

onUnmounted(() => {
    draggableInstance?.kill();
    gsap.killTweensOf(translateY);
});

watch(
    () => props.items,
    () => {
        nextTick(() => {
            draggableInstance?.kill();
            initDraggable();
            setupInitialPosition();
        });
    },
    { deep: true }
);

defineExpose({
    getCurrentIndex: () => currentScrollIndex.value,
    getCurrentItem: () => props.items[currentScrollIndex.value] ?? null,
    scrollToIndex: (index: number) => bounceToIndex(index)
});
</script>

<style scoped lang="scss">
.scroll_container {
    display: flex;
    justify-content: center;
    width: 100%;
}

.wrapper {
    height: v-bind('props.wrapperHeight + "px"');
    width: 100%;
    position: relative;
    overflow: hidden;
}

.box_wrapper {
    will-change: transform;
}

.top-gradient,
.bottom-gradient {
    position: absolute;
    left: 0;
    right: 0;
    height: v-bind('props.boxHeight + "px"');
    pointer-events: none;
    z-index: 10;
}

.top-gradient {
    top: 0;
    background: linear-gradient(to bottom, #fff 30%, transparent);
}

.bottom-gradient {
    bottom: 0;
    background: linear-gradient(to top, #fff 30%, transparent);
}

.box_style {
    display: flex;
    align-items: center;
    justify-content: center;
    height: v-bind('props.boxHeight + "px"');
    width: 100%;
    font-weight: 700;
    transform-origin: center;
}
</style>