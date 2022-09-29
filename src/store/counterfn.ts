import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useCounterStore1 = defineStore("counter1", () => {
  const count = ref<number>(0);
  const double = computed(() => count.value * 2);
  const add = (payload: number) => {
    count.value += payload;
  };
  return {
    count,
    double,
    add,
  };
});
