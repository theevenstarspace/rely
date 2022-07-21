import { RootDataType } from "../document/types";
import { Tag } from "../tag";
import type { ITagData, TreeUpdateEvent } from "../tag/types";
import type { IHistory } from './types';
export declare class History<ChildType extends ITagData['children']> implements IHistory<ChildType> {
    private stack;
    private pointer;
    size: number;
    readonly owner: Tag<RootDataType<ChildType>>;
    constructor(root: Tag<RootDataType<ChildType>>);
    push(event: TreeUpdateEvent): void;
    undo(): boolean;
    redo(): boolean;
    clear(): void;
    jump(count: number): void;
}
