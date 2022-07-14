import { clearRegistry, def } from '@/definer'
import { Document } from '@/document'
import { fromVDOM } from './index'
import type { NoAttrs } from '@/tag/types'
import type { Def } from '@/definer/types'

type Todo = Def<{title: string, completed: boolean}, never>
type TodoList = Def<NoAttrs, Todo>
type Root = Document<[TodoList]>

describe('fromVDOM', () => {
  it('correct output check', () => {
    clearRegistry()

    const todoCreator = def<Todo>('Todo')
    const todoListCreator = def<TodoList>('TodoList')

    const todo0 = todoCreator(null, {title: 'Hello', completed: false})
    const todo1 = todoCreator(null, {title: 'World', completed: false})
    const todoList = todoListCreator(null, {}, [todo0, todo1])

    const root: Root = new Document()
    root.addChild(todoList)

    const vdom = todoList.vdom

    todoList.removeChild(todo0)
    todoList.removeChild(todo1)

    fromVDOM(todoList, vdom)

    const expected = JSON.stringify(vdom)
    const actual = JSON.stringify(todoList.vdom)

    expect(actual).toBe(expected)
  })

  it('update existing', () => {
    clearRegistry()

    const todoCreator = def<Todo>('Todo')
    const todoListCreator = def<TodoList>('TodoList')

    const todo0 = todoCreator(null, {title: 'Hello', completed: false})
    const todo1 = todoCreator(null, {title: 'World', completed: false})
    const todoList = todoListCreator(null, {}, [todo0, todo1])

    const root: Root = new Document()
    root.addChild(todoList)

    const vdom = todoList.vdom

    todoList.removeChild(todo0)
    todo1.setAttr('completed', true)

    fromVDOM(todoList, vdom)

    const expected = JSON.stringify(vdom)
    const actual = JSON.stringify(todoList.vdom)

    expect(actual).toBe(expected)
  })

  it('remove existing', () => {
    clearRegistry()

    const todoCreator = def<Todo>('Todo')
    const todoListCreator = def<TodoList>('TodoList')

    const todo0 = todoCreator(null, {title: 'Hello', completed: false})
    const todo1 = todoCreator(null, {title: 'World', completed: false})
    const todoList = todoListCreator(null, {}, [todo0])

    const root: Root = new Document()
    root.addChild(todoList)

    const vdom = todoList.vdom

    todoList.removeChild(todo0)
    todoList.addChild(todo1)

    fromVDOM(todoList, vdom)

    const expected = JSON.stringify(vdom)
    const actual = JSON.stringify(todoList.vdom)

    expect(actual).toBe(expected)
  })

  it('do not update conflicts', () => {
    clearRegistry()

    const todoCreator = def<Todo>('Todo')
    const todoListCreator = def<TodoList>('TodoList')

    const todo0 = todoCreator(null, {title: 'Hello', completed: false})
    const todo1 = todoCreator(null, {title: 'World', completed: false})
    const todoList = todoListCreator(null, {}, [todo0, todo1])

    const root: Root = new Document()
    root.addChild(todoList)

    const vdom = todoList.vdom

    todoList.removeChild(todo0)

    fromVDOM(root, vdom)

    expect(root.children.length).toBe(1)
    expect(root.children[0].children.length).toBe(1)
  })
})