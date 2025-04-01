import {pin} from './settings';
import {PinCap} from './esp32';

test('pin validation', () => {
  let p = pin(PinCap.Input);
  expect(p.validate("gpio.32")).toBe(true)
  expect(p.validate("gpio.32:low")).toBe(true)
  expect(p.validate("gpio.32:high")).toBe(true)
  expect(p.validate("gpio.32:pu:high")).toBe(true)
  expect(p.validate("gpio.32:pd:low")).toBe(true)
  expect(p.validate("gpio.32:pd")).toBe(true)
  expect(p.validate("gpio.32:pd:")).toBe(false)
  expect(p.validate("gpio.132")).toBe(false)
});
