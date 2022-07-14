import { TagContext } from '@/context'
import { Tag } from '@/tag'
import { EventTypes } from '@/tag/types'
import type { ITagData } from '@/tag/types'

type cleanUp = () => void
interface CleanupRef {
  current: cleanUp | null
}

export const rxMount = (callback: () => cleanUp) : void => {
  const component = TagContext.get() as Tag<ITagData>

  if (!component) {
    throw new Error('rxMount hook is out of the component')
  }

  const fnRef: CleanupRef = {
    current: null,
  }

  const sub = component.events.subscribe((event) => {
    if (event.type === EventTypes.mount) {
      // Mount
      fnRef.current = callback()
    } else if (event.type === EventTypes.unmount && fnRef.current) {
      // Unmount
      fnRef.current()
      fnRef.current = null
    }
  })

  component.addSubscription(sub)
}