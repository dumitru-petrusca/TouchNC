import {getElement} from '../ui/ui';
import {Consumer} from '../common/common';

let modalStack: Modal[] = [];

interface Modal {
  element: HTMLElement;
  closeFn?: Consumer<any>
}

export function setActiveModal(htmlTemplate: string, closeFn?: Consumer<any>) {
  if (htmlTemplate == null) {
    return null;
  }
  modalStack.push({
    element: getElement(htmlTemplate),
    closeFn: closeFn
  })
  return getActiveModal();
}

export function pushModal(element: HTMLElement, closeFn: Consumer<any>): void {
  modalStack.push({
    element: element,
    closeFn: closeFn
  })
  showModal()
}

export function getActiveModal(): Modal | null {
  return modalStack.length > 0 ? modalStack[modalStack.length - 1] : null;
}

export function showModal() {
  const modal = getActiveModal();
  if (modal != null) {
    modal.element.style.display = "block";
  }
}

export function closeModal(value: any = null) {
  const modal = getActiveModal();
  if (modal != null) {
    modal.element.style.display = "none";
    modalStack.pop();
    if (modal.closeFn != null) {
      modal.closeFn(value);
    }
  }
}

(window as any).closeModal = closeModal