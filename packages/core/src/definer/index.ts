import { TagContext } from '@/context'
import { Tag } from '@/tag'
import type { ITagData, VDOM } from '@/tag/types'
import type { TagCreatorFunction } from './types'

const Registry: {[key: string]: TagCreatorFunction<ITagData>} = {}

export const clearRegistry = () => {
  for (const key in Registry) {
    delete Registry[key]
  }
}

export const create = (vdom: VDOM) : Tag<ITagData> | null => {
  const children = []
  for (const child of vdom.children) {
    const inst = create(child)
    if (inst) {
      children.push(inst)
    }
  }

  if (vdom.name in Registry) {
    return Registry[vdom.name](vdom.id, vdom.attrs, children)
  }

  return null
}

export const def = <Type extends ITagData>(
  name: string,
  initiator?: (Tag: Tag<Type>) => void,
) : TagCreatorFunction<Type> => {
  if (name in Registry) {
    throw new Error(`Name ${name} already registered. Name should be a uniq string`)
  }

  const creator = (id: string | null = null, attributes: Type['attrs'] = {}, children: Type['children'] = []) : Tag<Type> => {
    const targetInitiator = initiator && ((Tag: Tag<Type>) => {
      TagContext.set(Tag)
      initiator(Tag)
      TagContext.set(null)
    })

    const instance = new Tag<Type>(
      {
        id: id || '',
        name,
        attrs: attributes,
      },
      targetInitiator,
    )

    if (children.length) {
      instance.addChild(...children)
    }

    return instance
  }

  Registry[name] = creator

  return creator
}
