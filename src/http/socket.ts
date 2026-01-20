import { initUI } from '../main';
import { processMachineState, processSettingRead, setMachineProperties } from '../machine/machine';
import { processTool, processTools } from '../machine/tools';
import { ConnectDialog, disableUI, enableUI, firmware } from '../dialog/connectdlg';
import { CancelCurrentUpload, getPageId, processCommandCompletion, processCommandError, serverUrl, setPageId } from './http';
import { probe } from '../machine/probe';
import { registerClasses } from '../ui/commonStyles';
import { processModal } from '../machine/modal';
import { messages } from '../messages/messages';
import { restartChannel, startupChannel } from '../events/eventbus';
import { ConnectionMonitoring, preferences } from '../config/preferences';
import { reporting } from './reporting';
import { InputDialog } from '../dialog/inputdlg';

enum ConnectionStatus {
  CONNECTED,
  DISCONNECTED,
  CONNECTING
}

const convertDHT2Fahrenheit = false;
const WATCHDOG_INTERVAL_MS = 100;

let socket: WebSocket | null = null;
let connectionStatus = ConnectionStatus.DISCONNECTED;
let lastReportTime: number;

let prevMsg = ""

let event_source: EventSource;
let interval_ping: NodeJS.Timeout;
let last_ping = 0;
let enable_ping = true;

window.onload = function () {
  registerClasses();
  if (serverUrl() == "") {
    new InputDialog("Please enter the server URL", "", "http://fluidnc.local", value => {
      (window as any).serverUrl = value
      connect();
    });
  } else {
    console.log(`Connecting to ${serverUrl()}`);
    connect();
  }
};

function connect() {
  new ConnectDialog(firmware => {
    setMachineProperties(firmware)
    preferences.load().then(_ => {
      setupSocketWatchdog();
    })
  });
}

export function setupSocketWatchdog() {
  connectionStatus = ConnectionStatus.DISCONNECTED;
  setInterval(watchdog, WATCHDOG_INTERVAL_MS);
}

let lastDisconnectTime = 0;
let connectStartTime = 0;

function watchdog() {
  switch (connectionStatus) {
    case ConnectionStatus.CONNECTED:
      if (preferences.connectionMonitoring() == ConnectionMonitoring.Report &&
        new Date().getTime() - lastReportTime > preferences.recoveryPeriod()) {
        disconnect()
      }
      break;
    case ConnectionStatus.DISCONNECTED:
      if (Date.now() - lastDisconnectTime > 2000) {
        startSocket();
      }
      break;
    case ConnectionStatus.CONNECTING:
      if (Date.now() - connectStartTime > 5000) {
        socket?.close();
        connectionStatus = ConnectionStatus.DISCONNECTED;
        lastDisconnectTime = Date.now();
      }
      break;
  }
}

function startSocket() {
  connectionStatus = ConnectionStatus.CONNECTING;
  connectStartTime = Date.now();
  try {
    if (firmware.async) {
      if (!!window.EventSource) {
        event_source = new EventSource('/events');
        event_source.addEventListener('InitID', Init_events, false);
        event_source.addEventListener('ActiveID', ActiveID_events, false);
        event_source.addEventListener('DHT', DHT_events, false);
      }
      socket = new WebSocket('ws://' + document.location.host + '/ws', ['arduino']);
    } else {
      let parts = serverUrl().split(":");
      let url = `ws:${parts[1]}:${firmware.port}`
      console.log(`Connecting to WebSocket ${url}`);
      socket = new WebSocket(url, ['arduino']);
    }
  } catch (exception) {
    console.error(exception);
    connectionStatus = ConnectionStatus.DISCONNECTED;
    lastDisconnectTime = Date.now();
    return
  }
  socket.binaryType = "arraybuffer";
  socket.onopen = function (_) {
    console.log(`WebSocket connected`);
    initUI();
    connectionStatus = ConnectionStatus.CONNECTED;
    reporting.start();
    lastReportTime = new Date().getTime();
    enableUI();
    startupChannel.sendEvent()
  };
  socket.onclose = function (e) {
    if (e.target == socket) {
      console.log(`WebSocket closed.`);
      connectionStatus = ConnectionStatus.DISCONNECTED;
      lastDisconnectTime = Date.now();
    }
  };
  socket.onerror = function (e) {
    console.log(`WebSocket error`, e);
    if (e.target == socket) {
      connectionStatus = ConnectionStatus.DISCONNECTED;
      lastDisconnectTime = Date.now();
    }
  };
  socket.onmessage = function (e) {
    // console.log("Report");
    lastReportTime = (new Date()).getTime();
    if (e.data instanceof ArrayBuffer) {
      getMessage(e.data)?.split('\n').forEach(processControllerMessage);
    } else {
      processProtocolMessage(e.data as string);
    }
  }
}

export function disconnect() {
  connectionStatus = ConnectionStatus.DISCONNECTED;
  lastDisconnectTime = Date.now();
  disableUI();
  socket?.close();
}

function getMessage(data: any): string | null {
  let msg = ""
  for (const byte of new Uint8Array(data)) {
    msg += String.fromCharCode(byte);
    if (byte == 10) {
      break
    }
  }
  msg = msg.trim()
  if (msg.startsWith("error:")) {
    prevMsg = msg;
    return null;
  }
  if (prevMsg.startsWith("error:")) {
    if (msg.startsWith("[MSG:ERR")) {
      msg = prevMsg.trim() + msg.substring(8, msg.length - 1).trim();
    } else {
      throw "Unexpected message after error: " + msg
    }
    prevMsg = ""
  }
  return msg.replace('\r\n', '\n').trim();
}

function processProtocolMessage(msg: string) {
  const split = msg.split(":");
  if (split.length < 2) {
    return;
  }
  let name = split[0];
  let value = split[1];
  if (name === 'CURRENT_ID') {
    setPageId(value)
    console.log("CURRENT_ID = " + value);
  } else if (name === 'PING') {
    if (enable_ping) {
      setPageId(value)
      last_ping = Date.now();
      if (interval_ping != null) {
        interval_ping = setInterval(check_ping, 10 * 1000);
      }
    }
  } else if (name === 'ACTIVE_ID') {
    let pageId = getPageId();
    if (pageId != value) {
      Disable_interface(false);
      console.log("ACTIVE_ID = " + pageId);
    }
  } else if (name === 'DHT') {
    if (getPageId() != value) {
      Handle_DHT(value);
    }
  } else if (name === 'ERROR') {
    console.log("Protocol Err: " + split[2] + " code:" + value);
    CancelCurrentUpload();
  } else if (name === 'MSG') {
    console.log("Protocol Msg: " + split[2] + " code:" + value);
  }
}

function processControllerMessage(msg: string) {
  let displayMsg = msg;
  if (msg.startsWith('<')) {
    processMachineState(msg);
    displayMsg = ""
  } else if (msg.startsWith('[GC:')) {
    processModal(msg);
  } else if (msg.startsWith('[TOOLS:')) {
    processTools(msg);
    displayMsg = ""
  } else if (msg.startsWith('[TOOL:')) {
    processTool(msg);
    displayMsg = ""
  } else if (msg.startsWith('ok')) {
    processCommandCompletion(true);
  } else if (msg.startsWith('[PRB:')) {
    probe.processProbeResult(msg);
  } else if (msg.startsWith('[MSG:')) {
    displayMsg = processMessage(msg);
  } else if (msg.startsWith('error:')) {
    processCommandError(msg);
    displayMsg = '<span style="color:red;">' + msg + '</span>';
  } else if (msg.startsWith('ALARM:') || msg.startsWith('Hold:') || msg.startsWith('Door:')) {
    if (probe.isCurrentlyProbing()) {
      // probe_failed_notification(msg); //TODO-dp function missing
    }
  } else if (msg.startsWith('$')) {
    processSettingRead(msg);
  } else if (msg.startsWith('Grbl ')) {  // TODO-dp does this happen?
    processReset();
  }
  messages.message(displayMsg);
}

function processMessage(msg: string): string {
  if (msg.startsWith("[MSG:")) {
    return processMessage(msg.replace("[MSG:", '').replace("]", '').trim());
  } else if (msg.startsWith('INFO:')) {
    return processMessage(msg.replace("INFO:", '').trim());
  } else if (msg.startsWith('ERR:')) {
    return '<span style="color:red;">' + msg.replace("ERR:", '') + '</span>';
  } else if (msg.startsWith('MSG,')) {
    return '<span style="color:forestgreen;">' + msg.replace("MSG,", '') + '</span>';
  } else {
    return msg;
  }
}

function Init_events(e: any) {
  setPageId(e.data)
}

function ActiveID_events(e: any) {
  if (getPageId() != e.data) {
    Disable_interface(false);
    event_source.close();
  }
}

function DHT_events(e: any) {
  Handle_DHT(e.data);
}

function processReset() {
  reporting.start();
}

export function Handle_DHT(data: string) {
  const tdata = data.split(" ");
  if (tdata.length != 2) {
    console.log("DHT data invalid: " + data);
    return;
  }
  const temp = (convertDHT2Fahrenheit) ? (parseFloat(tdata[0]) * 1.8) + 32 : parseFloat(tdata[0]);
  let temps = temp.toFixed(2).toString() + "&deg;";
  temps += convertDHT2Fahrenheit ? "F" : "C";
  // getElement('DHT_humidity').innerHTML = parseFloat(tdata[1]).toFixed(2).toString() + "%";
  // getElement('DHT_temperature').innerHTML = temps;
}

function check_ping() {
  //if ((Date.now() - last_ping) > 20000){
  //Disable_interface(true);
  //console.log("No heart beat for more than 20s");
  //}
}

export function Disable_interface(_: boolean) {
  /*
    //block all communication
    lockHttpCommunication();
    log_off = true;
    if (interval_ping != -1) clearInterval(interval_ping);
    //clear all waiting commands
    clearCommandList();
    //no camera
    id('camera_frame').src = "";
    //No auto check
    on_autocheck_position(false);
    if (async_webcommunication) {
      event_source.removeEventListener('ActiveID', ActiveID_events, false);
      event_source.removeEventListener('InitID', Init_events, false);
      event_source.removeEventListener('DHT', DHT_events, false);
    }
    socket.close();
    document.title += "(" + decode_entitie(translate("Disabled")) + ")";
    UIdisableddlg(lostcon);
  */
}

restartChannel.register(disconnect)