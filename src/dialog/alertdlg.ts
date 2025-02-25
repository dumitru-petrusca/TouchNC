import {closeModal, pushModal} from './modaldlg';
import {panel, label} from '../ui/ui';
import {contentClass, modalClass, oneButtonRowClass, textRowClass, titleClass, titleRowClass} from './dialogStyles';
import {button} from '../ui/button';

export class AlertDialog {
  dialog: HTMLElement

  constructor(title: string, text: string) {
    this.dialog = this.createDialog(title, text);
    document.body.appendChild(this.dialog)
    pushModal(this.dialog, () => document.body.removeChild(this.dialog))
  }

  createDialog(title: string, text: string): HTMLElement {
    return panel("", modalClass,
        panel("", contentClass, [
          panel("", titleRowClass, label("", title, titleClass)),
          panel("", textRowClass, label("", text)),
          panel("", oneButtonRowClass, button("", "Ok", "Ok", closeModal))
        ])
    )
  }
}
