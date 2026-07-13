

/* eslint-disable no-unused-vars */
export default class OfflineModeUpdate {
    private static observers: IOfflineModeUpdate[] = []; // Map events to observers
    static status: boolean = false;

    public subscribe(observer: IOfflineModeUpdate) {

        OfflineModeUpdate.observers.push(observer);

        if (OfflineModeUpdate.status) {
            this.notify(OfflineModeUpdate.status);
        }
    }

    public unSubscribe() {
        OfflineModeUpdate.observers = [];
    }

    notify(status: boolean) {
        OfflineModeUpdate.status = status;
        for (const observer of OfflineModeUpdate.observers) {
            observer.onUpdate(status);
        }
    }

}

interface IOfflineModeUpdate {
    onUpdate: (status: boolean) => void;
}