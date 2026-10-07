<template>
    <ModuleCreateScreen :config="config" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ModuleCreateScreen from "@/core/components/module/ModuleCreateScreen.vue";
import { MODULE_CONFIGS } from "@/core/modules/module-screen-config";

export default defineComponent({
    name: "SUP20000",
    components: { ModuleCreateScreen },
    data() {
        return { config: MODULE_CONFIGS.SUP };
    }
});
</script>
