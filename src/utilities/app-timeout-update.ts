

/* eslint-disable no-unused-vars */
export default class AppTimeoutUpdate {
    private static observers: IAppTimeoutUpdate[] = []; // Map events to observers
    static status: boolean = false;

    public subscribe(observer: IAppTimeoutUpdate) {

        AppTimeoutUpdate.observers.push(observer);

        if (AppTimeoutUpdate.status) {
            this.notify(AppTimeoutUpdate.status);
        }
    }

    public unSubscribe() {
        AppTimeoutUpdate.observers = [];
    }

    notify(status: boolean) {
        AppTimeoutUpdate.status = status;
        for (const observer of AppTimeoutUpdate.observers) {
            observer.onUpdate(status);
        }
    }

}

interface IAppTimeoutUpdate {
    onUpdate: (status: boolean) => void;
}