import {Setting} from './settings';

export function toYAML(name: string, value: Record<string, any> | string, indent: string = "") {
  if (typeof value != "object") {
    return indent + name + ": " + value + "\n";
  }
  let root = name == "";
  let yaml = root ? "" : "\n" + indent + name + ":\n";
  indent += root ? "" : "  ";
  for (const key of Object.keys(value)) {
    yaml += toYAML(key, value[key], indent);
  }
  return yaml
}
