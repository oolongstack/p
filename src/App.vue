<template>
  <p>count:{{ counterStore.count }}</p>
  <p>double count:{{ counterStore.double }}</p>
  <button @click="counterStore.count++">+1</button>
  <br />
  <button @click="counterStore.add(3)">+3</button>
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
</script>

<style scoped></style>
