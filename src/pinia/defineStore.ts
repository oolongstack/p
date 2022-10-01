import {
  effectScope,
  getCurrentInstance,
  inject,
  reactive,
  computed,
  isRef,
  isReactive,
} from "vue";
import type { EffectScope } from "vue";
import { Pinia, piniaSymbol } from "./rootStore";

type WithIdOptions = {
  id: string;
  [key: string]: any;
};
function isComputed(v: any) {
  return !!(isRef(v) && v.effect);
}

export function defineStore(idOrOptions: string | WithIdOptions, setup: any) {
  let id: string;
  let options: Record<PropertyKey, any>;
  if (typeof idOrOptions === "string") {
    id = idOrOptions;
    options = setup;
  } else {
    options = idOrOptions;
    id = idOrOptions.id;
  }
  // 可能setup是个函数
  const isSetupStore = typeof setup === "function";

  function useStore(): any {
    // 组件中调用方法时，看是否已经使用过该模块
    const instance = getCurrentInstance();
    const pinia = instance && inject<Pinia>(piniaSymbol)!;
    if (!pinia?._s.has(id)) {
      // 第一次useStore
      if (isSetupStore) {
        createSetupStore(id, setup, pinia!, false);
      } else {
        createOptionStore(id, options, pinia!);
      }
    }
    const store = pinia?._s.get(id);

    return store;
  }

  return useStore;
}

function createOptionStore(
  id: string,
  options: Record<PropertyKey, any>,
  pinia: Pinia
) {
  const { state, getters, actions } = options;

  function setup() {
    // 会对用户传递的数据进行处理
    const loaclState = (pinia.state.value[id] = state ? state() : {});
    Object.assign(
      loaclState,
      actions,
      Object.keys(getters || {}).reduce((memo: any, computedName: string) => {
        memo[computedName] = computed(() => {
          const store = pinia._s.get(id);
          return getters[computedName].call(store);
        });
        return memo;
      }, {})
    );
    return loaclState;
  }
  // isOption
  return createSetupStore(id, setup, pinia, true);
}

function createSetupStore(
  id: string,
  setup: () => any,
  pinia: Pinia,
  isOption: boolean
) {
  let scope: EffectScope;
  const store = reactive<any>({});
  // 对于setupStore，initial目前不存在
  const initialState = pinia.state.value[id];
  if (!initialState && !isOption) {
    pinia.state.value[id] = {};
  }
  const setupStore = pinia._e.run(() => {
    scope = effectScope();
    // 父亲能停止所有，自己也能停止自己
    return scope.run(() => {
      return setup();
    });
  });

  // 包裹action，this指向处理，异步处理
  function wrapAction(name: string, action: () => any) {
    return (...args: []) => {
      let ret = action.apply(store, args);

      return ret;
    };
  }
  for (const key in setupStore) {
    const prop = setupStore[key];
    if (typeof prop === "function") {
      setupStore[key] = wrapAction(key, prop);
    }

    // 判断该值是否为状态
    if ((isRef(prop) && !isComputed(prop)) || isReactive(prop)) {
      if (!isOption) {
        // console.log("prop: ", id, key, prop);
        pinia.state.value[id][key] = prop;
      }
    }
  }

  Object.assign(store, setupStore);

  pinia._s.set(id, store);

  console.log(pinia);

  return store;
}
