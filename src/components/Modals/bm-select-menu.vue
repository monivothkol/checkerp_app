<template>
    <div class="modal_wrapper">
        <div class="modal_header">
            <ion-label>{{ title }}</ion-label>
            <p class="txt_message">{{ message }}</p>
			<div class="marBot16">
				<bm-input-search v-if="searchable" v-model="form.search" :show-clear-button="'never'" @focus="isSearchFocused = true" @blur="isSearchFocused = false"></bm-input-search>
			</div>
        </div>
        <div class="modal_content">
            <div class="formwrap">

                <div :key="form.search" class="component_group">
                    <bm-radio-group v-model="form.selected" :options="options" class="list_rdo02">
                        <template v-if="filteredOptions.length > 0 && !props.isFooter">
                            <div v-for="option in filteredOptions" :key="option.value" class="selection_group " @click="onClickFooterButtonConfirm(option)">
                                <bm-radio :value="option.value">{{ option.label }}</bm-radio>
                            </div>
                        </template>
                        <template v-else-if="filteredOptions.length > 0 && props.isFooter">
                            <div v-for="option in filteredOptions" :key="option.value" class="selection_group ">
                                <bm-radio :value="option.value">{{ option.label }}</bm-radio>
                            </div>
                        </template>
                        <template v-else>
                            <bm-empty-state />
                        </template>
                    </bm-radio-group>
                </div>
            </div>
        </div>
        <div v-if="props.isFooter" class="modal_footer">
            <bm-button
                v-for="button in getFooterButtons()"
                v-show="!(button.type === 'negative' && isSearchFocused)"
                :key="button.label"
                :class="[getButtonClass(button.type)]"
                :disabled="button.type === 'positive' && !form.selected"
                @click="onClickFooterButton(button.type)"
            >{{ button.label }}</bm-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { func } from "@/utilities/func";
import DialogUtil from "@/utilities/dialog-util";
interface Props {
    disabled: boolean;
    title: string;
    message: string;
    selected: string;
    searchable: boolean;
	isFooter?: boolean;
    options: Array<{ label: string; value: string }>;
    footerButtons?: Array<{ label: string; type: "negative" | "positive" }>;
}

const props = withDefaults(defineProps<Props>(), {
    title: "Dropdown Menu",
    message: "Please select an option below:",
    selected: "",
    searchable: false,
    options: () => [],
    footerButtons: () => [
        { label: "Close", type: "negative" },
        { label: "Confirm", type: "positive" }
    ],
    isFooter: false
});

const form = ref({
    search: "",
    selected: props.selected,
});

const isSearchFocused = ref(false);

const filteredOptions = computed(() => {

    if (props.searchable && form.value.search) {
        return props.options.filter((option) => {
            return option.label.toLowerCase().includes(form.value.search.toLowerCase());
        });
    }

    return props.options;
});

const getFooterButtons = func(() => {
    return props.footerButtons.map((button) => {
        return {
            label: button.label,
            type: button.type
        };
    });
}, "getFooterButtons");

const getButtonClass = computed(() => {
    return (type: "negative" | "positive") => {
        return type === "negative" ? "btn02" : "btn01";
    };
});

const onClickFooterButton = func((type: "negative" | "positive") => {
    if (type === "negative") {
        DialogUtil.closeDialog({ role: "cancel" });
    } else {
        const selectedOption = props.options.find((option) => option.value === form.value.selected);
        DialogUtil.closeDialog({
            role: "confirm",
            data: {
                value: form.value.selected,
                option: selectedOption
            }
        });
    }
}, "onClickFooterButton");

const onClickFooterButtonConfirm = func((option: { label: string; value: string }) => {
	DialogUtil.closeDialog({ role: "confirm", data: { value: option.value, option: option } });
}, "onClickFooterButtonConfirm");

</script>

<style scoped lang="scss">
.component_group { display: flex; flex-direction: column; gap: 16px;}
.selection_group { display: flex; align-items: center; gap: 12px;
    label { font-weight: 500; color: var(--ion-color-dark);
        &.disabled { opacity: 0.6; }
    }
}
.txt_message { font-size: var(--font14); font-weight: 500; line-height: 18px; color: #999999;}
.modal_header { flex-direction: column; gap: 8px;}
</style>
