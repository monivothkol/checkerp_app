<template>
    <div class="wrap_title">
        <div>
            <h1 class="txt_ellipsis">{{ props.title }}</h1>
            <ul>
                <li v-for="i in props.totalSteps" :key="i" :class="{ 'current': i === props.currentStep, 'done': i < props.currentStep }" >
                    <span>{{ i }}</span>
                </li>
            </ul>
        </div>
    </div>
</template>
<script setup lang="ts">
const props = withDefaults(defineProps<{
    title: string;
    currentStep: number;
    totalSteps: number;
}>(), {
    title: "Step Title",
    currentStep: 0,
    totalSteps: 0,
});
</script>
<style scoped lang="scss">
    .wrap_title { margin-bottom: 16px; border-bottom: 1px solid var(--colorPrimary);
        > div { max-width: 536px; margin: 0 auto; height: 60px; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        h1 { font-size: var(--font18); font-weight: 600; line-height: 140%; color: var(--colorPrimary); flex: 1; }
        ul { display: flex; align-items: center; gap: 8px;
            li { display: flex; align-items: center; justify-content: center; text-indent: -9999px; width: 12px; height: 12px; border-radius: 50%; background: #CCCCCC; color: #FFFFFF; font-size: var(--font14); font-weight: 600; line-height: 1; text-align: center; 
                &.done { background: var(--colorPrimary); }
                &.current { background: var(--colorPrimary); text-indent: 0; width: 24px; height: 24px; }
            }
        }
    }
</style>