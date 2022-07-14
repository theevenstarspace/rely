import { TagContext } from '@/context'
import { Tag } from '@/tag'
import { EventTypes } from '@/tag/types'
import type { ChangeEvent, ITagData } from '@/tag/types'


export const rxChange = (callback: (event: ChangeEvent<ITagData>) => void) : void => {
  const component = TagContext.get() as Tag<ITagData>

  if (!component) {
    throw new Error('rxMount hook is out of the component')
  }

  const sub = component.events.subscribe((event) => {
    if (event.type === EventTypes.change) {
      // Mount
      callback(event)
    }
  })

  component.addSubscription(sub)
}