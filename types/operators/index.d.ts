import type { ITagData } from '@/tag/types';
export declare function attrOp<DataType extends ITagData>(): import("rxjs").OperatorFunction<DataType, DataType["attrs"]>;
export declare function childOp<DataType extends ITagData>(): import("rxjs").OperatorFunction<DataType, DataType["children"]>;
