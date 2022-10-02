<template>
  <p>count:{{ counterStore.count }}</p>
  <p>double count:{{ counterStore.double }}</p>
  <div v-for="item of counterStore.fruits" :key="item">
    {{ item }}
  </div>
  <button @click="counterStore.count++">+1</button>
  <br />
  <button @click="counterStore.add(3)">+3</button>
  <br />
  <button @click="handlePatch">$patch</button>
  <br />
  <button @click="counterStore.$reset()">$reset</button>
  <br />
  <button @click="counterStore.$state = { count: 999 }">$state</button>
  <div>--------------------------------------</div>
  <p>count:{{ counterStore1.count }}</p>
  <p>double count:{{ counterStore1.double }}</p>
  <button @click="counterStore1.count++">+1</button>
  <br />
  <button @click="counterStore1.add(3)">+3</button>
</template>
<script setup lang="ts">
import { useCounterStore } from "./store/counter";
import { useCounterStore1 } from "./store/counterfn";
const counterStore = useCounterStore();
const counterStore1 = useCounterStore1();
const handlePatch = () => {
  counterStore.$patch({
    count: 1000,
  });
  // counterStore.$patch((state: any) => {
  //   state.fruits.push("watermelon");
  // });
};

// counterStore.$subscribe(({ storeId }, newVal: any) => {
//   console.log("storeInfo: any, state: any: ", storeId, newVal);
// });

counterStore.$onAction(({ after, onError }) => {
  console.log("action running");
  after((val) => {
    console.log("action after", val);
  });
  onError((err) => {
    console.log("action error", err);
  });
});
</script>

<style scoped></style>
