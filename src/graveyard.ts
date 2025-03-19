import {AlphanumericSetting, BooleanSetting, FloatSetting, IntegerSetting, SelectOption, SelectSetting, Setting, StringSetting} from './config/settings';
import {sendCommand} from './http/http';

export function serializeSettings(s: Setting<any, any>[]): any {
  return {EEPROM: s.map(serializeSetting)}
}

function serializeSetting(s: Setting<any, any>): any {
  let js: any = {F: "pref", P: s.path, H: s.path, V: s.getValue()}
  if (s instanceof StringSetting) {
    js.T = "S"
    js.M = s.min
    js.S = s.max
  } else if (s instanceof BooleanSetting) {
    js.T = "B"
    js.O = [{False: 0}, {True: 1}]
  } else if (s instanceof SelectSetting) {
    js.T = "B"
    js.O = s.options.map(serializeOption)
  } else if (s instanceof IntegerSetting) {
    js.T = "I"
    js.M = s.min
    js.S = s.max
  } else if (s instanceof FloatSetting) {
    js.T = "R"
  } else if (s instanceof AlphanumericSetting) {
    js.T = "A"
  }
  return js
}

function serializeOption(o: SelectOption) {
  let js: any = {};
  js[o.text] = o.value
  return js;
}

// function loadSettings(): Promise<SettingGroup> {
//   return sendHttpRequest("/command?plain=" + encodeURIComponent("[ESP400]"))
//       .then(value => this.parseSettings(value, "tree"))
// }
//
// function parseSettings(str: string, type: string): SettingGroup {
//   let root = createGroupTemplate();
//   for (const s of JSON.parse(str).EEPROM) {
//     if (s.F == type) {
//       let setting = this.parseSetting(s);
//       root.set(setting.name, setting.getValue())
//     }
//   }
//   root.finalize()
//   return root
// }

let spindleSpeedSetTimeout: NodeJS.Timeout;
const setSpindleSpeed = (speed: number) => {
  if (spindleSpeedSetTimeout != null) {
    clearTimeout(spindleSpeedSetTimeout)
  }
  if (speed >= 1) {
    let spindleTabSpindleSpeed = speed
    spindleSpeedSetTimeout = setTimeout(() => sendCommand('S' + spindleTabSpindleSpeed), 500)
  }
}

const observer = new MutationObserver((mutations, observer) => {
  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          console.log('Element added:', node);
        }
      });
      mutation.removedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          console.log('Element removed:', node);
        }
      });
    }
  }
});
