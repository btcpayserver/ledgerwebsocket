declare module "@ledgerhq/hw-transport-u2f"
{
    export default class TransportU2F
    {
        exchangeTimeout: number;
        static open(timeout?: number): Promise<TransportU2F>;
        exchange(apdu: Buffer): Promise<Buffer>;
        setScrambleKey(key: string): void;
    }
}