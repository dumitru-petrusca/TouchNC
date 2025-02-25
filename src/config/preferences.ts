import {GroupType, IntegerSetting, SelectSetting, Setting, SettingGroup, SettingOption, Settings} from './settings';
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
  group.settings.forEach(s => js[s.name] = s.getValue())
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

  defaultTab(): string {
    return this.getOrDefault(DEFAULT_TAB, TAB_MANUAL)
  }

  feedbackMode(): FeedbackMode {
    return this.getIndexOrDefault(FEEDBACK, FeedbackMode.None)
  }

  recoveryPeriod(): number {
    return this.getOrDefault(RECOVER_AFTER, 5000);
  }

  reportInterval(): number {
    return this.getOrDefault(REPORT_INTERVAL, 50);
  }

  reportType(): ReportType {
    return this.getIndexOrDefault(REPORT_TYPE, ReportType.NONE);
  }

  connectionMonitoring(): ConnectionMonitoring {
    return this.getIndexOrDefault(CONNECTION_MONITORING, ConnectionMonitoring.None);
  }
}

function createSettings(js: any) {
  js = applyDefaults(js)

  let basicGroup = new SettingGroup("/basic", GroupType.VIRTUAL);
  basicGroup.settings.push(new SelectSetting(DEFAULT_TAB, [
    new SettingOption(TAB_MANUAL, 0),
    new SettingOption(TAB_PROGRAM, 1),
  ]).setValue(js[DEFAULT_TAB]))
  basicGroup.settings.push(new SelectSetting(FEEDBACK, [
    new SettingOption("None", 0),
    new SettingOption("Audio", 1),
    new SettingOption("Tactile", 2)
  ]).setValue(js[FEEDBACK]))

  let reportingGroup = new SettingGroup("/reporting", GroupType.VIRTUAL);
  reportingGroup.settings.push(new SelectSetting(REPORT_TYPE, [
    new SettingOption("None", 0),
    new SettingOption("Auto", 1),
    new SettingOption("Polling", 2)
  ]).setValue(js[REPORT_TYPE]))
  reportingGroup.settings.push(new IntegerSetting(REPORT_INTERVAL, 1, 60000).setValue(js[REPORT_INTERVAL]))

  let connectionGroup = new SettingGroup("/connection/recovery", GroupType.VIRTUAL);
  connectionGroup.settings.push(new SelectSetting(CONNECTION_MONITORING, [
    new SettingOption("None", 0),
    new SettingOption("Report", 1),
    // new SettingOption("Ping", 2)
  ]).setValue(js[CONNECTION_MONITORING]))
  connectionGroup.settings.push(new IntegerSetting(RECOVER_AFTER, 1, 60000).setValue(js[RECOVER_AFTER]))

  let group = new SettingGroup("/", GroupType.NORMAL);
  group.groups.push(basicGroup, reportingGroup, connectionGroup)
  return group;
}

function applyDefaults(js: any) {
  applyDefault(FEEDBACK, "None", js)
  applyDefault(CONNECTION_MONITORING, "Report", js)
  applyDefault(DEFAULT_TAB, TAB_MANUAL, js)
  applyDefault(REPORT_INTERVAL, 50, js)
  applyDefault(RECOVER_AFTER, 5000, js)
  applyDefault(REPORT_TYPE, "Auto", js)
  return js
}

function applyDefault(pref: string, value: any, js: any) {
  if (js[pref] == undefined) {
    js[pref] = value
  }
}

export let preferences = new Preferences();
