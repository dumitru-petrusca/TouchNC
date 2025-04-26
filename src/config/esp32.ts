import {range} from '../common/common';
import {Set2} from '../common/set';

export const NO_PIN_TEXT = "NO_PIN";

export type PinBias = "od" | "pu" | "pd"
export type PinActive = "high" | "low"

export enum PinCap {
  GPIO = 1 << 1,
  I2SO = 1 << 2,
  UART1 = 1 << 3,
  UART2 = 1 << 4,
  Input = 1 << 5,
  Output = 1 << 6,
  PullUp = 1 << 7,
  PullDown = 1 << 8,
  ADC = 1 << 9,
  DAC = 1 << 10,
  PWM = 1 << 11,
  ISR = 1 << 12,
  UART = 1 << 13,
}

const GPIO = "gpio";
const I2SO = "i2so";
const UART1 = "uart_channel1";
const UART2 = "uart_channel2";

export class Pin {
  number: number
  caps: PinCap

  constructor(pin: number, cap: PinCap) {
    this.number = pin;
    this.caps = cap;
  }

  hasCaps(caps: PinCap) {
    return (caps & this.caps) != 0;
  }

  toString(): string {
    if (this.number == -1) {
      return NO_PIN_TEXT
    }
    return `${(this.typeString())}.${this.number}`
  }

  private typeString() {
    if (this.hasCaps(PinCap.UART1)) return UART1;
    if (this.hasCaps(PinCap.UART2)) return UART2;
    if (this.hasCaps(PinCap.I2SO)) return I2SO;
    return GPIO;
  }

  ordinal() {
    return (this == NO_PIN ? -1000 : 0) +
        (this.hasCaps(PinCap.GPIO) ? -100 : +100) +
        this.number
  }
}

export function pinComparator(a: Pin, b: Pin) {
  return a.ordinal() - b.ordinal();
}

function parsePinType(pinType: string) {
  if (pinType == UART1) return PinCap.UART1;
  if (pinType == UART2) return PinCap.UART2;
  if (pinType == I2SO) return PinCap.I2SO;
  return PinCap.GPIO
}

export function parsePinConfig(value: string): PinConfig {
  if (value.trim() == NO_PIN_TEXT) {
    return NO_PIN_CONFIG
  }
  let s = value.split(":").map(s => s.trim());
  let parts = s[0].split(".")
  let type = parsePinType(parts[0].trim());
  let pin = esp32.getPin(Number(parts[1].trim()), type)
  let bias: PinBias = "od"
  let active: PinActive = "high"
  if (s.length == 2) {
    if (s[1] == "pu" || s[1] == "pd") {
      bias = s[1].trim() as PinBias
    } else {
      active = s[1].trim() as PinActive
    }
  }
  if (s.length == 3) {
    bias = s[1].trim() as PinBias
    active = s[2].trim() as PinActive
  }
  return new PinConfig(pin, bias, active)
}

export class PinConfig {
  pin: Pin
  bias: PinBias = "od"
  active: PinActive = "high"

  constructor(pin: Pin, bias: PinBias, active: PinActive) {
    this.pin = pin;
    this.bias = bias;
    this.active = active;
  }

  toString() {
    if (this.pin.number == -1) {
      return NO_PIN_TEXT
    }
    let str = this.pin.toString();
    if (this.bias != "od") {
      str += ":" + this.bias
    }
    if (this.active != "high") {
      str += ":" + this.active
    }
    return str;
  }

  hasCaps(caps: PinCap) {
    return this.pin?.hasCaps(caps)
  }
}

export class ESP32 {
  pins: Set2<Pin>

  constructor() {
    this.pins = new Set2<Pin>()
    // See https://randomnerdtutorials.com/esp32-pinout-reference-gpios/ for an overview:
    this.add([0], PinCap.GPIO | PinCap.Input | PinCap.Output | PinCap.PullUp | PinCap.PullDown | PinCap.ADC | PinCap.PWM | PinCap.ISR | PinCap.UART); // Outputs PWM signal at boot
    this.add([1], PinCap.GPIO | PinCap.Output | PinCap.Input | PinCap.UART); // TX pin of Serial0. Note that Serial0 also runs through the Pins framework!
    this.add([3], PinCap.GPIO | PinCap.Output | PinCap.Input | PinCap.ISR | PinCap.UART);  // RX pin of Serial0. Note that Serial0 also runs through the Pins framework!
    this.add([5, 16, 17, 18, 19, 21, 22, 23, 29], PinCap.GPIO | PinCap.Input | PinCap.Output | PinCap.PullUp | PinCap.PullDown | PinCap.PWM | PinCap.ISR | PinCap.UART);
    this.add([2, 4, 12, 13, 14, 15, 27, 32, 33], PinCap.GPIO | PinCap.Input | PinCap.Output | PinCap.PullUp | PinCap.PullDown | PinCap.ADC | PinCap.PWM | PinCap.ISR | PinCap.UART);
    this.add([25, 26], PinCap.GPIO | PinCap.Input | PinCap.Output | PinCap.PullUp | PinCap.PullDown | PinCap.ADC | PinCap.DAC | PinCap.PWM | PinCap.ISR | PinCap.UART);
    this.add(range(34, 39), PinCap.GPIO | PinCap.Input | PinCap.ADC | PinCap.ISR | PinCap.UART);
    this.add(range(0, 15), PinCap.I2SO | PinCap.Output);
    this.add(range(0, 22), PinCap.UART1 | PinCap.Input | PinCap.Output | PinCap.PullUp | PinCap.PullDown);
  }

  add(pins: number[], cap: PinCap) {
    for (const pin of pins) {
      this.pins.add(new Pin(pin, cap));
    }
  }

  getPins(caps: PinCap): Set2<Pin> {
    let set = new Set2<Pin>()
    for (const pin of this.pins) {
      if ((pin.caps & caps) == caps) {
        set.add(pin)
      }
    }
    return set
  }

  getPin(number: number, caps: PinCap): Pin {
    for (const pin of this.pins) {
      if (pin.number == number && pin.hasCaps(caps)) {
        return pin
      }
    }
    return NO_PIN
  }
}

export const NO_PIN = new Pin(-1, 0 as PinCap)
export const NO_PIN_CONFIG = new PinConfig(NO_PIN, "od", "high");
export let esp32 = new ESP32()
