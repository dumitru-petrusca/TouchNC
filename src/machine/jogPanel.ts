import {CANCEL_JOG_CMD, sendCommand, sendCommandAndGetStatus} from '../http/http';
import {btnIcon, button, getButton} from '../ui/button';
import {isMmMode, mmToCurrent, mmToDisplay} from './modal';
import {Content, getElement, isInputFocused, panel} from '../ui/ui';
import {css, cssClass} from '../ui/commonStyles';
import {Icon} from '../ui/icons';
import {SelectOption, SelectSetting} from '../config/settings';
import {SettingButtonGroup} from '../ui/toggleButton';
import {preferences} from '../config/preferences';
import {machineSettings} from '../config/machinesettings';
import {JogDebouncer} from './jogDebouncer';

const STEP = "step";
const debounceDelayMs = 100
export const KEYBOARD_JOGGING_ONLY = true

type Axis = "X" | "Y" | "Z"
type Dir = "-" | "+"

class Jog {
  axis: Axis
  dir: Dir
  feed: number
  icon: SVGSVGElement

  constructor(axis: Axis, dir: Dir, feed: number, icon: SVGSVGElement) {
    this.axis = axis
    this.dir = dir
    this.feed = feed
    this.icon = icon
  }
}

const xPosJog = new Jog("X", "+", 100, btnIcon(Icon.left))
const xNegJog = new Jog("X", "-", 100, btnIcon(Icon.right))
const yPosJog = new Jog("Y", "+", 100, btnIcon(Icon.down))
const yNegJog = new Jog("Y", "-", 100, btnIcon(Icon.up))
const zPosJog = new Jog("Z", "+", 100, btnIcon(Icon.down))
const zNegJog = new Jog("Z", "-", 100, btnIcon(Icon.up))

const keyboardJogs = new Map<string, Jog>([
  ["ArrowLeft", xPosJog],
  ["ArrowRight", xNegJog],
  ["ArrowUp", yNegJog],
  ["ArrowDown", yPosJog],
  ["PageDown", zNegJog],
  ["PageUp", zPosJog],
])


export class JogPanel {
  setting: SelectSetting;
  feedGroup: SettingButtonGroup

  constructor() {
    if (KEYBOARD_JOGGING_ONLY) {
      this.setting = new SelectSetting("jog.rate", STEP, [
        new SelectOption(0, STEP, "", Icon.walk),
        new SelectOption(1, "1", `${preferences.jogRate(1)}%`),
        new SelectOption(2, "2", `${preferences.jogRate(2)}%`),
        new SelectOption(3, "3", `${preferences.jogRate(3)}%`),
        new SelectOption(4, "4", `${preferences.jogRate(4)}%`),
        new SelectOption(5, "5", `${preferences.jogRate(5)}%`)
      ]);
    } else {
      this.setting = new SelectSetting("speeds", STEP, [
        new SelectOption(0, STEP, STEP),
        new SelectOption(1, "1", "", Icon.walk),
        new SelectOption(2, "2", "", Icon.run),
        new SelectOption(3, "3", "", Icon.sprint)
      ]);
    }
    this.feedGroup = new SettingButtonGroup(this.setting);
    window.addEventListener("keydown", this.handleKeyDown.bind(this))
    window.addEventListener("keyup", this.handleKeyUp.bind(this))
  }

  create() {
    let feedButtons = this.feedGroup.build();
    if (KEYBOARD_JOGGING_ONLY) {
      return panel('', keyboardJogPanelClass, [
        feedButtons[0],
        feedButtons[1],
        feedButtons[2],
        feedButtons[3],
        feedButtons[4],
        feedButtons[5],
      ]);
    } else {
      return panel('', jogPanelClass, [
        feedButtons[0],
        this.jogButton(yPosJog),
        feedButtons[1],
        this.jogButton(zPosJog),
        this.jogButton(xPosJog),
        panel("X/Y", undefined, "X / Y"),
        this.jogButton(xNegJog),
        panel("Z", undefined, "Z"),
        feedButtons[2],
        this.jogButton(yNegJog),
        feedButtons[3],
        this.jogButton(zNegJog),
      ]);
    }
  }

  jogButton = (jog: Jog) => {
    let id = jog.axis + jog.dir
    let btn = button(id, jog.icon, `Move ${jog.axis}`, undefined, jog.axis);
    new JogDebouncer(debounceDelayMs,
      () => {
        btn.style.backgroundColor = "#d0f0d0"
        this.startJog(jog)
      },
      () => this.cancelJog(btn)
    ).registerListener(btn)
    return btn
  }

  startJog(jog: Jog) {
    if (this.setting.getValue() == STEP) {
      let step = isMmMode() ? "0.01" : "0.001"
      let feed = mmToDisplay(100);
      sendCommandAndGetStatus(`$J=G91 F${feed} ${jog.axis}${jog.dir}${step}`);
    } else {
      let i = this.setting.index();
      let feedPercent = Number(preferences.jogRate(i)) / 100.0;
      let maxFeed = machineSettings.floatSetting(`/axes/${jog.axis}/max_rate_mm_per_min`).getValue();
      let feed = mmToCurrent(maxFeed * feedPercent)
      sendCommandAndGetStatus(`$J=G91 F${feed.toFixed(2)} ${jog.axis}${jog.dir}1000`);
    }
  }

  cancelJog(btn: HTMLButtonElement) {
    btn.style.backgroundColor = "lightblue"
    console.log("Cancel Jog")
    sendCommand(CANCEL_JOG_CMD);
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if (event.repeat || isInputFocused) return;
    const jog = keyboardJogs.get(event.key);
    if (jog != undefined) {
      this.startJog(jog)
      event.preventDefault();
    }
  }

  handleKeyUp = (event: KeyboardEvent) => {
    if (event.repeat || isInputFocused) return;
    const jog = keyboardJogs.get(event.key);
    if (jog != undefined) {
      sendCommand(CANCEL_JOG_CMD);
      event.preventDefault();
    }
  }
}

const jogPanelClass = cssClass("jogPanel", css`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    gap: 10px;
    height: 100%;
    font-size: 30px;
`)

const keyboardJogPanelClass = cssClass("keyboardJogPanelClass", css`
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    gap: 10px;
    height: 100%;
    font-size: 30px;
`)
