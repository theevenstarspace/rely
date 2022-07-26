import { Tag } from '@evenstar/rely'
import { useEffect, useState } from 'react'
import type { ITagData } from '@evenstar/rely'
import { map } from 'rxjs'

type Empty = Record<string, never>
export const useAttrs = <Type extends ITagData>(tag?: Tag<Type>) => {
  const [state, setState] = useState<Type['attrs'] | Empty>(tag?.rx.value.attrs || {})

  useEffect(() => {
    if (tag) {
      const sub = tag.rx
        .pipe(map(data => data.attrs))
        .subscribe(setState)

      tag.addSubscription(sub)

      return () => tag.removeSubscription(sub)
    }

    setState({})// In case if tag is undefined

    return
  }, [tag])

  return state
}