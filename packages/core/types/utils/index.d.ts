import { ITagData, VDOM } from "../tag/types";
import { Tag } from "../tag";
export declare const fromVDOM: (Tag: Tag<ITagData>, vdom: VDOM, ignoreHistory?: boolean) => Tag<ITagData> | null;
