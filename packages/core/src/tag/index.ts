import { BehaviorSubject, Subject, map, distinctUntilChanged, Subscription, filter, pairwise } from 'rxjs'
import { v4 as uuid } from 'uuid'
import { EventTypes } from './types'
import type { ITag, ITagData, VDOM, MountObserver, MountEvent, ChangeEvent, TreeUpdateEvent, InitiatorFunction, HistoryConfig } from './types'
import type { Unpacked } from '@/utils/packer'



export class Tag<DataType extends ITagData> implements ITag {
  private readonly initiator: InitiatorFunction<this> | null = null

  private mounted = false
  private subscriptions: Subscription[] = []

  protected eventObserver: MountObserver<DataType> = new Subject()

  readonly data: BehaviorSubject<DataType>

  readonly id: string
  readonly name: string

  readonly parent: ITag | null = null
  readonly childKeys = new BehaviorSubject<string[]>([])

  readonly history: HistoryConfig = {
    enabled: true,
    __batch: false,
    // __batchedRecords: 0,
    __ignoreNextUpdate: false,
  }

  userData = {}

  constructor(props: Omit<VDOM, 'children'>, initiator?: InitiatorFunction<ITag>) {
    Object.defineProperties(this, {
      'initiator': {
        value: initiator || null,
        writable: false,
        configurable: false,
        enumerable: false,
      },
      'id': {
        value: props.id || uuid(),
        writable: false,
        configurable: false,
      },
      'name': {
        value: props.name,
        writable: false,
        configurable: false,
      },
    })

    this.data = new BehaviorSubject<DataType>({
      attrs: props.attrs,
      children: [] as DataType['children'],
    } as DataType)
  }

  protected __initialize() {
    // Executes on mount

    /** Update keys */
    const onKeysUpdate = this.data
      .pipe(map(({children}) => children), distinctUntilChanged())
      .subscribe(children => {
        this.childKeys.next(children.map(child => child.id))
      })

    /** On tree update event, pass up */
    const onTreeUpdate = this.eventObserver
      .pipe(filter(({type}) => type === EventTypes.treeUpdate))
      .subscribe((e: TreeUpdateEvent) => {
        if (!this.history.enabled || this.history.__batch) {
          if (e.tag !== this) {
            // If we batch, then ignore child event in the History processor
            e.tag.history.__ignoreNextUpdate = true
          }
          // else {
          //   this.history.__batchedRecords++
          // }
        }

        if (this.parent) {
          (this.parent as Tag<ITagData>).eventObserver.next(e)
        }
      })

    /** On change event */
    const onChange = this.data
      .pipe(pairwise())
      .subscribe((values: DataType[]) => {
        const event : ChangeEvent<DataType> = {
          type: EventTypes.change,
          prev: values[0],
          next: values[1],
        }

        // Emit change event
        this.eventObserver.next(event)

        // Emit treeUpdate event
        this.eventObserver.next({
          type: EventTypes.treeUpdate,
          tag: this,
          event,
        })
      })

    this.addSubscription(onKeysUpdate)
    this.addSubscription(onTreeUpdate)
    this.addSubscription(onChange)
  }

  get historyBatch() : boolean {
    return this.history.__batch
  }

  set historyBatch(value: boolean) {
    const isChanged = this.historyBatch !== value

    if (isChanged) {
      if (value) {
        const next = {
          attrs: this.attrs,
          children: this.children,
        } as DataType
    
        this.data.next(next)
      }

      this.history.__batch = value

      if (!value) {

        // Poor udate to fix history in case of Batch end
        const next = {
          attrs: this.attrs,
          children: this.children,
        } as DataType
    
        this.data.next(next)
      }
    }
  }

  get path(): string[] | null {
    if (!this.isMounted) {
      return null
    }

    if (!this.parent) {
      return []
    }

    return [
      ...(this.parent.path as []),
      this.id,
    ]
  }

  get isMounted() {
    return this.mounted
  }

  protected set isMounted(mounted: boolean) {
    if (mounted !== this.mounted) {
      for (const child of this.children) {
        child.isMounted = mounted
      }

      if (!mounted) {
        this.eventObserver.next({type: EventTypes.unmount})
        for (const sub of this.subscriptions) {
          sub.unsubscribe()
        }
        this.subscriptions.splice(0, this.subscriptions.length)
        this.userData = {}
      } else {
        this.__initialize()
        this.initiator && this.initiator(this)
        this.eventObserver.next({type: EventTypes.mount})
      }

      this.mounted = mounted
    }
  }

  get attrs() : DataType['attrs'] {
    return this.data.value.attrs
  }

  get children() : DataType['children'] {
    return this.data.value.children
  }

  get rx() {
    return this.data
  }

  get events() {
    return this.eventObserver
  }

  findByPath(path: string[]) : ITag | null {
    if (path.length === 0) {
      return this
    }

    const last = path[0] as string

    for (const child of this.children) {
      if (child.id === last) {
        return child.findByPath(path.slice(1))
      }
    }

    return null
  }

  findById(id: string, recursive = false) : ITag | null {
    let result

    for (const child of this.children) {
      if (child.id === id) {
        return child
      }

      if (recursive) {
        if (result = child.findById(id)) {
          return result
        }
      }
    }

    return null
  }

  findByName(name: string, recursive = false) : ITag | null {
    let result
    
    for (const child of this.children) {
      if (child.name === name) {
        return child
      }

      if (recursive) {
        if (result = child.findByName(name)) {
          return result
        }
      }
    }

    return null
  }

  find(fn: (child: ITag) => boolean, recursive = false) : ITag | null {
    let result
    
    for (const child of this.children) {
      if (fn(child)) {
        return child
      }

      if (recursive) {
        if (result = child.find(fn)) {
          return result
        }
      }
    }

    return null
  }

  getRoot() : ITag | null {
    if (!this.parent) {
      return null
    }

    return this.parent.getRoot()
  }

  get subscriptionsSize() {
    return this.subscriptions.length
  }

  addSubscription(sub: Subscription) {
    this.subscriptions.push(sub)
  }

  onUnmount(fn: (event: MountEvent) => void) : Subscription {
    return this.eventObserver.pipe(filter(({type}) => type === EventTypes.unmount)).subscribe(fn)
  }

  onChange(fn: (event: ChangeEvent<DataType>) => void) : Subscription {
    return this.eventObserver.pipe(filter(({type}) => type === EventTypes.change)).subscribe(fn)
  }

  onTreeUpdate(fn: (event: TreeUpdateEvent) => void) : Subscription {
    return this.eventObserver.pipe(filter(({type}) => type === EventTypes.treeUpdate)).subscribe(fn)
  }

  setAttr<Key extends keyof DataType['attrs']>(name: Key, value: DataType['attrs'][Key]) {
    const next = {
      attrs: {
        ...this.attrs,
        [name]: value,
      },
      children: this.children,
    } as DataType

    this.data.next(next)
  }

  setAttrs(attrs: DataType['attrs']) {
    const next = {
      attrs: {...attrs},
      children: this.children,
    } as DataType

    this.data.next(next)
  }

  addChild(...childList: DataType['children']) {
    const nextChildren = [...this.children]

    for (const child of childList) {
      if (child.parent && child.parent !== this) {
        child.parent.removeChild(child)
      }

      if (child.parent && child.parent === this) {
        continue
      }

      nextChildren.push(child)

      child.parent = this
      child.isMounted = this.isMounted
    }

    const next = {
      attrs: this.attrs,
      children: nextChildren,
    } as DataType

    this.data.next(next)
  }

  removeChild(child: Unpacked<DataType['children']> | DataType['children']) {
    const childArray = Array.isArray(child) ? child : [child]
    const validChild = childArray
      .filter(target => target.parent && (target.parent === this))
      .map(target => {
        target.parent = null
        target.isMounted = false

        return target.id
      })

    if (!validChild.length) {
      return false
    }
    
    const nextChild = this.children.filter(target => validChild.indexOf(target.id) === -1)

    const next = {
      attrs: this.attrs,
      children: nextChild,
    } as DataType

    this.data.next(next)

    return true
  }

  filterChild(fn: (child: Unpacked<DataType['children']>) => boolean) {
    const childrenToRemove: ITag[] = []

    const nextChild = this.children.filter(target => {
      if (fn(target as Unpacked<DataType['children']>)) {
        return true
      }

      childrenToRemove.push(target)
      return false
    })

    const next = {
      attrs: this.attrs,
      children: nextChild,
    } as DataType

    for (const child of childrenToRemove) {
      child.parent = null
      child.isMounted = false
    }

    this.data.next(next)
  }

  remove() : boolean {
    if (this.parent) {
      return this.parent.removeChild(this)
    }

    return false
  }

  traverse(fn: (Tag: ITag) => void) : void {
    for (const child of this.children) {
      fn(child)
      child.traverse(fn)
    }
  }

  get vdom() : VDOM {
    return {
      name: this.name,
      id: this.id,
      attrs: this.attrs,
      children: this.children.map(child => child.vdom),
    }
  }

  toJSON() {
    return this.vdom
  }
}

