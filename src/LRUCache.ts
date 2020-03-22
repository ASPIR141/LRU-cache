import { LinkedList, LinkedListNode } from 'data-structures';
import { Entry } from './Entry';

export class LRUCache<V = string> {
    private MAX_AGE = 0;
    private LRU_SIZE = 4;
    private ON_DISPOSE: (key: string, value: V) => void;
    private readonly LRU_LIST = new LinkedList<Entry<V>>();
    private readonly CACHE = new Map<string, LinkedListNode<Entry<V>>>();

    constructor({
        maxAge,
        maxSize,
        onDispose
    }: {
        maxAge?: number;
        maxSize?: number;
        onDispose?: (key: string, value: V) => void;
    }) {
        this.MAX_AGE = maxAge;
        this.LRU_SIZE = maxSize;
        this.ON_DISPOSE = onDispose;
    }

    public get size() {
        return this.CACHE.size;
    }

    public get(key: string) {
        if (this.CACHE.has(key)) {
            const node = this.CACHE.get(key);

            if (this.isExpired(node)) {
                this.LRU_LIST.remove(node);
                this.CACHE.delete(key);
                this.ON_DISPOSE && this.ON_DISPOSE(node.item.key, node.item.value);

                return null;
            }

            this.LRU_LIST.remove(node);
            this.CACHE.delete(key);
            this.ON_DISPOSE && this.ON_DISPOSE(node.item.key, node.item.value);

            return node.item;
        }

        return null;
    }

    public set(key: string, value: V): boolean {
        const entry = new Entry<V>(key, value);

        if (this.MAX_AGE > 0) {
            entry.expiresAt = Date.now() + this.MAX_AGE;
        }

        if (this.CACHE.has(key)) {
            const node = this.CACHE.get(key);

            this.LRU_LIST.remove(node);
            this.CACHE.delete(key);
            this.ON_DISPOSE && this.ON_DISPOSE(node.item.key, node.item.value);

            this.LRU_LIST.addFirst(entry);
            this.CACHE.set(key, this.LRU_LIST.first);

            return true;
        }

        this.LRU_LIST.addFirst(entry);
        this.CACHE.set(key, this.LRU_LIST.first);

        if (this.CACHE.size > this.LRU_SIZE) {
            this.trim();
        }

        return true;
    }

    public delete(key: string) {
        const node = this.CACHE.get(key);

        this.CACHE.delete(key);
        this.LRU_LIST.remove(node);
        this.ON_DISPOSE && this.ON_DISPOSE(node.item.key, node.item.value);

        return true;
    }

    public values() {
        const values: V[] = [];
        this.CACHE.forEach(x => values.push(x.item.value));
        return values;
    }

    private isExpired(node: LinkedListNode<Entry<V>>) {
        return this.MAX_AGE > 0 && Date.now() > node.item.expiresAt;
    }

    private trim() {
        const node = this.LRU_LIST.last;

        this.LRU_LIST.removeLast();
        this.CACHE.delete(node.item.key);
        this.ON_DISPOSE && this.ON_DISPOSE(node.item.key, node.item.value);
    }
}
