<template>
    <div class="wrap_progress_bar">
        <div v-if="props.title" class="progress_bar_title">{{ props.title }}</div>
        <div class="progress_bar">
            <div class="progress_bar_inner" :style="{ width: animatedWidth + '%' }"></div>
        </div>
        <div class="progress_bar_text">
            <span class="progress_percentage">{{formatNumberWithUnit(animatedPercentage,'%')}}</span>
            <span class="progress_current">{{ formatNumber(animatedCurrent) }}/{{ formatNumber(props.total) }} {{ props.unit }}</span>
        </div>
    </div>
</template>
<script setup lang="ts">
    import { ref, onMounted, watch } from "vue";

    defineOptions({
        name: "BMProgressBar",
        description: "BM Progress Bar"
    });

    const props = withDefaults(defineProps<{
        title: string;
        current: number;
        total: number;
        unit: string;
    }>(), {
        title: "",
        current: 0,
        total: 0,
        unit: "",
    });

    const animatedWidth = ref(0);
    const animatedCurrent = ref(0);
    const animatedPercentage = ref(0);

    const targetPercentage = () => Math.round((Number(props.current) / Number(props.total)) * 100) || 0;

    const animateValues = () => {
        const duration = 1500;
        const startTime = performance.now();
        const targetCurrent = Number(props.current);
        const targetPercent = targetPercentage();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);

            animatedCurrent.value = Math.round(targetCurrent * easeOut);
            animatedPercentage.value = Math.round(targetPercent * easeOut);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animatedWidth.value = targetPercent;
        requestAnimationFrame(animate);
    };

    onMounted(() => {
        setTimeout(() => {
            animateValues();
        }, 100);
    });

    watch(() => [props.current, props.total], () => {
        animateValues();
    });

    const formatNumber = (value: number) => {
        return value.toLocaleString();
    };

    const formatNumberWithUnit = (value: number, unit: string) => {
        return value.toLocaleString() + unit;
    };
</script>
<style scoped lang="scss">
    .wrap_progress_bar { width: 100%;
        &:not(:first-child) { margin-top: 16px; }
        .progress_bar { width: 100%; height: 8px; background: #DDDDDD;  border-radius: var(--radius8); overflow: hidden; margin: 6px 0;
            .progress_bar_inner { width: 0%; height: 100%; background: var(--colorPrimary); transition: width 1500ms cubic-bezier(0.4, 0, 0.2, 1); }
        }
        .progress_bar_title { color: var(--fontColor02); font-size: var(--font12); font-weight: 600; line-height: 140%; }
        .progress_bar_text { text-align: right; display: flex; justify-content: space-between; align-items: center;
            .progress_current { color: var(--fontColor02); font-size: var(--font12); font-weight: 600; line-height: 140%; }
            .progress_percentage { color: var(--fontColor02); font-size: var(--font12); font-weight: 600; line-height: 140%; }
        }
    }
</style>