import {Predicate} from './common';

export class List<E> {
  list: E[]

  constructor(...es: E[]) {
    this.list = es
  }

  push(e: E): this {
    this.list.push(e);
    return this
  }

  pushFirst(e: E): this {
    this.list = [e, ...this.list]
    return this;
  }

  pushIf(condition: boolean, e: () => E): this {
    if (condition) {
      this.list.push(e());
    }
    return this
  }

  pushIfDefined(e?: E): this {
    if (e) {
      this.push(e);
    }
    return this
  }

  pushAll(...es: E[]): this {
    this.list.push(...es)
    return this
  }

  map<R>(mapper: (e: E) => R): List<R> {
    const newList = new List<R>();
    for (const e of this.list) {
      newList.push(mapper(e));
    }
    return newList;
  }

  // remove(set: List<E>): this {
  //   for (const e of set) {
  //     this.delete(e);
  //   }
  //   return this;
  // }

  sort(compareFn?: (a: E, b: E) => number): this {
    this.list.sort(compareFn);
    return this;
  }

  * [Symbol.iterator](): Generator<E, void, unknown> {
    for (const e of this.list) {
      yield e;
    }
  }

  find(predicate: Predicate<E>): E | undefined {
    return this.list.find(predicate)
  }
}
