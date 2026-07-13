<template>
    <ion-item v-bind="$attrs" lines="none">
        <slot></slot>
    </ion-item>
</template>

<script lang="ts" setup>

</script>

<style lang="scss" scoped>
    ion-item { --background: transparent; background-color: transparent; --min-height: unset; --inner-padding-start: 16px; --inner-padding-end:16px;
        &:not(:first-child) { margin-top: 16px;}
    }
</style>