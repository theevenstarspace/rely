import type { ChangeEvent, ITag, ITagData } from "../tag/types";
import { Tag } from "../tag";
export declare type Packed<Type> = Type extends ITag[] ? Type : Type[];
export declare type Unpacked<T> = T extends (infer U)[] ? U : T;
export declare type ChangeEventUnpacked<T> = T extends Tag<infer U> ? ChangeEvent<U> : ChangeEvent<ITagData>;
