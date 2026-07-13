/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import BizCheckMobileApp from "./bizcheckmobile-app";

const bizCheckMobile = window.bizCheckMobile;
class File {
    private static instance: File;

    // Private constructor to prevent direct instantiation
    private constructor() { }

    // Get the singleton instance
    static getInstance(): File {

        if (!this.instance) {
            this.instance = new File();
        }
        return this.instance;

    }

    /**
     * @author Rethysen
     * @namespace remove
     * @param {*} option
     * @param {String[]} option.sourcePath    - Array List of source path
     * @param {Function} option.callback      - callback function after file was removed
     * 
     * @example
     * BizCheckMobileFile.remove({
     *  sourcePath: [filePath],
     *  callback: () => {....}
     * });
     */
    remove(option: { sourcePath: string[], callback: (result: any) => void }) {
        bizCheckMobile.gateway("File", "remove", {_bMock: false, _aSourcePath: option.sourcePath, _fCallback: option.callback});
    }

    /**
     * @author Rethysen
     * @namespace downloadBase64
     * @param {*} option
     * @param {String} option.base64String  - base64String Base64 of image file that need download as file.
     * @param {String} option.fileName      - fileName file name for store in directory
     * @param {String} option.targetPath    - targetPath target folder for store image. It's optional
     * @param {Function} option.callback      - callback function after file download
     * 
     * @@example
     * BizCheckMobileFile.downloadBase64({
     *  base64String: ".....",
     *  fileName: "sample.[jpg, png]",
     *  callback: () => {.....}
     * });
     */
    downloadBase64(option:{base64String: string, fileName: string, targetPath?: string, callback: (result: any) => void}) {
        let base64Strirng = option.base64String.replace(/^data:image\/\w+;base64,/, "");
        base64Strirng = base64Strirng.replace(/^data:application\/\w+;base64,/, "");
        BizCheckMobileApp.callPlugIn("SAVE_IMAGE_BASE_64", {
            param: {
                image_base_64: base64Strirng,
                source_path: option.targetPath ? "PPCBank/" + option.targetPath : "PPCBank/",
                source_path_type: "internal",
                file_name: option.fileName

            },
            callback:option.callback
        });
    }

    /**
     * @author Rethysen
     * @namespace downloadImageToPhotoLibrary
     * @param {*} option
     * @param {String} option.base64String  - base64String Base64 of image file that need download as file.
     * @param {String} option.fileName      - fileName file name for store in directory
     * @param {String} option.targetPath    - targetPath target folder for store image. It's optional
     * @param {Function} option.callback      - callback function after file download. It's optional
     * 
     * @@example
     * BizCheckMobileFile.downloadBase64({
     *  base64String: ".....",
     *  fileName: "sample.[jpg, png]",
     *  callback: () => {.....}
     * });
     */
    downloadImageToPhotoLibrary(option:{base64Strirng: string, fileName: string, targetPath?: string, callback?: (result: any) => void}) {
        let base64Strirng = option.base64Strirng.replace(/^data:image\/\w+;base64,/, "");
        base64Strirng = base64Strirng.replace(/^data:application\/\w+;base64,/, "");
        BizCheckMobileApp.callPlugIn("SAVE_IMAGE_BASE_64", {
            param: {
                image_base_64: base64Strirng,
                source_path: option.targetPath ? "PPCBank/" + option.targetPath : "PPCBank/",
                source_path_type: "internal",
                file_name: option.fileName

            },
            callback: (result: any) => {
                BizCheckMobileApp.callPlugIn("COPY_IMAGE_TO_PHOTO_LIBRARY_PLUGIN", {
                    injectBodyHeader: true,
                    param: {
                        source_path: result.path,
                        target_album: "PPCBank"
                    },
                    callback:option.callback
                });
            }
        });
    }

    /**
     * 
     * @param {OptionDownloadFile} option 
     * @param {Array<UrlList>} option.urlList
     * @param {Function} option.onDownloaded
     * 
     * @example
     * BizCheckMobileFile.downloadFile({
     *  urlList: [{
     *      url: "",
     *      expired_date: "",// yyyyMMdd
     *      extension: "jpg",// jpg,png,pdf
     *      compress: 0.8,//0.0~1.0
     *  }]
     *  onDownloaded: () => {.....}
     * });
     */
    downloadFile(option: OptionDownloadFile) {
        let urlList: [] = []; 
        for (const element of option.urlList) {
            let objURLLIst: any = {};
            objURLLIst["compress"] = element.compress;
            objURLLIst["expired_date"] = element.expiredDate;
            objURLLIst["extension"] = element.extension;
            objURLLIst["url"] = element.url;

        }
        BizCheckMobileApp.callPlugIn("DOWNLOAD_FILES_PLUGIN", {
            injectBodyHeader: true,
            param: {
                url_list: urlList,
            },
            callback(res) {
                if(res.header) {
                    if(res.body && res.body.url_list) {
                        option.onDownloaded(res.body.url_list);
                    }
                } else {
                    option.onDownloaded(Object.assign({}, {}) as ResultDownloadFile);
                }
            },
        });
    }

    /**
     * 
     * @param option
     * @param option.sourcePath
     * @param option.targetDirectory
     * @param option.onSaved
     * @example
     * BizCheckMobileFile.downloadFileToFilesLibrary({
     *  sourcePath: "",
     *  targetDirectory: ""
     *  onSaved: () => {.....}
     * });
     */
    downloadFileToFilesLibrary(option: {sourcePath: string, targetDirectory?: string, onSaved?: (response: any) => void}) {
        BizCheckMobileApp.callPlugIn("COPY_FILE_TO_FILE_LIBRARY_PLUGIN", {
            injectBodyHeader: true,
            param: {
                target_directory: option.targetDirectory || "",
                source_path: option.sourcePath
            },
            callback: (res) => {
                option.onSaved?.(res["body"]);
            }
        });
    }

}

interface OptionDownloadFile {
    urlList: Array<UrlList>,
    onDownloaded: (response: ResultDownloadFile) => void
}

interface UrlList {
    url: string,
    expiredDate: string,
    extension: "jpg" | "png" | "pdf",
    compress: number
}

interface ResultDownloadFile {
    urlList: Array<{ file_path: string, base_64: string}>
}


const BizCheckMobileFile = File.getInstance();

export default BizCheckMobileFile;