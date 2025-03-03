import {sendHttpRequest, writeFile} from '../http/http';
import {Setting, SettingAttr, SettingGroup, Settings} from './settings';
import {SettingsUI} from './settingsui';
import {toYAML, YAML} from './yaml';
import {instantiateTemplate} from './machinetemplate';
import {messages} from '../messages/messages';

let configFileName = "config.yaml"

class MachineSettings extends Settings {

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
    let yml = new YAML(yamlStr);
    let group = instantiateTemplate();
    group.set(yml)
    group.finalize()
    return group
  }

  saveSetting(setting: Setting<any, any>): Promise<any> {
    // command?plain=[ESP401]P=/axes/x/max_rate_mm_per_min T=R V=1500.001 & PAGEID=0
    // return sendHttpRequest(`/command?plain=[ESP401]P=${setting.name} V=${setting.getValue()}`)
    return Promise.resolve()
  }

  serializeSettings() {
    let obj = {}
    this.settings!.insert(obj)
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
export let machineSettingsUI = new SettingsUI(machineSettings, "machineSettings")
