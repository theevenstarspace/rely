import { clearRegistry, def } from '@/definer'
import { Document } from '@/document'
import { attrOp, childOp } from './index'
import type { NoAttrs } from '@/tag/types'
import type { Def } from '@/definer/types'

type Todo = Def<{title: string, completed: boolean}, never>
type TodoList = Def<NoAttrs, Todo>
type Root = Document<[TodoList]>

describe('Operators', () => {
  it('Attr', () => {
    clearRegistry()

    const todoCreator = def<Todo>('Todo')
    const todoListCreator = def<TodoList>('TodoList')

    const todo0 = todoCreator(null, {title: 'Hello', completed: false})
    const todo1 = todoCreator(null, {title: 'World', completed: false})
    const todoList = todoListCreator(null, {}, [todo0, todo1])

    const root: Root = new Document()
    root.addChild(todoList)

    const expected = JSON.stringify(todo0.attrs)
    let actual: Todo['attrs'] = {} as Todo['attrs']

    todo0.rx.pipe(attrOp()).subscribe(v => { actual = v })

    expect(JSON.stringify(actual)).toBe(expected)
  })

  it('Child', () => {
    clearRegistry()

    const todoCreator = def<Todo>('Todo')
    const todoListCreator = def<TodoList>('TodoList')

    const todo0 = todoCreator(null, {title: 'Hello', completed: false})
    const todo1 = todoCreator(null, {title: 'World', completed: false})
    const todoList = todoListCreator(null, {}, [todo0, todo1])

    const root: Root = new Document()
    root.addChild(todoList)

    const expected = JSON.stringify(todoList.children)
    let actual: TodoList['children'] = [] as TodoList['children']

    todoList.rx.pipe(childOp()).subscribe(v => { actual = v })

    expect(JSON.stringify(actual)).toBe(expected)
  })
})