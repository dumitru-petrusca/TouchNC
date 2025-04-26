import {string} from './settings';

const enabledField = "__enabled";
const empty = yamlObject(true)

export class YAML {
  yml: Record<string, any> = yamlObject(true)

  parse(yamlString: string): YAML {
    const lines = yamlString.split("\n")
    const stack: { [key: string]: any }[] = [yamlObject(true)]
    const indentStack: number[] = [-1]
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i]
      let disabled = line.trim().startsWith("##");
      if (disabled) {
        line = line.substring(line.indexOf("##") + 2)
      } else if (line.trim().startsWith("#")) {
        continue
      }
      if (line.trim().length == 0) continue;  // Skip empty lines
      const indent = line.search(/\S/) // Count leading spaces
      line = line.trim()
      while (indentStack[indentStack.length - 1] >= indent) {
        stack.pop()
        indentStack.pop()
      }
      let key = line.substring(0, line.indexOf(":")).trim()
      let value: any = line.substring(line.indexOf(":") + 1).trim()
      if (value.startsWith("\"")) {
        value = value.substring(1, value.length - 1)
      }
      if (value.match("{.*}")) { // empty object
        value = empty
      }
      const obj = stack[stack.length - 1]
      if (value == "") {
        obj[key] = yamlObject(!disabled)
        stack.push(obj[key])
        indentStack.push(indent)
      } else {
        obj[key] = value
      }
    }
    this.yml = stack[0]
    this.finish(this.yml)
    return this
  }

  finish(obj: Record<string, any>) {
    for (const key of Object.keys(obj)) {
      let child = obj[key];
      if (typeof child == "object") {
        this.finish(child)
        if (Object.keys(child).length == 1 && child != empty) { // object with 1 child is empty, only has __enabled field
          obj[key] = ""
        }
      }
    }
  }

  get(path: string): any | undefined {
    let obj = this.yml
    for (const part of path.substring(1).split("/")) {
      if (obj && typeof obj === 'object' && obj.hasOwnProperty(part)) {
        obj = obj[part]
      } else {
        return undefined
      }
    }
    return obj
  }

  traverse(settingConsumer: (path: string, value: string) => void,
           groupConsumer: (path: string, enabled: boolean) => void) {
    return this.iterate_(this.yml, "", settingConsumer, groupConsumer)
  }

  iterate_(obj: Record<string, any> | string, path: string,
           settingConsumer: (path: string, value: string) => void,
           groupConsumer: (path: string, enabled: boolean) => void) {
    if (typeof obj == "string") {
      settingConsumer(path, obj)
      return
    }
    groupConsumer(path, obj[enabledField])
    for (const key of Object.keys(obj)) {
      if (key != enabledField) {
        this.iterate_(obj[key], path + "/" + key, settingConsumer, groupConsumer)
      }
    }
  }

  setGroup(path: string, enabled: boolean) {
    this.setValue(path + "/" + enabledField, enabled)
  }

  setValue(path: string, value: any = undefined) {
    let fields = path.substring(1).split("/");
    let obj = this.yml
    for (let i = 0; i < fields.length - 1; i++) {
      let f = fields[i]
      obj = obj[f] == undefined ? (obj[f] = {}) : obj[f];
    }
    if (value != undefined) {
      obj[fields[fields.length - 1]] = value
    }
  }

  serialize(): string {
    return toYAML("", this.yml, "", true)
  }
}

function yamlObject(enabled: boolean): Record<string, any> {
  let obj: Record<string, any> = {};
  obj[enabledField] = enabled
  return obj;
}

function toYAML(name: string, value: Record<string, any>, indent: string, enabled: boolean) {
  if (typeof value != "object") {
    let comment = enabled ? "" : "##"
    return comment + indent + name + (": " + value).trim() + "\n"
  }

  if (value[enabledField] == undefined) {
    throw new Error(`__enabled field missing in group '${name}': ` + JSON.stringify(value))
  }

  let isRoot = name == ""
  enabled = enabled && value[enabledField]
  let comment = enabled ? "" : "##"
  let yaml = isRoot ? "" : "\n" + comment + indent + name + ":"
  if (Object.keys(value).length == 1) { // Object is empty
    return yaml + " { }\n"
  }
  yaml += isRoot ? "" : "\n"
  indent += isRoot ? "" : "  "
  for (const key of Object.keys(value)) {
    if (key != enabledField) {
      yaml += toYAML(key, value[key], indent, enabled)
    }
  }
  return yaml
}
