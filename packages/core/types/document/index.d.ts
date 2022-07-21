import { Tag } from "../tag";
import type { ITagData, ITag } from "../tag/types";
import type { IHistory } from "../history/types";
import type { IDocument, RootDataType } from './types';
export declare class Document<ChildType extends ITagData['children']> extends Tag<RootDataType<ChildType>> implements IDocument<ChildType> {
    historyManager: IHistory<ChildType>;
    constructor(name?: string, id?: string);
    get isMounted(): boolean;
    getRoot(): ITag;
}
