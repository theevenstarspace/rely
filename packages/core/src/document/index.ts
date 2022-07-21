import { filter } from 'rxjs'
import { Tag } from '@/tag'
import { History } from '@/history'
import { EventTypes } from '@/tag/types'
import type { ITagData, TreeUpdateEvent, ITag } from '@/tag/types'
import type { IHistory } from '@/history/types'
import type { IDocument, RootDataType } from './types'


export class Document<ChildType extends ITagData['children']> extends Tag<RootDataType<ChildType>> implements IDocument<ChildType> {
  historyManager: IHistory<ChildType>

  constructor(name?: string, id?: string) {
    super({name: name || 'Document', id: id || 'root', attrs: {}})
    this.__initialize()

    this.historyManager = new History(this)

    /** One time bind, since document is always mounted */
    this.eventObserver
      .pipe(filter(({type}) => type === EventTypes.treeUpdate))
      .subscribe((e: TreeUpdateEvent) => this.historyManager.push(e))
  }

  get isMounted(): boolean {
    return true
  }

  getRoot() : ITag {
    return this
  }
}