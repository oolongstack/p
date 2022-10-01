import type { App, EffectScope, Ref } from "vue";
export const piniaSymbol = Symbol();
type StateTree = Record<string | number | symbol, any>;
export interface Pinia {
  install: (app: App) => void;
  /**
   * root state
   */
  state: Ref<Record<string, StateTree>>;

  /**
   * Adds a store plugin to extend every store
   *
   * @param plugin - store plugin to add
   */
  // use(plugin: PiniaPlugin): Pinia;

  // /**
  //  * Installed store plugins
  //  *
  //  * @internal
  //  */
  // _p: PiniaPlugin[];

  /**
   * App linked to this Pinia instance
   *
   * @internal
   */
  _a: App | null;

  /**
   * Effect scope the pinia is attached to
   *
   * @internal
   */
  _e: EffectScope;

  /**
   * Registry of stores used by this pinia.
   *
   * @internal
   */
  _s: Map<string, StoreGeneric>;
}

export type StoreGeneric = Store<
  string,
  StateTree,
  _GettersTree<StateTree>,
  _ActionsTree
>;
export type _GettersTree<S extends StateTree> = Record<string, () => any>;
type _Method = (...args: any[]) => any;
/**
 * Type of an object of Actions. For internal usage only.
 * For internal use **only**
 */
export type _ActionsTree = Record<string, _Method>;
export type Store<
  Id extends string = string,
  S extends StateTree = {},
  G = {},
  A = {}
> = _StoreWithState<Id, S, G, A>;

export interface _StoreWithState<
  Id extends string,
  S extends StateTree,
  G /* extends GettersTree<StateTree> */,
  A /* extends ActionsTree */
> extends StoreProperties<Id> {
  $patch<F extends (state: any) => any>(
    // this prevents the user from using `async` which isn't allowed
    stateMutator: ReturnType<F> extends Promise<any> ? never : F
  ): void;

  $reset(): void;

  $onAction(callback: any, detached?: boolean): () => void;

  $dispose(): void;
}
export interface StoreProperties<Id extends string> {
  /**
   * Unique identifier of the store
   */
  $id: Id;

  /**
   * Private property defining the pinia the store is attached to.
   *
   * @internal
   */
  _p: Pinia;

  /**
   * Used by devtools plugin to retrieve getters. Removed in production.
   *
   * @internal
   */
  _getters?: string[];

  /**
   * Used (and added) by devtools plugin to detect Setup vs Options API usage.
   *
   * @internal
   */
  _isOptionsAPI?: boolean;

  /**
   * Used by devtools plugin to retrieve properties added with plugins. Removed
   * in production. Can be used by the user to add property keys of the store
   * that should be displayed in devtools.
   */
  _customProperties: Set<string>;

  /**
   * Handles a HMR replacement of this store. Dev Only.
   *
   * @internal
   */
  _hotUpdate(useStore: StoreGeneric): void;
}
