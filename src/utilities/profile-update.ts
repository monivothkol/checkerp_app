/* eslint-disable no-unused-vars */
export default class ProfileUpdate {
    private static observers: IProfileUpdate[] = []; // Map events to observers

    public subscribe(observer: IProfileUpdate) {
        ProfileUpdate.observers.push(observer);
    }

    public unSubscribe() {
        ProfileUpdate.observers = [];
    }

    notify(fileId: string) {
        for (const observer of ProfileUpdate.observers) {
            observer.update(fileId);
        }
    }

}

interface IProfileUpdate {
    update: (fileId: string) => void;
}