<template>
    <ion-radio v-bind="$attrs" class="radio_card">
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
    ion-radio + ion-radio { margin-top: 16px;}
    .radio_card { margin: 0; background: #FFFFFF; position: relative; background-image: unset; height: max-content;  border-radius: var(--radius8); box-shadow: 0 8px 24px 0 rgba(149, 157, 165, 0.20); 
        &::part(label) { margin: 0;}
        &::before { content: ""; z-index: 1; position: absolute; top: 0; left: 0px; width: calc(100% - 2px); height: calc(100% - 2px); border: 0px solid #D9D9D9; border-radius: var(--radius8);}
        &.radio-checked { 
            &::before { border: 1px solid var(--colorPrimary)}
        }
    }
    
</style>
