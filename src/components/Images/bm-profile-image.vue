<template>
    <ion-avatar :class="props.size" v-bind="$attrs">
        <b-image :source="props.src || tempProfile" alt="profile" category="profile" />
    </ion-avatar>
</template>
<script setup lang="ts">
import tempProfile from "@/assets/images/ico_doc.svg";
defineOptions({
    name: "BProfileImage",
    description: "BProfileImage component"
});

const props = withDefaults(defineProps<{
    size?: "small" | "medium" | "large" |"";
    src?: string;
}>(), {
    size: "",
    src: tempProfile
});


</script>

<style scoped lang="scss">
.small { width: 48px; height: 48px; min-width: 48px; min-height: 48px; margin: 0 auto;}
.medium { width: 64px; height: 64px; min-width: 64px; min-height: 64px; margin: 0 auto;}
.large { height: 128px; width: 128px;}
</style>
