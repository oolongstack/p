import { effectScope, markRaw, ref } from "vue";
import type { App, EffectScope } from "vue";
import { Pinia, piniaSymbol } from "./rootStore";
// 解决pinia只能在组件内使用的问题
export let activePinia = undefined;
export const setActivePinia = (pinia) => {
  activePinia = pinia;
};

export const getActivePinia = () => {
  return activePinia;
};

export function createPinia(): Pinia {
  const scope: EffectScope = effectScope();
  const state = scope.run(() => ref({}))!;
  const pinia: Pinia = markRaw({
    install(app: App) {
      setActivePinia(pinia);
      app.provide<Pinia>(piniaSymbol, pinia);
      app.config.globalProperties.$pinia = pinia;
      pinia._a = app;
    },
    use(plugin) {
      pinia._p.push(plugin);
    },
    _p: [],
    _s: new Map(),
    _a: null,
    state,
    _e: scope,
  });
  return pinia;
}
