import {closeModal, pushModal} from './modaldlg';
import {panel, label} from '../ui/ui';
import {contentClass, modalClass, titleRowClass, titleClass, twoButtonRowStyle} from './dialogStyles';
import {Function2} from '../common';
import {button} from '../ui/button';

export class ConfirmDialog {
  action: Function2<void>;
  dialog: HTMLElement

  constructor(text: string, action: Function2<void> = null) {
    this.action = action;
    this.dialog = this.createDialog(text);
    document.body.appendChild(this.dialog)
    pushModal(this.dialog, () => document.body.removeChild(this.dialog))
  }

  createDialog(text: string): HTMLElement {
    return panel("", modalClass,
        panel("", contentClass, [
          panel("", titleRowClass, label("", text, titleClass)),
          panel("", twoButtonRowStyle, [
            button("", "Yes", "Yes", () => this.close("yes")),
            button("", "No", "No", () => this.close("no"))
          ])
        ])
    )
  }

  close(answer: string) {
    closeModal("");
    if (answer == "yes") {
      this.action?.()
    }
  }
}
