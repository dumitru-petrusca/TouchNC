import {esp32, NO_PIN, parsePinConfig, Pin, PinCap, pinComparator} from './esp32';
import {List} from '../common/list';

test('parse pin full', () => {
  let v = parsePinConfig("gpio.12:pu:high");
  expect(v.pin).toBe(esp32.getPin(12, PinCap.GPIO))
  expect(v.bias).toBe("pu")
  expect(v.active).toBe("high")
  expect(v.toString()).toBe("gpio.12:pu")
});

test('parse pin pullup', () => {
  let v = parsePinConfig("gpio.12:pu");
  expect(v.pin).toBe(esp32.getPin(12, PinCap.GPIO))
  expect(v.bias).toBe("pu")
  expect(v.active).toBe("high")
  expect(v.toString()).toBe("gpio.12:pu")
});

test('parse pin low', () => {
  let v = parsePinConfig("gpio.12:low");
  expect(v.pin).toBe(esp32.getPin(12, PinCap.GPIO))
  expect(v.bias).toBe("od")
  expect(v.active).toBe("low")
  expect(v.toString()).toBe("gpio.12:low")
});

test('parse pin only', () => {
  let v = parsePinConfig("gpio.12");
  expect(v.pin).toBe(esp32.getPin(12, PinCap.GPIO))
  expect(v.bias).toBe("od")
  expect(v.active).toBe("high")
  expect(v.toString()).toBe("gpio.12")
});

test('parse NO_PIN', () => {
  let v = parsePinConfig("NO_PIN");
  expect(v.pin).toBe(NO_PIN)
  expect(v.bias).toBe("od")
  expect(v.active).toBe("high")
  expect(v.toString()).toBe("NO_PIN")
});

test('parse i2so', () => {
  let v = parsePinConfig("i2so.8");
  expect(v.pin).toBe(esp32.getPin(8, PinCap.I2SO))
  expect(v.bias).toBe("od")
  expect(v.active).toBe("high")
  expect(v.toString()).toBe("i2so.8")
});

test('parse missing i2so', () => {
  let v = parsePinConfig("i2so.17");
  expect(v.pin).toBe(NO_PIN)
  expect(v.bias).toBe("od")
  expect(v.active).toBe("high")
  expect(v.toString()).toBe("NO_PIN")
});

test('parse missing gpio', () => {
  let v = parsePinConfig("gpio.11");
  expect(v.pin).toBe(NO_PIN)
  expect(v.bias).toBe("od")
  expect(v.active).toBe("high")
  expect(v.toString()).toBe("NO_PIN")
});

test('get pins', () => {
  let pins = esp32.getPins(PinCap.DAC).map(e => e.number).sortedList();
  expect(pins).toEqual(new List(25, 26))
});

test('sort', () => {
  let list = new List(
      new Pin(2, PinCap.I2SO), new Pin(1, PinCap.I2SO), new Pin(11, PinCap.I2SO),
      new Pin(10, PinCap.GPIO), new Pin(1, PinCap.GPIO), new Pin(11, PinCap.GPIO),
      NO_PIN
  );
  let actual = list.sort(pinComparator).map(p => p.toString());
  expect(actual).toEqual(new List("NO_PIN", "gpio.1", "gpio.10", "gpio.11", "i2so.1", "i2so.2", "i2so.11"))
});
