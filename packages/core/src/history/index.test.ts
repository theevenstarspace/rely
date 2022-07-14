import { clearRegistry, def } from '@/definer'
import { Document } from '@/document'
import type { Def } from '@/definer/types'
import type { NoAttrs } from '@/tag/types'

type Todo = Def<{title: string, completed: boolean}, never>
type TodoList = Def<NoAttrs, Todo>
type Root = Document<[TodoList]>

describe('History', () => {
  it('Undo', () => {
    clearRegistry()

    const todoCreator = def<Todo>('Todo')
    const todoListCreator = def<TodoList>('TodoList')

    const todo0 = todoCreator(null, {title: 'Hello', completed: false})
    const todo1 = todoCreator(null, {title: 'World', completed: false})
    const todoList = todoListCreator(null, {}, [todo0, todo1])

    const root: Root = new Document()
    const expected = JSON.stringify(root.vdom)

    root.addChild(todoList)
    root.historyManager.undo()

    const actual = JSON.stringify(root.vdom)


    expect(actual).toBe(expected)
  })

  it('Redo', () => {
    clearRegistry()

    const todoCreator = def<Todo>('Todo')
    const todoListCreator = def<TodoList>('TodoList')

    const todo0 = todoCreator(null, {title: 'Hello', completed: false})
    const todo1 = todoCreator(null, {title: 'World', completed: false})
    const todoList = todoListCreator(null, {}, [todo0, todo1])

    const root: Root = new Document()

    root.addChild(todoList)
    const expected = JSON.stringify(root.vdom)

    root.historyManager.undo()
    root.historyManager.redo()

    const actual = JSON.stringify(root.vdom)


    expect(actual).toBe(expected)
  })

  it('Undo attributes', () => {
    clearRegistry()

    const todoCreator = def<Todo>('Todo')
    const todoListCreator = def<TodoList>('TodoList')

    const todo0 = todoCreator(null, {title: 'Hello', completed: false})
    const todo1 = todoCreator(null, {title: 'World', completed: false})
    const todoList = todoListCreator(null, {}, [todo0, todo1])

    const root: Root = new Document()
    root.addChild(todoList)


    const expected = JSON.stringify(root.vdom)

    todo0.setAttr('title', 'New one')
    root.historyManager.undo()

    const actual = JSON.stringify(root.vdom)


    expect(actual).toBe(expected)
  })

  it('Batch', () => {
    clearRegistry()

    const todoCreator = def<Todo>('Todo')
    const todoListCreator = def<TodoList>('TodoList')

    const todo0 = todoCreator(null, {title: 'Hello', completed: false})
    const todo1 = todoCreator(null, {title: 'World', completed: false})
    const todoList = todoListCreator(null, {}, [todo0, todo1])

    const root: Root = new Document()
    root.addChild(todoList)


    const expected = JSON.stringify(root.vdom)

    todoList.historyBatch = true

    todo0.setAttr('title', 'New one')
    todo1.setAttr('completed', true)
    todoList.removeChild(todo0)

    todoList.historyBatch = false

    root.historyManager.undo()

    const actual = JSON.stringify(root.vdom)


    expect(actual).toBe(expected)
  })

  it('Batch mixed', () => {
    clearRegistry()

    const todoCreator = def<Todo>('Todo')
    const todoListCreator = def<TodoList>('TodoList')

    const todo0 = todoCreator(null, {title: 'Hello', completed: false})
    const todo1 = todoCreator(null, {title: 'World', completed: false})
    const todoList = todoListCreator(null, {}, [todo0, todo1])

    const root: Root = new Document()
    root.addChild(todoList)

    todo0.setAttr('title', 'New one')
    const expected = JSON.stringify(root.vdom)

    todoList.historyBatch = true
    todo1.setAttr('completed', true)
    todoList.removeChild(todo0)
    todoList.historyBatch = false

    root.historyManager.undo()

    const actual = JSON.stringify(root.vdom)


    expect(actual).toBe(expected)
  })

  it('Jump', () => {
    clearRegistry()

    const todoCreator = def<Todo>('Todo')
    const todoListCreator = def<TodoList>('TodoList')

    const todo0 = todoCreator(null, {title: 'Hello', completed: false})
    const todo1 = todoCreator(null, {title: 'World', completed: false})
    const todoList = todoListCreator(null, {}, [todo0, todo1])

    const root: Root = new Document() // 1st state
    root.addChild(todoList)// 2nd state

    todo0.setAttr('title', 'New one')// 3rd state
    const expected = JSON.stringify(root.vdom)// Capture state (3rd)

    todoList.historyBatch = true// 4th state, the same as 3rd
    todo1.setAttr('completed', true)
    todoList.removeChild(todo0)
    todoList.historyBatch = false// 5th state

    root.historyManager.jump(-10)// Move to 0
    root.historyManager.jump(10)// Move to 5th
    root.historyManager.jump(-1)// Move to 3rd

    const actual = JSON.stringify(root.vdom)// Capture actual


    expect(actual).toBe(expected)
  })

  it('Clear', () => {
    clearRegistry()

    const todoCreator = def<Todo>('Todo')
    const todoListCreator = def<TodoList>('TodoList')

    const todo0 = todoCreator(null, {title: 'Hello', completed: false})
    const todo1 = todoCreator(null, {title: 'World', completed: false})
    const todoList = todoListCreator(null, {}, [todo0, todo1])

    const root: Root = new Document()
    root.addChild(todoList)

    todo0.setAttr('title', 'New one')

    todoList.historyBatch = true
    todo1.setAttr('completed', true)
    todoList.removeChild(todo0)
    todoList.historyBatch = false

    root.historyManager.clear()
    const canUndo = root.historyManager.undo()


    expect(canUndo).toBe(false)
  })

  it('History size', () => {
    clearRegistry()

    const todoCreator = def<Todo>('Todo')
    const todoListCreator = def<TodoList>('TodoList')

    const todo0 = todoCreator(null, {title: 'Hello', completed: false})
    const todo1 = todoCreator(null, {title: 'World', completed: false})
    const todoList = todoListCreator(null, {}, [todo0, todo1])

    const root: Root = new Document() // 1st state
    root.historyManager.size = 4
    root.addChild(todoList)// 2nd state

    todo0.setAttr('title', 'New one')// 3rd state
    const expected = JSON.stringify(root.vdom)// Capture state (3rd)

    todoList.historyBatch = true// 4th state, the same as 3rd
    todo1.setAttr('completed', true)
    todoList.removeChild(todo0)
    todoList.historyBatch = false// 5th state

    todo1.setAttr('title', 'Test')// 6th state
    // As history size is 4, we know that only 4 last changes now in the stack [6, 5, 4, 3]
    // So 3rd state is a 1st one right now

    root.historyManager.jump(-10)// Move to 3rd state

    const actual = JSON.stringify(root.vdom)// Capture actual


    expect(actual).toBe(expected)
  })
})