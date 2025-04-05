export type Consumer<T> = (value: T) => void
export type Producer<T> = () => T
export type Predicate<T> = (t: T) => boolean
export type EventHandler = Consumer<Event>

export function valueOrError<T>(v: T, error: () => string): NonNullable<T> {
  if (v == null) {
    throw error()
  }
  return v
}

export function countCharInstances(str: string, char: string): number {
  if (char.length !== 1) {
    throw new Error("The character to count must be a single character.");
  }
  let count = 0;
  for (const c of str) {
    if (c === char) {
      count++;
    }
  }
  return count;
}

export function arraysEqual<T>(arr1: T[], arr2: T[]): boolean {
  return arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index]);
}

export function structuredEquals(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) => structuredEquals(a[key], b[key]));
}

export class WeightList<T> {
  items: WeightItem<T>[] = []

  add(name: string, weight: number, item: T) {
    this.items.push(new WeightItem<T>(item, name, weight))
    this.items.sort((a, b) => a.weight - b.weight)
  }

  forEach(f: (item: T) => void) {
    for (const wi of this.items) {
      f(wi.item)
    }
  }
}

class WeightItem<T> {
  item: T
  name: string;
  weight: number

  constructor(item: T, name: string, weight: number) {
    this.item = item;
    this.name = name;
    this.weight = weight;
  }
}

export const isDigit = (c: string) => c >= '0' && c <= '9';
export const first = (name: string) => charAt(name, 0);
export const last = (name: string, n = 0) => charAt(name, -1);

// 0  - first char, -1 last char, -2 next to last char
export const charAt = (name: string, i = 0) => {
  if (name == "") return ""
  while (i < 0) i += name.length
  return name.charAt(i)
}

export const drop = (name: string, n = 0) => name.substring(n);
export const dropLast = (name: string, n = 1) => name.substring(0, name.length - n);

export  const substring = (name: string, i = 0, j = -1) => {
  if (name == "") return ""
  while (i < 0) i += name.length
  while (j < 0) j += name.length
  return name.substring(i, j)
}

export const capitalize = (name: string) => first(name) == '(' ? name : first(name).toUpperCase() + drop(name, 1);

export function randomString(length: number): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}

export function range(from: number, to: number): number[] {
  return Array.from({length: to - from + 1}, (_, i) => from + i);
}
