import {label, panel} from './ui';
import {btnIcon, button, getButtonValueAsString} from './button';
import {axisNames, getAxisValue, gotoAxisValue, lockAxis, setAxisValue} from '../machine/machine';
import {Numpad, NumpadType} from '../dialog/numpad';
import {factor} from '../machine/modal';
import {css, cssClass} from './commonStyles';
import {Icon} from './icons';

export const axesDRO = () => panel('axis-position', droClass, axisNames.map((axis) => makeDRO(axis)))

function showAxisNumpad(e: Event) {
  let axis = getButtonValueAsString(e);
  new Numpad(NumpadType.FLOAT, () => "" + getAxisValue(axis), v => setAxisValue(axis, Number(v)), v => gotoAxisValue(axis, Number(v)));
}

const btnHalfAxis = (e: Event) => {
  let axis = getButtonValueAsString(e)
  setAxisValue(axis, getAxisValue(axis) / factor() / 2);
}

const btnZeroAxis = (e: Event) => setAxisValue(getButtonValueAsString(e), 0);

const btnGoto0 = (e: Event) => gotoAxisValue(getButtonValueAsString(e), 0)

function makeDRO(axis: string): HTMLElement {
  let axisU = axis.toUpperCase()
  return panel(`${axis}-dro`, axisRowClass, [
    label('', axisU),
    button(`wpos-${axis}`, '0.00', `Modify ${axis} position`, showAxisNumpad, axis),
    label(`mpos-${axis}`, '0.00', mposClass),
    button(`zero-${axis}`, btnIcon(Icon.delete), `Set ${axisU} to 0`, btnZeroAxis, axisU),
    button(`half-${axis}`, `1/2`, `Divide ${axisU} by 2`, btnHalfAxis, axisU),
    button(`goto0-${axis}`, btnIcon(Icon.gotoZero), `Goto 0 in ${axisU}`, btnGoto0, axisU),
    button(`lock-${axis}`, btnIcon(Icon.lockClosed), `Toggle ${axisU} MPG`, lockAxis, axisU)
  ])
}

const droClass = cssClass("dro", css`
  display: grid;
  grid-auto-rows: minmax(auto, auto);
  gap: 10px;
  width: 100%;
  max-width: 100%;
`)

const axisRowClass = cssClass("axisRow", css`
  display: grid;
  grid-template-columns: 1fr 5fr 2fr 3fr 3fr 3fr 3fr;
  gap: 10px;
  width: 100%;
  max-width: 100%;
`)

const mposClass = cssClass("mpos", css`
  padding-top: 0.1em;
  font-size: 0.9em;
  color: #606060;
`)

