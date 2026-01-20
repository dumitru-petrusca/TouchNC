import { capitalize, charAt, dropLast, last } from '../common/common';
import { YAML } from './yaml';
import { NO_PIN_CONFIG, parsePinConfig, Pin, PinCap, PinConfig } from './esp32';
import { Set2 } from '../common/set';
import { isDigit } from 'json5/lib/util';
import { Icon } from '../ui/icons';

export enum SettingAttr {
  DEFAULT = 0,
  VIRTUAL = 1 << 0,
  ONE_OF = 1 << 1,
  HIDDEN = 1 << 2,
}


export abstract class Setting<T, B extends Setting<T, B>> {
  parent?: SettingGroup
  path: string = ""
  name: string = ""
  readonly defaultValue: T
  protected oldValue: T
  protected value: T
  private configured = false;

  protected constructor(name: string, defaultValue: T) {
    this.setName(name)
    this.value = defaultValue
    this.oldValue = defaultValue
    this.defaultValue = defaultValue
  }

  setValue(value: T): B {
    this.oldValue = this.value
    this.value = value;
    return this as any
  }

  setDisplayName(name: string) {
    this.name = name
    return this;
  }

  setParent(parent: SettingGroup): B {
    this.parent = parent
    return this as any
  }

  setName(name: string): B {
    this.path = name;
    this.name = settingName(name)
    return this as any
  }

  setConfigured() {
    this.configured = true
  }

  save(yml: YAML) {
    if (this.isReal()) {
      yml.setValue(this.path, this.stringValue())
    }
  }

  finalize() {
  }

  getValue = (): T => this.value!;
  undo = () => this.value = this.oldValue;
  isConfigured = () => this.configured || this.isModified();
  isModified = () => !this.valuesEqual(this.getValue(), this.defaultValue);

  public valuesEqual(v1: T, v2: T): boolean {
    if (v1 === v2) return true;
    if (v1 == null || v2 == null) return v1 === v2;
    if (typeof v1 === 'object') {
      return JSON.stringify(v1) === JSON.stringify(v2);
    }
    return v1 == v2;
  }

  isReal = () => true;

  stringValue(): string {
    return this.value as string
  }

  resetToDefault() {
    this.value = this.defaultValue;
    this.configured = false;
  }
}

export class BooleanSetting extends Setting<boolean, BooleanSetting> {
  constructor(name: string, defaultValue: boolean) {
    super(name, defaultValue);
  }
}

export class StringSetting extends Setting<string, StringSetting> {
  min: number
  max: number

  constructor(name: string, defaultValue: string, min: number, max: number) {
    super(name, defaultValue)
    this.min = min;
    this.max = max;
  }
}

export class AlphanumericSetting extends Setting<string, AlphanumericSetting> {
  constructor(name: string, defaultValue: string) {
    super(name, defaultValue);
  }
}

export class IntegerSetting extends Setting<number, IntegerSetting> {
  min: number
  max: number

  constructor(name: string, defaultValue: number, min: number, max: number) {
    super(name, defaultValue)
    this.min = min;
    this.max = max;
  }
}

export class FloatSetting extends Setting<number, FloatSetting> {
  min: number
  max: number

  constructor(name: string, defaultValue: number, min: number, max: number) {
    super(name, defaultValue);
    this.min = min;
    this.max = max;
  }
}

export class SelectSetting extends Setting<string, SelectSetting> {
  options: SelectOption[] = []

  constructor(name: string, defaultValue: string, options: SelectOption[]) {
    super(name, defaultValue);
    this.setOptions(options);
  }

  setOptions = (options: SelectOption[]) => {
    this.options = options.sort((o1, o2) => o1.id - o2.id);
  }

  index = (): number => this.indexOf(this.getValue());
  indexOf = (value: string) => this.options.find(o => o.value == value)?.id ?? -1;
  findOption = (value: number) => this.options.find(o => o.id == value);
}

export class PinSetting extends Setting<PinConfig, PinSetting> {
  caps: PinCap;

  constructor(name: string, defaultValue: PinConfig, cap: PinCap) {
    super(name, defaultValue);
    this.caps = cap;
  }

  setValue(value: PinConfig | string): PinSetting {
    if (typeof value == "string") {
      value = parsePinConfig(value)
    }
    return super.setValue(value)
  }

  validate(value: string) {
    let s = value.split(":").map(s => s.trim());
    return (s.length == 1 && this.pinOk(s[0])) ||
      (s.length == 2 && this.pinOk(s[0]) && (this.isUpDown(s[1]) || this.isLowHigh(s[1]))) ||
      (s.length == 3 && this.pinOk(s[0]) && this.isUpDown(s[1]) && this.isLowHigh(s[2]))
  }

  pinOk = (pin: string) => this.value.hasCaps(this.caps);
  isUpDown = (s: string) => s == "pu" || s == "pd";
  isLowHigh = (s: string) => s == "low" || s == "high";
  pin = () => this.value.pin
  bias = () => this.value.bias
  active = () => this.value.active
  stringValue = () => this.value.toString()
}

export class GroupSetting extends SelectSetting {
  groupPath: string;
  group?: SettingGroup;
  attr: SettingAttr;

  constructor(name: string, groupName: string, attr: SettingAttr) {
    super(name, "NONE", []);
    this.groupPath = groupName;
    this.attr = attr;
    this.setValue("NONE")
  }

  finalize() {
    this.group = this.groupPath == "this" ?
      this.getParent() :
      this.getParent().getRoot().getGroup(this.groupPath)
    if (this.group == undefined) {
      throw `Cannot find groups with name: ${this.groupPath}`
    }
    this.setOptions([
      new SelectOption(0, "NONE", "None"),
      ...this.group!.groups.map((g, i) => new SelectOption(i + 1, g.name, groupName(g.name)))
    ])
    if (this.isVirtual()) {
      this.setValue(this.group!.groups.find(g => g.isConfigured())?.name ?? "NONE")
    }
  }

  setValue(value: string): SelectSetting {
    if (value != this.value) {
      let currentGroup = this.getSelectedGroup();
      let newGroup = this.group?.getGroupByName(value!);
      if (currentGroup != undefined && newGroup != undefined) {
        newGroup.copyValuesFrom(currentGroup)
      }
    }
    return super.setValue(value);
  }

  save(yml: YAML) {
    super.save(yml);
    this.getSelectedGroup()?.save(yml, true);
  }

  private getParent(): SettingGroup {
    if (this.parent != undefined) {
      return this.parent
    }
    throw new Error(`Setting ${this.path} does not have a parent`)
  }

  getSelectedGroup = () => this.group?.getGroupByName(this.value!);
  getLinkedSettings = () => this.group?.groups.find(g => g.name == this.value)?.settings ?? [];
  isReal = () => (this.attr & SettingAttr.VIRTUAL) == 0;
  isVirtual = () => !this.isReal();
}

export class SelectOption {
  id: number = -1
  value: string = ""
  text: string = ""
  icon?: Icon

  constructor(id: number, value: string, text: string, icon?: Icon) {
    this.id = id;
    this.value = value;
    this.text = text
    this.icon = icon
  }
}

export const string = (value: string, min: number, max: number) => string_("", value, min, max)
export const string_ = (name: string, value: string, min: number, max: number) => new StringSetting(name, value, min, max).setValue(value);
export const alpha = (value: string) => new AlphanumericSetting("", value).setValue(value);
export const alpha_ = (name: string, value: string) => new AlphanumericSetting(name, value).setValue(value);
export const int_ = (name: string, value: number, min: number, max: number) => new IntegerSetting(name, value, min, max).setValue(value);
export const int = (value: number, min: number, max: number) => new IntegerSetting("", value, min, max).setValue(value);
export const bool = (value: boolean) => new BooleanSetting("", value).setValue(value);
export const bool_ = (name: string, value: boolean) => new BooleanSetting(name, value).setValue(value);
export const float = (value: number, min: number, max: number) => new FloatSetting("", value, min, max).setValue(value);
export const float_ = (name: string, value: number, min: number, max: number) => new FloatSetting(name, value, min, max).setValue(value);
export const position = (min: number, max: number) => new StringSetting("", "0, 0, 0", min, max).setValue("0, 0, 0");  // TODO-dp - needs work
export const select = (value: string, values: string[]) => new SelectSetting("", value, values.map((v, i) => new SelectOption(i, v, v))).setValue(value);
export const select_ = (name: string, value: string, values: string[]) => new SelectSetting(name, value, values.map((v, i) => new SelectOption(i, v, v))).setValue(value);
export const group = (group: string, attr: SettingAttr = 0) => new GroupSetting("", group, attr);
export const pin = (cap: PinCap) => new PinSetting("", NO_PIN_CONFIG, cap).setValue(NO_PIN_CONFIG);

export function cloneSetting<T extends Setting<any, T>>(s: T): T {
  let ss: Setting<any, any>
  if (s instanceof IntegerSetting) {
    ss = new IntegerSetting(s.path, s.defaultValue, s.min, s.min)
  } else if (s instanceof FloatSetting) {
    ss = new FloatSetting(s.path, s.defaultValue, s.min, s.min)
  } else if (s instanceof BooleanSetting) {
    ss = new BooleanSetting(s.path, s.defaultValue)
  } else if (s instanceof StringSetting) {
    ss = new StringSetting(s.path, s.defaultValue, s.min, s.max)
  } else if (s instanceof AlphanumericSetting) {
    ss = new AlphanumericSetting(s.path, s.defaultValue)
  } else if (s instanceof PinSetting) {
    ss = new PinSetting(s.path, s.defaultValue, s.caps)
  } else if (s instanceof GroupSetting) {
    ss = new GroupSetting(s.path, s.groupPath, s.attr)
  } else if (s instanceof SelectSetting) {
    ss = new SelectSetting(s.path, s.defaultValue, s.options)
  } else {
    throw `Cannot clone setting: ${s}`;
  }
  ss.setValue(s.getValue())  // TODO not sure about this
  return ss as any
}

export abstract class Settings {
  public settings?: SettingGroup

  protected abstract loadSettings(): Promise<SettingGroup>

  abstract saveSetting(s: Setting<any, any>): Promise<any>

  abstract saveSettings(): Promise<void>

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
        return int_(s.P, parseInt(s.V), parseInt(s.M), parseInt(s.S))
      case "R":
        return float_(s.P, parseFloat(s.V), -1e6, 1e6)
      case "S":
        return string_(s.P, s.V, parseInt(s.M), parseInt(s.S))
      case "A":
        return alpha_(s.P, s.V)
      case "B":
        // TODO-dp simplify
        let options = (s.O as any[]).map(o => {
          let name = Object.keys(o)[0];
          return new SelectOption(o[name], name, name)
        }).sort((o1, o2) => o1.id - o2.id);

        if (options.length == 2 && options[0].value == "False" && options[1].value == "True") {
          return bool_(s.P, parseInt(s.V) == 1)
        } else {
          let value = options.find(o => o.id == s.V)!.value;
          return select_(s.P, value, options.map(o => o.value))
        }
      default:
        throw `Unknown setting type ${s.T}`
    }
  }

  getDisplayGroups(): SettingGroup[] {
    return this.settings?.groups ?? [];
  }

  get = <T>(path: string): Setting<T, any> | undefined => this.settings?.getSetting<T>(path.toLowerCase());
  intSetting = (path: string) => this.get(path) as IntegerSetting;
  floatSetting = (path: string) => this.get(path) as FloatSetting;
  pinSetting = (path: string) => this.get(path) as PinSetting;
  getOrDefault = <T>(name: string, def: T): T => this.get<T>(name)?.getValue() ?? def;
  getSelect = (name: string) => this.get(name) as SelectSetting | undefined;
  isConfigured = (name: string) => this.get(name)?.isConfigured();
}

export class SettingGroup {
  path: string;
  name: string
  attributes: SettingAttr
  settings: Setting<any, any>[]
  groups: SettingGroup[]
  parent?: SettingGroup;
  // TODO-dp - figure this out
  configured: boolean = false;
  enabled: boolean = true;

  constructor(path: string, attributes: SettingAttr,
    settings: Setting<any, any>[] = [], groups: SettingGroup[] = []) {
    this.path = path
    this.name = path.substring(path.lastIndexOf("/") + 1)
    this.attributes = attributes;
    this.settings = settings
    this.groups = groups
  }

  getSetting<T>(path: string): Setting<T, any> | undefined {
    for (const s of this.settings) {
      if (s.path.toLowerCase() == path) {
        return s
      }
    }
    for (const g of this.groups) {
      let s = g.getSetting(path);
      if (s != undefined) {
        return s as Setting<T, any>
      }
    }
    return undefined
  }

  getGroup(path: string): SettingGroup | undefined {
    if (this.path.toLowerCase() == path.toLowerCase()) {
      return this
    }
    for (const child of this.groups) {
      let g = child.getGroup(path);
      if (g != undefined) {
        return g
      }
    }
    return undefined
  }

  getGroupByName(name: string): SettingGroup | undefined {
    if (this.name == name) {
      return this
    }
    for (const child of this.groups) {
      let g = child.getGroupByName(name);
      if (g != undefined) {
        return g
      }
    }
    return undefined
  }

  save(yml: YAML, force = false) {
    if (force || this.isConfigured()) {
      if (!this.isVirtual()) {
        yml.setGroup(this.path, this.enabled)
      }
      this.settings.forEach(s => s.save(yml))
    }
    if (!this.isOneOf()) {
      this.groups.forEach(g => g.save(yml))
    }
  }

  setParent(parent: SettingGroup): SettingGroup {
    this.parent = parent;
    return this
  }

  finalize(yml: YAML) {
    this.configured = yml.get(this.path) != undefined
    this.groups.forEach(g => g.finalize(yml))
    this.settings.forEach(s => s.finalize())
  }

  expandSettings(): Setting<any, any>[] {
    let expansion: Setting<any, any>[] = []
    let q = [...this.settings]
    while (q.length != 0) {
      let s = q.shift()
      if (s instanceof GroupSetting) {
        q.push(...s.getLinkedSettings())
      }
      expansion.push(s as any)
    }
    return expansion
  }

  copyValuesFrom(g: SettingGroup) {
    this.settings.forEach(s1 => {
      let name1 = s1.path.substring(s1.path.lastIndexOf("/"));
      let s2 = g.settings.find(s => s.path.endsWith(name1))
      if (s2 != undefined) {
        s1.setValue(s2.getValue())
      }
    })
  }

  getUsedPins(set: Set2<Pin>) {
    for (const setting of this.settings) {
      if (setting instanceof PinSetting) {
        let pin = setting.pin();
        if (pin) {
          set.add(pin)
        }
      }
    }
    this.groups.forEach(g => g.getUsedPins(set))
  }

  getRoot = (r: SettingGroup = this): SettingGroup => r.parent == undefined ? r : this.getRoot(r.parent);
  isConfigured = (): boolean =>
    this.configured ||
    this.enabled !== true ||
    this.settings.some(s => s.isConfigured()) ||
    this.groups.some(g => g.isConfigured());

  isModified = (): boolean =>
    this.enabled !== true ||
    this.settings.some(s => s.isModified()) ||
    this.groups.some(g => g.isModified());

  isOneOf = () => (this.attributes & SettingAttr.ONE_OF) != 0
  isVirtual = () => (this.attributes & SettingAttr.VIRTUAL) != 0
  isHidden = () => (this.attributes & SettingAttr.HIDDEN) != 0

  resetToDefault() {
    this.configured = false;
    this.settings.forEach(s => s.resetToDefault());
    this.groups.forEach(g => g.resetToDefault());
  }
}

let acronyms = new Map([
  ["mm/min", "(mm/min)"],
  ["mm/sec2", "(mm/s\u00B2)"],
  ["mm", "(mm)"],
  ["ms", "(ms)"],
  ["us", "(us)"],
  ["Hz", "(Hz)"],
  ["rpm", "RPM"],
  ["i2c", "I2C"],
  ["i2so", "I2SO"],
  ["pwm", "PWM"],
  ["atc", "ATC"],
  ["uart", "UART"],
  ["adcard", "SD Card"],
  ["spi", "SPI"],
  ["oled", "OLED"],
]);

export function groupName(path: string) {
  let name = path
    .replace("/axes/", "")
    .replaceAll('/', ' ')
    .replaceAll('_', ' ')
    .split(" ")
    .flatMap(splitNumber)
    .map(name => acronyms.get(name) ?? name)
    .map(capitalize)
    .join(" ");
  return renames.get(name) ?? name
}

export function settingName(name: string) {
  name = name
    .substring(name.lastIndexOf("/") + 1)
    .replaceAll('_', ' ')
    .replaceAll(' per ', '/')
    .split(" ")
    .map(name => acronyms.get(name) ?? name)
    .map(capitalize)
    .join(" ");
  return renames.get(name) ?? name
}

function splitNumber(name: string): string[] {
  if (name.length >= 2 && isDigit(charAt(name, -1)) && !isDigit(charAt(name, -2))) {
    return [dropLast(name), last(name)];
  } else {
    return [name];
  }
}

let renames = new Map([
  ["Enable Parking Override Control", "Parking Override Control"],
  ["Shared Stepper Disable Pin", "Shared Disable Pin"],
  ["Shared Stepper Reset Pin", "Shared Reset Pin"],
  ["Parking Override Control", "Parking Override"],
]);
