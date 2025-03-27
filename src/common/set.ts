import {List} from './list';

export class Set2<E> extends Set<E> {
  constructor(...es: E[]) {
    super(es);
  }

  addIfDefined(e?: E): this {
    if (e) {
      this.add(e);
    }
    return this
  }

  addAll(...es: E[]): this {
    for (const e of es) {
      this.add(e)
    }
    return this
  }

  map<R>(mapper: (e: E) => R): Set2<R> {
    const newSet = new Set2<R>();
    for (const e of this) {
      newSet.add(mapper(e));
    }
    return newSet;
  }

  remove(set: Set2<E>): this {
    for (const e of set) {
      this.delete(e);
    }
    return this;
  }

  list(): List<E> {
    return new List(...this);
  }

  sortedList(compareFn?: (a: E, b: E) => number): List<E> {
    const list = new List(...this);
    list.sort(compareFn);
    return list;
  }
}

export function add<T>(s1: Set<T>, s2: Set<T>): Set<T> {
  const set = new Set<T>(s1);
  for (const elem of s2) {
    set.add(elem);
  }
  return set;
}

export function intersection<T>(s1: Set<T>, s2: Set<T>): Set<T> {
  const set = new Set<T>();
  for (const e of s2) {
    if (s1.has(e)) {
      set.add(e);
    }
  }
  return set;
}
