import { Tag } from '@evenstar/rely'
import { useEffect, useState } from 'react'
import type { ITagData } from '@evenstar/rely'
import { map } from 'rxjs'

export const useChildren = <Type extends ITagData>(tag?: Tag<Type>) => {
  const [state, setState] = useState<Type['children'] | ITagData['children']>(tag?.rx.value.children || [])

  useEffect(() => {
    if (tag) {
      const sub = tag.rx
        .pipe(map(data => data.children))
        .subscribe(setState)

      tag.addSubscription(sub)

      return () => tag.removeSubscription(sub)
    }

    setState([])// In case if tag is undefined

    return
  }, [tag])

  return state
}