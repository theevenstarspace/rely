import { def, clearRegistry, Document } from '@evenstar/rely'
import type { Def, NoAttrs } from '@evenstar/rely'

const TodoName = 'Todo'
const TodoListName = 'TodoList'
const RootName = 'Root'

export type Todo = Def<{title: string, completed: boolean}, never>
export type TodoList = Def<NoAttrs, Todo[]>
export type Root = Document<[TodoList]>

export const createTodo = def<Todo>(TodoName)
export const createTodoList = def<TodoList>(TodoListName)
export const createRoot = (id?: string) : Root => new Document(RootName, id)

export const createMock = () => {
  clearRegistry()

  const root = createRoot()

  const todo0 = createTodo('todo0', {title: 'Hello', completed: false})
  const todo1 = createTodo('todo1', {title: 'World', completed: true})
  const todoList = createTodoList('todoList', {}, [todo0, todo1])

  root.addChild(todoList)

  return root
}