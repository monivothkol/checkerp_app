/* eslint-disable no-unused-vars */
const bizCheckMobile = window.bizCheckMobile;
class Event {
    private static instance: Event;

    // Private constructor to prevent direct instantiation
    private constructor() {}

    // Get the singleton instance
    static getInstance(): Event {

        if (!this.instance) {
            this.instance = new Event();
        }
        return this.instance;
        
    }

    /**
     * @author Rethysen
     * @name setEvent
     * @param sEvent it's events type with "backbutton" | "resume" | "pause" | "push" | "networkstatechange" | "deeplink" | "appwidget" | "appshortcut" | "screenchanged" | "screenmodechanged" | "clipboard"
     * @param fCallback callback with result after event emit or called
     * @example
     * BizCheckMobilesetEvent("resume", (result: any) => {
     *  // share your method or logic here to check some case or track data
     * });
     */
    setEvent(sEvent: EVENTS_TYPE, fCallback: (result?: any) => void): void {
        bizCheckMobile.gateway("EventManager", "set", { _sEvent: sEvent, _fCallback: fCallback }, ["_sEvent"]);
    }

    /**
     * @author Rethysen
     * @name clearEvent
     * @param sEvent it's events type with "backbutton" | "resume" | "pause" | "push" | "networkstatechange" | "deeplink" | "appwidget" | "appshortcut" | "screenchanged" | "screenmodechanged" | "clipboard"
     * @example
     * BizCheckMobileclearEvent("resume")
     */
    clearEvent(sEvent: EVENTS_TYPE): void {
        bizCheckMobile.gateway("EventManager", "clear", { _sEvent: sEvent }, ["_sEvent"]);
    }

    /**
     * @author Rethysen
     * @name onAppReady
     * @description onAppReady it's event to track with native or web when page is loaded on DOM
     * @param fCallback it's optional
     * @example
     * BizCheckMobileonAppReady( () => {
     *  // share your method or logic here to load with ready event
     * });
     */
    onAppReady(callback: () => void) {
        bizCheckMobile.gateway("EventManager", "set", { _sEvent: "ready", _fCallback:callback }, ["_sEvent"]);
    }
}

export type EVENTS_TYPE = "welcome" | "backbutton" | "resume"
    | "pause" | "push" | "networkstatechange" | "deeplink" | "networkstrength"
    | "appwidget" | "appshortcut" | "screenchanged"
    | "screenmodechanged" | "clipboard" | "welcome"
    | "firebaseremoteconfig" | "downloading" | "uploading" | "sessiontimeout"
    |"tokenexpired" | "shakedetect"|"updatinguserprofileid" | "ready" | "updatingaccountorder" | "updatingloanorder" | "updatingcardorder";

const BizCheckMobileEvent = Event.getInstance();

export default BizCheckMobileEvent;