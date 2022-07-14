import { clearRegistry, def } from '@/definer'
import { Document } from '@/document'
import { rxMount } from './index'
import type { Def } from '@/definer/types'

type Todo = Def<{title: string, completed: boolean}, never>
type Root = Document<Todo[]>

describe('rxMount', () => {
  it('mount calls', () => {
    clearRegistry()

    const fn = jest.fn()
    const todoCreator = def<Todo>('Todo', () => {
      rxMount(fn)
    })

    const todo0 = todoCreator(null, {title: 'Hello', completed: false})
    const todo1 = todoCreator(null, {title: 'World', completed: false})

    const todoList: Root = new Document()
    todoList.addChild(todo0, todo1)

    expect(fn).toBeCalledTimes(2)
  })

  it('unmount calls', () => {
    clearRegistry()

    const fn = jest.fn()
    const todoCreator = def<Todo>('Todo', () => {
      rxMount(() => fn)
    })

    const todo0 = todoCreator(null, {title: 'Hello', completed: false})
    const todo1 = todoCreator(null, {title: 'World', completed: false})

    const todoList: Root = new Document()
    todoList.addChild(todo0, todo1)

    todoList.filterChild(() => false)// Remove all (unmount)

    expect(fn).toBeCalledTimes(2)
  })

  it('outside component error', () => {
    expect(rxMount).toThrow()
  })
})