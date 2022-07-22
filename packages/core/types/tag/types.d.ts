import type { BehaviorSubject, Subject } from 'rxjs';
interface ObjectLiteral {
    [key: string]: unknown;
}
export interface VDOM {
    name: string;
    id: string;
    attrs: ObjectLiteral;
    children: VDOM[];
}
export interface HistoryConfig {
    enabled: boolean;
    __batch: boolean;
    __ignoreNextUpdate: boolean;
}
export interface ITag {
    parent: ITag | null;
    userData: ObjectLiteral;
    readonly history: HistoryConfig;
    readonly data: BehaviorSubject<unknown>;
    readonly id: string;
    readonly name: string;
    get historyBatch(): boolean;
    set historyBatch(value: boolean);
    get vdom(): VDOM;
    get isMounted(): boolean;
    set isMounted(mounted: boolean);
    get events(): MountObserver<ITagData>;
    get rx(): BehaviorSubject<ITagData>;
    get path(): string[] | null;
    findByPath(path: string[]): ITag | null;
    findById(id: string, recursive?: boolean): ITag | null;
    findByName(name: string, recursive?: boolean): ITag | null;
    find(fn: (child: ITag) => boolean, recursive?: boolean): ITag | null;
    getRoot(): ITag | null;
    addChild(...childList: ITag[]): void;
    removeChild(child: ITag | ITag[]): boolean;
    filterChild(fn: (child: ITag) => boolean): void;
    remove(): boolean;
    traverse(fn: (Tag: ITag) => void): void;
}
export interface ITagData {
    attrs: ObjectLiteral;
    children: ITag[];
}
export declare type InitiatorFunction<TagObject> = (Tag: TagObject) => void;
export declare enum EventTypes {
    change = 0,
    mount = 1,
    unmount = 2,
    treeUpdate = 3
}
export interface ChangeEvent<Type extends ITagData> {
    type: EventTypes.change;
    prev: Type;
    next: Type;
}
export interface TreeUpdateEvent {
    type: EventTypes.treeUpdate;
    tag: ITag;
    event: ChangeEvent<ITagData>;
}
export interface MountEvent {
    type: EventTypes.mount | EventTypes.unmount;
}
export declare type MountObserver<Type extends ITagData> = Subject<ChangeEvent<Type> | TreeUpdateEvent | MountEvent>;
export declare type TagMap = {
    [key: string]: ITag;
};
export declare type NoAttrs = Record<string, never>;
export {};
