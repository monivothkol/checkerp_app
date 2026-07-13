<template>
    <ion-button v-bind="$attrs" :disabled="props.disabledButton" :class="{'disabled': props.disabledButton}" expand="block">
         <slot></slot>
    </ion-button>
</template>
<script setup lang="ts">
const props = defineProps({
    disabledButton: {
        type: Boolean,
        default: false
    }
});
</script>
<style scoped lang="scss">
    .full { width: 100%;}
</style>