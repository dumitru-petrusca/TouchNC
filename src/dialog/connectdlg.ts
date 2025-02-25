import {panel, label} from '../ui/ui';
import {closeModal, pushModal} from './modaldlg';
import {Function2} from '../common';
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
  onSuccess: Function2<Firmware>

  constructor(onConnect: Function2<Firmware> = null) {
    this.onSuccess = onConnect
    let dialog = panel("", modalClass, label("", "Connecting...", connectingClass));
    document.body.appendChild(dialog)
    pushModal(dialog, () => document.body.removeChild(dialog))
    if (onConnect != null) {
      const url = "/command?plain=" + encodeURIComponent("[ESP800]");
      sendHttpRequest(url)
          .then(response => this.connectSuccess(response))
          .catch(reason => new AlertDialog(`Firmware identification error: ${reason}`, reason))
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

//FW version:0.9.200 # FW target:smoothieware # FW HW:Direct SD # primary sd:/ext/ # secondary sd:/sd/ # authentication: yes
function parseFirmwareData(response: string) {
  const tlist = response.split("#");
  if (tlist.length < 3) {
    return false;
  }
  //FW version
  let sublist = tlist[0].split(":");
  if (sublist.length != 2) {
    return false;
  }
  firmware.version = sublist[1].toLowerCase().trim();
  //FW target
  sublist = tlist[1].split(":");
  if (sublist.length != 2) {
    return false;
  }
  firmware.target = sublist[1].toLowerCase().trim();
  //FW HW
  sublist = tlist[2].split(":");
  if (sublist.length != 2) {
    return false;
  }
  const sddirect = sublist[1].toLowerCase().trim();
  firmware.directSd = sddirect == "direct sd";
  //primary sd
  sublist = tlist[3].split(":");
  if (sublist.length != 2) {
    return false;
  }
  firmware.primarySd = sublist[1].toLowerCase().trim();

  //secondary sd
  sublist = tlist[4].split(":");
  if (sublist.length != 2) {
    return false;
  }
  firmware.secondarySd = sublist[1].toLowerCase().trim();

  //authentication
  sublist = tlist[5].split(":");
  if (sublist.length != 2) {
    return false;
  }
  firmware.authentication = sublist[0].trim() == "authentication" && sublist[1].trim() == "yes";
  //async communications
  if (tlist.length > 6) {
    sublist = tlist[6].split(":");
    if (sublist[0].trim() == "webcommunication" && sublist[1].trim() == "Async") {
      firmware.async = true;
    } else {
      firmware.async = false;
      firmware.port = parseInt(sublist[2].trim());
      firmware.ip = sublist.length > 3 ? sublist[3].trim() : document.location.hostname;
    }
  }
  if (tlist.length > 7) {
    sublist = tlist[7].split(":");
    if (sublist[0].trim() == "hostname") {
      // esp_hostname = sublist[1].trim();
      //TODO-dp what do we do with this?
    }
  }

  if (tlist.length > 8) {
    sublist = tlist[8].split(":");
    if (sublist[0].trim() == "machine") {
      firmware.machine = sublist[1].trim()
    }
  }

  if (tlist.length > 9) {
    sublist = tlist[9].split(":");
    if (sublist[0].trim() == "axis") {
      firmware.axes = parseInt(sublist[1].trim())
    }
  }

  return true;
}

export const connectingClass = cssClass("connecting", css`
  align-content: center;
  font-size: 40px;
  text-align: center;
  background: coral;
`)

export function disableUI() {
  console.log(`WebSocket unresponsive, reconnecting...`);
  new ConnectDialog()
}

export function enableUI() {
  closeModal("Connection successful");
}
