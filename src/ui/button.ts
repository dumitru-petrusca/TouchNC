import {EventHandler, valueOrError} from '../common/common';
import {btnClass, css, cssClass, CssClass} from './commonStyles';
import {beep, Content, element, getElement, ifPresent} from './ui';
import {Icon, svgIcon} from './icons';

export function button(id: string, content: Content, title: string,
                       click?: EventHandler, value: string = "", css?: CssClass): HTMLButtonElement {
  const btn = element('button', id, btnClass.plus(css), content) as HTMLButtonElement
  btn.title = title
  btn.value = value
  btn.onclick = e => {
    beep()
    click?.(e)
  }
  return btn
}

export function setButtonText(id: string, text: string) {
  ifPresent(id, button => {
    button.replaceChildren(text)
  })
}

export function setButton(id: string, isEnabled: boolean, iconName: Icon, onClick?: EventHandler) {
  ifPresent(id, button => {
    (button as HTMLButtonElement).disabled = !isEnabled;
    button.replaceChildren(btnIcon(iconName, isEnabled ? "black" : "darkgray"))
    if (onClick!=undefined) {
      button.onclick = onClick
    }
  })
}

export function setButtonIcon(id: string, iconName: Icon) {
  ifPresent(id, button => {
    button.replaceChildren(btnIcon(iconName, "black"))
  })
}

export function getButton(id: string) {
  return getElement(id) as HTMLButtonElement
}

export function getButtonValuesAsNumber(e: Event): number {
  return Number(getButtonValueAsString(e));
}

export function getButtonValueAsString(e: Event): string {
  let btn = getParentButtonOrError(e);
  return btn.value;
}

export function getParentButton(e: Event): HTMLButtonElement | null {
  let c: HTMLElement | null = e.target as HTMLElement
  while (c != null && !(c instanceof HTMLButtonElement)) {
    c = c.parentElement
  }
  return c;
}

function getParentButtonOrError(e: Event): HTMLButtonElement {
  return valueOrError(getParentButton(e), () => `Cannot find parent button of ${(e.target as HTMLElement).id}`);
}

export function btnIcon(icon: Icon, color: string = "black") {
  return svgIcon(icon, "1.3em", "1.3em", "black", btnIconClass)
}

const btnIconClass = cssClass("btnIcon", css`
  vertical-align: text-top;
  user-select: none;           /* Disable text selection (standard) */
  touch-action: manipulation;
`)
