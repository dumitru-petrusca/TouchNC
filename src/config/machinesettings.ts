import {sendHttpRequest, writeFile} from '../http/http';
import {Setting, SettingGroup, Settings} from './settings';
import {SettingsUI} from './settingsui';
import {toYAML} from './yaml';
import {createGroupTemplate} from './machinetemplate';

class MachineSettings extends Settings {

  loadSettings(): Promise<SettingGroup> {
    return sendHttpRequest("/command?plain=" + encodeURIComponent("[ESP400]"))
        .then(value => this.parseSettings(value, "tree"))
  }

  parseSettings(str: string, type: string): SettingGroup {
    let group = createGroupTemplate();
    for (const s of JSON.parse(str).EEPROM) {
      if (s.F == type) {
        let setting = this.parseSetting(s);
        group.set(setting.name, setting.getValue())
      }
    }
    group.finalize()
    return group
  }

  saveSetting(setting: Setting<any, any>): Promise<any> {
    // command?plain=[ESP401]P=/axes/x/max_rate_mm_per_min T=R V=1500.001 & PAGEID=0
    return sendHttpRequest(`/command?plain=[ESP401]P=${setting.name} V=${setting.getValue()}`)
  }

  serializeSettings() {
    let obj = {}
    this.settings!.save(obj)
    return toYAML("", obj, "");
  }

  saveSettings(): Promise<any> {
    return writeFile("config.yaml", this.serializeSettings())
  }
}

export let machineSettings = new MachineSettings()
export let machineSettingsUI = new SettingsUI(machineSettings, "machineSettings")
