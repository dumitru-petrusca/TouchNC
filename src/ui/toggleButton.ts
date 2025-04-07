import {Consumer, Producer, randomString} from '../common/common';
import {BooleanSetting, SelectOption, SelectSetting} from '../config/settings';
import {btnIcon, button} from './button';

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

export class SettingButtonGroup {
  private setting: SelectSetting;
  private buttons?: HTMLButtonElement[];
  private consumer?: Consumer<string>;

  constructor(setting: SelectSetting, consumer?: Consumer<string>) {
    this.setting = setting;
    this.consumer = consumer;
  }

  private update() {
    this.buttons?.forEach(b => b.style.backgroundColor = "lightblue")
    let i = this.setting.index();
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
      this.setting.setValue(option.value)
      this.update();
      this.consumer?.(option.value)
    });
  }
}

export function toggleButton(setting: BooleanSetting, consumer: Consumer<boolean>): ToggleButton {
  return new ToggleButton(setting, consumer);
}