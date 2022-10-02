// import { defineStore } from "pinia";
import { defineStore } from "../pinia";

export const useCounterStore = defineStore("counter", {
  state() {
    return {
      count: 0,
      fruits: ["apple", "banana", "peer"],
    };
  },
  getters: {
    double(): number {
      return this.count * 2;
    },
  },
  actions: {
    add(payload: number) {
      // return new Promise((resolve) => {
      //   setTimeout(() => {
      //     this.count += payload;
      //     resolve("chenggong");
      //   }, 1000);
      // });
      this.count += payload;
      return 111;
    },
  },
});
