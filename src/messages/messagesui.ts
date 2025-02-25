import {button} from '../ui/button';
import {css, cssClass, floatingButtonClass} from '../ui/commonStyles';
import {messageChannel, tabSelectChannel} from '../events/eventbus';
import {messages} from './messages';
import {ifPresent, panel} from '../ui/ui';
import {Icon, svgIcon} from '../ui/icons';

export function refreshMessages() {
  ifPresent('messages', e => {
    e.innerHTML = messages.messagesText;
    e.scrollTop = e.scrollHeight;
  })
}

export function messagesPanel() {
  return panel('messagepane', messagePaneClass, [
    panel('messages', messagesClass),
    button('messages-clear', svgIcon(Icon.x, "1.1em", "1.1em"), 'Clear', () => messages.clear(), "", floatingButtonClass)
  ])
}

const messagePaneClass = cssClass("messagePane", css`
  position: relative;
  overflow: auto;
`)

const messagesClass = cssClass("messages", css`
  text-align: left;
  font-size: 0.65em;
  border: 0.05rem solid #5755d9;
  max-height: 100%;
  overflow-x: auto;
  overflow-y: scroll;
  user-select: text;
  height: 100%;
`)

tabSelectChannel.register(refreshMessages, "messages", 10)
messageChannel.register(refreshMessages)