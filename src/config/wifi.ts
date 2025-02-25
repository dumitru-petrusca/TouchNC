import {sendHttpRequest} from '../http/http';
import {Settings, SelectSetting, Setting, SettingGroup, GroupType} from './settings';
import {SettingsUI} from './settingsui';

class WiFi extends Settings {
  loadSettings(): Promise<SettingGroup> {
    return Promise.resolve(new SettingGroup("", GroupType.NORMAL))
    //TODO
    // return sendHttpRequest("/command?plain=" + encodeURIComponent("[ESP400]"))
    //     .then(value => this.parseSettings(value, "nvs"))
  }

  saveSetting(s: Setting<any, any>): Promise<any> {
    // command?plain=[ESP401]P=/axes/x/max_rate_mm_per_min T=R V=1500.001 & PAGEID=0
    return sendHttpRequest(`/command?plain=[ESP401]P=${s.name} V=${s.getValue()}`)
  }

  saveSettings(): Promise<void> {
    return Promise.resolve(undefined);
  }
}

class WiFiUI extends SettingsUI {
  constructor(config: Settings, id: string) {
    super(config, id);
  }

  protected createGroups(): SettingGroup[] {
    return []
    // return [
    //   new SettingGroup("WiFi", [
    //     new UISetting("Mode", "WiFi/Mode"),
    //     new UISetting("mDNS", "MDNS/Enable"),
    //     new UISetting("mDNS Host", "Hostname", () => wifi.getSelect("MDNS/Enable")!.getValue() == "ON"),
    //   ]),
    //   new SettingGroup("Network", [
    //     new UISetting("SSID", "Sta/SSID", isSTA),
    //     new UISetting("IP Mode", "Sta/IPMode", isSTA),
    //     new UISetting("IP", "Sta/IP", () => {
    //       return isSTA() && wifi.getSelect("Sta/IPMode")!.getValue() == "Static"
    //     }),
    //     new UISetting("Gateway", "Sta/Gateway", isSTA),
    //     new UISetting("Netmask", "Sta/Netmask", isSTA),
    //     new UISetting("Password", "Sta/Password", isSTA),
    //   ]),
    //   new SettingGroup("Access Point", [
    //     new UISetting("SSID", "AP/SSID", isAP),
    //     new UISetting("IP", "AP/IP", isAP),
    //     new UISetting("Channel", "AP/Channel", isAP),
    //     new UISetting("Country", "AP/Country", isAP),
    //     new UISetting("Password", "AP/Password", isAP),
    //   ]),
    // ];
  }
}

function getWiFiMode(): SelectSetting | undefined {
  return wifi.getSelect("WiFi/Mode");
}

let isSTA = () => {
  let s = getWiFiMode()!;
  return s.getValue() == "STA" || s.getValue() == "STA>AP"
}

let isAP = () => {
  let s = getWiFiMode()!;
  return s.getValue() == "AP" || s.getValue() == "STA>AP"
}

export let wifi = new WiFi()
export let wifiUI = new WiFiUI(wifi, "wifisettings");
