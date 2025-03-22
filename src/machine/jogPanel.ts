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
      new SelectOption(STEP, STEP, 0),
      new SelectOption("10", "10", 1),
      new SelectOption("100", "100", 2),
      new SelectOption("1000", "1000", 3)
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
      this.jogButton('x-', btnIcon(Icon.left), `X-`, 100),
      panel("X/Y", undefined, "X / Y"),
      this.jogButton('x+', btnIcon(Icon.right), `X+`, 100),
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
    btn.addEventListener('pointerdown', this.handleDown(axis, feedRate));
    btn.addEventListener('pointerup', _ => this.cancelJog());
    btn.addEventListener('pointerout', _ => this.cancelJog());
    // logEvents(btn)
    return btn
  }

  cancelJog() {
    if (this.jogging) {
      this.jogging = false
      sendCommand(CANCEL_JOG_CMD);
    }
  }

  handleDown(axis: string, _feedRate: number) {
    return (_: Event) => {
      if (this.setting.getValue() == STEP) {
        let step = isMmMode() ? "0.01" : "0.001"
        let feed = mmToDisplay(100);
        sendCommandAndGetStatus(`$J=G91 F${feed} ${axis}${step}`);
      } else {
        let feed = Number(this.setting.getValue());
        this.jogging = true
        sendCommandAndGetStatus(`$J=G91 F${feed.toFixed(2)} ${axis}1000`);
      }
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
