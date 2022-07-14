import { RootDataType } from '@/document/types'
import { Tag } from '@/tag'
import { fromVDOM } from '@/utils'
import type { ITagData, TreeUpdateEvent, VDOM } from '@/tag/types'
import type { IHistory } from './types'

type HistorySlice = {
  path: string[]
  vdom: VDOM
}

export class History<ChildType extends ITagData['children']> implements IHistory<ChildType> {
  private stack: HistorySlice[] = []
  private pointer = 0

  size = 256

  // private batchedTags: Map<string, HistorySlice> = new Map()

  readonly owner: Tag<RootDataType<ChildType>>

  constructor(root: Tag<RootDataType<ChildType>>) {
    this.owner = root
    this.stack.push({
      path: root.path as string[],
      vdom: root.vdom,
    })
  }

  push(event: TreeUpdateEvent) : void {
    if (!event.tag.history.enabled || event.tag.historyBatch) {
      return
    }

    if (event.tag.history.__ignoreNextUpdate) {
      event.tag.history.__ignoreNextUpdate = false
      return
    }

    // Process event
    this.stack.splice(this.pointer + 1, this.stack.length - this.pointer)// Remove future
    this.stack.push({
      path: event.tag.path as string[],
      vdom: event.tag.vdom,
    })// Push new state

    if (this.stack.length > this.size) {
      // Remove out of range slices
      this.stack = this.stack.slice(this.stack.length - this.size)
    }

    this.pointer = this.stack.length - 1
  }

  undo(): boolean {
    if (this.pointer <= 0) {
      return false
    }

    const step = this.stack[--this.pointer]// Get prev
    const tag = this.owner.findByPath(step.path)

    if (tag) {
      fromVDOM(tag as Tag<ITagData>, step.vdom, true)// Apply
    }

    return true
  }

  redo(): boolean {
    if (this.pointer >= this.stack.length - 1) {
      return false
    }
    
    const step = this.stack[++this.pointer]// Get next
    const tag = this.owner.findByPath(step.path)

    if (tag) {
      fromVDOM(tag as Tag<ITagData>, step.vdom, true)// Apply
    }

    return true
  }
  
  clear() : void {
    this.stack.splice(0, this.stack.length)
    this.pointer = 0
  }

  jump(count: number): void {
    const absCount = count < 0 ? (-count) : count
    const fn = count < 0 ? this.undo.bind(this) : this.redo.bind(this)

    for (let i = 0; i <= absCount; i++) {
      fn()
    }
  }
}