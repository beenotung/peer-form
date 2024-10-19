import { TimezoneDate } from 'timezone-date.ts'
import { DynamicContext, WsContext } from '../context'

export function updatedMessage(context: WsContext) {
  let now = new TimezoneDate()
  now.setTimezoneOffset(context.session.timezoneOffset!)
  let h = now.getHours().toString().padStart(2, '0')
  let m = now.getMinutes().toString().padStart(2, '0')
  let s = now.getSeconds().toString().padStart(2, '0')
  return `[${h}:${m}:${s}] updated`
}
