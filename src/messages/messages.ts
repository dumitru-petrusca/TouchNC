import {messageChannel, startupChannel} from '../events/eventbus';

const maxCount = 100

export class Messages {
  messagesText = ""
  count = 0;

  error(msg: string) {
    this.message('<span style="color:red;">' + msg + '</span>')
  }

  warning(msg: string) {
    this.message('<span style="color:darkorange;">' + msg + '</span>')
  }

  info(msg: string) {
    this.message('<span style="color:darkgreen;">' + msg + '</span>')
  }

  message(msg: string) {
    msg = msg.trim()
    if (shouldIgnore(msg.trim())) {
      return;
    }
    this.messagesText += this.count == 0 ? msg : `<br>` + msg
    if (this.count == maxCount) {
      let i = this.messagesText.indexOf("<br>");
      this.messagesText = this.messagesText.substring(i + 4)
    } else {
      this.count++
    }
    messageChannel.sendEvent();
  }

  clear() {
    this.messagesText = ""
    this.count = 0
    messageChannel.sendEvent();
  }

}

function shouldIgnore(msg: string) {
  return msg == '' ||
      msg.startsWith('ok') ||
      msg.startsWith('[GC') ||
      msg.startsWith("[G54:") ||
      msg.startsWith("[TOOL") ||
      msg.startsWith("websocket auto report interval set to")
}

export let messages = new Messages()

startupChannel.register(_ => messages.info("Welcome to TouchNC!"))