import { Tag } from '@rely/core'
import { useEffect, useState } from 'react'
import { distinctUntilChanged } from 'rxjs'
import type { ITagData } from '@rely/core'

const distinctFn = <Type extends ITagData>(prev: Type, curr: Type) : boolean => {
  return (
    prev.attrs === curr.attrs &&
    prev.children === curr.children
  )
}

const emptyTag = {attrs: {}, children: []}

export const useTag = <Type extends ITagData>(tag?: Tag<Type>) => {
  const [state, setState] = useState<Type | ITagData>(tag?.rx.value || {...emptyTag})

  useEffect(() => {
    if (tag) {
      const sub = tag.rx
        .pipe(distinctUntilChanged(distinctFn))
        .subscribe(setState)

      tag.addSubscription(sub)

      return () => tag.removeSubscription(sub)
    }

    setState({...emptyTag})// In case if tag is undefined

    return
  }, [tag])

  return state
}