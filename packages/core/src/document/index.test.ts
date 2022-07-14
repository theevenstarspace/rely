import { Document } from './index'

describe('Document', () => {
  it('isMount always returns true', () => {
    const empty: Document<never> = new Document()

    expect(empty.isMounted).toBe(true)
  })

  it('path is always an empty array', () => {
    const empty: Document<never> = new Document()

    const path = empty.path
    const isValid = Array.isArray(path) && (path.length === 0)

    expect(isValid).toBe(true)
  })
})