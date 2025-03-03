import {capitalize, splitNumber} from '../common';
import {YAML} from './yaml';

export enum SettingAttr {
  DEFAULT = 0,
  VIRTUAL = 1 << 0,
  ONE_OF = 1 << 1,
  HIDDEN = 1 << 2,
}

export abstract class Setting<T, B extends Setting<T, B>> {
  parent?: SettingGroup
  name: string = ""
  displayName: string = ""
  defaultValue: T
  protected oldValue?: T
  value?: T

  protected constructor(name: string, defaultValue: T) {
    this.setName(name)
    this.defaultValue = defaultValue
  }

  setValue(value: T): B {
    this.oldValue = this.value
    this.value = value;
    return this as any
  }

  setDisplayName(name: string) {
    this.displayName = name
    return this;
  }

  setParent(parent: SettingGroup): B {
    this.parent = parent
    return this as any
  }

  setName(name: string): B {
    this.name = name;
    name = this.name
        .substring(this.name.lastIndexOf("/") + 1)
        .replaceAll('_', ' ')
    name = replaceDimension(name)
        .split(" ")
        .map(capitalize)
        .map(replaceAcronyms)
        .join(" ");
    this.displayName = renames.get(name) ?? name
    return this as any
  }

  insert(obj: Record<string, any>) {
    if (this.isReal()) {
      insert(obj, this.name, this.value)
    }
  }

  finalize() {
  }

  getValue = (): T => this.value!;
  undo = () => this.value = this.oldValue;
  isConfigured = () => this.getValue() != this.defaultValue;
  isReal = () => true;
}

function insert(obj: Record<string, any>, path: string, value: any = undefined) {
  let fields = path.substring(1).split("/");
  let o = obj
  for (let i = 0; i < fields.length - 1; i++) {
    let f = fields[i]
    o = o[f] == undefined ? (o[f] = {}) : o[f];
  }
  if (value != undefined) {
    o[fields[fields.length - 1]] = value
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
    this.options = options.sort((o1, o2) => o1.value - o2.value);
  }

  index = (): number => this.indexOf(this.getValue());
  indexOf = (text: string) => this.options.find(o => o.text == text)?.value ?? -1;
  findOption = (value: number) => this.options.find(o => o.value == value);
}

export class PinSetting extends SelectSetting {
  constructor(name: string, defaultValue: string, options: SelectOption[]) {
    super(name, defaultValue, options);
    options.forEach((o, i) => o.value = i)
  }

  setValue(value: string): PinSetting {
    value = value.toLowerCase();
    //TODO-dp I am dropping the modifier
    // value = (value.split(":"))[0].trim()
    if (value == "no_pin") {
      value = "NO_PIN"
    }
    super.setValue(value)
    return this
  }

  validate(value: string) {
    let s = value.split(":").map(s => s.trim());
    return (s.length == 1 && this.pinOk(s[0])) ||
        (s.length == 2 && this.pinOk(s[0]) && (this.isUpDown(s[1]) || this.isLowHigh(s[1]))) ||
        (s.length == 3 && this.pinOk(s[0]) && this.isUpDown(s[1]) && this.isLowHigh(s[2]))
  }

  pinOk = (pin: string) => this.options.find(o => o.text == pin) != undefined;
  isUpDown = (s: string) => s == "pu" || s == "pd";
  isLowHigh = (s: string) => s == "low" || s == "high";
}

export class GroupSetting extends SelectSetting {
  groupPath: string;
  group?: SettingGroup;
  attr: SettingAttr;

  constructor(name: string, groupName: string, attr: SettingAttr) {
    super(name, "", []);
    this.groupPath = groupName;
    this.attr = attr;
    this.defaultValue = "";
    this.setValue("")
  }

  finalize() {
    if (this.name == "/kinematics/_type") {
      console.log("aaa")
    }
    this.group = this.groupPath == "this" ?
        this.getParent() :
        this.getParent().getRoot().getGroupByPath(this.groupPath)
    if (this.group == undefined) {
      throw `Cannot find groups with name: ${this.groupPath}`
    }
    this.setOptions([
      new SelectOption("NONE", "None", 0),
      ...this.group!.groups.map((g, i) => new SelectOption(g.name, groupName(g.name), i + 1))
    ])
    if (this.isVirtual()) {
      this.setValue(this.group!.groups.find(g => g.isConfigured())?.name ?? "NONE")
    }
  }

  setValue(value: string): SelectSetting {
    if (this.name == "/_type") {
      console.log("aaa")
    }
    if (value != this.value) {
      let currentGroup = this.getSelectedGroup();
      let newGroup = this.group?.getGroupByName(value!);
      if (currentGroup != undefined && newGroup != undefined) {
        newGroup.copyValuesFrom(currentGroup)
      }
    }
    return super.setValue(value);
  }

  insert(obj: Record<string, any>) {
    super.insert(obj);
    this.getSelectedGroup()?.insert(obj, true);
  }

  private getParent(): SettingGroup {
    if (this.parent != undefined) {
      return this.parent
    }
    throw new Error(`Setting ${this.name} does not have a parent`)
  }

  getSelectedGroup = () => this.group?.getGroupByName(this.value!);
  getLinkedSettings = () => this.group?.groups.find(g => g.name == this.value)?.settings ?? [];
  isReal = () => (this.attr & SettingAttr.VIRTUAL) == 0;
  isVirtual = () => !this.isReal();
}

export class SelectOption {
  text: string = ""
  displayText: string = ""
  value: number = -1

  constructor(text: string, displayText: string, value: number) {
    this.text = text;
    this.displayText = displayText
    this.value = value;
  }
}

function pins(prefix: "gpio" | "i2so", from: number, to: number): SelectOption[] {
  let pins = []
  for (let i = from; i <= to; i++) {
    let pin = prefix + "." + i;
    pins.push(new SelectOption(pin, pin, i))
  }
  return pins;
}

const pinsIO = [
  new SelectOption("NO_PIN", "None", 0),
  ...pins("gpio", 0, 5),
  ...pins("gpio", 12, 19),
  ...pins("gpio", 21, 23),
  ...pins("gpio", 25, 27),
  ...pins("gpio", 32, 33)
]
const pinsI = [...pinsIO, ...pins("gpio", 34, 39)]
const pinsO = [...pinsIO, ...pins("i2so", 0, 15)]

export const string = (value: string, min: number, max: number) => string_("", value, min, max)
export const string_ = (name: string, value: string, min: number, max: number) => new StringSetting(name, value, min, max).setValue(value);
export const alpha_ = (name: string, value: string) => new AlphanumericSetting(name, value).setValue(value);
export const int_ = (name: string, value: number, min: number, max: number) => new IntegerSetting(name, value, min, max).setValue(value);
export const int = (value: number, min: number, max: number) => new IntegerSetting("", value, min, max).setValue(value);
export const bool = (value: boolean) => new BooleanSetting("", value).setValue(value);
export const bool_ = (name: string, value: boolean) => new BooleanSetting(name, value).setValue(value);
export const float = (value: number, min: number, max: number) => new FloatSetting("", value, min, max).setValue(value);
export const float_ = (name: string, value: number, min: number, max: number) => new FloatSetting(name, value, min, max).setValue(value);
export const position = (min: number, max: number) => new StringSetting("", "0, 0, 0", min, max).setValue("0, 0, 0");  // TODO-dp - needs work
export const select = (value: string, values: string[]) => new SelectSetting("", value, values.map((v, i) => new SelectOption(v, v, i))).setValue(value);
export const select_ = (name: string, value: string, values: string[]) => new SelectSetting(name, value, values.map((v, i) => new SelectOption(v, v, i))).setValue(value);
export const group = (group: string, attr: SettingAttr = 0) => new GroupSetting("", group, attr);
export const pinI = () => new PinSetting("", "NO_PIN", pinsI).setValue("NO_PIN");
export const pinO = () => new PinSetting("", "NO_PIN", pinsO).setValue("NO_PIN");
export const pinIO = () => new PinSetting("", "NO_PIN", pinsIO).setValue("NO_PIN");

export function cloneSetting<T extends Setting<any, T>>(s: T): T {
  let ss: Setting<any, any>
  if (s instanceof IntegerSetting) {
    ss = new IntegerSetting(s.name, s.defaultValue, s.min, s.min)
  } else if (s instanceof FloatSetting) {
    ss = new FloatSetting(s.name, s.defaultValue, s.min, s.min)
  } else if (s instanceof BooleanSetting) {
    ss = new BooleanSetting(s.name, s.defaultValue)
  } else if (s instanceof StringSetting) {
    ss = new StringSetting(s.name, s.defaultValue, s.min, s.max)
  } else if (s instanceof AlphanumericSetting) {
    ss = new AlphanumericSetting(s.name, s.defaultValue)
  } else if (s instanceof PinSetting) {
    ss = new PinSetting(s.name, s.defaultValue, s.options)
  } else if (s instanceof GroupSetting) {
    ss = new GroupSetting(s.name, s.groupPath, s.attr)
  } else if (s instanceof SelectSetting) {
    ss = new SelectSetting(s.name, s.defaultValue, s.options)
  } else {
    throw `Cannot clone setting: ${s}`;
  }
  ss.value = s.value
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
          return new SelectOption(name, name, o[name])
        }).sort((o1, o2) => o1.value - o2.value);

        if (options.length == 2 && options[0].text == "False" && options[1].text == "True") {
          return bool_(s.P, parseInt(s.V) == 1)
        } else {
          let value = options.find(o => o.value == s.V)!.text;
          return select_(s.P, value, options.map(o => o.text))
        }
      default:
        throw `Unknown setting type ${s.T}`
    }
  }

  getIndexOrDefault<T>(name: string, def: T): T {
    let s = this.get(name);
    return s == undefined
        ? def
        : s instanceof SelectSetting ? s.index() : s.getValue()
  }

  getDisplayGroups(): SettingGroup[] {
    return this.settings?.groups ?? [];
  }

  get = (name: string) => this.settings?.getSetting(name);
  getOrDefault = <T>(name: string, def: T): T => this.get(name)?.getValue() ?? def;
  getSelect = (name: string) => this.get(name) as SelectSetting;
  isConfigured = (name: string) => this.get(name)?.isConfigured();
}

export class SettingGroup {
  path: string;
  name: string
  attributes: SettingAttr
  settings: Setting<any, any>[]
  groups: SettingGroup[]
  parent?: SettingGroup;
  configured: boolean = false;

  constructor(path: string, attributes: SettingAttr,
              settings: Setting<any, any>[] = [], groups: SettingGroup[] = []) {
    this.path = path
    this.name = path.substring(path.lastIndexOf("/") + 1)
    this.attributes = attributes;
    this.settings = settings
    this.groups = groups
  }

  set(yml: YAML) {
    this.settings.forEach(s => {
      let value = yml.get(s.name);
      if (value != undefined) {
        s.setValue(value)
      }
    })
    this.configured = yml.get(this.path) != undefined
    this.groups.forEach(g => g.set(yml))
  }

  getSetting(name: string): Setting<any, any> | undefined {
    for (const child of this.settings) {
      if (child.name == name) {
        return child
      }
    }
    for (const child of this.groups) {
      let s = child.getSetting(name);
      if (s != undefined) {
        return s
      }
    }
    return undefined
  }

  getGroupByPath(path: string): SettingGroup | undefined {
    if (this.path == path) {
      return this
    }
    for (const child of this.groups) {
      let g = child.getGroupByPath(path);
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

  insert(obj: any, force = false) {
    if (this.path == "/kinematics/Cartesian") {//TODO-dp
      let i = 0;
    }
    if (force) {
      insert(obj, this.path + "/")
    }
    if (force || this.isConfigured()) {
      this.settings.forEach(s => s.insert(obj))
    }
    if (!this.isOneOf()) {
      this.groups.forEach(g => g.insert(obj))
    }
  }

  setParent(parent: SettingGroup): SettingGroup {
    this.parent = parent;
    return this
  }

  finalize() {
    this.groups.forEach(g => g.finalize())
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
      let name1 = s1.name.substring(s1.name.lastIndexOf("/"));
      let s2 = g.settings.find(s => s.name.endsWith(name1))
      if (s2 != undefined) {
        s1.setValue(s2.getValue())
      }
    })
  }

  getRoot = (r: SettingGroup = this): SettingGroup => r.parent == undefined ? r : this.getRoot(r.parent);
  isConfigured = () => this.configured || this.settings.find(s => s.isConfigured()) != undefined;
  isOneOf = () => (this.attributes & SettingAttr.ONE_OF) != 0
  isVirtual = () => (this.attributes & SettingAttr.VIRTUAL) != 0
  isHidden = () => (this.attributes & SettingAttr.HIDDEN) != 0
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

export function groupName(path: string) {
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
