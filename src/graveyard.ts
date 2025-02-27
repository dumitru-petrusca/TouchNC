import {AlphanumericSetting, BooleanSetting, FloatSetting, IntegerSetting, SelectSetting, Setting, SelectOption, StringSetting} from './config/settings';

export function serializeSettings(s: Setting<any, any>[]): any {
  return {EEPROM: s.map(serializeSetting)}
}

function serializeSetting(s: Setting<any, any>): any {
  let js: any = {F: "pref", P: s.name, H: s.name, V: s.getValue()}
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

export function parseYaml(yamlString: string): Record<string, any> {
  const lines = yamlString.split("\n");
  const stack: { [key: string]: any }[] = [{}];
  const indentStack: number[] = [-1];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue; // Skip empty lines and comments
    }
    const [key, value] = trimmed.split(":").map(s => s.trim());
    const indent = line.search(/\S/); // Count leading spaces
    while (indentStack[indentStack.length - 1] >= indent) {
      stack.pop();
      indentStack.pop();
    }
    const obj = stack[stack.length - 1];
    if (value) {
      obj[key] = value.startsWith("\"") ? value.substring(1, value.length - 1) : value;
    } else {
      obj[key] = {};
      stack.push(obj[key]);
      indentStack.push(indent);
    }
  }

  return stack[0];
}
