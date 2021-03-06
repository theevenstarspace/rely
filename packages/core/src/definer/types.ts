import { Tag } from '@/tag'
import type { ITagData, ITag } from '@/tag/types'
import type { Packed } from '@/utils/packer'

export type TagCreatorFunction<Type extends ITagData> = (
  id?: string | null,
  attributes?: Type['attrs'],
  children?: Type['children']
) => Tag<Type>

export type Def<
  AttrType extends ITagData['attrs'],
  ChildrenType extends (ITagData['children'] | ITag)
> = Tag<{
  attrs: AttrType
  children: Packed<ChildrenType>
}>