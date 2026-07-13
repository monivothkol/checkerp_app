<template>
    <div class="wrap_email">
        <p class="email">{{ props.email }}</p>
    </div>
</template>
<script setup lang="ts">
interface Props {
    email: string,
}

const props = withDefaults(defineProps<Props>(), {
    email: "N/A",
});
</script>
<style scoped lang="scss">
    .wrap_email { display: flex; border-radius: var(--radius8); background: #E9EBF0 url("@/assets/images/ico_email.svg") no-repeat right 16px center; padding: 16px; align-items: center;
        .email { font-size: var(--font18); font-weight: 700; line-height: 140%; color: var(--fontColor02); }
    }
</style>