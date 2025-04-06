import { closeModal, pushModal } from './modaldlg';
import { label, panel } from '../ui/ui';
import { contentClass, modalClass, oneButtonRowClass, titleClass, titleRowClass } from './dialogStyles';
import { css, cssClass } from '../ui/commonStyles';
import { sendHttpRequest } from '../http/http';
import { FS, FSResponse, FSType, toSizeString } from '../fs/fs';
import { translate } from '../translate';
import { button } from '../ui/button';
import { SettingGroup } from '../config/settings';
import { machineSettings } from '../config/machinesettings';
import { AlertDialog } from './alertdlg';
import {row} from '../ui/panel';

const web_ui_version = "TouchNC 0.1"

export class StatusDialog {

  constructor() {
    Promise.allSettled([
      sendHttpRequest("/command?plain=" + encodeURIComponent("[ESP420]plain")),
      new FS(FSType.SDCard).loadFiles(),
      new FS(FSType.Local).loadFiles(),
      machineSettings.load()]
    ).then(v => {
      return this.createUI(v[0] as PromiseSettledResult<string>, v[1] as PromiseSettledResult<Awaited<FSResponse>>, v[2] as PromiseSettledResult<Awaited<FSResponse>>, v[3] as PromiseSettledResult<Awaited<SettingGroup>>);
    })
  }

  createUI(response: PromiseSettledResult<string>,
    sdFS: PromiseSettledResult<FSResponse>,
    localFS: PromiseSettledResult<FSResponse>,
    settings: PromiseSettledResult<SettingGroup>) {

    if (response.status == "rejected") {
      return new AlertDialog("Error reading firmware", response.reason)
    }
    if (localFS.status == "rejected") {
      return new AlertDialog("Error listing local FS", localFS.reason)
    }
    if (settings.status == "rejected") {
      return new AlertDialog("Error loading settings", settings.reason)
    }

    let v = new Map<string, string>()
    for (const item of response.value.trim().split("\n")) {
      if (item.startsWith("[MSG:")) {
        for (const item2 of item.substring(5, item.length - 2).split(":")) {
          const [name, value] = item2.split("=");
          v.set(name.trim(), value.trim())
        }
      } else {
        const [name, value] = item.split(":");
        v.set(name.trim(), value.trim())
      }
    }

    let rows: HTMLElement[] = []
    rows.push(newRow("Machine", `${settings.value.getSetting("/name")?.getValue()} (${settings.value.getSetting("/machine")?.getValue()})`))
    rows.push(newRow("Board", `${settings.value.getSetting("/board")?.getValue()}`))
    rows.push(newRow("Firmware", `${v.get("FW version")}`))
    rows.push(newRow("SDK", `${v.get("SDK")}`))
    rows.push(newRow("CPU", `${v.get("CPU Frequency")}, ${v.get("CPU Cores")} core, ${v.get("CPU Temperature")}, ID ${v.get("Chip ID")}`))
    rows.push(newRow("Memory", `Free ${v.get("Free memory")}, Flash ${v.get("Flash Size")}`))
    rows.push(newRow("Network", `IP ${v.get("IP")}, MAC ${v.get("MAC")}`))
    rows.push(newRow("Local FS", `${translate("Free:")} ${toSizeString(localFS.value.total - localFS.value.used)} / ${toSizeString(localFS.value.total)}`))
    if (sdFS.status == "fulfilled") {
      rows.push(newRow("SD Card", `${translate("Free:")} ${toSizeString(sdFS.value.total - sdFS.value.used)} / ${toSizeString(sdFS.value.total)}`))
    } else {
      rows.push(newRow("SD Card", `${sdFS.reason}`))
    }
    rows.push(newRow("Web UI", web_ui_version))

    let dialog = panel("", modalClass,
      panel("", contentClass, [
        panel("", titleRowClass, label("", "System Properties", titleClass)),
        panel("status-values", statusClass, rows),
        panel("", oneButtonRowClass, button("", "Close", "Close", _ => closeModal("")))
      ])
    );

    document.body.appendChild(dialog)
    pushModal(dialog, () => document.body.removeChild(dialog))
  }

  failed(reason: any) {
    console.log("Error " + reason);
  }
}

function newRow(name: string, value: string) {
  return row()
    .gap("10px")
    .add("1fr", label("", name, textClass))
    .add("4fr", label("", value, textClass))
    .build();
}

const statusClass = cssClass("status", css`
  display: grid;
  grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
  height: auto;
  overflow-y: scroll;
`)

const textClass = cssClass("text", css`
  font-size: 25px;
`)
