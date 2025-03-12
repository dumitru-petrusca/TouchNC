import {sendCommand, sendCommandAndGetStatus} from '../http/http';
import {btnIcon, button} from '../ui/button';
import {currentModal} from './modal';
import {Content, panel} from '../ui/ui';
import {css, cssClass} from '../ui/commonStyles';
import {Icon} from '../ui/icons';

export function jogPanel() {
  return panel('', jogPanelClass, [
    panel(""),
    jogButton('y+', btnIcon(Icon.up), `Y+`, 100),
    panel(""),
    jogButton('z+', btnIcon(Icon.up), `Z+`, 100),
    jogButton('x-', btnIcon(Icon.left), `X-`, 100),
    panel("X/Y", undefined, "X / Y"),
    jogButton('x+', btnIcon(Icon.right), `X+`, 100),
    panel("Z", undefined, "Z"),
    panel(""),
    jogButton('y-', btnIcon(Icon.down), `Y-`, 100),
    panel(""),
    jogButton('z-', btnIcon(Icon.down), `Z-`, 100),
  ]);
}

export function axisJogPanel(axis: string) {
  let axisMinus = `${axis}-`;
  let axisPlus = `${axis}+`;
  return panel('', jogRowClass, [
    jogButton('jog1', '<', axisMinus, 2),
    jogButton('jog2', '<<', axisMinus, 100),
    jogButton('jog3', '<<<', axisMinus, 1000),
    jogButton('jog4', '>>>', axisPlus, 1000),
    jogButton('jog5', '>>', axisPlus, 100),
    jogButton('jog6', '>', axisPlus, 2),
  ]);
}

export const jogButton = (id: string, content: Content, axis: string, feedRate: number) => {
  let btn = button(id, content, `Move ${axis}`, undefined, axis);
  btn.addEventListener('pointerdown', handleDown(axis, feedRate));
  btn.addEventListener('pointerup', handleUp);
  btn.addEventListener('pointerout', handleUp);
  return btn
}

function handleDown(axis: string, feedrate: number) {
  return (event: Event) => {
    if (currentModal.units === "G20") {
      feedrate /= 25.4;
    }
    const cmd = '$J=G91F' + feedrate.toFixed(2) + axis + '1000\n';
    // tabletShowMessage("Jog: " + axis + ": " + cmd);
    sendCommandAndGetStatus(cmd);
  }
}

const handleUp = (event: Event) => {
  sendCommand('\x85');
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
