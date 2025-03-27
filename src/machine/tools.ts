import {ifPresent, label, setTextInput, textInput} from '../ui/ui';
import {GET_TOOL_TABLE_CMD, sendCommandAndGetStatus} from '../http/http';
import {mposClass} from '../ui/commonStyles';
import {btnIcon, button, getButtonValuesAsNumber, setButtonText} from '../ui/button';
import {currentModal, mmToDisplay} from './modal';
import {toolChannel, unitChannel} from '../events/eventbus';
import {Icon} from '../ui/icons';
import {spacer} from '../ui/ui';
import {range} from '../common/common';
import {column, row} from '../ui/panel';

interface Tool {
  number: number;
  name: string;
  offset: number;
}

export let tools = range(0, 15).map(n => ({
  number: n,
  name: "--",
  offset: 0.0
}) as Tool);

const makeToolRow = (tool: Tool) => {
  const n = tool.number;
  return row()
      .add("2fr", button(`tool-${n}-number`, "" + n, `Select tool ${n}`, btnSelectTool, "" + n))
      .add("20fr", textInput(`tool-${n}-name`, "Tool Name", tool.name, btnSetToolName(n)))
      .add("5fr", label(`tool-${n}-offset`, "" + tool.offset, mposClass))
      .add("2fr", button(`tool-${n}-delete`, btnIcon(Icon.x), `Remove tool ${n}`, btnRemoveTool, "" + n))
      .build()
}

export function createToolTable() {
  return column('tool-table')
      .overflowY('auto')
      .gap('10px')
      .addAll("auto", tools.slice(1).map(makeToolRow))
      .add("1fr", spacer(1))
      .build();
}

function btnSetToolName(n: number) {
  return (event: Event) => {
    let text = (event.target as HTMLInputElement).value
    let name = text.substring(0, 32)
    let offset = tools[n].offset
    sendCommandAndGetStatus(`$T${n}=${name},${offset}`);
  }
}

const btnRemoveTool = (event: Event) => {
  let n = getButtonValuesAsNumber(event)
  sendCommandAndGetStatus(`$T${n}=--,0`);
}

const btnSelectTool = (event: Event) => {
  let n = getButtonValuesAsNumber(event)
  sendCommandAndGetStatus(`T${n}`);
}

/**
 * Sets the tool length offset for the current tool based on a Z machine position.
 * The tool table stores relative Z offsets between the tool and the reference tool 1.
 * The absolute Z position of tool 1 is stored in tool 0 and the offset of tool 1 is 0.
 */
export const setCurrentToolOffset = (zMPos: number) => {
  let n = currentModal.tool;
  let offset = 0
  if (n == 1) {
    tools[0].offset = zMPos // tool 0 is stores the absolute Z position of tool 1, TODO-dp persist the value
  } else {
    offset = zMPos - tools[0].offset;
  }
  sendCommandAndGetStatus(`$T${n}=${(tools[n].name)},${offset}`);
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
    setButtonText(`tool-${tool.number}-offset`, mmToDisplay(tool.offset));
    ifPresent(`tool-${tool.number}-number`, e => e.style.backgroundColor = "lightblue")
  })
  ifPresent(`tool-${currentModal.tool}-number`, e => e.style.backgroundColor = "cadetblue")
}

export function requestTools() {
  let hasToolTable = true // TODO-dp
  if (hasToolTable) {
    sendCommandAndGetStatus(GET_TOOL_TABLE_CMD);
  }
}

unitChannel.register(updateUI)
toolChannel.register(updateUI)