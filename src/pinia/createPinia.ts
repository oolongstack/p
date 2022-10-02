import { effectScope, markRaw, ref } from "vue";
import type { App, EffectScope } from "vue";
import { Pinia, piniaSymbol } from "./rootStore";

export function createPinia(): Pinia {
  const scope: EffectScope = effectScope();
  const state = scope.run(() => ref({}))!;
  const pinia: Pinia = markRaw({
    install(app: App) {
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
