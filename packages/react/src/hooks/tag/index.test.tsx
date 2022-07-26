import { renderHook, act } from '@testing-library/react'
import { createMock, Todo, TodoList } from '../../../__mocks__/mock'
import { useTag } from './index'


describe('useTag', () => {
  test('returns tag as excpected', () => {
    const mock = createMock()
    const todo = mock.findById('todo0', true) as Todo

    const {result, rerender} = renderHook(useTag, {
      initialProps: todo,
    })

    // Tag is valid
    expect(result.current.attrs.title).toBe(todo.attrs.title)
    expect(result.current.attrs.completed).toBe(todo.attrs.completed)

    // Providing undefined results in empty tag data 
    rerender()
    expect(Object.keys(result.current.attrs).length).toBe(0)
    expect(result.current.children.length).toBe(0)
  })

  test('hook updates value on tag change', () => {
    const mock = createMock()
    const todo = mock.findById('todo0', true) as Todo

    const {result} = renderHook(useTag, {
      initialProps: todo,
    })

    // Tag is valid
    expect(result.current.attrs.completed).toBe(todo.attrs.completed)

    const nextCompleted = !todo.attrs.completed

    // Update tag results in useEffect update
    act(() => {
      todo.setAttr('completed', nextCompleted)
    })

    expect(result.current.attrs.completed).toBe(nextCompleted)
  })

  test('hook updates value on child change', () => {
    const mock = createMock()
    const todoList = mock.findById('todoList', true) as TodoList

    const {result} = renderHook(useTag, {
      initialProps: todoList,
    })

    // Tag is valid
    expect(result.current.children.length).toBe(2)

    // Update tag results in useEffect update
    act(() => {
      todoList.removeChild(todoList.children[0])
    })

    expect(result.current.children.length).toBe(1)
  })
})
