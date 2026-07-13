<template>
    <ion-label class="lbl txt_ellipsis">
        <slot name="label"></slot>
    </ion-label>
    <div class="upload_wrapper">
        <div v-if="base64StringList.length > 0" class="wrap_image">
            <bm-image v-for="(base64, index) in base64StringList" :key="index" :base64="base64" :category="'document'" :enable-preview="props.enablePreview" :file-paths="imagePath" :active-index="activeIndex" @on-click-image="onClick(index)">
                <bm-button class="btn_remove" @click.stop="onRemove(index, 'base64')">{{ $t('COMMON.BM_UPLOAD_IMAGE.REMOVE') }}</bm-button>
            </bm-image>
        </div>
        <bm-button v-if="base64StringList.length < props.limit"  class="btn_upload" @click="upload">{{ $t('COMMON.BM_UPLOAD_IMAGE.UPLOAD') }}</bm-button>
    </div>
</template>
<script setup lang="ts">
import DocumentUploadService from "@/services/document-upload-service";
import DialogUtil from "@/utilities/dialog-util";
import { func } from "@/utilities/func";
import { BizCheckMobileLogger } from "@/shared/bizcheckmobile";
import { onMounted, ref, watch } from "vue";

interface Props {
    limit?: number,
    fileIdList?: Array<{fileId: string, fileName: string, fileContentType: string}>,
    base64List?: Array<string>,
    enablePreview?: boolean,
	isSaveBase64?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    limit: 5,
    fileIdList: () => [],
    base64List: () => [],
    enablePreview: true,
    isSaveBase64: true
});
const isSaveBase64 = ref<boolean>(props.isSaveBase64);
const filesIDList = ref<Array<any>>(new Array());
const base64StringList = ref<Array<any>>([]);
const uploadImage = new DocumentUploadService();
const uploadedFilesList = ref<Array<any>>(new Array());
const imagePath = ref<Array<any>>([]);
const activeIndex = ref<number>(0);

onMounted( () => {
    BizCheckMobileLogger.info("base64StringList => ", base64StringList.value);
});

const emit = defineEmits(["onComplete"]);

watch( () => props.base64List , (newVal) => {
    if ( newVal ) {
        filesIDList.value = [];
        base64StringList.value = [];
        uploadedFilesList.value = [];
        base64StringList.value = newVal;
        if(isSaveBase64.value) {
            saveBase64Image();
        }
    }
});

watch( () => props.fileIdList , (newVal) => {
    if ( newVal ) {
        BizCheckMobileLogger.info("fileIDList: => ", props.fileIdList);
        filesIDList.value = [];
        base64StringList.value = [];
        uploadedFilesList.value = [];
        filesIDList.value = newVal;
        viewFileImage();
    }
});

const onRemove = func( (index: number, type: "fileID" | "base64") => {

    if (type === "base64") {
        base64StringList.value = base64StringList.value.filter((_, i) => i !== index);
    }

    if ( type === "fileID" ) {
        filesIDList.value = filesIDList.value.filter((_, i) => i !== index);
    }

    uploadedFilesList.value = uploadedFilesList.value.filter((_, i) => i !== index);

    imagePath.value = imagePath.value.filter((_, i) => i !== index);

    BizCheckMobileLogger.info("imagePath => ", imagePath.value, index);
    emit("onComplete", imagePath.value);
});

const onClick = func( (index: any) => {
    BizCheckMobileLogger.info("onClick => ",index);
    activeIndex.value =  index;
});

// const upload = func( () => {
//     uploadImage.uploadImage({
//         callback: (response) => {
//             BizCheckMobileLogger.info("uploadFromGallery response: ", response);
//             uploadedFilesList.value.push({ fileId: response.fileList[0].fileId, fileName: response.fileList[0].originalFileName, fileContentType: response.fileList[0].fileContentType });
//             base64StringList.value.push(response.base64);
//             imagePath.value = [...imagePath.value, ...response.filePaths];
//             emit("onComplete", imagePath.value);
//             DialogUtil.closeLoading();
//         }
//     });
// });

const upload = func( () => {
uploadImage.pickFile({
			callback: (response: any) => {
				BizCheckMobileLogger.info("response=====>: ", response);
				if (response) {
					const imagePathPicked = [response.uri];
					uploadImage.reSize({
						imagePaths: imagePathPicked,
						fileSize: response.size,
						width: response.width,
						height: response.height,
						callback: () => {
                            // uploadedFilesList.value.push({ fileId: response.fileList[0].fileId, fileName: response.fileList[0].originalFileName, fileContentType: response.fileList[0].fileContentType });
                            base64StringList.value.push(uploadImage.toBase64DataUri(response.base64));
                            imagePath.value = [...imagePath.value, ...imagePathPicked];
                            emit("onComplete", imagePath.value, base64StringList.value);
                            DialogUtil.closeLoading();
							BizCheckMobileLogger.info("after picked image: " , imagePath.value, imagePathPicked);
						}
					});
				} else {
					BizCheckMobileLogger.error("No image found in response", response);
				}
			}
		});
});

const saveBase64Image = func( () => {
    const promises = base64StringList.value.map((element, index) => {
        const fileName = `Image_ID_${index}`;
        return uploadImage.saveBase64Image({
            base64: element,
            fileName: fileName
        });
    });

    Promise.all(promises).then((results) => {
        uploadedFilesList.value = results.map(result => ({ ...result.fileList[0] }));
        emit("onComplete", imagePath.value);
    }).catch(error => {
        BizCheckMobileLogger.error("saveBase64Image error: ", error);
    });
});

const viewFileImage = func( () => {
    const promises = filesIDList.value.map(element => uploadImage.viewImage(element.fileId));

    Promise.all(promises).then((results) => {
        base64StringList.value = results.map(r => r.base64);
        imagePath.value = results.map(r => r.filePath);
        uploadedFilesList.value = [...filesIDList.value];

        BizCheckMobileLogger.info("viewFileImage complete: ", imagePath.value);
        emit("onComplete", imagePath.value);
    }).catch(error => {
        BizCheckMobileLogger.error("viewFileImage error: ", error);
    });
});

</script>
<style scoped lang="scss">
    .lbl { display: block; color: var(--fontColor02); font-size: var(--font12); font-weight: 600; line-height: 140%; margin-bottom: 4px;}
    .upload_wrapper { display: flex; gap: 8px; flex-wrap: wrap;
        .wrap_image { position: relative; display: flex;
            ion-avatar { width: 100%; height: 100%; border-radius: 8px; overflow: hidden;}
            .btn_remove { position: absolute; top: 4px; right: 4px; text-indent: -999px; width: 18px; min-height: 18px; height: 18px; text-indent: -999px; --background: transparent; background: #D9D9D9 url("@/assets/images/ico_remove_red.svg") no-repeat center center; border-radius: var(--radius8);
                &::after { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 200%; height: 200%; }
            }
            > :not(:last-child) { margin-right: 8px;}
        }
        .btn_upload { min-width: 64px; width: 64px; height: 64px; text-indent: -999px; --background: transparent; background: #D9D9D9 url("@/assets/images/ico_ring_plus.svg") no-repeat center center; border-radius: var(--radius8);
            &:active { box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25) inset;}
        }
    }
</style>
