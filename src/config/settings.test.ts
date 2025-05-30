import {groupName, pin, settingName} from './settings';
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

test('settingName', () => {
  expect(settingName("atc_manual/probe_seek_rate_mm_per_min")).toBe("Probe Seek Rate (mm/min)")
  expect(settingName("atc_manual/change_mpos_mm")).toBe("Change Mpos (mm)")
  expect(settingName("coolant/delay_ms")).toBe("Delay (ms)")
});

test('groupName', () => {
  expect(groupName("/axes/x/motor0/driver")).toBe("X Motor 0 Driver")
});
