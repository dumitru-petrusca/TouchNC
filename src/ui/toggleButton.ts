import {Consumer, Producer, randomString} from '../common/common';
import {BooleanSetting, SelectOption, SelectSetting} from '../config/settings';
import {btnIcon, button} from './button';
import {tabSelectChannel} from "../events/eventbus";
import {currentState} from "../machine/machine";

export class ToggleButton {
  private readonly id: string
  private readonly name: string;
  private enabled: Producer<boolean>;
  private e?: HTMLButtonElement;
  private setting: BooleanSetting;
  private consumer: Consumer<boolean>;

  constructor(setting: BooleanSetting, consumer: Consumer<boolean>) {
    this.setting = setting;
    this.consumer = consumer;
    this.name = setting.name;
    this.id = setting.path + "-" + randomString(5);
    this.enabled = () => true;
  }

  setEnabled(enabled: Producer<boolean>) {
    this.enabled = enabled;
    return this;
  }

  getValue(): boolean {
    return this.setting.getValue();
  }

  setValue(value: boolean) {
    this.setting.setValue(value);
    this.update();
  }

  update() {
    console.log("Value: " + this.getValue())
    this.e!.style.background = this.getValue() ? "#d0f0d0" : "lightblue";
    console.log("Color: " + this.e!.style.background)
  }

  build(): HTMLButtonElement {
    this.e = button(this.id, "", "", _ => {
      let value = !this.getValue();
      this.setValue(value)
      this.consumer(value)
    })
    this.update()
    return this.e
  }
}

export function toggleButton(setting: BooleanSetting, consumer: Consumer<boolean>): ToggleButton {
  return new ToggleButton(setting, consumer);
}

export class SettingButtonGroup {
  private setting: SelectSetting;
  private buttons?: HTMLButtonElement[];
  private consumer?: Consumer<string>;

  constructor(setting: SelectSetting, consumer?: Consumer<string>) {
    this.setting = setting;
    this.consumer = consumer;
    if (localStorage.getItem(setting.path) == null) {
      localStorage.setItem(setting.path, setting.getValue())
    }
    tabSelectChannel.register(_ => this.update(), "toggle", 0)
  }

  private update() {
    this.buttons?.forEach(b => b.style.backgroundColor = "lightblue")
    let value = localStorage.getItem(this.setting.path)!
    this.setting.setValue(value)
    let i = this.setting.indexOf(value)
    this.buttons![i].style.backgroundColor = "#d0f0d0"
  }

  build(): HTMLButtonElement[] {
    this.buttons = this.setting.options.map(o => this.makeButton(o));
    this.update()
    return this.buttons
  }

  private makeButton(option: SelectOption) {
    let content = option.icon ? btnIcon(option.icon) : option.text;
    return button(option.value, content, `Feed ${option.text}`, _ => {
      localStorage.setItem(this.setting.path, option.value);
      this.update();
      this.consumer?.(option.value)
    });
  }
}
