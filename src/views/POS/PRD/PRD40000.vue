<template>
    <ModuleResultScreen :config="config" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ModuleResultScreen from "@/core/components/module/ModuleResultScreen.vue";
import { MODULE_CONFIGS } from "@/core/modules/module-screen-config";

export default defineComponent({
    name: "PRD40000",
    components: { ModuleResultScreen },
    data() {
        return { config: MODULE_CONFIGS.PRD };
    }
});
</script>
