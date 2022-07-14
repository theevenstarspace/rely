import type { ChangeEvent, ITag, ITagData } from '@/tag/types'
import { Tag } from '@/tag'

export type Packed<Type> = Type extends ITag[] ? Type : Type[]
export type Unpacked<T> = T extends (infer U)[] ? U : T
export type ChangeEventUnpacked<T> = T extends Tag<infer U> ? ChangeEvent<U> : ChangeEvent<ITagData>
