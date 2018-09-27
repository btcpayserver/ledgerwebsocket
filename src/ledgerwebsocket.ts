import * as u2f from "u2f-api";
import TransportU2F from "@ledgerhq/hw-transport-u2f";


async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    return new Promise<ArrayBuffer>((resolve, reject) => {
        const reader: FileReader = new FileReader();
        reader.addEventListener("loadend", (e) => {
            resolve(reader.result as ArrayBuffer);
        }, false);
        reader.readAsArrayBuffer(blob);
    });
}

export class LedgerWebSocketBridge {
    path: String;
    constructor(path: String) {
        path = path.replace("https://", "wss://");
        path = path.replace("http://", "ws://");
        this.path = path;
    }

    public isSupported(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const supportsWebSockets: boolean = "WebSocket" in window && ((window as any).WebSocket as WebSocket).CLOSING === 2;
            if (!supportsWebSockets) {
                resolve(false);
            } else {
                u2f.default.isSupported().then(v => resolve(v));
            }
        });
    }

    public timeoutSeconds: number = 20;
    public scrambleKey: string = "BTC";

    public sendCommand(command: string, exta_args?: string, timeoutSeconds?: number): Promise<any> {
        const socketConnectionPath: string = this.path + "?command=" + command + (exta_args ? "&" + exta_args : "");
        const socket: WebSocket = new WebSocket(socketConnectionPath);
        if (!timeoutSeconds) {
            timeoutSeconds = this.timeoutSeconds;
        }

        return new Promise<any>((resolve, reject) => {
            TransportU2F
                .open(timeoutSeconds)
                .catch(reason => reject(reason))
                .then(transport => {
                    const u2fTransport: TransportU2F = transport as TransportU2F;
                    u2fTransport.exchangeTimeout = timeoutSeconds * 1000;
                    u2fTransport.setScrambleKey(this.scrambleKey);
                    socket.onmessage = async (ev) => {
                        if (ev.data && ev.data instanceof Blob) {
                            const dataBlob: Blob = ev.data as Blob;
                            try {
                                const reply: Buffer = await u2fTransport.exchange(Buffer.from(await blobToArrayBuffer(dataBlob)));
                                socket.send(reply);
                            } catch (ex) {
                                socket.close();
                                reject(ex);
                            }
                        } else if (ev.data && typeof ev.data === "string") {
                            socket.close();
                            resolve(JSON.parse(ev.data));
                        }
                    };
                });
        });
    }
}