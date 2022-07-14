import { Tag } from '@/tag';
import type { ITagData, VDOM } from '@/tag/types';
import type { TagCreatorFunction } from './types';
export declare const clearRegistry: () => void;
export declare const create: (vdom: VDOM) => Tag<ITagData> | null;
export declare const def: <Type extends ITagData>(name: string, initiator?: ((Tag: Tag<Type>) => void) | undefined) => TagCreatorFunction<Type>;
