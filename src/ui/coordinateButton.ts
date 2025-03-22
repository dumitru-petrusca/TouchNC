import {Producer, randomString} from '../common';
import {FloatSetting} from '../config/settings';
import {currentToMm, mmToDisplay} from '../machine/modal';
import {unitChannel} from '../events/eventbus';
import {numpadButton, NumpadType} from './numpad';

export class CoordinateButton {
  private readonly id: string
  private readonly name: string;
  private enabled: Producer<boolean>;
  private e?: HTMLButtonElement;
  private setting: FloatSetting;

  constructor(setting: FloatSetting) {
    this.setting = setting;
    this.name = setting.name;
    this.id = setting.path + "-" + randomString(5);
    this.enabled = () => true;
  }

  setEnabled(enabled: Producer<boolean>) {
    this.enabled = enabled;
    return this;
  }

  setValue(value: number) {
    this.setting.setValue(currentToMm(value));
    this.update();
  }

  build(): HTMLButtonElement {
    this.e = numpadButton(this.id, this.name, "", NumpadType.FLOAT, v => this.setValue(parseFloat(v)));
    this.update()
    unitChannel.register(_ => this.update())  // TODO-dp should remove the listener when the component dies?
    return this.e
  }

  update() {
    this.e?.replaceChildren(this.name + " " + mmToDisplay(this.setting.getValue()));
    if (this.e != undefined) {
      this.e.disabled = !this.enabled();
    }
  }

  getValue() {
    return this.setting.getValue();
  }
}

export function coordButton(setting: FloatSetting): CoordinateButton {
  return new CoordinateButton(setting);
}