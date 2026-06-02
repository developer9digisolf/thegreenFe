import { describe, it, expect } from 'vitest'
import { buildTreeData } from './parse.util'

interface IMenuItem {
  id: number
  name: string
  parentId: number | null
}

describe('buildTreeData', () => {
  it('should return empty array for empty input', () => {
    const result = buildTreeData<IMenuItem>([], 'parentId', 'id', ['id', 'name', 'parentId'])
    expect(result).toEqual([])
  })

  it('should return flat array when identifier field is not in attributes', () => {
    // When parentId is not in attributes, destructPayload strips it,
    // so the condition !(items)['parentId'] is always true → all become roots
    const data: IMenuItem[] = [
      { id: 1, name: 'Parent', parentId: null },
      { id: 2, name: 'Child', parentId: 1 },
    ]

    const result = buildTreeData<IMenuItem>(data, 'parentId', 'id', ['id', 'name'])

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ id: 1, name: 'Parent' })
    expect(result[1]).toEqual({ id: 2, name: 'Child' })
  })

  it('should build nested tree when identifier is included in attributes', () => {
    const data: IMenuItem[] = [
      { id: 1, name: 'Parent', parentId: null },
      { id: 2, name: 'Child', parentId: 1 },
    ]

    const result = buildTreeData<IMenuItem>(data, 'parentId', 'id', ['id', 'name', 'parentId'])

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 1,
      name: 'Parent',
      parentId: null,
    })
    expect((result[0] as any).children).toHaveLength(1)
    expect((result[0] as any).children[0]).toMatchObject({
      id: 2,
      name: 'Child',
      parentId: 1,
    })
  })

  it('should build deeply nested tree', () => {
    const data: IMenuItem[] = [
      { id: 1, name: 'Grandparent', parentId: null },
      { id: 2, name: 'Parent', parentId: 1 },
      { id: 3, name: 'Child', parentId: 2 },
    ]

    const result = buildTreeData<IMenuItem>(data, 'parentId', 'id', ['id', 'name', 'parentId'])

    expect(result).toHaveLength(1)
    const level1 = (result[0] as any)
    expect(level1).toMatchObject({ id: 1, name: 'Grandparent' })
    expect(level1.children).toHaveLength(1)

    const level2 = level1.children[0]
    expect(level2).toMatchObject({ id: 2, name: 'Parent' })
    expect(level2.children).toHaveLength(1)

    const level3 = level2.children[0]
    expect(level3).toMatchObject({ id: 3, name: 'Child' })
  })

  it('should handle multiple children under same parent', () => {
    const data: IMenuItem[] = [
      { id: 1, name: 'Parent', parentId: null },
      { id: 2, name: 'Child A', parentId: 1 },
      { id: 3, name: 'Child B', parentId: 1 },
    ]

    const result = buildTreeData<IMenuItem>(data, 'parentId', 'id', ['id', 'name', 'parentId'])

    expect(result).toHaveLength(1)
    expect((result[0] as any).children).toHaveLength(2)
    expect((result[0] as any).children[0]).toMatchObject({ id: 2, name: 'Child A' })
    expect((result[0] as any).children[1]).toMatchObject({ id: 3, name: 'Child B' })
  })

  it('should handle multiple root items', () => {
    const data: IMenuItem[] = [
      { id: 1, name: 'Root A', parentId: null },
      { id: 2, name: 'Root B', parentId: null },
      { id: 3, name: 'Child of A', parentId: 1 },
    ]

    const result = buildTreeData<IMenuItem>(data, 'parentId', 'id', ['id', 'name', 'parentId'])

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ id: 1, name: 'Root A' })
    expect(result[1]).toMatchObject({ id: 2, name: 'Root B' })
    expect((result[0] as any).children).toHaveLength(1)
    expect((result[0] as any).children[0]).toMatchObject({ id: 3, name: 'Child of A' })
  })

  it('should map attributes with rename tuples', () => {
    const data: IMenuItem[] = [
      { id: 1, name: 'Item', parentId: null },
    ]

    const result = buildTreeData<IMenuItem>(data, 'parentId', 'id', [
      ['id', 'key'],
      ['name', 'title'],
      ['parentId', 'parentKey'],
    ])

    expect(result[0]).toEqual({ key: 1, title: 'Item', parentKey: null })
  })

  it('should handle mixed attributes (direct and renamed)', () => {
    const data: IMenuItem[] = [
      { id: 1, name: 'Item', parentId: null },
    ]

    const result = buildTreeData<IMenuItem>(data, 'parentId', 'id', [
      'id',
      ['name', 'title'],
      'parentId',
    ])

    expect(result[0]).toEqual({ id: 1, title: 'Item', parentId: null })
  })

  it('should handle items with falsy parentId as root (null, 0, undefined)', () => {
    interface IFalsyItem {
      id: number
      name: string
      parentId: number | null | undefined
    }

    const data: IFalsyItem[] = [
      { id: 1, name: 'Null Root', parentId: null },
      { id: 2, name: 'Zero Root', parentId: 0 },
      { id: 3, name: 'Undefined Root', parentId: undefined },
      { id: 4, name: 'Child', parentId: 1 },
    ]

    const result = buildTreeData<IFalsyItem>(data, 'parentId', 'id', ['id', 'name', 'parentId'])

    // null, 0, undefined are all falsy so they become root
    expect(result).toHaveLength(3)
    const rootIds = result.map((r: any) => r.id)
    expect(rootIds).toContain(1)
    expect(rootIds).toContain(2)
    expect(rootIds).toContain(3)
  })

  it('should drop orphan items (parentId not found)', () => {
    const data: IMenuItem[] = [
      { id: 1, name: 'Root', parentId: null },
      { id: 99, name: 'Orphan', parentId: 999 },
    ]

    const result = buildTreeData<IMenuItem>(data, 'parentId', 'id', ['id', 'name', 'parentId'])

    // Orphan items are silently dropped when parent is not found
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ id: 1, name: 'Root' })
  })

  it('should preserve only specified attributes in output', () => {
    interface IFullItem {
      id: number
      name: string
      extra: string
      hidden: boolean
      parentId: number | null
    }

    const data: IFullItem[] = [
      { id: 1, name: 'Item', extra: 'ignored', hidden: true, parentId: null },
    ]

    const result = buildTreeData<IFullItem>(data, 'parentId', 'id', ['id', 'name', 'parentId'])

    expect((result[0] as any).extra).toBeUndefined()
    expect((result[0] as any).hidden).toBeUndefined()
    expect(result[0]).toEqual({ id: 1, name: 'Item', parentId: null })
  })
})
