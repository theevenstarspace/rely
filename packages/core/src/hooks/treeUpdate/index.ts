import { TagContext } from '@/context'
import { Tag } from '@/tag'
import { EventTypes } from '@/tag/types'
import type { TreeUpdateEvent, ITagData } from '@/tag/types'


export const rxTreeUpdate = (callback: (event: TreeUpdateEvent) => void) : void => {
  const component = TagContext.get() as Tag<ITagData>

  if (!component) {
    throw new Error('rxTreeUpdate hook is out of the component')
  }

  const sub = component.events.subscribe((event) => {
    if (event.type === EventTypes.treeUpdate) {
      // Mount
      callback(event)
    }
  })

  component.addSubscription(sub)
}