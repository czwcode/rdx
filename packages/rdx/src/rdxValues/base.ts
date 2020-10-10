import { ShareContextClass, StoreValues } from '../RdxContext/shareContext';
import { IRdxAnyDeps, IRdxView } from '../global';

import { get } from 'lodash';
export enum RdxNodeType {
  Atom = 'atom',
  Watcher = 'watcher',
  WatcherFamily = 'watcherFamily',
  Reaction = 'reaction',
}

export interface IRdxNode {
  id: string;
  type?: RdxNodeType;
}

export interface IRdxNodeLifeCycle {
  load(context: ShareContextClass): void;
}
/**
 * 基础节点
 */
export class RdxNode<GModel> implements IRdxNodeLifeCycle {
  load(context: ShareContextClass): void {}
  private id: string;
  private type: RdxNodeType = RdxNodeType.Atom;
  constructor(config: IRdxNode) {
    this.id = config.id;
    this.type = config.type;
  }
  getType() {
    return this.type;
  }
  getId() {
    return this.id;
  }
}

export class RdxNode2<GModel> implements IRdxNodeLifeCycle {
  load(context: ShareContextClass): void {}
  private id: string;
  private type: RdxNodeType = RdxNodeType.Atom;
  constructor(config: IRdxNode) {
    this.id = config.id;
    this.type = config.type;
  }
  getType() {
    return this.type;
  }
  getId() {
    return this.id;
  }
}

export type TPath<GModel> = RdxNode<GModel> | string;
export type ValueOrUpdater<GModel> = ((preValue: GModel) => GModel) | GModel;

export type RdxGet = <GModel>(node: TPath<GModel>) => GModel;

// const a: RdxGet = null;
// const c: RdxNode<string> = null;
// const b = a(c);
export type RdxSet = <GModel>(
  node: TPath<GModel>,
  value: ValueOrUpdater<GModel>
) => void;
export type RdxReset = <GModel>(node: RdxNode<GModel>) => void;

export type get = <ISource, IPath>(node: IPath) => ISource[];

type valueof<T> = T[keyof T];

// const a = { a: { b: 1}}
// type D = typeof a
// function get<KS extends KeyPath<D>>(paths: KS ): ResolveKeyPath<D , KS> {
//   return 1 as any
// }
// function getIn<D extends object, KS extends KeyPath<D>>(
//   data: D,
//   keyPath: KS
// ): ResolveKeyPath<D, KS> {
//   return null;
// }

// function setIn<D extends object, KS extends KeyPath<D>>(
//   data: D,
//   keyPath: KS,
//   value: ResolveKeyPath<D, KS>
// ) {}

// const o = { a: { b: [1, 2, 3] } }

// let aaaa = getIn(o, ['a', 'b', 0])

// type T<TObject, KS> = KS extends [infer K1] ?  K1 extends keyof TObject ? TObject[K1] :never : never ;
// type T2<TObject, KS> = KS extends [infer K2] ?  K2 extends keyof TObject ? TObject[K2] :never : never ;

// type ddd = T<typeof o, ['a']>

// type X<KS> = KS extends [infer K1, infer K2] ? K2 : KS
// const ff =[1,2]
// type eee = X<typeof ff>
// const path = ['a', 'b', 0]
// type Arr<K> = Array<K extends infer K1 ? K1: K>
// function test<K>(arr: Arr<K>): K {
//   return null as any
// }
// test([123, '123'])
