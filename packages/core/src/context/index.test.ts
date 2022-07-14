import { TagContext } from '@/context'
import { clearRegistry, def } from '@/definer'
import type { Def } from '@/definer/types'


type Todo = Def<{title: string, completed: boolean}, never>

describe('Context', () => {
  it('context set', () => {
    clearRegistry()

    const todoCreator = def<Todo>('Todo')

    const todo = todoCreator(null, {title: 'Hello', completed: false})
    TagContext.set(todo)

    const value = TagContext.get() as Todo

    expect(value.id).toBe(todo.id)
  })

  it('context reset', () => {
    clearRegistry()
    
    const todoCreator = def<Todo>('Todo')

    const todo = todoCreator(null, {title: 'Hello', completed: false})
    TagContext.set(todo)
    TagContext.set(null)

    const value = TagContext.get()

    expect(value).toBe(null)
  })
})