import {FSFile} from '../fs/fs';
import {EventChannel} from './eventchannel';

export let startupChannel = new EventChannel<void>()
export let tabSelectChannel = new EventChannel<TabSelectEvent>()
export let restartChannel = new EventChannel<void>()
export let unitChannel = new EventChannel<UnitEvent>()
export let toolChannel = new EventChannel<void>()
export let positionChannel = new EventChannel<void>()
export let stateChannel = new EventChannel<void>()
export let progressChannel = new EventChannel<void>()
export let messageChannel = new EventChannel<void>()

export class AbstractEvent {
  toString(): string {
    const fields = Object.entries(this)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
    return `${(this.constructor.name)} { ${fields} }`;
  }
}

export class UnitEvent extends AbstractEvent {
  unit: string

  constructor(unit: string) {
    super();
    this.unit = unit;
  }
}

export class TabSelectEvent extends AbstractEvent {
  tabId: string
  content: HTMLElement;

  constructor(tabId: string, content: HTMLElement) {
    super();
    this.tabId = tabId;
    this.content = content;
  }
}

export class Overrides {
  feed = 0
  rapid = 0
  spindle = 0
}

export class State {
  name = ""
  message = ""
  wco: number[] = [0, 0, 0]
  mpos: number[] = [0, 0, 0]
  wpos: number[] = [0, 0, 0]
  feedRate = 0
  spindleSpeed = 0
  spindleDirection = ""
  ovr = new Overrides
  lineNumber = 0
  flood = false
  mist = false
  pins = ""
  mpgs = 0
  lathe_rpm = 0
  sdName = ""
  sdPercent = 0
}

export class Coordinate {
  x: number
  y: number
  z: number

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  copy(): Coordinate {
    return new Coordinate(this.x, this.y, this.z)
  }
}

export class GCodeFile {
  path: string
  size: number
  content: string

  constructor(file: FSFile) {
    this.path = file.path
    this.size = file.size
    this.content = ""
  }

  canDisplay() {
    return this.size < 1000000;
  }
}
