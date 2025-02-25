import {currentState} from './machine';
import {label, panel, setTextInput, textInput} from '../ui/ui';
import {GET_TOOL_TABLE_CMD, sendCommandAndGetStatus} from '../http/http';
import {css, cssClass} from '../ui/commonStyles';
import {btnIcon, button, getButtonValuesAsNumber, setButtonText} from '../ui/button';
import {decimals, factor} from './modal';
import {unitChannel} from '../events/eventbus';
import {Icon} from '../ui/icons';

class Tool {
  number: number
  name: string
  offset: number

  constructor(number: number, name: string, offset: number) {
    this.number = number;
    this.name = name;
    this.offset = offset;
  }
}

let tools = [
  new Tool(0, "--", 0.0),
  new Tool(1, "--", 0.0),
  new Tool(2, "--", 0.0),
  new Tool(3, "--", 0.0),
  new Tool(4, "--", 0.0),
  new Tool(5, "--", 0.0),
  new Tool(6, "--", 0.0),
  new Tool(7, "--", 0.0),
  new Tool(8, "--", 0.0),
  new Tool(9, "--", 0.0),
  new Tool(10, "--", 0.0),
  new Tool(11, "--", 0.0),
  new Tool(12, "--", 0.0),
  new Tool(13, "--", 0.0),
  new Tool(14, "--", 0.0),
  new Tool(15, "--", 0.0),
]

const makeTool = (n: number) => {
  return panel(`tool-${n}`, toolRowClass, [
    label("", "" + n),
    textInput(`tool-${n}-name`, "Tool Name", tools[n].name, btnSetToolName(n)),
    button(`tool-${n}-offset`, "" + tools[n].offset, `Set tool ${n} offset`, btnSetToolOffset, "" + n),
    button(`tool-${n}-delete`, btnIcon(Icon.x), `Remove tool ${n}`, btnRemoveTool, "" + n)
  ])
}

export function createToolTable() {
  const tools = []
  for (let i = 1; i < 16; i++) {
    tools.push(makeTool(i))
  }
  return panel('tool-table', toolTableClass, tools)
}

function btnSetToolName(n: number) {
  return (event: Event) => {
    let text = (event.target as HTMLInputElement).value
    let name = text.substring(0, 32)
    let offset = tools[n].offset
    let e = `$T${n}=${name},${offset}`;
    sendCommandAndGetStatus(e);
  }
}

const btnRemoveTool = (event: Event) => {
  let n = getButtonValuesAsNumber(event)
  sendCommandAndGetStatus(`$T${n}=--,0`);
}

const btnSetToolOffset = (event: Event) => {
  let n = getButtonValuesAsNumber(event)
  let name = tools[n].name;
  let offset = currentState.wpos[2] * factor()
  sendCommandAndGetStatus(`$T${n}=${name},${offset}`);
}

export const processTools = (msg: string) => {
  msg.replace("[TOOLS:", '').replace(']', '').split(';').map(setTool)
  updateUI()
}

export const processTool = (msg: string) => {
  setTool(msg.replace("[TOOL:", '').replace(']', ''));
  updateUI()
}

function setTool(toolStr: string) {
  const parts = toolStr.split(',');
  let tool = tools[parseInt(parts[0])];
  tool.name = parts[1]
  tool.offset = parseFloat(parts[2])
}

function updateUI() {
  tools.forEach(tool => {
    setTextInput(`tool-${tool.number}-name`, tool.name);
    setButtonText(`tool-${tool.number}-offset`, (tool.offset * factor()).toFixed(decimals()));
  })
}

export function requestTools() {
  let hasToolTable = true // TODO-dp
  if (hasToolTable) {
    sendCommandAndGetStatus(GET_TOOL_TABLE_CMD);
  }
}

const toolTableClass = cssClass("toolTable", css`
  display: grid;
  grid-template-rows: repeat(15, auto) 1fr;
  gap: 10px;
  overflow-y: scroll;
  text-align: center;
  vertical-align: middle;
  background-color: #ffffff;
  font-family: sans-serif;
  font-size: 3.2rem;
  user-select: none;
  width: 50%;
  height: 100%;
  max-height: 100%;
`)


const toolRowClass = cssClass("toolRow", css`
  display: grid;
  grid-template-columns: 1fr 20fr 5fr 2fr;
  gap: 10px;
  width: 100%;
  max-width: 100%;
`)

unitChannel.register(updateUI)