import type { ITag } from '@/tag/types'
import type { ITagContext } from './types'

export const TagContext : ITagContext = {
  current: null,
  get: function (): ITag | null {
    return this.current
  },
  set: function (Tag: ITag | null): void {
    this.current = Tag
  },
}