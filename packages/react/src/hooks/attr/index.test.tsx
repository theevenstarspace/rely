import { renderHook, act } from '@testing-library/react'
import { createMock, Todo } from '../../../__mocks__/mock'
import { useAttr } from './index'


describe('useAttr', () => {
  test('returns tag as excpected', () => {
    const mock = createMock()
    const todo = mock.findById('todo0', true) as Todo

    const {result, rerender} = renderHook(({todo, attr}) => useAttr(todo, attr as keyof Todo['attrs']), {
      initialProps: {todo, attr: 'completed'},
    })

    // Tag is valid
    expect(result.current).toBe(false)

    // Providing undefined results in empty attr data 
    rerender({ todo: undefined, attr: 'empty' } as unknown as {todo: Todo, attr: string})
    expect(result.current).toBe(null)

    // Providing undefined results in empty attr data 
    rerender({todo, attr: ''}) // Tag exists, but attr key is not deined in todo, result is undefined
    expect(result.current).toBe(undefined)
  })

  test('hook updates value on tag change', () => {
    const mock = createMock()
    const todo = mock.findById('todo0', true) as Todo

    const {result} = renderHook(({todo, attr}) => useAttr(todo, attr as keyof Todo['attrs']), {
      initialProps: {todo, attr: 'completed'},
    })

    // Tag is valid
    expect(result.current).toBe(false)

    const nextCompleted = !todo.attrs.completed

    // Update tag results in useEffect update
    act(() => {
      todo.setAttr('completed', nextCompleted)
    })

    expect(result.current).toBe(true)
  })
})
