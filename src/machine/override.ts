import {Content, panel, spacer} from '../ui/ui';
import {sendCommand} from '../http/http';
import {css, cssClass} from '../ui/commonStyles';
import {btnIcon, button, getButtonValueAsString} from '../ui/button';
import {Icon} from '../ui/icons';

const override = (label: Content, value: string, help: string) => {
  return button('', label, help, btnOverride, value)
}

export function createOverridesPanel() {
  return panel('ovr-controls', overrideRowClass, [
    panel('ovr-feed', overrideWidgetClass, [
      override(btnIcon(Icon.down), '\x92', 'Decrease feedrate by 10%'),
      button('feed-ovr', 'Feed / 100%', 'Cancel feed override', btnFeedOvrCancel),
      override(btnIcon(Icon.up), '\x91', 'Increase feedrate by 10%'),
    ]),
    spacer(5),
    panel('ovr-spindle', overrideWidgetClass, [
      override(btnIcon(Icon.down), '\x9b', 'Decrease spindle speed by 10%'),
      button('spindle-ovr', 'RPM / 100%', 'Cancel spindle override', btnSpindleOvrCancel),
      override(btnIcon(Icon.up), '\x9a', 'Increase spindle speed by 10%')
    ])
  ])
}

const btnOverride = (event: Event) => sendCommand(getButtonValueAsString(event));
const btnFeedOvrCancel = (event: Event) => sendCommand('\x90');
const btnSpindleOvrCancel = (event: Event) => sendCommand('\x99');

const overrideRowClass = cssClass("overrideRow", css`
  display: grid;
  grid-template-columns: 6fr 1fr 6fr;
  gap: 10px;
  width: 100%;
  max-width: 100%;
`)

const overrideWidgetClass = cssClass("overrideWidget", css`
  display: grid;
  grid-template-columns: 1fr 10fr 1fr;
  width: 100%;
  max-width: 100%;
`)