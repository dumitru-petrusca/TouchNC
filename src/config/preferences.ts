import {float_, int_, select_, SelectOption, SelectSetting, Setting, SettingAttr, SettingGroup, Settings} from './settings';
import {sendHttpRequest, writeFile} from '../http/http';
import {messages} from '../messages/messages';

const preferencesFileName = "touchnc.json";

export const DEFAULT_TAB = "Default Tab";
export const FEEDBACK = "Feedback";

export const REPORT_TYPE = "Report Type";
export const REPORT_INTERVAL = "Report Interval (ms)";

export const CONNECTION_MONITORING = "Connection Monitoring";
export const RECOVER_AFTER = "Recover After";

export const TAB_MANUAL = "Manual"
export const TAB_PROGRAM = "Program"
export const TAB_TOOLS = "Tools"
export const TAB_WIFI = "WiFi"
export const TAB_SETTINGS = "Settings"
export const TAB_PREFERENCES = "Preferences"

export const PROBE_TYPE = "type"
export const PROBE_OFFSET = "Offset"
export const PROBE_FEED = "Feed"
export const PROBE_MAX_TRAVEL = "Travel"
export const PROBE_RETRACT = "Retract"

export const JOG_RATE_1 = "Rate 1 (%)"
export const JOG_RATE_2 = "Rate 2 (%)"
export const JOG_RATE_3 = "Rate 3 (%)"

export enum FeedbackMode {
  None,
  Audio,
  Tactile,
}

export enum ReportType {
  NONE,
  AUTO,
  POLLING
}

export enum ConnectionMonitoring {
  None,
  Report,
  // Ping,
}

function serialize(group: SettingGroup, js: any) {
  group.settings.forEach(s => js[s.path] = s.getValue())
  group.groups.forEach(g => serialize(g, js))
}

class Preferences extends Settings {

  loadSettings(): Promise<SettingGroup> {
    return sendHttpRequest(preferencesFileName)
        .then(JSON.parse)
        .catch(reason => {
          console.log("Cannot load preferences; using defaults instead: " + reason)
          messages.warning("Cannot load preferences; using defaults instead.")
          return {};
        })
        .then(js => Promise.resolve(createSettings(js)));
  }

  saveSetting(s: Setting<any, any>): Promise<any> {
    return writeFile(preferencesFileName, this.serializeSettings());
  }

  saveSettings(): Promise<void> {
    return Promise.resolve(undefined);
  }

  private serializeSettings() {
    let js: any = {}
    serialize(this.settings!, js)
    return JSON.stringify(js, null, 2);
  }

  defaultTab = () => this.getOrDefault(DEFAULT_TAB, TAB_MANUAL);
  feedbackMode = () => this.getSelect(FEEDBACK)?.index() ?? FeedbackMode.None;

  connectionMonitoring = () => this.getSelect(CONNECTION_MONITORING)?.index() ?? ConnectionMonitoring.None;
  recoveryPeriod = () => this.getOrDefault(RECOVER_AFTER, 5000);
  reportInterval = () => this.getOrDefault(REPORT_INTERVAL, 50);
  reportType = () => this.getSelect(REPORT_TYPE)?.index() ?? ReportType.NONE;

  jogRate = (i: number) => this.intSetting(`Rate ${i} (%)`).getValue();
}

function createSettings(js: any) {
  js = applyDefaults(js)
  return new SettingGroup("/", SettingAttr.DEFAULT, [], [
    new SettingGroup("/basic", SettingAttr.VIRTUAL, [
      select_(DEFAULT_TAB, js[DEFAULT_TAB], [TAB_MANUAL, TAB_PROGRAM]),
      select_(FEEDBACK, js[FEEDBACK], ["None", "Audio", "Tactile"]),
    ]),
    new SettingGroup("/reporting", SettingAttr.VIRTUAL, [
      select_(REPORT_TYPE, js[REPORT_TYPE], ["None", "Auto", "Polling"]),
      int_(REPORT_INTERVAL, js[REPORT_INTERVAL], 1, 60000),
    ]),
    new SettingGroup("/connection/recovery", SettingAttr.VIRTUAL, [
      select_(CONNECTION_MONITORING, js[CONNECTION_MONITORING], ["None", "Report"]),
      int_(RECOVER_AFTER, js[RECOVER_AFTER], 1, 60000),
    ]),
    new SettingGroup("/tool_length_offset", SettingAttr.VIRTUAL, [
      new SelectSetting(PROBE_TYPE, js[PROBE_TYPE], [new SelectOption(0, "manual", "Manual"), new SelectOption(1, "probe", "Probe")]),
      float_(PROBE_OFFSET, js[PROBE_OFFSET], 0, 10000),
      float_(PROBE_FEED, js[PROBE_FEED], 0, 10000),
      float_(PROBE_MAX_TRAVEL, js[PROBE_MAX_TRAVEL], 0, 10000),
      float_(PROBE_RETRACT, js[PROBE_RETRACT], 0, 10000),
    ]),
    new SettingGroup("/jog_rates", SettingAttr.VIRTUAL, [
      float_(JOG_RATE_1, js[JOG_RATE_1], 0, 100),
      float_(JOG_RATE_2, js[JOG_RATE_2], 0, 100),
      float_(JOG_RATE_3, js[JOG_RATE_3], 0, 100),
    ])
  ]);
}

function applyDefaults(js: any) {
  applyDefault(FEEDBACK, "None", js)
  applyDefault(CONNECTION_MONITORING, "Report", js)
  applyDefault(DEFAULT_TAB, TAB_MANUAL, js)
  applyDefault(REPORT_INTERVAL, 50, js)
  applyDefault(RECOVER_AFTER, 5000, js)
  applyDefault(REPORT_TYPE, "Auto", js)
  applyDefault(PROBE_TYPE, "probe", js)
  applyDefault(PROBE_OFFSET, 0, js)
  applyDefault(PROBE_FEED, 100, js)
  applyDefault(PROBE_MAX_TRAVEL, 1000, js)
  applyDefault(PROBE_RETRACT, 10, js)
  applyDefault(JOG_RATE_1, 10, js)
  applyDefault(JOG_RATE_2, 50, js)
  applyDefault(JOG_RATE_3, 75, js)
  return js
}

function applyDefault(pref: string, value: any, js: any) {
  if (js[pref] == undefined) {
    js[pref] = value
  }
}

export let preferences = new Preferences();
