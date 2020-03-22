export class Entry<T> {
    constructor(
        public key: string,
        public value: T,
        public expiresAt?: number
    ) { }
}