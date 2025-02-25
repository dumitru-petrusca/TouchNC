import {capitalize, splitNumber} from '../common';

export enum GroupType {NORMAL, VIRTUAL}

export enum GroupMode {ALL, ONE_OF}

export abstract class Setting<T, B extends Setting<T, B>> {
  public name: string
  protected _oldValue: T | undefined = undefined
  protected _value: T | undefined = undefined
  public exists: boolean = false

  protected constructor(name: string) {
    this.name = name;
  }

  getValue(): T {
    return this._value!;
  }

  setValue(value: T): B {
    this._oldValue = this._value
    this._value = value;
    return this as any
  }

  undo() {
    this._value = this._oldValue;
  }

  getDisplayName() {
    let name = this.name
        .substring(this.name.lastIndexOf("/") + 1)
        .replaceAll('_', ' ')
    name = replaceDimension(name)
        .split(" ")
        .map(capitalize)
        .map(replaceAcronyms)
        .join(" ");
    return renames.get(name) ?? name
  }

  insert(obj: Record<string, any>) {
    let fields = this.name.substring(1).split("/");
    let o = obj
    for (let i = 0; i < fields.length - 1; i++) {
      let f = fields[i]
      o = o[f] == undefined ? (o[f] = {}) : o[f];
    }
    o[fields[fields.length - 1]] = this.getValue()
  }

  abstract clone(name: string): B

  isConfigured(defaults: SettingGroup) {
    return this.getValue() != defaults.get(this.name)?.getValue()
  }
}

export class BooleanSetting extends Setting<boolean, BooleanSetting> {
  constructor(name: string) {
    super(name);
  }

  clone(name: string): BooleanSetting {
    return new BooleanSetting(name).setValue(this.getValue());
  }
}

export class StringSetting extends Setting<string, StringSetting> {
  min: number
  max: number

  constructor(name: string, min: number, max: number) {
    super(name)
    this.min = min;
    this.max = max;
  }

  clone(name: string): StringSetting {
    return new StringSetting(name, this.min, this.max).setValue(this.getValue());
  }
}

export class AlphanumericSetting extends Setting<string, AlphanumericSetting> {
  constructor(name: string) {
    super(name);
  }

  clone(name: string): AlphanumericSetting {
    return new AlphanumericSetting(name).setValue(this.getValue());
  }
}

export class IntegerSetting extends Setting<number, IntegerSetting> {
  min: number
  max: number

  constructor(name: string, min: number, max: number) {
    super(name)
    this.min = min;
    this.max = max;
  }

  clone(name: string): IntegerSetting {
    return new IntegerSetting(name, this.min, this.max).setValue(this.getValue());
  }
}

export class FloatSetting extends Setting<number, FloatSetting> {
  min: number
  max: number

  constructor(name: string, min: number = -1e6, max: number = 1e6) {
    super(name);
    this.min = min;
    this.max = max;
  }

  clone(name: string): FloatSetting {
    return new FloatSetting(name, this.min, this.max).setValue(this.getValue());
  }


  setValue(value: number): FloatSetting {
    return super.setValue(value);
  }
}

export class SelectSetting extends Setting<string, SelectSetting> {
  options: SettingOption[] = []

  constructor(name: string, options: SettingOption[]) {
    super(name);
    this.setOptions(options);
  }

  setOptions(options: SettingOption[]) {
    this.options = options.sort((o1, o2) => o1.value - o2.value);
  }

  index(): number {
    return this.indexOf(this.getValue())
  }

  indexOf(text: string) {
    for (const option of this.options) {
      if (option.text == text) {
        return option.value
      }
    }
    return -1
  }

  findOption(value: number): SettingOption | undefined {
    return this.options.find(o => o.value == value)
  }

  clone(name: string): SelectSetting {
    return new SelectSetting(name, this.options).setValue(this.getValue());
  }
}

export class PinSetting extends SelectSetting {
  constructor(name: string, options: SettingOption[]) {
    super(name, options);
  }

  setValue(value: string): SelectSetting {
    value = value.toLowerCase();
    let strings = value.split(":");
    value = strings[0].trim()
    if (value == "no_pin") {
      value = "NO_PIN"
    }
    super.setValue(value)

    if (this.name == "/uart1/rdx_pin") {
      console.log(`pin: ${value}, ${this._value}, ${this.getValue()}`)
    }
    return this
  }

  clone(name: string): PinSetting {
    return new PinSetting(name, this.options).setValue(this.getValue());
  }
}

export class TypeSetting extends SelectSetting {
  private group: SettingGroup;

  constructor(g: SettingGroup) {
    super("Type", []);
    this.group = g
    let names = ["NONE", ...g.groups.map(g => g.shortName)]
    this.setOptions(names.map((name, i) => new SettingOption(name, i)))
    let selectedGroup = g.groups.find(g => g.exists());
    this.setValue(selectedGroup?.shortName ?? "NONE")
  }

  setValue(value: string): SelectSetting {
    super.setValue(value);
    let selectedGroup = this.group?.groups.find(g => g.shortName == value);
    this.group.settings = [this]
    if (selectedGroup != undefined) {
      this.group.settings.push(...selectedGroup.settings)
    }
    return this
  }

  clone(name: string): SelectSetting {
    return new TypeSetting(this.group).setValue(this.getValue());
  }
}

export class SettingOption {
  text: string = ""
  value: number = -1

  constructor(name: string, value: number) {
    this.text = name;
    this.value = value;
  }
}

export abstract class Settings {
  public settings?: SettingGroup

  protected abstract loadSettings(): Promise<SettingGroup>

  abstract saveSetting(s: Setting<any, any>): Promise<any>

  load(): Promise<SettingGroup> {
    if (this.settings != undefined) {
      return Promise.resolve(this.settings)
    }
    return this.loadSettings()
        .then(settings => this.settings = settings)
  }

  parseSetting(s: any): Setting<any, any> {
    switch (s.T) {
      case "I":
        return new IntegerSetting(s.P, parseInt(s.M), parseInt(s.S)).setValue(parseInt(s.V))
      case "R":
        return new FloatSetting(s.P).setValue(parseFloat(s.V))
      case "S":
        return new StringSetting(s.P, parseInt(s.M), parseInt(s.S)).setValue(s.V)
      case "A":
        return new AlphanumericSetting(s.P).setValue(s.V)
      case "B":
        let options = (s.O as any[]).map(o => {
          let name = Object.keys(o)[0];
          return new SettingOption(name, o[name])
        })
        if (options.length == 2 && options[0].text == "False" && options[1].text == "True") {
          return new BooleanSetting(s.P).setValue(parseInt(s.V) == 1);
        } else {
          let option = options.find(o => o.value == s.V);
          return new SelectSetting(s.P, options).setValue(option!.text)
        }
      default:
        throw `Unknown setting type ${s.T}`
    }
  }

  get(name: string): Setting<any, any> | undefined {
    return this.settings?.get(name)
  }

  getSelect(name: string): SelectSetting | undefined {
    return this.get(name) as SelectSetting
  }

  exists(name: string) {
    return this.get(name) != undefined
  }

  getOrDefault<T>(name: string, def: T): T {
    let s = this.get(name);
    return s == undefined ? def : s.getValue()
  }

  getIndexOrDefault<T>(name: string, def: T): T {
    let s = this.get(name);
    return s == undefined
        ? def
        : s instanceof SelectSetting ? s.index() : s.getValue()
  }

  abstract saveSettings(): Promise<void>
}

export class SettingGroup {
  path: string;
  fullName: string
  shortName: string
  type: GroupType
  mode: GroupMode
  settings: Setting<any, any>[] = []
  groups: SettingGroup[] = []

  constructor(path: string, type: GroupType, mode: GroupMode = GroupMode.ALL) {
    this.path = path
    this.type = type;
    this.mode = mode;
    this.fullName = groupName(path)
    this.shortName = groupName(path.substring(path.lastIndexOf("/")))
  }

  set(name: string, value: any) {
    this.settings.forEach(s => {
      if (s.name == name) {
        s.setValue(value)
        s.exists = true
      }
    })
    this.groups.forEach(g => g.set(name, value))
  }

  get(name: string): Setting<any, any> | undefined {
    for (const child of this.settings) {
      if (child.name == name) {
        return child
      }
    }
    for (const child of this.groups) {
      let s = child.get(name);
      if (s != undefined) {
        return s
      }
    }
    return undefined
  }

  save(obj: any, defaults: SettingGroup) {
    if (this.isConfigured(defaults)) {
      this.settings.filter(s => s.name != "Type").forEach(s => s.insert(obj))
    }
    if (this.mode == GroupMode.ONE_OF) {
      let type = this.settings.find(s => s.name == "Type")?.getValue();
      if (type != undefined) {
        this.groups.find(g => g.shortName == type)?.save(obj, defaults)
      }
    } else {
      this.groups.forEach(g => g.save(obj, defaults))
    }
  }

  exists() {
    return this.settings.find(s => s.exists) != undefined;
  }

  isConfigured(defaults: SettingGroup) {
    return this.settings.find(s => s.isConfigured(defaults)) != undefined;
  }

  finalize() {
    if (this.mode == GroupMode.ONE_OF) {
      new TypeSetting(this)
    } else {
      this.groups.forEach(g => g.finalize())
    }
  }
}

function groupName(path: string) {
  return path
      .replace("/axes/", "")
      .replaceAll('/', ' ')
      .replaceAll('_', ' ')
      .split(" ")
      .map(capitalize)
      .map(splitNumber)
      .map(replaceAcronyms)
      .join(" ");
}

function replaceDimension(name: string) {
  name = name.replaceAll(' per ', '/')
  if (name.includes("mm/min")) {
    return name.replace("mm/min", "(mm/min)")
  } else if (name.includes("mm/sec2")) {
    return name.replace("mm/sec2", "(mm/s\u00B2)")
  } else if (name.includes(" mm")) {
    return name.replace(" mm", " (mm)")
  } else if (name.includes(" ms")) {
    return name.replace(" ms", " (ms)")
  } else if (name.includes(" us")) {
    return name.replace(" us", " (us)")
  } else if (name.includes(" Hz")) {
    return name.replace(" Hz", " (Hz)")
  }
  return name;
}

let acronyms = new Map([
  ["Rpm", "RPM"],
  ["I2c", "I2C"],
  ["I2so", "I2SO"],
  ["Pwm", "PWM"],
  ["Atc", "ATC"],
  ["Uart", "UART"],
  ["Sdcard", "SD Card"],
  ["Spi", "SPI"],
  ["Oled", "OLED"],
]);

let renames = new Map([
  ["Enable Parking Override Control", "Parking Override Control"],
]);

export function replaceAcronyms(name: string) {
  return acronyms.get(name) ?? name
}
