import {sendHttpRequest} from '../http/http';
import {GroupMode, GroupType, SelectSetting, Setting, SettingGroup, Settings} from './settings';
import {EnableRule, SettingsUI} from './settingsui';

class WiFi extends Settings {
  loadSettings(): Promise<SettingGroup> {
    return sendHttpRequest("/command?plain=" + encodeURIComponent("[ESP400]"))
        .then(value => this.parseSettings(value))
  }

  parseSettings(str: string): SettingGroup {
    let settings = JSON.parse(str).EEPROM as [any]
    return new SettingGroup("", GroupType.NORMAL, GroupMode.ALL, [], [
      new SettingGroup("WiFi", GroupType.NORMAL, GroupMode.ALL, [
        this.parse("WiFi/Mode", settings),
        this.parse("MDNS/Enable", settings).setDisplayName("MDNS"),
        this.parse("Hostname", settings),
      ]),
      new SettingGroup("Network", GroupType.NORMAL, GroupMode.ALL, [
        this.parse("Sta/SSID", settings),
        this.parse("Sta/IPMode", settings),
        this.parse("Sta/IP", settings),
        this.parse("Sta/Gateway", settings),
        this.parse("Sta/Netmask", settings),
        this.parse("Sta/Password", settings),
      ]),
      new SettingGroup("Access Point", GroupType.NORMAL, GroupMode.ALL, [
        this.parse("AP/SSID", settings),
        this.parse("AP/IP", settings),
        this.parse("AP/Channel", settings),
        this.parse("AP/Country", settings),
        this.parse("AP/Password", settings),
      ]),
    ])
  }

  private parse(name: string = "WiFi/Mode", settings: [any]) {
    return this.parseSetting(settings.find(s => s.P == name));
  }

  saveSetting(s: Setting<any, any>): Promise<any> {
    return sendHttpRequest(`/command?plain=[ESP401]P=${s.name} V=${s.getValue()}`)
  }

  saveSettings(): Promise<void> {
    return Promise.resolve(undefined);
  }
}

function getWiFiMode(): SelectSetting | undefined {
  return wifi.getSelect("WiFi/Mode");
}

function enable(setting: string, enable: () => boolean): EnableRule {
  return new EnableRule(setting, enable);
}

export let wifi = new WiFi()
export let wifiUI = new SettingsUI(wifi, "wifisettings",
    enable("Hostname", () => wifi.getSelect("MDNS/Enable")!.getValue() == "ON"),
    enable("Sta/", () => ["STA", "STA>AP"].includes(getWiFiMode()!.getValue())),
    enable("Sta/IP", () => wifi.getSelect("Sta/IPMode")!.getValue() == "Static"),
    enable("AP/", () => ["AP", "STA>AP"].includes(getWiFiMode()!.getValue())),
)
