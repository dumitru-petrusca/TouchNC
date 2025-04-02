import {translate} from '../translate';

export const GET_SYSTEM_COMMANDS_CMD = '$+'; // Displays all the supported system commands
export const GET_COMMANDS_CMD = '$CMD'; // Get system commands info
export const GET_GCODE_PARAMS_CMD = '$#';  // Displays the values Work Coordinate Offsets, Tool Length Offsets, Probe offset
export const STOP_SPINDLE_CMD = '$S'; // This stops the spindle if running, this is a safety feature
export const LASER_FIRE_CMD = '$L'; // Fires the laser at a low power setting for testing
export const GET_PARSER_STATE_CMD = '$G'; // Displays the current state of the G-code parser
export const GET_BUILD_INFO_CMD = '$I'; // Displays the build info of FluidNC
export const GET_START_BLOCKS_CMD = '$N'; // Displays the startup G-code commands
export const SLEEP_CMD = '$SLP'; // Puts the machine to sleep
export const GCODE_CHECK_CMD = '$C'; // Enables GCode check mode, run again to disable
export const UNLOCK_CMD = '$X'; // Unlocks the machine after an alarm state
export const HOME_CMD = '$H'; // Starts the homing cycle
export const HOMEA_CMD = '$HA'; // Starts the homing cycle for the A axis
export const FORCE_START_CMD = '$F'; // Force the planner to start a new cycle from the current state, used for testing
export const GET_TOOL_TABLE_CMD = '$TT'; // Fetch the tool table
export const GET_STARTUP_LOG = '$SS'; // Get startup log
export const CANCEL_JOG_CMD = '\x85';

export const GET_STATUS_CMD = '?'; // Get status report (<Idle,MPos:10.000,20.000,5.000,WPos:0.000,0.000,0.000,FS:500,...>)
export const FEED_HOLD_CMD = '!'; // Initiates a feed hold, which pauses the machine's motion
export const FEED_RESUME_CMD = '~'; // Resumes program execution after a feed hold
export const RESET_CMD = '\x18'; // Performs a reset of the FluidNC controller (same as Ctrl-X)

const WAIT_FOR_OK_CMD = new Set<string>([])

const maxCommandCount = 20;

interface Cmd {
  cmd: string,
  resolve: (value: void) => void;
  reject: (reason?: any) => void;
}

let commandList: Cmd[] = [];
let pageId = ""

export function setPageId(id: string) {
  pageId = id
}

export function getPageId(): string {
  return pageId
}

export function CancelCurrentUpload() {
  //TODO-dp implement
}

export function lockHttpCommunication() {
  //TODO-dp implement
  commandList = [];
}

export function httpCommunicationLocked() {
  //TODO-dp implement
  return false;
}

function log(s: string) {
  // console.log(s)
}

export function sendCommandAndGetStatus(cmd: string): Promise<void> {
  log("sendCommandAndGetStatus: " + cmd)
  return sendCommand(cmd)
      .then(_ => {
        if (cmd != GET_STATUS_CMD) {
          sendCommand(GET_STATUS_CMD)
        }
      });
}

export function sendCommand(cmd: string): Promise<void> {
  console.log("CMD: " + cmd)
  log("sendCommand: " + cmd)
  if (commandList.length >= maxCommandCount) {
    throw new Error(`Too many http requests, maximum ${maxCommandCount} allowed.`)
  }
  if (cmd.startsWith("[ESP")) {
    throw new Error("Pass commands starting with [ESP to SendGetHttp().")
  }
  let promise = new Promise<void>((resolve, reject) => {
    log("In Promose")
    commandList.push({
      cmd: cmd,
      resolve: resolve,
      reject: reject
    });
  });
  log("After Promise")
  if (commandList.length == 1) {
    // this is the only command in the queue, run immediately
    log("Running immediately")
    processNextCommand();
  }
  return promise;
}

function processNextCommand() {
  log("processNextCommand: " + commandList.length)
  if (commandList.length == 0) {
    return; // nothing to do
  }
  let command = commandList[0];
  if (httpCommunicationLocked()) {
    console.error("Communication locked while sending command: " + JSON.stringify(commandList[0]) + ". Current command: " + JSON.stringify(command))
    throw new Error(translate("Communication locked!"));
  }
  log("Sending Command: " + command.cmd)
  log("http: " + command.cmd)
  sendHttpRequest("/command?commandText=" + encodeURI(command.cmd).replace("#", "%23"))
      .then(_ => {
        if (!WAIT_FOR_OK_CMD.has(command.cmd)) {
          processCommandCompletion(false)
        }
      })
      .catch(reason => processCommandError(reason))
}

export const processCommandCompletion = (okReceived: boolean) => {
  let command = commandList.shift();
  if (command != undefined) {
    log("Command Success: " + command?.cmd + ", " + commandList.length)
    command?.resolve?.()
    processNextCommand();
  } else {
    // throw new Error(`Command succeeded (ok=${okReceived}), but there is no current command.`)
  }
}

export const processCommandError = (msg: string) => {
  let command = commandList[0];
  log("Command Error: " + command?.cmd + ", " + msg + ", " + commandList.length)
  commandList.shift();
  command?.reject?.(msg)
  processNextCommand();
}

export function sendHttpRequest(url: string): Promise<string> {
  return fetch(serverUrl(url))
      .then(response => {
        if (!response.ok) {
          throw new Error(`Response: ${JSON.stringify(response)}`);
        }
        return response.text();
      })
}


export function serverUrl(url: string) {
  if (url.startsWith("/command")) {
    url = url.indexOf("?") == -1 ? `${url}?` : `${url}&PAGEID=${pageId}`;
  }
  let server = ((window as any).serverUrl ?? "").trim()
  server += server.endsWith("/") ? "" : "/"
  url = url.startsWith("/") ? url.substring(1) : url
  return server + url;
}

export function writeFile(name: string, js: string): Promise<Response> {
  const blob = new Blob([js], {type: 'application/json'});
  const file = new File([blob], name);
  let form = new FormData();
  form.append('path', '/');
  form.append('myfile[]', file, name);
  return fetch(serverUrl("/files"), {method: 'POST', body: form})
}
