import {WeightList} from '../common/common';

type Listener<E> = (e: E) => void

export class EventChannel<E> {
  private listeners = new WeightList<Listener<E>>()

  register(listener: Listener<E>, name: string = "", weight: number = 0) {
    this.listeners.add(name, weight, listener)
  }

  sendEvent(e: E) {
    this.listeners.forEach(listener => listener(e))
  }
}
