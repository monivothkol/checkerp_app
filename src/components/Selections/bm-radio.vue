<template>
    <ion-radio v-bind="$attrs" label-placement="end">
        <slot></slot>
    </ion-radio>
</template>
<script setup lang="ts">
    defineOptions({
        name: "CRadio",
        description: "Radio Component"
    });
</script>
<style scoped lang="scss">
    ion-radio + ion-radio { margin-left: 16px;}
</style>
