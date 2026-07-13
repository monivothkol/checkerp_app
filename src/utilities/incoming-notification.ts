

/* eslint-disable no-unused-vars */
export default class IncomingNotificationUpdate {
    private static observers: IIncomingNotificationUpdate[] = []; // Map events to observers
    private static data: any;

    public subscribe(observer: IIncomingNotificationUpdate) {

        IncomingNotificationUpdate.observers.push(observer);

        if (IncomingNotificationUpdate.data) {
            this.notify(IncomingNotificationUpdate.data);
        }
    }

    public unSubscribe() {
        IncomingNotificationUpdate.observers = [];
    }

    notify(data: any) {
        IncomingNotificationUpdate.data = data;
        for (const observer of IncomingNotificationUpdate.observers) {
            observer.onUpdate(data);
        }
    }

    public resetData() {
        IncomingNotificationUpdate.data = {};
    }
}

interface IIncomingNotificationUpdate {
    onUpdate: (data: any) => void;
}