// import { defineStore } from "pinia";
import { defineStore } from "../pinia";

export const useCounterStore = defineStore("counter", {
  state() {
    return {
      count: 0,
    };
  },
  getters: {
    double(): number {
      return this.count * 2;
    },
  },
  actions: {
    add(payload: number) {
      this.count += payload;
    },
  },
});
