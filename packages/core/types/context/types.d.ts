import type { ITag } from "../tag/types";
export interface ITagContext {
    current: ITag | null;
    get(): ITag | null;
    set(Tag: ITag | null): void;
}
