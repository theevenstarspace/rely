import { clearRegistry, create, def } from './index'
import { Document } from '@/document'
import { TagContext } from '@/context'
import type { NoAttrs } from '@/tag/types'
import type { Def } from './types'

type Todo = Def<{title: string, completed: boolean}, never>
type TodoList = Def<NoAttrs, Todo>
type Root = Document<[TodoList]>

describe('Definer', () => {
  it('define todolist', () => {
    clearRegistry()

    const todoCreator = def<Todo>('Todo')
    const todoListCreator = def<TodoList>('TodoList')

    const todo = todoCreator(null, {title: 'Hello', completed: false})
    const todoList = todoListCreator(null, {}, [todo])

    expect(todoList.children.length).toBe(1)
  })

  it('check multiple define error', () => {
    clearRegistry()

    const define = () => {
      def<Todo>('Todo')
      def<Todo>('Todo')
    }

    expect(define).toThrow()
  })

  it('initiator should be called 1 time', () => {
    clearRegistry()

    const fn = jest.fn()
    const todoCreator = def<Todo>('Todo', fn)

    const todoListCreator = def<TodoList>('TodoList')

    const todo = todoCreator(null, {title: 'Hello', completed: false})
    const todoList = todoListCreator(null, {}, [todo])

    const root: Root = new Document()
    root.addChild(todoList)

    expect(fn).toBeCalledTimes(1)
  })

  it('initiator should be called with apropriate Tag', () => {
    clearRegistry()

    const todoCreator = def<Todo>('Todo', (Tag) => {
      const current = TagContext.get() as Todo

      expect(current !== null).toBe(true)
      expect(current.id).toBe(Tag.id)
    })

    const todoListCreator = def<TodoList>('TodoList')

    const todo = todoCreator(null, {title: 'Hello', completed: false})
    const todoList = todoListCreator(null, {}, [todo])

    const root: Root = new Document()
    root.addChild(todoList)
  })

  it('registry check', () => {
    clearRegistry()
    
    def<Todo>('Todo')// Register here
    const todoListCreator = def<TodoList>('TodoList')

    const todo = create({name: 'Todo', id: '', attrs: {title: 'Hello', completed: false}, children: []}) as Todo
    const todoList = todoListCreator(null, {}, [todo])

    const root: Root = new Document()
    root.addChild(todoList)

    expect(root.children[0].children[0].attrs.title).toBe('Hello')
  })

  it('registry deep check', () => {
    clearRegistry()

    const todoCreator = def<Todo>('Todo')
    const todoListCreator = def<TodoList>('TodoList')

    const todo0 = todoCreator(null, {title: 'Hello', completed: false})
    const todo1 = todoCreator(null, {title: 'World', completed: false})
    const todoList = todoListCreator(null, {}, [todo0, todo1])

    const root: Root = new Document()
    root.addChild(todoList)

    const expected = JSON.stringify(root)

    const vdom = todoList.vdom
    root.removeChild(todoList)

    root.addChild(create(vdom) as TodoList)

    const actual = JSON.stringify(root)

    expect(actual).toBe(expected)
  })

  it('registry unknown check', () => {
    clearRegistry()

    const todoCreator = def<Todo>('Todo')
    const todoListCreator = def<TodoList>('TodoList')

    const todo0 = todoCreator(null, {title: 'Hello', completed: false})
    const todo1 = todoCreator(null, {title: 'World', completed: false})
    const todoList = todoListCreator(null, {}, [todo0, todo1])

    const root: Root = new Document()
    root.addChild(todoList)

    const vdom = todoList.vdom
    vdom.children[1].name = 'TodoWrong'

    root.removeChild(todoList)
    root.addChild(create(vdom) as TodoList)

    expect(root.children[0].children.length).toBe(1)
  })
})