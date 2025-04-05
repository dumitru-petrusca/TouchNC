import {CANCEL_JOG_CMD, sendCommand, sendCommandAndGetStatus} from '../http/http';
import {btnIcon, button} from '../ui/button';
import {isMmMode, mmToDisplay} from './modal';
import {Content, panel} from '../ui/ui';
import {css, cssClass} from '../ui/commonStyles';
import {Icon} from '../ui/icons';
import {SelectOption, SelectSetting} from '../config/settings';
import {SettingButtonGroup} from '../ui/toggleButton';

const STEP = "step";

export class JogPanel {
  setting: SelectSetting;
  feedGroup: SettingButtonGroup
  jogging: boolean = false;

  constructor() {
    this.setting = new SelectSetting("speeds", STEP, [
      new SelectOption(0, STEP, STEP),
      new SelectOption(1, "10", "10"),
      new SelectOption(2, "100", "100"),
      new SelectOption(3, "1000", "1000")
    ]);
    this.feedGroup = new SettingButtonGroup(this.setting);
  }

  create() {
    let feedButtons = this.feedGroup.build();
    return panel('', jogPanelClass, [
      feedButtons[0],
      this.jogButton('y+', btnIcon(Icon.up), `Y+`, 100),
      feedButtons[1],
      this.jogButton('z+', btnIcon(Icon.up), `Z+`, 100),
      this.jogButton('x+', btnIcon(Icon.left), `X+`, 100),
      panel("X/Y", undefined, "X / Y"),
      this.jogButton('x-', btnIcon(Icon.right), `X-`, 100),
      panel("Z", undefined, "Z"),
      feedButtons[2],
      this.jogButton('y-', btnIcon(Icon.down), `Y-`, 100),
      feedButtons[3],
      this.jogButton('z-', btnIcon(Icon.down), `Z-`, 100),
    ]);
  }

  axisPanel(axis: string) {
    let axisMinus = `${axis}-`;
    let axisPlus = `${axis}+`;
    return panel('', jogRowClass, [
      this.jogButton('jog1', '<', axisMinus, 2),
      this.jogButton('jog2', '<<', axisMinus, 100),
      this.jogButton('jog3', '<<<', axisMinus, 1000),
      this.jogButton('jog4', '>>>', axisPlus, 1000),
      this.jogButton('jog5', '>>', axisPlus, 100),
      this.jogButton('jog6', '>', axisPlus, 2),
    ]);
  }

  jogButton = (id: string, content: Content, axis: string, feedRate: number) => {
    let btn = button(id, content, `Move ${axis}`, undefined, axis);
    btn.addEventListener('touchstart', _ => this.handleDown(axis, feedRate, btn));
    btn.addEventListener('touchend', _ => this.cancelJog(btn));
    // btn.addEventListener('pointerout', _ => this.cancelJog(btn));
    return btn
  }

  handleDown(axis: string, _feedRate: number, btn: HTMLButtonElement) {
    btn.style.backgroundColor = "#d0f0d0"
    if (this.setting.getValue() == STEP) {
      let step = isMmMode() ? "0.01" : "0.001"
      let feed = mmToDisplay(100);
      sendCommandAndGetStatus(`$J=G91 F${feed} ${axis}${step}`);
    } else {
      let feed = Number(this.setting.getValue());
      this.jogging = true
      console.log("Start Jog")
      sendCommandAndGetStatus(`$J=G91 F${feed.toFixed(2)} ${axis}1000`);
    }
  }

  cancelJog(btn: HTMLButtonElement) {
    this.jogging = false
    btn.style.backgroundColor = "lightblue"
    console.log("Cancel Jog")
    sendCommand(CANCEL_JOG_CMD);
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
