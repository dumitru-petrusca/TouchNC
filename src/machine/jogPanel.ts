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

type Axis = "X" | "Y" | "Z"
type Dir = "-" | "+"

class Jog {
  axis: Axis
  dir: Dir
  feed: number

  constructor(axis: Axis, dir: Dir, feed: number) {
    this.axis = axis
    this.dir = dir
    this.feed = feed
  }
}

const jogs = new Map<string, Jog>([
  ["ArrowLeft", new Jog("X", "-", 100)],
  ["ArrowRight", new Jog("X", "+", 100)],
  ["ArrowUp", new Jog("Y", "+", 100)],
  ["ArrowDown", new Jog("Y", "-", 100)],
  ["PageDown", new Jog("Z", "-", 100)],
  ["PageUp", new Jog("Z", "+", 100)],
])

export class JogPanel {
  setting: SelectSetting;
  feedGroup: SettingButtonGroup

  constructor() {
    this.setting = new SelectSetting("speeds", STEP, [
      new SelectOption(0, STEP, STEP),
      new SelectOption(1, "1", "", Icon.walk),
      new SelectOption(2, "2", "", Icon.run),
      new SelectOption(3, "3", "", Icon.sprint)
    ]);
    this.feedGroup = new SettingButtonGroup(this.setting);
    window.addEventListener("keydown", this.handleKeyDown.bind(this))
    window.addEventListener("keyup", this.handleKeyUp.bind(this))
  }

  create() {
    let feedButtons = this.feedGroup.build();
    return panel('', jogPanelClass, [
      feedButtons[0],
      this.jogButton('y+', btnIcon(Icon.up), `y`, +1, 100),
      feedButtons[1],
      this.jogButton('z+', btnIcon(Icon.up), `z`, +1, 100),
      this.jogButton('x+', btnIcon(Icon.left), `x`, +1, 100),
      panel("X/Y", undefined, "X / Y"),
      this.jogButton('x-', btnIcon(Icon.right), `x`, -1, 100),
      panel("Z", undefined, "Z"),
      feedButtons[2],
      this.jogButton('y-', btnIcon(Icon.down), `y`, -1, 100),
      feedButtons[3],
      this.jogButton('z-', btnIcon(Icon.down), `z`, -1, 100),
    ]);
  }

  jogButton = (id: string, content: Content, axis: string, dir: number, feedRate: number) => {
    let btn = button(id, content, `Move ${axis}`, undefined, axis);
    new JogDebouncer(debounceDelayMs,
      () => this.startJog(axis, dir, feedRate, btn),
      () => this.cancelJog(btn)
    ).registerListener(btn)
    return btn
  }

  startJog(axis: string, dir: number, _feedRate: number, btn: HTMLButtonElement) {
    let sign = dir < 0 ? "-" : "+"
    btn.style.backgroundColor = "#d0f0d0"
    if (this.setting.getValue() == STEP) {
      let step = isMmMode() ? "0.01" : "0.001"
      let feed = mmToDisplay(100);
      sendCommandAndGetStatus(`$J=G91 F${feed} ${axis}${sign}${step}`);
    } else {
      let i = this.setting.index();
      let feedPercent = Number(preferences.jogRate(i)) / 100.0;
      let maxFeed = machineSettings.floatSetting(`/axes/${axis}/max_rate_mm_per_min`).getValue();
      let feed = mmToCurrent(maxFeed * feedPercent)
      sendCommandAndGetStatus(`$J=G91 F${feed.toFixed(2)} ${axis}${sign}1000`);
    }
  }

  cancelJog(btn: HTMLButtonElement) {
    btn.style.backgroundColor = "lightblue"
    console.log("Cancel Jog")
    sendCommand(CANCEL_JOG_CMD);
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if (event.repeat || isInputFocused) return;
    const jog = jogs.get(event.key);
    if (jog != undefined) {
      this.startJog2(jog)
      event.preventDefault();
    }
  }

  handleKeyUp = (event: KeyboardEvent) => {
    if (event.repeat || isInputFocused) return;
    const jog = jogs.get(event.key);
    if (jog != undefined) {
      sendCommand(CANCEL_JOG_CMD);
      event.preventDefault();
    }
  }

  startJog2(jog: Jog) {
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
}

const jogRowClass = cssClass("jogRow", css`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
    gap: 10px;
    width: 100%;
    max-width: 100%;
`)

const jogPanelClass = cssClass("jogPanel", css`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    gap: 10px;
    height: 100%;
    font-size: 30px;
`)
