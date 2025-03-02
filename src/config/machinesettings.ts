import {sendHttpRequest, writeFile} from '../http/http';
import {Setting, SettingGroup, Settings} from './settings';
import {SettingsUI} from './settingsui';
import {toYAML, YAML} from './yaml';
import {createGroupTemplate} from './machinetemplate';

let configFileName = "config.yaml"

class MachineSettings extends Settings {

  loadSettings(): Promise<SettingGroup> {
    return sendHttpRequest(configFileName)
        .then(yml => this.parseSettings(yml))
        // .catch(reason => {
        //   console.log("Cannot load preferences; using defaults instead: " + reason)
        //   messages.warning("Cannot load preferences; using defaults instead.")
        //   return {};
        // })
  }

  parseSettings(yamlStr: string): SettingGroup {
    let yml = new YAML(yamlStr);
    let group = createGroupTemplate();
    group.set(yml)
    group.finalize()
    return group
  }

  saveSetting(setting: Setting<any, any>): Promise<any> {
    // command?plain=[ESP401]P=/axes/x/max_rate_mm_per_min T=R V=1500.001 & PAGEID=0
    return sendHttpRequest(`/command?plain=[ESP401]P=${setting.name} V=${setting.getValue()}`)
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
}

export let machineSettings = new MachineSettings()
export let machineSettingsUI = new SettingsUI(machineSettings, "machineSettings")
