<template>
    <div :class="{ 'cont_wrap': props.category !== 'profile' }">
        <!-- Preview PDF or DOC -->
         <ion-avatar v-if="isFile">
			<p class="ico_file" @click.stop="onPreviewFile">{{ props.fileName }}</p>
        </ion-avatar>

        <!-- For Loan Process Only -->
         <ion-avatar v-else-if="props.isDocument">
			<p class="ico_file" @click.stop="emit('onClickDocument')">PDF</p>
        </ion-avatar>

        <!-- Preview Image -->
        <ion-avatar v-else>
            <img :src="displayImage" alt="avatar"
                style="user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;" :draggable="false"
                loading="lazy" @error="displayImage = placeholderImage" @click.stop="onPreviewImage">
        </ion-avatar>

        <slot></slot>
    </div>
</template>
<script setup lang="ts">
import sampleImage from "@/assets/images/ico_image_placeholder.svg";
import tempProfile from "@/assets/images/ico_profile_holder.svg";
import DocumentUploadService from "@/services/document-upload-service";
import { func } from "@/utilities/func";
import { BizCheckMobileApp, BizCheckMobileAppSocial, BizCheckMobileDateTime, BizCheckMobileLogger } from "@/shared/bizcheckmobile";
import { computed, onMounted, ref, watch } from "vue";
import DialogUtil from "@/utilities/dialog-util";

interface Props {
    base64?: string;
    fileId?: string;
    category?: "profile" | "document";
    fileContentType?: string;
    fileName?: string;
    enablePreview?: boolean,
    filePaths?: Array<string>,
    activeIndex?: number,
	isDocument?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    removable: false,
    base64: "",
    category: "profile",
    fileId: "",
    fileContentType: "",
    fileName: "",
    enablePreview: true,
    filePaths: () => [],
    activeIndex: 0,
    isDocument: false,
});

const displayImage = ref(props.base64);
const documentUpload = new DocumentUploadService();
const placeholderImage = computed(() => props.category === "profile" ? tempProfile : sampleImage);
const imagePath = ref<Array<any>>(props.filePaths);
const startPosition = ref<number>(props.activeIndex);
const emit = defineEmits(["onClickImage", "onClickDocument"]);

watch(() => props.fileId, (newVal) => {
    if (newVal !== "") {
        displayImage.value = "";
        documentUpload.viewImage(props.fileId).then((response) => {
            displayImage.value = response.base64;
            imagePath.value.push(response.filePath);
        });
    }
});

watch( () => props.filePaths, (newVal) => {
    BizCheckMobileLogger.info("file-paths => ", imagePath.value, newVal);
    imagePath.value = newVal;
});

watch(() => displayImage.value, (newVal) => {
    displayImage.value = newVal;
});

watch(() => props.activeIndex, (newVal) => {
    BizCheckMobileLogger.info("activeIndex => ", props.activeIndex, newVal);
   startPosition.value = newVal;
});

watch(() => props.base64, (newVal) => {
    if (newVal !== "") {
        displayImage.value = newVal;
    }
}, { immediate: true });

const isFile = computed(() => {
    return props.fileContentType?.startsWith("application");
});

onMounted(() => {
    if (props.fileId !== "") {
        displayImage.value = "";
        documentUpload.viewImage(props.fileId).then((response) => {
            displayImage.value = response.base64;
            imagePath.value.push(response.filePath);
        });
    }

    if (props.base64 !== "") {
        displayImage.value = props.base64;
    }
});

const onPreviewImage = func(() => {
    emit("onClickImage");
    if ( !props.enablePreview ) return;
    setTimeout(() => {
        BizCheckMobileApp.callPlugin({
            pluginKey: "IMAGE_PREVIEW_PLUGIN",
            params: {
                header: {
                    result: true,
                    error_code: "",
                    erro_message: "",
                },
                body: {
                    image_urls: imagePath.value,
                    start_position: startPosition.value,
                    title: "Preview Image",
                }
            },
            callback: (response) => {
                BizCheckMobileLogger.info("Callback", response);
            }
        });
    }, 100);
});

const onPreviewFile = func(() => {
    BizCheckMobileLogger.info("fileId => ", props.fileId);
    if (props.fileContentType === "application/pdf") {
        documentUpload.downloadFile({ fileId: props.fileId, viewMode: "download" });
    } else {
        // let fileExtension = props.fileContentType?.split("/").pop() || "file";
        // if (props.fileContentType?.includes("word") || props.fileContentType?.includes("officedocument.wordprocessingml")) {
        //     fileExtension = "docx";
        // } else if (props.fileContentType?.includes("sheet") || props.fileContentType?.includes("excel")) {
        //     fileExtension = "xlsx";
        // }
        let fileExtension = props.fileName?.split(".").pop() || "file";
        BizCheckMobileLogger.info("fileExtension => ", fileExtension);
        documentUpload.download({
            fileId: props.fileId,
            trcode: "DFD01001I01",
            expiredDate: BizCheckMobileDateTime.getCurrentDate(),
            extension: fileExtension,
            viewMode: "download",
            callback: (response: any) => {
                if (response.url_list && response.url_list.length > 0) {
                    const filePath = response.url_list[0].file_path;
                    const fileName = props.fileName;
                    BizCheckMobileAppSocial.shareFile({
                        filePath: filePath,
                        title: fileName,
                        callback: (shareResponse: any) => {
                            BizCheckMobileLogger.log("Share file response: ", shareResponse);
                            // DialogUtil.showToast({ message: "downloaded successfully " + fileName, duration: 1000 });
                        }
                    });
                } else {
                    DialogUtil.showToast({ message: "download failed" });
                }
            }
        });
    }
});

</script>

<style scoped lang="scss">
.profile_image {
    .cont_wrap {
        height: 48px;
        width: 48px;
        background: transparent;
        border: none;
    }
    .cont_wrap { min-width: 64px; position: relative; width: 64px; height: 64px; border-radius: var(--radius8); border: 1px solid #D9D9D9; background: #FFFFFF; overflow: hidden;
        ion-avatar { width: 100%; height: 100%; --border-radius: 8px; overflow: hidden;}
        .btn_remove { position: absolute; top: 4px; right: 4px; text-indent: -999px; width: 18px; min-height: 18px; height: 18px; text-indent: -999px; --background: transparent; background: #FFFFFF url("@/assets/images/ico_remove_red.svg") no-repeat center center; border-radius: var(--radius8);
            &::after { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 200%; height: 200%; }
        }
    }

}
.ico_file { text-overflow: ellipsis; white-space: nowrap; overflow: hidden; padding: 42px 8px 4px; text-align: center; font-size: 0.5rem; font-size: 400; line-height: 140%; color: var(--fontColor02);
  &::before { content: ''; position: absolute; top: 14px; left: calc(50% - 12px); width: 24px; height: 24px; background: url("@/assets/images/ico_file.svg") no-repeat center; }
    &.type_image::before { background-image: url("@/assets/images/ico_image_placeholder.svg"); }
}
</style>
