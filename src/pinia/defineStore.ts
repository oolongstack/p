import { getCurrentInstance, inject } from "vue";
import { Pinia, piniaSymbol } from "./rootStore";

type WithIdOptions = {
  id: string;
  [key: string]: any;
};

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

  function useStore(): any {
    // 组件中调用方法时，看是否已经使用过该模块
    const instance = getCurrentInstance();
    const pinia = instance && inject<Pinia>(piniaSymbol)!;
    console.log(pinia, id, options);
  }

  return useStore;
}
