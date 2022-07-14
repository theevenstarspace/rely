import { map } from 'rxjs'
import type { ITagData } from '@/tag/types'

export function attrOp<DataType extends ITagData>() {
  return map((data: DataType) => data.attrs as DataType['attrs'])
}

export function childOp<DataType extends ITagData>() {
  return map((data: DataType) => data.children as DataType['children'])
}