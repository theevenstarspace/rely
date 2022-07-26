import { renderHook, act } from '@testing-library/react'
import { createMock, Todo } from '../../../__mocks__/mock'
import { useAttrs } from './index'


describe('useAttrs', () => {
  test('returns tag as excpected', () => {
    const mock = createMock()
    const todo = mock.findById('todo0', true) as Todo

    const {result, rerender} = renderHook(useAttrs, {
      initialProps: todo,
    })

    // Tag is valid
    expect(result.current.title).toBe(todo.attrs.title)
    expect(result.current.completed).toBe(todo.attrs.completed)

    // Providing undefined results in empty attr data 
    rerender()
    expect(Object.keys(result.current).length).toBe(0)
  })

  test('hook updates value on tag change', () => {
    const mock = createMock()
    const todo = mock.findById('todo0', true) as Todo

    const {result} = renderHook(useAttrs, {
      initialProps: todo,
    })

    // Tag is valid
    expect(result.current.completed).toBe(todo.attrs.completed)

    const nextCompleted = !todo.attrs.completed

    // Update tag results in useEffect update
    act(() => {
      todo.setAttr('completed', nextCompleted)
    })

    expect(result.current.completed).toBe(nextCompleted)
  })
})
