import {NO_PIN_CONFIG, NO_PIN_TEXT, parsePinConfig, PinCap} from './esp32';
import {PinDialog} from './pindialog';
import {PinSetting} from './settings';

test('NO_PIN', () => {
  let setting = new PinSetting("foo", NO_PIN_CONFIG, PinCap.DAC)
  let dialog = new PinDialog("", setting, value => {
  });
});

test('gpio.26', () => {
  let setting = new PinSetting("foo", parsePinConfig("gpio.26"), PinCap.DAC)
  let dialog = new PinDialog("", setting, value => {
  });
  expect(optionValues(dialog.pinElement)).toEqual([NO_PIN_TEXT, "gpio.25", "gpio.26"])
  expect(optionValues(dialog.biasElement)).toEqual(["od", "pu", "pd"])
  expect(optionValues(dialog.activeElement)).toEqual(["high", "low"])
  expect(dialog.value()).toEqual(parsePinConfig("gpio.26"))
});

test('gpio.34:low', () => {
  let setting = new PinSetting("foo", parsePinConfig("gpio.34:low"), PinCap.Input)
  let dialog = new PinDialog("", setting, value => {
  });
  expect(optionValues(dialog.biasElement)).toEqual(["od"])
  expect(optionValues(dialog.activeElement)).toEqual(["high", "low"])
  expect(dialog.value()).toEqual(parsePinConfig("gpio.34:low"))
});

function optionValues(e: HTMLSelectElement): string[] {
  let texts: string[] = []
  for (const option of e.options) {
    texts.push(option.value)
  }
  return texts;
}
