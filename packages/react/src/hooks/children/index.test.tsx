import { renderHook, act } from '@testing-library/react'
import { createMock, TodoList } from '../../../__mocks__/mock'
import { useChildren } from './index'


describe('useChildren', () => {
  test('returns children as excpected', () => {
    const mock = createMock()
    const todoList = mock.findById('todoList', true) as TodoList

    const {result, rerender} = renderHook(useChildren, {
      initialProps: todoList,
    })

    // Children are valid
    expect(result.current.length).toBe(2)

    // Providing undefined results in empty children data 
    rerender()
    expect(result.current.length).toBe(0)
  })

  test('hook updates value on tag change', () => {
    const mock = createMock()
    const todoList = mock.findById('todoList', true) as TodoList

    const {result} = renderHook(useChildren, {
      initialProps: todoList,
    })


    // Removing child results in useEffect update
    act(() => {
      todoList.removeChild(todoList.children[0])
    })

    expect(result.current.length).toBe(1)
  })

  test('hook updates value on child change', () => {
    const mock = createMock()
    const todoList = mock.findById('todoList', true) as TodoList

    const {result} = renderHook(useChildren, {
      initialProps: todoList,
    })

    // Update tag results in useEffect update
    act(() => {
      const child = todoList.children[0]
      todoList.removeChild(child)
      todoList.addChild(child)
    })

    expect(result.current.length).toBe(2)
  })
})
