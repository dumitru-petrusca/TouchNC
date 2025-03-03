import {pinIO} from './settings';

test('spindle type', () => {
  expect(pinIO().validate("gpio.32")).toBe(true)
  expect(pinIO().validate("gpio.32:low")).toBe(true)
  expect(pinIO().validate("gpio.32:high")).toBe(true)
  expect(pinIO().validate("gpio.32:pu:high")).toBe(true)
  expect(pinIO().validate("gpio.32:pd:low")).toBe(true)
  expect(pinIO().validate("gpio.32:pd")).toBe(true)
  expect(pinIO().validate("gpio.32:pd:")).toBe(false)
  expect(pinIO().validate("gpio.132")).toBe(false)
});
