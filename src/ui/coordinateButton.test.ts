import {coordButton} from './coordinateButton';
import {FloatSetting} from '../config/settings';

test('set get value', () => {
  let b = coordButton(new FloatSetting("pitch", 0, 0, 1e6));
  b.setValue(12.23)
  expect(b.getValue()).toBe(12.23)
});
