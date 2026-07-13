/* eslint-disable camelcase */
import BizCheckMobileApp from "./bizcheckmobile-app";

/* eslint-disable no-unused-vars */
const bizCheckMobile = window.bizCheckMobile;
class Logger {

    private static instance: Logger;
    private static logScreenView: ScreenViewInfo;
    private static logButtonEvent: ButtonEventInfo;
    private static previousScreenView: PreviousScreenViewInfo;

    // Private constructor to prevent direct instantiation
    private constructor() { }

    // Get the singleton instance
    static getInstance(): Logger {

        if (!this.instance) {
            this.instance = new Logger();
            this.logScreenView = {
                action: "",
                data: {
                    date_time: "",
                    item_id: "",
                    screen_class: "",
                    screen_id: "",
                    screen_name: ""
                },
                user_properties: {
                    age: 0,
                    gender: "",
                    nationality: "",
                    uid: ""
                }
            };
            this.logButtonEvent = {
                action: "",
                data: {
                    button_name: "",
                    search_text: "",
                    source_screen: ""
                },
                user_properties: {
                    age: 0,
                    gender: "",
                    nationality: "",
                    uid: ""
                }
            };
        }

        return this.instance;
    }

    info(message?: string, ...param: any[]) {
        if (!bizCheckMobile?.gateway) {
            console.log(`[INFO] ${message}`, ...param);
            return;
        }
        bizCheckMobile.gateway("Module", "logger", { _sService: "logger", _sAction: "info", _sLogType: "I", _sMessage: message, _oParams: param });
    }

    log(message?: string, ...param: any[]) {
        if (!bizCheckMobile?.gateway) {
            console.log(`[LOG] ${message}`, ...param);
            return;
        }
        bizCheckMobile.gateway("Module", "logger", { _sService: "logger", _sAction: "log", _sLogType: "L", _sMessage: message, _oParams: param });
    }

    warn(message?: string, ...param: any[]) {
        if (!bizCheckMobile?.gateway) {
            console.warn(`[WARN] ${message}`, ...param);
            return;
        }
        bizCheckMobile.gateway("Module", "logger", { _sService: "logger", _sAction: "warn", _sLogType: "W", _sMessage: message, _oParams: param });
    }

    debug(message?: string, ...param: any[]) {
        if (!bizCheckMobile?.gateway) {
            console.debug(`[DEBUG] ${message}`, ...param);
            return;
        }
        bizCheckMobile.gateway("Module", "logger", { _sService: "logger", _sAction: "debug", _sLogType: "D", _sMessage: message, _oParams: param });
    }

    error(message?: string, ...param: any[]) {
        if (!bizCheckMobile?.gateway) {
            console.error(`[ERROR] ${message}`, ...param);
            return;
        }
        bizCheckMobile.gateway("Module", "logger", { _sService: "logger", _sAction: "error", _sLogType: "E", _sMessage: message, _oParams: param });
    }

    screenView(info: ScreenView) {

        Logger.logScreenView = {
            action: "screen_view",
            data: {
                screen_id: info.data.screenId,
                date_time: info.data.dateTime,
                screen_class: info.data.screenClass,
                screen_name: info.data.screenName
            },
            user_properties: {
                uid: info.data.uid,
                age: info.data.age,
                gender: info.data.gender === "M" ? "Male" : "Female",
                nationality: info.data.nationality
            }
        };

        if (import.meta.env.VITE_ENABLE_FIREBASE_ANALYTICS) {

            BizCheckMobileApp.callPlugIn("FIREBASE_ANALYTICS_PLUGIN", {
                param: {
                    ...Logger.logScreenView
                }
            });
        }
    }

    previousScreenView(info: PreScreenView) {

        Logger.previousScreenView = {
            action: "path_event",
            data: {
                previous_screen: info.data.previousScreen,
                current_screen: info.data.currentScreen,
                action: info.data.action
            },
            user_properties: {
                uid: info.data.uid,
                age: info.data.age,
                gender: info.data.gender === "M" ? "Male" : "Female",
                nationality: info.data.nationality
            }
        };

        if (import.meta.env.VITE_ENABLE_FIREBASE_ANALYTICS) {

            BizCheckMobileApp.callPlugIn("FIREBASE_ANALYTICS_PLUGIN", {
                param: {
                    ...Logger.logScreenView
                }
            });
        }
    }

    buttonEvent(info: ButtonEvent) {
        Logger.logButtonEvent = {
            action: "button_click",
            data: {
                source_screen: Logger.logScreenView.data.screen_id,
                button_name: info.data.buttonName,
                search_text: ""
            },
            user_properties: {
                uid: info.data.uid,
                age: info.data.age,
                gender: info.data.gender === "M" ? "Male" : "Female",
                nationality: info.data.nationality
            }
        };

        if (import.meta.env.VITE_ENABLE_FIREBASE_ANALYTICS) {
            BizCheckMobileApp.callPlugIn("FIREBASE_ANALYTICS_PLUGIN", {
                param: {
                    ...Logger.logButtonEvent
                }
            });
        }
    }
}

interface ScreenView {
    data: LogScreenViewData
}

interface PreScreenView {
    data: LogPreScreenViewData
}

interface ButtonEvent {
    data: LogButtonEventData
}


interface LogScreenViewData {
    screenName: string,
    screenClass: string,
    screenId: string,
    dateTime: string,
    age?: number,
    nationality?: string,
    gender?: string,
    uid: string
}

interface LogPreScreenViewData {
    previousScreen: string,
    currentScreen: string,
    action?: string,
    dateTime: string,
    age?: number,
    nationality?: string,
    gender?: string,
    uid: string
}

interface LogButtonEventData {
    buttonName: string,
    age?: number,
    nationality?: string,
    gender?: string,
    uid: string
}

interface ButtonEventInfo {
    action: string,
    data: {
        button_name: string,
        source_screen: string,
        search_text: string
    },
    user_properties: {
         uid: string,
        gender?: string,
        age?: number,
        nationality?: string
    }
}

interface ScreenViewInfo {
    action: string,
    data: {
        screen_name: string
        screen_class: string,
        screen_id: string,
        item_id?: string,
        date_time: string
    },
    user_properties: {
        uid: string,
        gender?: string,
        age?: number,
        nationality?: string
    }
}

interface PreviousScreenViewInfo {
    action: string,
    data: {
        previous_screen: string
        action?: string,
        current_screen: string
    },
    user_properties: {
        uid: string,
        gender?: string,
        age?: number,
        nationality?: string
    }
}

const BizCheckMobileLogger = Logger.getInstance();

export default BizCheckMobileLogger;
