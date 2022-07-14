import { clearRegistry, def } from '@/definer'
import { Document } from '@/document'
import { rxChange } from './index'
import type { Def } from '@/definer/types'
import type { ChangeEventUnpacked } from '@/utils/packer'

type Todo = Def<{title: string, completed: boolean}, never>
type Root = Document<Todo[]>

describe('rxChange', () => {
  it('change calls', () => {
    clearRegistry()

    const fn = jest.fn()
    const todoCreator = def<Todo>('Todo', () => {
      rxChange(fn)
    })

    const todo0 = todoCreator(null, {title: 'Hello', completed: false})
    const todo1 = todoCreator(null, {title: 'World', completed: false})

    const todoList: Root = new Document()
    todoList.addChild(todo0, todo1)

    todo0.setAttr('completed', true)

    expect(fn).toBeCalledTimes(1)
  })

  it('change data correct', () => {
    clearRegistry()

    const expectedSnapshots: string[] = []

    const fn = jest.fn((event: ChangeEventUnpacked<Todo>) => {
      expectedSnapshots.push(JSON.stringify(event.prev))
      expectedSnapshots.push(JSON.stringify(event.next))
    })

    const todoCreator = def<Todo>('Todo', () => {
      rxChange(fn)
    })

    const todo0 = todoCreator(null, {title: 'Hello', completed: false})
    const todo1 = todoCreator(null, {title: 'World', completed: false})

    const todoList: Root = new Document()
    todoList.addChild(todo0, todo1)

    const actualSnapshots = [JSON.stringify(todo0.rx.value)]
    todo0.setAttr('completed', true)
    actualSnapshots.push(JSON.stringify(todo0.rx.value))

    expect(actualSnapshots.join('')).toBe(expectedSnapshots.join(''))
  })

  it('outside component error', () => {
    expect(rxChange).toThrow()
  })
})