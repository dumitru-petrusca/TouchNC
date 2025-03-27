import {Content, element, getElement, panel} from './ui';
import {css, cssClass} from './commonStyles';
import {EventHandler} from '../common/common';
import {button} from './button';
import {Icon, svgIcon} from './icons';

export class MenuItem {
  text: string
  onClick: EventHandler

  constructor(name: string, onclick: EventHandler) {
    this.text = name;
    this.onClick = onclick;
  }
}

export const createMenu = (id: string, title: string, position: string, items: MenuItem[]) => {
  let buttonId = id + '-menu-button';
  let menuId = id + 'menu-content';
  let menuItems = items.map(item => mi(menuId, item))
  return panel(id, undefined, [
    menuButton(buttonId, svgIcon(Icon.menu), () => getElement(menuId).style.display = "block"),
    panel(menuId, menuClass, menuItems)
  ])
}

const mi = (id: string, item: MenuItem, show = true) => {
  const anchor = element('div', item.text, menuItemClass, item.text)
  if (show) {
    anchor.onclick = (e) => {
      item.onClick?.(e)
      getElement(id).style.display = "none";
    };
  } else {
    anchor.hidden = true;
  }
  return anchor;
}

const menuButton = (id: string, content: Content, onclick: EventHandler) => {
  return button(id, content, "", onclick)
}

export function menuItem(id: string, content: Content, title: string, click?: EventHandler, value: string = ""): HTMLButtonElement {
  const btn = element('button', id, btnMenuClass, content) as HTMLButtonElement
  btn.title = title
  btn.value = value
  if (click != undefined) {
    btn.onclick = click
  }
  return btn
}

const btnMenuClass = cssClass("btnMenu", css`
  width: 60px;
  height: 60px;
  border: none;
  border-radius: 0;
  background-color: lightblue;
  font-size: x-large;
  cursor: pointer;
`)

const menuClass = cssClass("menu", css`
  display: none;
  animation: slide-down .15s ease 1;
  overflow-y: auto;
  position: absolute;
  background-color: #f9f9f9;
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
  border: 1px solid #dddddd;
  user-select: none;
  max-height: 50vh;
  min-width: 160px;
  z-index: 1;
  left: inherit;
  right: inherit;
`)

const menuItemClass = cssClass("menuItem", css`
  text-align: left;
`)

cssClass("menuItem:hover", css`
  background: #e0e0e0
`)

cssClass("menuItem:active", css`
  background: #d0f0d0
`)
