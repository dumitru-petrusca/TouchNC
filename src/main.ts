import {firmware} from './dialog/connectdlg';
import {askMachineBbox, currentState, machine, MILL, requestModes} from './machine/machine';
import {requestTools} from './machine/tools';
import {closeModal} from './dialog/modaldlg';
import {tabSelectChannel} from './events/eventbus';
import {addTab, createMainMenu, selectTab, Tab} from './ui/tabs';
import {machineSettings, machineSettingsUI} from './config/machinesettings';
import {preferencesUI} from './config/preferencesui';
import {preferences, TAB_MANUAL, TAB_PREFERENCES, TAB_PROGRAM, TAB_SETTINGS, TAB_TOOLS, TAB_WIFI} from './config/preferences';
import {MillUI} from './ui/mill';
import {LatheUI} from './ui/lathe';
import {Icon} from './ui/icons';
import {wifiUI} from './config/wifi';

let app: HTMLElement

export function initUI() {
  if (firmware.authentication) {
    // openConnectDialog();
  }
  //check if we need setup
  if (firmware.target === "???") {
    //TODO-dp
    // closeModal("Connection successful");
    // setupdlg();
  } else {
    closeModal();
    // checkStartupMessage();
  }
  machineSettings.load();
  buildUI(document.body);
  requestModes();
  askMachineBbox();
}

const buildUI = (container: HTMLElement) => {
  if (app == null) {
    app = container

    let ui = machine == MILL ? new MillUI() : new LatheUI()

    let manualTab = ui.manualTab();
    if (manualTab != null) {
      addTab(new Tab(TAB_MANUAL, Icon.person, 'Manual Operation', manualTab));
    }

    let programTab = ui.programTab();
    if (programTab != null) {
      addTab(new Tab(TAB_PROGRAM, Icon.playCircle, 'CNC Program', programTab));
    }

    let toolsTab = ui.toolsTab();
    if (toolsTab != null) {
      addTab(new Tab(TAB_TOOLS, Icon.tools, 'Tool Table', toolsTab, requestTools));
    }

    addTab(new Tab(TAB_SETTINGS, Icon.cog, 'Settings', machineSettingsUI.create(), () => machineSettingsUI.loadAndDisplay()));
    addTab(new Tab(TAB_WIFI, Icon.folder, 'WiFi', wifiUI.create(), () => wifiUI.loadAndDisplay()));
    addTab(new Tab(TAB_PREFERENCES, Icon.prefs, 'Preferences', preferencesUI.create(), () => preferencesUI.loadAndDisplay()));

    app.appendChild(createMainMenu())
    selectTab(preferences.defaultTab())
  }
}

tabSelectChannel.register(e => app.appendChild(e.content), "main", -10)

window.onbeforeunload = (event) => {
  if (["Hold", "Run", "Jog"
    , "Home"].includes(currentState.name)) {
    event.preventDefault();
  }
}

document.addEventListener("contextmenu", function (event) {
  event.preventDefault();
});

// document.addEventListener("touchstart", function (event) {
//   if (event.touches.length > 1) {
//     event.preventDefault(); // Prevent multi-touch gestures
//   }
// }, {passive: false});
//
// document.addEventListener("gesturestart", function (event) {
//   event.preventDefault(); // Disable pinch-to-zoom
// });
//
// document.addEventListener("selectstart", function(event) {
//   event.preventDefault(); // Prevent text selection
// });