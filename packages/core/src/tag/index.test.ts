import { Document } from '@/document'
import { distinctUntilChanged, filter, map } from 'rxjs'
import { Tag } from './index'
import { NoAttrs } from './types'

type TodoType = Tag<{attrs: {title: string, completed: boolean}, children: never }>
type TodoListType = Tag<{attrs: NoAttrs, children: TodoType[]}>
type RootType = Document<[TodoListType]>

describe('Tag', () => {

  it('isMount returns false for new component', () => {
    const empty: TodoListType = new Tag({name: '', id: '', attrs: {} })

    expect(empty.isMounted).toBe(false)
  })

  it('isMount returns true for the component that is inside of the Document', () => {
    const empty: TodoListType = new Tag({name: '', id: '', attrs: {} })
    const root: RootType = new Document()

    root.addChild(empty)

    expect(empty.isMounted).toBe(true)
  })

  it('isMount returns false for the component that has been removed from the Document', () => {
    const empty: TodoListType = new Tag({name: '', id: '', attrs: {} })
    const root: RootType = new Document()

    root.addChild(empty)
    root.removeChild(empty)

    expect(empty.isMounted).toBe(false)
  })

  it('isMount is true for Tag that is deeply nested inside of the Document', () => {
    const todo: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todoList: TodoListType = new Tag({name: '', id: '', attrs: {} })
    const root: RootType = new Document()

    todoList.addChild(todo)
    root.addChild(todoList)

    expect(todo.isMounted).toBe(true)
  })

  it('todo attr is set', () => {
    const todo: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    todo.setAttr('completed', true)

    expect(todo.attrs.completed).toBe(true)
  })
  
  it('todo attrs are set', () => {
    const todo: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })

    const attrsToSet = {
      title: 'Test',
      completed: true,
    }

    todo.setAttrs(attrsToSet)

    const actual = JSON.stringify(todo.attrs)
    const expected = JSON.stringify(attrsToSet)

    expect(actual).toBe(expected)
  })

  it('todo parent is equal to the todolist', () => {
    const todo: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todoList: TodoListType = new Tag({name: '', id: '', attrs: {} })

    todoList.addChild(todo)

    expect(todo.parent).toBe(todoList)
    expect(todoList.children.length).toBe(1)
  })

  it('todo parent is null after removing', () => {
    const todo: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todoList: TodoListType = new Tag({name: '', id: '', attrs: {} })

    todoList.addChild(todo)
    todoList.removeChild(todo)

    expect(todo.parent).toBe(null)
    expect(todoList.children.length).toBe(0)
  })

  it('todo parent is null after self removing', () => {
    const todo: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todoList: TodoListType = new Tag({name: '', id: '', attrs: {} })

    todoList.addChild(todo)
    const removeResult = todo.remove()

    expect(removeResult).toBe(true)
    expect(todoList.children.length).toBe(0)
  })

  it('todo self removing without parent', () => {
    const todo: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    
    expect(todo.remove()).toBe(false)
  })

  it('todolist remove array of tags', () => {
    const todo0: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todo1: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todoList: TodoListType = new Tag({name: '', id: '', attrs: {} })

    todoList.addChild(todo0, todo1)
    todoList.removeChild([todo0, todo1])

    expect(todoList.children.length).toBe(0)
  })

  it('todo parent is null after filtering', () => {
    const todo: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todoList: TodoListType = new Tag({name: '', id: '', attrs: {} })

    todoList.addChild(todo)
    todoList.filterChild(child => child !== todo)

    expect(todo.parent).toBe(null)
    expect(todoList.children.length).toBe(0)
  })

  it('todo parent is todoList after filtering another todo', () => {
    const todo0: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todo1: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todoList: TodoListType = new Tag({name: '', id: '', attrs: {} })

    todoList.addChild(todo0, todo1)
    todoList.filterChild(child => child !== todo0)

    const parentExists = todo1.parent !== null
    expect(parentExists).toBe(true)

    const parent = todo1.parent as TodoListType
    
    expect(todo0.parent).toBe(null)
    expect(parent.id).toBe(todoList.id)
    expect(todoList.children.length).toBe(1)
  })

  it('root traverse', () => {
    const todo0: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todo1: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todoList0: TodoListType = new Tag({name: '', id: '', attrs: {} })
    const todoList1: TodoListType = new Tag({name: '', id: '', attrs: {} })

    const root: Document<TodoListType[]> = new Document()

    todoList0.addChild(todo0, todo1)
    root.addChild(todoList0, todoList1)
    
    const expected = [todoList0.id, todo0.id, todo1.id, todoList1.id]
    const actual = [] as string[]

    root.traverse(node => actual.push(node.id))

    expect(JSON.stringify(expected))
      .toBe(JSON.stringify(actual))
  })

  it('move child', () => {
    const todo: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todoList0: TodoListType = new Tag({name: '', id: '', attrs: {} })
    const todoList1: TodoListType = new Tag({name: '', id: '', attrs: {} })

    let parent: TodoListType

    todoList0.addChild(todo)

    parent = todo.parent as TodoListType
    expect(parent.id).toBe(todoList0.id)
    expect(todoList0.children.length).toBe(1)

    todoList1.addChild(todo)
    parent = todo.parent as TodoListType

    expect(parent.id).toBe(todoList1.id)
    expect(todoList1.children.length).toBe(1)
    expect(todoList0.children.length).toBe(0)
  })

  it('add the same child', () => {
    const todo: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todoList: TodoListType = new Tag({name: '', id: '', attrs: {} })

    let parent: TodoListType

    todoList.addChild(todo)

    parent = todo.parent as TodoListType
    expect(parent.id).toBe(todoList.id)
    expect(todoList.children.length).toBe(1)

    todoList.addChild(todo)
    parent = todo.parent as TodoListType

    expect(parent.id).toBe(todoList.id)
    expect(todoList.children.length).toBe(1)
  })

  it('remove child outside', () => {
    const todo: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todoList0: TodoListType = new Tag({name: '', id: '', attrs: {} })
    const todoList1: TodoListType = new Tag({name: '', id: '', attrs: {} })

    todoList0.addChild(todo)

    todoList1.removeChild(todo)
    const parent = todo.parent as TodoListType

    expect(parent.id).toBe(todoList0.id)
    expect(todoList0.children.length).toBe(1)
  })

  it('path is null for unmounted tag', () => {
    const todo: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })

    expect(todo.path).toBe(null)
  })

  it('todo path is valid', () => {
    const todo: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todoList: TodoListType = new Tag({name: '', id: '', attrs: {} })
    const root: RootType = new Document()

    todoList.addChild(todo)
    root.addChild(todoList)

    const expected = JSON.stringify([
      todoList.id,
      todo.id,
    ])

    const actual = JSON.stringify(todo.path)

    expect(actual).toBe(expected)
  })

  it('findByPath for empty array returns Document', () => {
    const todoList: TodoListType = new Tag({name: '', id: '', attrs: {} })
    const root: RootType = new Document()

    root.addChild(todoList)

    const tag = root.findByPath([]) as RootType

    expect(tag.id).toBe(root.id)
  })

  it('findByPath for Tag path returns todo tag', () => {
    const todo: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todoList: TodoListType = new Tag({name: '', id: '', attrs: {} })
    const root: RootType = new Document()

    todoList.addChild(todo)
    root.addChild(todoList)

    const tag = root.findByPath(todo.path as string[]) as TodoType

    expect(tag.id).toBe(todo.id)
  })

  it('findByPath for unmounted tag path returns null', () => {
    const todo: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todoList: TodoListType = new Tag({name: '', id: '', attrs: {} })
    const root: RootType = new Document()

    todoList.addChild(todo)
    root.addChild(todoList)

    const todoPath = todo.path as string[]
    root.removeChild(todoList)

    const TagDoesNotExists = root.findByPath(todoPath) === null

    expect(TagDoesNotExists).toBe(true)
  })

  it('toJSON equals to the VDOM', () => {
    const todo0: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todo1: TodoType = new Tag({name: '', id: '', attrs: {title: 'World', completed: false} })
    const todoList: TodoListType = new Tag({name: '', id: '', attrs: {} })
    const root: RootType = new Document()

    todoList.addChild(todo0, todo1)
    root.addChild(todoList)

    const expected = JSON.stringify(root.vdom)
    const actual = JSON.stringify(root)

    expect(actual).toBe(expected)
  })

  it('unmount called 1 time', () => {
    const todo: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todoList: TodoListType = new Tag({name: '', id: '', attrs: {} })
    const root: RootType = new Document()

    const unmountFn = jest.fn()
    const sub = todo.onUnmount(unmountFn)

    todoList.addChild(todo)
    root.addChild(todoList)
    root.removeChild(todoList)
    sub.unsubscribe()

    expect(unmountFn).toBeCalledTimes(1)
  })

  it('subscribe on unmount', () => {
    const todo: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todoList: TodoListType = new Tag({name: '', id: '', attrs: {} })
    const root: RootType = new Document()

    const unmountFn = jest.fn()
    todo.addSubscription(todo.onUnmount(unmountFn))

    expect(todo.subscriptionsSize).toBe(1)

    todoList.addChild(todo)
    root.addChild(todoList)
    root.removeChild(todoList)

    expect(todo.subscriptionsSize).toBe(0)
    expect(unmountFn).toBeCalledTimes(1)
  })

  it('onchange called 1 time', () => {
    const todo: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todoList: TodoListType = new Tag({name: '', id: '', attrs: {} })
    const root: RootType = new Document()

    todoList.addChild(todo)

    const changeFn = jest.fn()
    todo.addSubscription(todo.onChange(changeFn))

    todo.setAttr('title', 'Test0')
    root.addChild(todoList)// Mount node

    todo.setAttr('title', 'Test1')// Change

    root.removeChild(todoList)
    todo.setAttr('title', 'Test2')// unmounted, no changes
    
    expect(changeFn).toBeCalledTimes(1)
  })

  it('onTreeUpdate called 2 times on a document', () => {
    const todo: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todoList: TodoListType = new Tag({name: '', id: '', attrs: {} })
    const root: RootType = new Document()

    const changeFn = jest.fn()
    root.addSubscription(root.onTreeUpdate(changeFn))

    todo.setAttr('title', 'Test0')
    todoList.addChild(todo)
    root.addChild(todoList)// Mount nodes, emit onTreeUpdate
    root.addChild(todoList)// Unmount nodes, emit onTreeUpdate
    
    expect(changeFn).toBeCalledTimes(2)
  })

  it('onTreeUpdate called 3 times on a tag', () => {
    const todo: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todoList: TodoListType = new Tag({name: '', id: '', attrs: {} })
    const root: RootType = new Document()

    const changeFn = jest.fn()
    todoList.addSubscription(todoList.onTreeUpdate(changeFn))

    todoList.addChild(todo)
    root.addChild(todoList)// Mount nodes, no treeUpdate in todoList

    todoList.removeChild(todo)// Update todoList children, emit onTreeUpdate
    todoList.addChild(todo)// Update todoList children, emit onTreeUpdate
    todo.setAttr('title', 'Test1')// Update todo, emit onTreeUpdate
    
    expect(changeFn).toBeCalledTimes(3)
  })

  it('rx attr change called 2 times', () => {
    const todo: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todoList: TodoListType = new Tag({name: '', id: '', attrs: {} })
    const root: RootType = new Document()

    todoList.addChild(todo)

    const changeFn = jest.fn()
    

    todo.setAttr('title', 'Test0')
    root.addChild(todoList)// mount

    // 1st call
    todo.addSubscription(
      todo.rx.pipe(filter(() => todo.isMounted), map(({attrs}) => attrs.title), distinctUntilChanged()).subscribe(changeFn),
    )

    todo.setAttr('title', 'Test1')// 2nd change
    todo.setAttr('title', 'Test1')// doesn't changed

    root.removeChild(todoList)
    todo.setAttr('title', 'Test2')// unmounted, no changes
    
    expect(changeFn).toBeCalledTimes(2)
  })

  it('initiator called 2 time', () => {
    const todoInititator = jest.fn()
    const todo: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} }, todoInititator)
    const todoList: TodoListType = new Tag({name: '', id: '', attrs: {} })
    const root: RootType = new Document()

    todoList.addChild(todo)

    todo.setAttr('title', 'Test0')
    root.addChild(todoList)// 1st call on mount

    todo.setAttr('title', 'Test1')// no additional calls

    root.removeChild(todoList)// no additional calls, unmount
    todo.setAttr('title', 'Test2')// no additional calls

    root.addChild(todoList)// 2nd call on mount
    
    expect(todoInititator).toBeCalledTimes(2)
  })


  it('find by id', () => {
    const todo0: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todo1: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todoList0: TodoListType = new Tag({name: '', id: '', attrs: {} })
    const todoList1: TodoListType = new Tag({name: '', id: '', attrs: {} })

    const root: Document<TodoListType[]> = new Document()

    todoList0.addChild(todo0, todo1)
    root.addChild(todoList0, todoList1)

    const node = root.findById(todoList0.id)
    
    expect(node?.id).toBe(todoList0.id)
  })

  it('find by id (recursive)', () => {
    const todo0: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todo1: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todoList0: TodoListType = new Tag({name: '', id: '', attrs: {} })
    const todoList1: TodoListType = new Tag({name: '', id: '', attrs: {} })

    const root: Document<TodoListType[]> = new Document()

    todoList0.addChild(todo0, todo1)
    root.addChild(todoList0, todoList1)

    const node = root.findById(todo0.id, true)
    
    expect(node?.id).toBe(todo0.id)
  })

  it('find by id (not recursive)', () => {
    const todo0: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todo1: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todoList0: TodoListType = new Tag({name: '', id: '', attrs: {} })
    const todoList1: TodoListType = new Tag({name: '', id: '', attrs: {} })

    const root: Document<TodoListType[]> = new Document()

    todoList0.addChild(todo0, todo1)
    root.addChild(todoList0, todoList1)

    const node = root.findById(todo0.id)
    
    expect(node).toBeNull()
  })

  it('find by name', () => {
    const todo0: TodoType = new Tag({name: 'Todo', id: '', attrs: {title: 'Hello', completed: false} })
    const todo1: TodoType = new Tag({name: 'Todo', id: '', attrs: {title: 'Hello', completed: false} })
    const todoList0: TodoListType = new Tag({name: 'TodoList', id: '', attrs: {} })
    const todoList1: TodoListType = new Tag({name: 'TodoList', id: '', attrs: {} })

    const root: Document<TodoListType[]> = new Document()

    todoList0.addChild(todo0, todo1)
    root.addChild(todoList0, todoList1)

    const node = root.findByName(todoList0.name)
    
    expect(node?.name).toBe(todoList0.name)
  })

  it('find by name (recursive)', () => {
    const todo0: TodoType = new Tag({name: 'Todo', id: '', attrs: {title: 'Hello', completed: false} })
    const todo1: TodoType = new Tag({name: 'Todo', id: '', attrs: {title: 'Hello', completed: false} })
    const todoList0: TodoListType = new Tag({name: 'TodoList', id: '', attrs: {} })
    const todoList1: TodoListType = new Tag({name: 'TodoList', id: '', attrs: {} })

    const root: Document<TodoListType[]> = new Document()

    todoList0.addChild(todo0, todo1)
    root.addChild(todoList0, todoList1)

    const node = root.findByName(todo0.name, true)
    
    expect(node?.name).toBe(todo0.name)
  })

  it('find by name (not recursive)', () => {
    const todo0: TodoType = new Tag({name: 'Todo', id: '', attrs: {title: 'Hello', completed: false} })
    const todo1: TodoType = new Tag({name: 'Todo', id: '', attrs: {title: 'Hello', completed: false} })
    const todoList0: TodoListType = new Tag({name: 'TodoList', id: '', attrs: {} })
    const todoList1: TodoListType = new Tag({name: 'TodoList', id: '', attrs: {} })

    const root: Document<TodoListType[]> = new Document()

    todoList0.addChild(todo0, todo1)
    root.addChild(todoList0, todoList1)

    const node = root.findByName(todo0.name)
    
    expect(node).toBeNull()
  })

  it('find', () => {
    const todo0: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todo1: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todoList0: TodoListType = new Tag({name: '', id: '', attrs: {} })
    const todoList1: TodoListType = new Tag({name: '', id: '', attrs: {} })

    const root: Document<TodoListType[]> = new Document()

    todoList0.addChild(todo0, todo1)
    root.addChild(todoList0, todoList1)

    const node = root.find(node => node === todoList0)
    
    expect(node?.id).toBe(todoList0.id)
  })

  it('find (recursive)', () => {
    const todo0: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todo1: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todoList0: TodoListType = new Tag({name: '', id: '', attrs: {} })
    const todoList1: TodoListType = new Tag({name: '', id: '', attrs: {} })

    const root: Document<TodoListType[]> = new Document()

    todoList0.addChild(todo0, todo1)
    root.addChild(todoList0, todoList1)

    const node = root.find(node => node === todo0, true)
    
    expect(node?.id).toBe(todo0.id)
  })

  it('find (not recursive)', () => {
    const todo0: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todo1: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todoList0: TodoListType = new Tag({name: '', id: '', attrs: {} })
    const todoList1: TodoListType = new Tag({name: '', id: '', attrs: {} })

    const root: Document<TodoListType[]> = new Document()

    todoList0.addChild(todo0, todo1)
    root.addChild(todoList0, todoList1)

    const node = root.find(node => node === todo0)
    
    expect(node).toBeNull()
  })

  it('getRoot returns null for unmounted', () => {
    const todo0: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todo1: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todoList: TodoListType = new Tag({name: '', id: '', attrs: {} })

    todoList.addChild(todo0, todo1)

    const node = todo0.getRoot()
    
    expect(node).toBeNull()
  })

  it('getRoot returns root document for mounted', () => {
    const todo0: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todo1: TodoType = new Tag({name: '', id: '', attrs: {title: 'Hello', completed: false} })
    const todoList: TodoListType = new Tag({name: '', id: '', attrs: {} })

    const root: Document<TodoListType[]> = new Document()

    todoList.addChild(todo0, todo1)
    root.addChild(todoList)

    const node = todo0.getRoot()
    
    expect(node === root).toBe(true)
  })
})