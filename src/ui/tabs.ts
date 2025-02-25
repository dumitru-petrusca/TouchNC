import {Function2} from '../common';
import {getButton, getParentButton} from './button';
import {panel} from './ui';
import {Icon, svgIcon} from './icons';
import {menuItem} from './menu';
import {css, cssClass} from './commonStyles';
import {tabSelectChannel, TabSelectEvent} from '../events/eventbus';
import {TAB_MANUAL} from '../config/preferences';
import {StatusDialog} from '../dialog/statusdlg';

let tabs: Map<string, Tab> = new Map()
let selectedTab = TAB_MANUAL

export class Tab {
  id: string
  content: HTMLElement
  onSelect: Function2<void>
  c: HTMLElement | null = null
  icon: SVGSVGElement;
  title: string;

  constructor(name: string, icon: Icon, title: string, content: HTMLElement, onSelect: Function2<void> = null) {
    this.id = name;
    this.icon = menuIcon(icon);
    this.title = title;
    this.content = content;
    this.onSelect = onSelect;
  }

  getContent() {
    return this.content
  }

  select() {
    tabSelectChannel.sendEvent(new TabSelectEvent(this.id, this.getContent()))
    this.onSelect?.()
  }
}

function clickTab(e: Event) {
  let selectedButton = getParentButton(e);
  if (selectedButton != null) {
    selectTab(selectedButton.id)
  }
}

export function selectTab(newTab: string) {
  getButton(selectedTab).style.background = "lightblue"
  tabs.get(selectedTab)?.getContent().remove()
  let selectedButton = getButton(newTab);
  if (selectedButton != null) {
    selectedTab = newTab
    selectedButton.style.background = "white"
    tabs.get(selectedTab)?.select();
  }
}

export function addTab(tab: Tab) {
  tabs.set(tab.id, tab)
}

export function createMainMenu() {
  let buttons = panel('', tabsClass, []);
  tabs.forEach((tab, _) => buttons.appendChild(menuItem(tab.id, tab.icon, tab.title, clickTab)));
  let logo = menuItem("", svgIcon(Icon.logo, "50px", "50px", "green"), "TouchNC", _ => new StatusDialog())
  return panel('', mainMenuClass, [logo, buttons]);
}

function menuIcon(icon: Icon): SVGSVGElement {
  return svgIcon(icon, "50px", "50px", "black", menuIconClass);
}

const menuIconClass = cssClass("menuIcon", css`
  vertical-align: middle;
`)

const mainMenuClass = cssClass("mainMenu", css`
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 3px;
  background: cadetblue;
  width: 60px;
`)

const tabsClass = cssClass("tabs", css`
  display: grid;
  grid-template-rows: repeat(5, auto) 1fr;
  width: 60px;
  background-color: lightblue;
`)
