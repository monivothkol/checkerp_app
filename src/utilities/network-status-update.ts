/* eslint-disable no-unused-vars */
export default class NetworkStatusUpdate {

    private static observers: INetworkStatusUpdate[] = []; // Map events to observers
    static status: INetworkStatusResult = {} as INetworkStatusResult;

    public subscribe(observer: INetworkStatusUpdate) {

        NetworkStatusUpdate.observers.push(observer);

        if (NetworkStatusUpdate.status && Object.keys(NetworkStatusUpdate.status).length > 0) {
            this.notify(NetworkStatusUpdate.status);
        }
    }

    public unSubscribe() {
        NetworkStatusUpdate.observers = [];
    }

    notify(status?: INetworkStatusResult) {
        NetworkStatusUpdate.status = status ? status : {} as INetworkStatusResult;
        for (const observer of NetworkStatusUpdate.observers) {
            observer.update(NetworkStatusUpdate.status);
        }
    }
}

interface INetworkStatusUpdate {
    update: (status: INetworkStatusResult) => void;
}

interface INetworkStatusResult {
    result: boolean,
    signal_strength: string,
    status: boolean,
    type: string
}