<template>
    <div class="wrap_phone_call">
        <p class="phone ">{{ props.phone }}</p>
    </div>
</template>
<script setup lang="ts">
interface Props {
    phone: string,
}

const props = withDefaults(defineProps<Props>(), {
    phone: "N/A",
});
</script>
<style scoped lang="scss">
    .wrap_phone_call { display: flex; border-radius: var(--radius8); background: #E9EBF0 url("@/assets/images/ico_phone_call.svg") no-repeat right 16px center; padding: 16px; align-items: center;
        .phone { font-size: var(--font18); font-weight: 700; line-height: 140%; color: var(--fontColor02); }
    }
</style>