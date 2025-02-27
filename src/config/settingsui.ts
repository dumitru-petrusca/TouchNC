import {numpadButton, NumpadType} from '../dialog/numpad';
import {AlertDialog} from '../dialog/alertdlg';
import {translate} from '../translate';
import {btnClass, css, cssClass, CssClass, navRowClass} from '../ui/commonStyles';
import {capitalize, EventHandler, splitNumber} from '../common';
import {AlphanumericSetting, BooleanSetting, FloatSetting, groupName, GroupSetting, IntegerSetting, replaceAcronyms, SelectSetting, Setting, SettingGroup, Settings, string, StringSetting} from './settings';
import {checkbox, element, getElement, ifPresent, label, panel, setEnabled, textInput, toggleFullscreen} from '../ui/ui';
import {btnIcon, button} from '../ui/button';
import {Icon} from '../ui/icons';
import {ConfirmDialog} from '../dialog/confirmdlg';
import {restartChannel} from '../events/eventbus';
import {sendHttpRequest} from '../http/http';

export class EnableRule {
  settingName: string
  enabled: () => boolean

  constructor(settingName: string, enabled: () => boolean) {
    this.settingName = settingName;
    this.enabled = enabled;
  }
}

export class SettingsUI {
  readonly settings: Settings;
  private readonly id: string;
  private enableRules: EnableRule[];

  constructor(settings: Settings, id: string, ...enableRules: EnableRule[]) {
    this.settings = settings;
    this.id = id;
    this.enableRules = enableRules;
  }

  loadAndDisplay() {
    this.settings.load()
        .then(() => this.display())
  }

  settingsNavPanel() {
    return panel('', navRowClass, [
      button('save', btnIcon(Icon.file), 'Save Settings',
          _ => this.settings.saveSettings()
              .then(_ => new ConfirmDialog(translate("Settings saved. Restart FluidNC?"), () => {
                    restartChannel.sendEvent()
                    sendHttpRequest("/command?plain=" + encodeURIComponent("[ESP444]RESTART"));
                  })
              )
              .catch(reason => new AlertDialog(translate("Save Failed"), "Error " + reason))
      ),
      button('fullscreen', btnIcon(Icon.fullscreen), 'Toggle Fullscreen', toggleFullscreen),
    ])
  }

  create(): HTMLElement {
    return panel("", topPanelClass, [
      this.settingsNavPanel(),
      panel(this.id, settingsPanelClass, [])
    ])
  }

  display() {
    ifPresent(this.id, e => {
      if (e.children.length == 0) {
        e.replaceChildren(...this.createPanes())
      } else {
        this.update()
      }
      this.updateVisibility()
    })
  }

  createPanes() {
    return this.settings.settings?.groups
        ?.filter(g => !g.isHidden())
        ?.map(g => this.createPane(g)) ?? [];
  }

  createPane(group: SettingGroup): HTMLDivElement {
    let paneId = `${group.path}-pane`, listId = `${group.path}-list`;
    let children = [label("", groupName(group.path), settingsPaneTitleClass)]
    group.expandSettings().forEach(s => {
      children.push(label(s.name + "_label", s.displayName, settingsLabelClass))
      children.push(this.createWidget(s, _ => getElement(paneId).replaceWith(this.createPane(group))))
    });
    let list = panel(listId, settingsListClass, children);
    return panel(paneId, settingsPaneClass, list)
  }

  createWidget(s: Setting<any, any>, redrawCallback: EventHandler): HTMLElement {
    if (s instanceof IntegerSetting) {
      return numpadButton(s.name, "", "" + s.getValue(), NumpadType.INTEGER, v => {
        s.setValue(Number(v))
        this.saveSetting(s);
      })
    } else if (s instanceof FloatSetting) {
      return numpadButton(s.name, "", "" + s.getValue(), NumpadType.FLOAT, v => {
        s.setValue(Number(v))
        this.saveSetting(s);
      })
    } else if (s instanceof BooleanSetting) {
      return checkbox(s.name, checkboxClass, s.getValue(), (e) => {
        s.setValue((e.target as HTMLInputElement).checked)
        this.saveSetting(s);
      })
    } else if (s instanceof StringSetting) {
      return textInput(s.name, "", s.getValue(), (e) => {
        s.setValue((e.target as HTMLInputElement).value)
        this.saveSetting(s);
      })
    } else if (s instanceof AlphanumericSetting) {
      return numpadButton(s.name, "", "" + s.getValue(), NumpadType.IP, v => {
        s.setValue(v)
        this.saveSetting(s);
      })
    } else if (s instanceof GroupSetting) {
      return this.select(s.name, btnClass, s, (e) => {
        let value = Number((e.target as HTMLSelectElement).value);
        s.setValue(s.findOption(value)!.text)
        redrawCallback?.(e)
        //TODO-dp do I need to save anything?
      })
    } else if (s instanceof SelectSetting) {
      return this.select(s.name, btnClass, s, (e) => {
        let value = Number((e.target as HTMLSelectElement).value);
        s.setValue(s.findOption(value)!.text)
        this.saveSetting(s);
      })
    } else {
      return label(s.name, "N/A", settingsValueClass);
    }
  }

  update(group: SettingGroup = this.settings.settings!) {
    group.settings.forEach(s => ifPresent(s.name, e => this.updateWidget(e, s)))
    group.groups.forEach(g => this.update(g))
  }

  updateWidget(e: HTMLElement, s: Setting<any, any>) {
    if (e instanceof HTMLInputElement) {
      if (e.type == "checkbox") {
        e.checked = s.getValue()
      } else {
        e.innerText = s.getValue();
      }
    } else if (e instanceof HTMLSelectElement) {
      e.value = "" + (s as SelectSetting).index()
    } else {
      e.innerText = s.getValue();
    }
  }

  private saveSetting(setting: Setting<any, any>) {
    this.settings
        .saveSetting(setting)
        .then(() => this.updateVisibility())
        .catch(reason => {
          setting.undo()
          new AlertDialog(translate("Set failed"), "Error " + reason)
        })
  }

  updateVisibility(group: SettingGroup = this.settings.settings!) {
    for (const setting of group.settings) {
      let enabled = this.enableRules.find(rule => setting.name.startsWith(rule.settingName) && !rule.enabled()) == undefined;
      setEnabled(setting.name, enabled)
      setEnabled(setting.name + "_label", enabled)
    }
    for (const g of group.groups) {
      this.updateVisibility(g)
    }
  }

  select(id: string, css: CssClass, select: SelectSetting, onChange: EventHandler = null) {
    const e = element("select", id, css, null, onChange) as HTMLSelectElement;
    select.options.forEach(o => {
      const option = document.createElement("option") as HTMLOptionElement
      option.value = "" + o.value;
      option.text = o.displayText;
      option.textContent = o.displayText;
      e.appendChild(option);
    });
    e.value = "" + select.index()
    return e
  }
}

const topPanelClass = cssClass("topPanel", css`
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 10px;
  height: 100%;
  overflow: hidden;

  text-align: center;
  background-color: #ffffff;
  font-family: sans-serif;
  font-size: 3.2rem;
  user-select: none;

  width: 100%;
  max-width: 100%;
  max-height: 100%;
`)

const settingsPanelClass = cssClass("settingsPanel", css`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 2px;
  height: 100%;
  font-size: 25px;
  overflow: auto;
`)

const settingsPaneClass = cssClass("settingsPane", css`
  text-align: center;
  padding-left: 5px;
  padding-right: 5px;
`)

const settingsPaneTitleClass = cssClass("settingsPaneTitle", css`
  text-align: Left;
  background: turquoise;
  grid-column: 1 / 3;
`)

const settingsListClass = cssClass("settingsList", css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
`)

const settingsLabelClass = cssClass("settingsLabel", css`
  text-align: left;
  height: 40px;
`)

const settingsValueClass = cssClass("settingsValue", css`
  text-align: right;
`)

const checkboxClass = cssClass("checkboxClass", css`
  display: inline-block;
  text-align: left;
  font-size: 0.85em;
  user-select: auto;
  outline: none;
  cursor: pointer;
  border: 0.05rem solid #5755d9;
  padding: 0;
  width: 100%;
  height: 30px;
`)
