import type { IHistory } from "../history/types";
import type { ITagData, NoAttrs } from "../tag/types";
export declare type RootDataType<DataType extends ITagData['children']> = {
    attrs: NoAttrs;
    children: DataType;
};
export declare type IDocument<DataType extends ITagData['children']> = {
    historyManager: IHistory<DataType>;
};
