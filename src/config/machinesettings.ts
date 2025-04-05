import {sendHttpRequest, writeFile} from '../http/http';
import {AlphanumericSetting, BooleanSetting, cloneSetting, FloatSetting, GroupSetting, IntegerSetting, PinSetting, SelectSetting, Setting, SettingAttr, SettingGroup, Settings, StringSetting} from './settings';
import {toYAML, YAML} from './yaml';
import {messages} from '../messages/messages';
import {machineTemplate} from './machinetemplate';
import {Pin} from './esp32';
import {Set2} from '../common/set';

let configFileName = "config.yaml"

export class MachineSettings extends Settings {

  loadSettings(): Promise<SettingGroup> {
    return sendHttpRequest(configFileName)
        .then(yml => this.parseSettings(yml))
        .catch(reason => {
          console.log("Cannot load preferences; using defaults instead: " + reason)
          messages.warning("Cannot load preferences; using defaults instead.")
          return new SettingGroup("", SettingAttr.VIRTUAL);
        })
  }

  parseSettings(yamlStr: string): SettingGroup {
    let group = new SettingGroup("", SettingAttr.VIRTUAL);
    group.groups.push(...(instantiate(machineTemplate, "", group)))
    let yml = new YAML(yamlStr);
    yml.forEach((path, value) => {
      path = path.toLowerCase();
      let s = group.getSetting(path);
      if (s instanceof IntegerSetting) {
        s.setValue(parseInt(value))
      } else if (s instanceof FloatSetting) {
        s.setValue(parseFloat(value))
      } else if (s instanceof BooleanSetting) {
        s.setValue(value == "true")
      } else if (s instanceof StringSetting) {
        s.setValue(value)
      } else if (s instanceof PinSetting) {
        s.setValue(value)
      } else if (s instanceof AlphanumericSetting) {
        s.setValue(value)
      } else if (s instanceof GroupSetting) {
        s.setValue(value)
      } else if (s instanceof SelectSetting) {
        s.setValue(value)
      } else if (s == undefined) {
        console.error("Cannot find setting or group " + path)
        // throw Error("Cannot find setting or group " + path)
      }
    })
    group.finalize(yml)
    return group
  }


  saveSetting(setting: Setting<any, any>): Promise<any> {
    // command?plain=[ESP401]P=/axes/x/max_rate_mm_per_min T=R V=1500.001 & PAGEID=0
    // return sendHttpRequest(`/command?plain=[ESP401]P=${setting.name} V=${setting.getValue()}`)
    return Promise.resolve()
  }

  serializeSettings() {
    let obj = {}
    this.settings!.serialize(obj)
    return toYAML("", obj, "");
  }

  saveSettings(): Promise<any> {
    let yml = this.serializeSettings();
    console.log(yml)
    return writeFile("config.yaml", yml)
  }

  getDisplayGroups() {
    let groups = this.settings?.groups ?? [];
    return [...groups].sort((a, b) => layout.indexOf(a.path) - layout.indexOf(b.path))
  }

  getUsedPins(): Set2<Pin> {
    let set = new Set2<Pin>();
    this.settings?.getUsedPins(set)
    return set
  }
}

function instantiate(obj: any, path: string, parent: SettingGroup): SettingGroup[] {
  let groups = []
  for (const key of Object.keys(obj)) {
    let childObj = obj[key]
    if (childObj instanceof Setting) {
      let name = path + "/" + key;
      let setting = cloneSetting(childObj).setName(name).setParent(parent);
      parent.settings.push(setting)
    } else if (typeof childObj == "object") {
      let group = new SettingGroup(path + "/" + key, childObj._attributes).setParent(parent);
      groups.push(group);
      let holder = group.isOneOf() ? group.groups : groups
      let path2 = group.isVirtual() ? path : path + "/" + key;
      holder.push(...instantiate(childObj, path2, group))
    }
  }
  return groups
}

let layout = [
  '/general', '/axes', '/kinematics',
  '/start', '/coolant', '/probe',
  '/stepping', '/various', '/parking',
  '/axes/x', '/axes/y', '/axes/z',
  '/axes/x/motor0', '/axes/y/motor0', '/axes/z/motor0',
  '/axes/x/motor0/driver', '/axes/y/motor0/driver', '/axes/z/motor0/driver',
  '/axes/x/motor1', '/axes/y/motor1', '/axes/z/motor1',
  '/axes/x/motor1/driver', '/axes/y/motor1/driver', '/axes/z/motor1/driver',
  '/axes/x/homing', '/axes/y/homing', '/axes/z/homing',
  '/axes/x/mpg', '/axes/y/mpg', '/axes/z/mpg',
  '/axes/a', '/axes/b', '/axes/c',
  '/axes/a/motor0', '/axes/b/motor0', '/axes/c/motor0',
  '/axes/a/motor0/driver', '/axes/b/motor0/driver', '/axes/c/motor0/driver',
  '/axes/a/motor1', '/axes/b/motor1', '/axes/c/motor1',
  '/axes/a/motor1/driver', '/axes/b/motor1/driver', '/axes/c/motor1/driver',
  '/axes/a/homing', '/axes/b/homing', '/axes/c/homing',
  '/axes/a/mpg', '/axes/b/mpg', '/axes/c/mpg',
  '/status_outputs', '/macros', '/synchro',
  '/control', '/user_outputs', '/user_inputs',
  '/i2so', '/i2c0', '/i2c1',
  '/uart1', '/uart2', '/uart3',
  '/uart_channel1', '/uart_channel2', '/spi',
  '/sdcard', '/oled', '/spindle',
  '/atc'
]

export let machineSettings = new MachineSettings()