import {closeModal, pushModal} from './modaldlg';
import {getTextInput, label, panel, textInput} from '../ui/ui';
import {contentClass, modalClass, textRowClass, titleClass, titleRowClass, twoButtonRowStyle} from './dialogStyles';
import {Function2} from '../common';
import {button} from '../ui/button';

export class InputDialog {
  action: Function2<string>;
  dialog: HTMLElement

  constructor(title: string, text: string, value: string, action: Function2<string> = null) {
    this.action = action;
    this.dialog = this.createDialog(title, text, value);
    document.body.appendChild(this.dialog)
    pushModal(this.dialog, () => document.body.removeChild(this.dialog))
  }

  createDialog(title: string, text: string, value: string): HTMLElement {
    return panel("", modalClass,
        panel("", contentClass, [
          panel("", titleRowClass, label("", title, titleClass)),
          panel("", textRowClass, [
            textInput("input-text", "New Name", value)
          ]),
          panel("", twoButtonRowStyle, [
            button("", "Ok", "Ok", () => this.close("ok")),
            button("", "Cancel", "Cancel", () => this.close("cancel"))
          ])
        ])
    )
  }

  close(answer: string) {
    let text = getTextInput("input-text");
    closeModal("");
    if (answer == "ok") {
      this.action?.(text)
    }
  }
}
