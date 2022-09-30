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
  _s: Map<string, any>;
}
