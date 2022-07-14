import { clearRegistry, def } from '@/definer'
import { Document } from '@/document'
import { rxTreeUpdate } from './index'
import type { Def } from '@/definer/types'
import type { NoAttrs, TreeUpdateEvent } from '@/tag/types'

type Todo = Def<{title: string, completed: boolean}, never>
type TodoList = Def<NoAttrs, Todo[]>
type Root = Document<[TodoList]>

describe('rxTreeUpdate', () => {
  it('treeUpdate calls', () => {
    clearRegistry()

    const fn = jest.fn()

    const todoListCreator = def<TodoList>('TodoList', () => {
      rxTreeUpdate(fn)
    })

    const todoCreator = def<Todo>('Todo')
    const todo0 = todoCreator(null, {title: 'Hello', completed: false})
    const todo1 = todoCreator(null, {title: 'World', completed: false})

    const todoList = todoListCreator()
    const root: Root = new Document()

    todoList.addChild(todo0, todo1)
    root.addChild(todoList)// Mount

    todo0.setAttr('completed', true)// 1st update

    expect(fn).toBeCalledTimes(1)
  })

  it('treeUpdate data correct', () => {
    clearRegistry()

    const expectedSnapshots: string[] = []

    const fn = jest.fn((updateEvent: TreeUpdateEvent) => {
      expectedSnapshots.push(JSON.stringify(updateEvent.event.prev))
      expectedSnapshots.push(JSON.stringify(updateEvent.event.next))
    })

    const todoListCreator = def<TodoList>('TodoList', () => {
      rxTreeUpdate(fn)
    })

    const todoCreator = def<Todo>('Todo')
    const todo0 = todoCreator(null, {title: 'Hello', completed: false})
    const todo1 = todoCreator(null, {title: 'World', completed: false})

    const todoList = todoListCreator()
    const root: Root = new Document()

    todoList.addChild(todo0, todo1)
    root.addChild(todoList)// Mount

    const actualSnapshots = [JSON.stringify(todo0.rx.value)]
    todo0.setAttr('completed', true)// Tree update
    actualSnapshots.push(JSON.stringify(todo0.rx.value))

    expect(actualSnapshots.join('')).toBe(expectedSnapshots.join(''))
  })

  it('outside component error', () => {
    expect(rxTreeUpdate).toThrow()
  })
})