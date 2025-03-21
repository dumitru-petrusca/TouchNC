import {column, label, row} from './ui';
import {btnIcon, button, getButtonValueAsString} from './button';
import {axisNames, getAxisValue, gotoAxisValue, lockAxis, setAxisValue} from '../machine/machine';
import {Numpad, NumpadType} from '../dialog/numpad';
import {mmToCurrent} from '../machine/modal';
import {mposClass} from './commonStyles';
import {Icon} from './icons';
import {jogPanel} from '../machine/jog';

export function axesDRO() {
  let droRows = column('axis-position').maxWidth("100%");
  axisNames.forEach(axis => droRows.add("auto", makeDRO(axis)))
  return row()
      .maxWidth(`100%`)
      .add("1fr", droRows)
      .add("auto", jogPanel())
      .build()
}

function makeDRO(axis: string): HTMLElement {
  let axisU = axis.toUpperCase()
  return row(`${axis}-dro`)
      .maxWidth("100%")
      .add("1fr", label('', axisU))
      .add("5fr", button(`wpos-${axis}`, '0.00', `Modify ${axis} position`, showAxisNumpad, axis))
      .add("2fr", label(`mpos-${axis}`, '0.00', mposClass))
      .add("3fr", button(`zero-${axis}`, btnIcon(Icon.delete), `Set ${axisU} to 0`, btnZeroAxis, axisU))
      .add("3fr", button(`half-${axis}`, `1/2`, `Divide ${axisU} by 2`, btnHalfAxis, axisU))
      .add("3fr", button(`goto0-${axis}`, btnIcon(Icon.gotoZero), `Goto 0 in ${axisU}`, btnGoto0, axisU))
      .add("3fr", button(`lock-${axis}`, btnIcon(Icon.lockClosed), `Toggle ${axisU} MPG`, lockAxis, axisU))
      .build()
}

function showAxisNumpad(e: Event) {
  let axis = getButtonValueAsString(e);
  new Numpad(NumpadType.FLOAT, () => "" + getAxisValue(axis), v => setAxisValue(axis, Number(v)), v => gotoAxisValue(axis, Number(v)));
}

const btnHalfAxis = (e: Event) => {
  let axis = getButtonValueAsString(e)
  setAxisValue(axis, mmToCurrent(getAxisValue(axis)) / 2);
}

const btnZeroAxis = (e: Event) => setAxisValue(getButtonValueAsString(e), 0);

const btnGoto0 = (e: Event) => gotoAxisValue(getButtonValueAsString(e), 0)
