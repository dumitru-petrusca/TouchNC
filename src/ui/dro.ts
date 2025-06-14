import { label,} from './ui';
import {btnIcon, button, getButtonValueAsString} from './button';
import {axisNames, getAxisPosition, gotoAxisPosition, lockAxis, setAxisPosition} from '../machine/machine';
import {Numpad, NumpadType} from './numpad';
import {isInchMode, mmToCurrent} from '../machine/modal';
import {mposClass} from './commonStyles';
import {Icon} from './icons';
import {column, row} from './panel';
import {JogPanel} from '../machine/jogPanel';

export function axesDRO() {
  let droRows = column('axis-position').maxWidth("100%");
  axisNames.forEach(axis => droRows.add("auto", makeDRO(axis)))
  return row()
      .maxWidth(`100%`)
      .add("1fr", droRows)
      .add("auto", new JogPanel().create())
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
      .add("3fr", button(`lock-${axis}`, btnIcon(Icon.lockClosed), `Toggle ${axisU} MPG`, lockAxis, axisU))
      .add("3fr", button(`half-${axis}`, `1/2`, `Divide ${axisU} by 2`, btnHalfAxis, axisU))
      .add("3fr", button(`goto0-${axis}`, btnIcon(Icon.gotoZero), `Goto 0 in ${axisU}`, btnGoto0, axisU))
      .build()
}

function showAxisNumpad(e: Event) {
  let axis = getButtonValueAsString(e);
  new Numpad(NumpadType.FLOAT, () => getAxisPosition(axis).toFixed(isInchMode() ? 3 : 2), v => setAxisPosition(axis, Number(v)), v => gotoAxisPosition(axis, Number(v)));
}

const btnHalfAxis = (e: Event) => {
  let axis = getButtonValueAsString(e)
  setAxisPosition(axis, mmToCurrent(getAxisPosition(axis)) / 2);
}

const btnZeroAxis = (e: Event) => setAxisPosition(getButtonValueAsString(e), 0);

const btnGoto0 = (e: Event) => gotoAxisPosition(getButtonValueAsString(e), 0)
