import { Tag } from '@evenstar/rely'
import { useEffect, useState } from 'react'
import type { ITagData } from '@evenstar/rely'
import { map } from 'rxjs'

// type AttrKey<T extends ITagData> = keyof T['attrs']

export const useAttr = <Type extends ITagData, Key extends keyof Type['attrs']>(tag: Tag<Type>, attr: Key) => {
  const [state, setState] = useState<Type['attrs'][Key] | null>((tag?.rx.value.attrs as Type['attrs'])[attr] || null)

  useEffect(() => {
    if (tag) {
      const sub = tag.rx
        .pipe(map(data => (data.attrs as Type['attrs'])[attr]))
        .subscribe(setState)

      tag.addSubscription(sub)

      return () => tag.removeSubscription(sub)
    }

    setState(null)// In case if tag is undefined

    return
  }, [tag])

  return state
}