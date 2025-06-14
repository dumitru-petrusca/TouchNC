import {label, panel} from '../ui/ui';
import {closeModal, pushModal} from './modaldlg';
import {Consumer} from '../common/common';
import {modalClass} from './dialogStyles';
import {css, cssClass} from '../ui/commonStyles';
import {AlertDialog} from './alertdlg';
import {sendHttpRequest} from '../http/http';
import {MILL} from '../machine/machine';

export class Firmware {
  target = ""
  version = ""
  directSd = false
  primarySd = "/ext/"
  secondarySd = "/sd/"
  async = false
  authentication = false
  ip = ""
  port = 0
  axes = -1
  machine = ""
}

export let firmware = new Firmware()

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
    firmware = parseFirmwareData(response)
    if (firmware) {
      console.log("Firmware:   " + response);
      console.log("Machine:   " + firmware.machine);
      this.onSuccess?.(firmware)
    } else {
      console.log(response);
      new AlertDialog(`Firmware parsing error: `, response);
    }
  }
}

// FW version: FluidNC v3.9.6 (my-changes-2-b56d776d-dirty) # FW target:grbl-embedded  #
// FW HW:Direct SD  # primary sd:/sd # secondary sd:none  # authentication:no # webcommunication: Sync: 81 # meta:a=b,c=d # axis:3
export function parseFirmwareData(response: string, pairDelimiter = "#", keyValDelimiter = ":", fw = new Firmware()): Firmware {
  for (const sections of response.split(pairDelimiter).map(s => s.trim())) {
    let [name, value, value2, value3] = sections.split(keyValDelimiter).map(s => s.trim());
    if (name == "FW version") {
      fw.version = value
    } else if (name == "FW target") {
      fw.target = value
    } else if (name == "FW HW") {
      fw.directSd = value.toLowerCase() == "direct sd";
    } else if (name == "primary sd") {
      fw.primarySd = value.toLowerCase();
    } else if (name == "secondary sd") {
      fw.secondarySd = value.toLowerCase();
    } else if (name == "authentication") {
      fw.authentication = value == "yes";
    } else if (name == "webcommunication") {
      fw.async = value == "Async"
      if (!fw.async) {
        fw.port = parseInt(value2);
        fw.ip = value3 != "" ? value3 : document.location.hostname;
      }
    } else if (name == "axis") {
      fw.axes = parseInt(value)
    } else if (name == "meta") {
      parseFirmwareData(value, ",", "=", fw)
    } else if (name == "machine") { // meta
      fw.machine = value
    }
  }
  if (fw.machine == "") {
    fw.machine = MILL
  }
  return fw;
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
