const empty = {}

type YamlObject = Record<string, any> | string

export function toYAML(name: string, value: YamlObject, indent: string = "") {
  if (typeof value != "object") {
    return indent + name + (": " + value).trim() + "\n"
  }
  let root = name == ""
  let yaml = root ? "" : "\n" + indent + name + ":\n"
  indent += root ? "" : "  "

  for (const key of Object.keys(value)) {
    yaml += toYAML(key, value[key], indent)
  }
  return yaml
}

export class YAML {
  yml: Record<string, any>

  constructor(yamlString: string) {
    const lines = yamlString.split("\n")
    const stack: { [key: string]: any }[] = [{}]
    const indentStack: number[] = [-1]
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim()
      if (!trimmed || trimmed.startsWith("#")) {
        continue // Skip empty lines and comments
      }
      const indent = lines[i].search(/\S/) // Count leading spaces
      while (indentStack[indentStack.length - 1] >= indent) {
        stack.pop()
        indentStack.pop()
      }
      let key = trimmed.substring(0, trimmed.indexOf(":")).trim()
      let value: any = trimmed.substring(trimmed.indexOf(":") + 1).trim()
      if (value.startsWith("\"")) {
        value = value.substring(1, value.length - 1)
      }
      if (value.match("{.*}")) {
        value = empty
      }
      const obj = stack[stack.length - 1]
      if (value == "") {
        obj[key] = {}
        stack.push(obj[key])
        indentStack.push(indent)
      } else {
        obj[key] = value
      }
    }
    this.yml = stack[0]
    this.finish(this.yml)
  }

  finish(obj: Record<string, any>) {
    for (const key of Object.keys(obj)) {
      let child = obj[key];
      if (typeof child == "object") {
        this.finish(child)
      }
      if (Object.keys(child).length == 0 && child != empty) {
        obj[key] = ""
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

  forEach(consumer: (path: string, value: string) => void) {
    return this.iterate_(this.yml, "", consumer)
  }

  iterate_(obj: YamlObject, path: string, consumer: (path: string, value: string) => void) {
    if (typeof obj == "string") {
      consumer(path, obj)
      return
    }
    for (const key of Object.keys(obj)) {
      this.iterate_(obj[key], path + "/" + key, consumer)
    }
  }
}
