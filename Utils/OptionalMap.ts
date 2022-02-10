import { None, Option, Some } from "../deps.ts";

export class OptionalMap<K, V> extends Map<K, V> {
    public probablyGet(key: K) : Option<V> {
        const result = super.get(key);

        if (result) {
            return Some(result);
        } else {
            return None;
        }
    }
}