import {label, panel} from '../ui/ui';
import {closeModal, pushModal} from './modaldlg';
import {Consumer} from '../common/common';
import {modalClass} from './dialogStyles';
import {css, cssClass} from '../ui/commonStyles';
import {AlertDialog} from './alertdlg';
import {sendHttpRequest} from '../http/http';

export type Firmware = typeof firmware

export let firmware = {
  target: "",
  version: "",
  directSd: false,
  primarySd: "/ext/",
  secondarySd: "/sd/",
  async: false,
  authentication: false,
  ip: "",
  port: 0,
  axes: -1,
  machine: ""
}

export class ConnectDialog {
  onSuccess?: Consumer<Firmware>

  constructor(onConnect?: Consumer<Firmware>) {
    this.onSuccess = onConnect
    let dialog = panel("", modalClass, label("", "Connecting...", connectingClass));
    document.body.appendChild(dialog)
    pushModal(dialog, () => document.body.removeChild(dialog))
    if (onConnect != null) {
      const url = "/command?plain=" + encodeURIComponent("[ESP800]");
      sendHttpRequest(url)
          .then(response => this.connectSuccess(response))
          .catch(reason => new AlertDialog(`Firmware Identification Error`, reason))
    }
  }

  connectSuccess(response: string) {
    if (parseFirmwareData(response)) {
      console.log("Firmware:" + response);
      this.onSuccess?.(firmware)
    } else {
      console.log(response);
      new AlertDialog(`Firmware parsing error: `, response);
    }
  }
}

// FW version: FluidNC v3.9.6 (my-changes-2-b56d776d-dirty) # FW target:grbl-embedded  #
// FW HW:Direct SD  # primary sd:/sd # secondary sd:none  # authentication:no # webcommunication: Sync: 81 # meta:a=b,c=d # axis:3
function parseFirmwareData(response: string) {
  for (const sections of response.split("#").map(s => s.trim())) {
    let [name, value, value2, value3] = sections.split(":").map(s => s.trim());
    if (name == "FW version") {
      firmware.version = value
    } else if (name == "FW target") {
      firmware.target = value
    } else if (name == "FW HW") {
      firmware.directSd = value.toLowerCase() == "direct sd";
    } else if (name == "primary sd") {
      firmware.primarySd = value.toLowerCase();
    } else if (name == "secondary sd") {
      firmware.secondarySd = value.toLowerCase();
    } else if (name == "authentication") {
      firmware.authentication = value == "yes";
    } else if (name == "webcommunication") {
      firmware.async = value == "Async"
      if (!firmware.async) {
        firmware.port = parseInt(value2);
        firmware.ip = value3 != "" ? value3 : document.location.hostname;
      }
    } else if (name == "axis") {
      firmware.axes = parseInt(value)
    } else if (name == "meta") {
      parseFirmwareData(value)
    } else if (name == "machine") { // meta
      firmware.machine = value
    }
  }
  return true;
}

export function disableUI() {
  console.log(`WebSocket unresponsive, reconnecting...`);
  new ConnectDialog()
}

export function enableUI() {
  closeModal("Connection successful");
}

export const connectingClass = cssClass("connecting", css`
  align-content: center;
  font-size: 40px;
  text-align: center;
  background: coral;
`)
