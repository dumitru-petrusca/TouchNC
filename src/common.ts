export type Function2<T> = ((value: T) => void) | null
export type EventHandler = Function2<Event>

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

export function capitalize(name: string) {
  let c = name.charAt(0);
  return c == '(' ? name : c.toUpperCase() + name.substring(1);
}

export function splitNumber(name: string) {
  let c = name.charAt(name.length - 1);
  if (c >= '0' && c <= '9') {
    return name.substring(0, name.length - 1) + " " + c;
  } else {
    return name;
  }
}
