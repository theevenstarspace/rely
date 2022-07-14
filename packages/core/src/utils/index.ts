import { ITagData, VDOM } from '@/tag/types'
import { Tag } from '@/tag'
import { create } from '@/definer'

type Mutable<Immutable> = {
  -readonly [K in keyof Immutable]: Immutable[K] 
}

export const fromVDOM = (Tag: Tag<ITagData>, vdom: VDOM, ignoreHistory = false) : Tag<ITagData> | null => {
  if (Tag.name !== vdom.name) {
    return null
  }

  Tag.history.__ignoreNextUpdate = ignoreHistory

  const nextChildren = []

  const childrenToInsert: ITagData['children'] = []
  const indicesToSave: number[] = []

  const keys: string[] = Tag.childKeys.value

  // Loop to search for new/old Tags
  for (const child of vdom.children) {
    const originIndex = keys.indexOf(child.id)
    if (originIndex !== -1) {
      /** Always ignore history for child udates */
      const current = fromVDOM(Tag.children[originIndex] as Tag<ITagData>, child, true)
      // Save indices of old instances that should be saved/updated
      indicesToSave.push(originIndex)
      nextChildren.push(current)
    } else {
      // Save Tags that will be inserted for the first time
      const nextChild = create(child)

      if (nextChild) {
        /** Always ignore history for child udates */
        const current = fromVDOM(nextChild as Tag<ITagData>, child, true) as Mutable<Tag<ITagData>>

        childrenToInsert.push(current)
        nextChildren.push(current)
        current.parent = Tag
      }
    }
  }


  // Unmount removed
  for (let childIndex = 0; childIndex < Tag.children.length; childIndex++) {
    if (indicesToSave.indexOf(childIndex) !== -1) {
      continue
    }

    const child = Tag.children[childIndex]

    child.isMounted = false
    child.parent = null
  }

  const next = {
    attrs: vdom.attrs,
    children: nextChildren,
  } as ITagData

  Tag.data.next(next)

  // Mount Tags that were inserted for the first time
  for (const child of childrenToInsert) {
    child.isMounted = Tag.isMounted
  }

  return Tag
}