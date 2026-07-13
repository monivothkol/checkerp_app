<template>
    <ion-list v-bind="$attrs" :class="[$attrs.class, 'bm-list']">
        <ion-list-header v-if="$slots.header">
            <slot name="header"></slot>
        </ion-list-header>

        <!-- Static list items (manual items in template) -->
        <!-- <bm-item v-if="$slots.list" lines="none" @click="onClickItem">
            <slot name="list"></slot>
        </bm-item> -->

        <!-- Dynamic list items (loop through list prop) -->
        <template v-for="(item, index) in dataList" :key="item">
            <bm-item @click="onClickItem(item)">
                <slot name="item" :item="item" :index="index"></slot>
            </bm-item>
        </template>

        <!-- Infinite Scroll Implementation (only for dynamic mode) -->
        <ion-infinite-scroll v-if="props.infiniteScroll" :disabled="isDisableScroll" :threshold="100" @ion-infinite="onScrollHandler" >
            <ion-infinite-scroll-content loading-spinner="crescent"></ion-infinite-scroll-content>
        </ion-infinite-scroll>

        <!-- Empty state when no items (only for dynamic mode) -->
        <bm-item v-if="isDynamicMode && dataList.length === 0">
            <bm-empty-state :description="$t(props.emptyStateDescription)"></bm-empty-state>
        </bm-item>
    </ion-list>
</template>

<script lang="ts" setup>
import { func } from "@/utilities/func";
import { InfiniteScrollCustomEvent } from "@ionic/vue";
import { computed, onMounted, ref, useSlots, watch } from "vue";

const $slots = useSlots();

interface Props {
    infiniteScroll?: boolean;
    totalCount?: number;
    list?: any[];
    emptyStateDescription?: string;
}

const props = withDefaults(defineProps<Props>(), {
    infiniteScroll: false,
    totalCount: 0,
    emptyStateDescription: "MISC.EMPTY_STATE.NO_DATA",
    list: () => []
});

const dataList = ref<any[]>([]);

const emit = defineEmits(["loading", "onClickItem"]);

const onClickItem = func( (item: any) => {
    emit("onClickItem", item);
});

watch(() => props.list, (newVal) => {
    dataList.value = newVal || [];
}, { immediate: true });

const isDynamicMode = computed(() => {
    // Dynamic mode: has item slot and list prop with items
    return $slots.item && props.list;
});

// Return list items only when in dynamic mode
// const dynamicList = computed(() => {
//     return dataList.value || [];
// });

watch(() => dataList.value, (newVal) => {
    dataList.value = newVal;
});

// Computed property to determine if infinite scroll should be shown
const isDisableScroll = computed(() => {
    if (!props.infiniteScroll) return true;
    if (props.totalCount <= 0) return true;
    return dataList.value.length >= props.totalCount;
});

const onScrollHandler = (event: InfiniteScrollCustomEvent) => {
    setTimeout(() => {
        emit("loading", event);
    }, 1000);
};

onMounted(() => {
    dataList.value = props.list || [];
});

</script>

<style scoped lang="scss">
    ion-list { --background: transparent; background-color: transparent; margin-left: -16px; margin-right: -16px;
        ion-item { --background: transparent; background-color: transparent; overflow: unset;
            &:not(:first-child) { margin-top: 16px;}
            &:has(> .wrap_nodata) { margin-top: 0;}
        }
        &.gap8 {
            ion-item {
                &:not(:first-child) { margin-top: 8px;}
            }
        }
    }
</style>
