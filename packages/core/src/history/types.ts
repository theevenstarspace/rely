import { Tag } from '@/tag'
import type { RootDataType } from '@/document/types'
import type { ITagData, TreeUpdateEvent } from '@/tag/types'

export type IHistory<DataType extends ITagData['children']> = {
  readonly owner: Tag<RootDataType<DataType>>
  size: number

  undo() : boolean
  redo() : boolean

  clear() : void
  jump(count: number): void

  push(event: TreeUpdateEvent) : void
}