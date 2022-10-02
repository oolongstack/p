import {
  effectScope,
  getCurrentInstance,
  inject,
  reactive,
  computed,
  toRefs,
  isRef,
  isReactive,
  watch,
} from "vue";
import type { EffectScope } from "vue";
import { Pinia, piniaSymbol } from "./rootStore";
import { isObject } from "@vue/shared";
import { addSubscription, triggerSubscriptions } from "./subscribe";
import { activePinia, setActivePinia } from "./createPinia";
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
    let pinia = instance && inject<Pinia>(piniaSymbol)!;
    if (pinia) {
      setActivePinia(pinia);
    }
    pinia = activePinia! as Pinia;
    if (!pinia?._s.has(id)) {
      // 第一次useStore
      if (isSetupStore) {
        createSetupStore(id, setup, pinia!, false);
      } else {
        createOptionsStore(id, options, pinia!);
      }
    }
    const store = pinia?._s.get(id);

    return store;
  }

  return useStore;
}

function createOptionsStore(
  id: string,
  options: Record<PropertyKey, any>,
  pinia: Pinia
) {
  const { state, getters, actions } = options;

  function setup() {
    // 会对用户传递的数据进行处理
    pinia.state.value[id] = state ? state() : {};
    const loaclState = toRefs(pinia.state.value[id]);
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
  const store = createSetupStore(id, setup, pinia, true);

  store.$reset = function () {
    const newState = state ? state() : {};
    store.$patch((state: any) => {
      Object.assign(state, newState);
    });
  };
  return store;
}
function mergeReactiveObject(target: any, state: any) {
  for (const key in state) {
    let oldValue = target[key];
    let newValue = state[key];
    if (isObject(oldValue) && isObject(newValue)) {
      target[key] = mergeReactiveObject(oldValue, newValue);
    } else {
      target[key] = newValue;
    }
  }
  return target;
}

function createSetupStore(
  id: string,
  setup: () => any,
  pinia: Pinia,
  isOption: boolean
) {
  let scope: EffectScope;
  let actionSubscriptions = [];
  const partialStore = {
    $patch,
    $subscribe(callback: ({}: any, newVal: any) => void, options?: any) {
      scope.run(() =>
        watch(
          pinia.state.value[id],
          (newVal) => {
            callback({ storeId: id }, newVal);
          },
          options
        )
      );
    },
    $onAction: addSubscription.bind(null, actionSubscriptions),
    $dispose() {
      scope.stop(); // 清除响应式
      actionSubscriptions.length = 0;
      pinia._s.delete(id);
    },
  };
  function $patch(partialStateOrMutatior: any) {
    if (isObject(partialStateOrMutatior)) {
      mergeReactiveObject(pinia.state.value[id], partialStateOrMutatior);
    } else {
      partialStateOrMutatior(pinia.state.value[id]);
    }
  }
  const store = reactive<any>(partialStore);
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
      const afterCallbackList: any[] = [];
      const onErrorCallbackList: any[] = [];
      function after(cb) {
        afterCallbackList.push(cb);
      }
      function onError(cb) {
        onErrorCallbackList.push(cb);
      }
      triggerSubscriptions(actionSubscriptions, { after, onError });
      let ret;
      try {
        ret = action.apply(store, args);
      } catch (error) {
        triggerSubscriptions(onErrorCallbackList, error);
      }
      if (ret instanceof Promise) {
        return ret
          .then((val: any) => {
            triggerSubscriptions(afterCallbackList, val);
          })
          .catch((error: any) => {
            triggerSubscriptions(onErrorCallbackList, error);
          });
      }
      triggerSubscriptions(afterCallbackList, ret);
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
  Object.defineProperty(store, "$state", {
    get() {
      return pinia.state.value[id];
    },
    set(newState) {
      store.$patch((state) => {
        Object.assign(state, newState);
      });
    },
  });
  store.$id = id;

  // 应用插件
  pinia._p.forEach((plugin) =>
    scope.run(() => {
      plugin({ store });
    })
  );
  pinia._s.set(id, store);

  return store;
}
