import { createApp, effectScope, effect, ref, EffectScope } from "vue";
// import { createPinia } from "pinia";
import { createPinia } from "./pinia";
import { useCounterStore } from "./store/counter";
import App from "./App.vue";

// const scope = effectScope(true);

// let scope1: EffectScope;

// const a = ref(0);

// scope.run(() => {
//   effect(() => {
//     console.log("effect1");
//   });
//   effect(() => {
//     console.log(a.value);
//   });
//   // 在父effectScope中调用才会被父收集
//   scope1 = effectScope();
//   scope1.run(() => {
//     effect(() => {
//       console.log(a.value, "scope1");
//     });
//   });
// });

// setTimeout(() => {
//   scope.stop();
// }, 1000);

// setTimeout(() => {
//   a.value = 100;
// }, 2000);

const pinia = createPinia();
pinia.use(({ store }) => {
  const local = localStorage.getItem(store.$id + "_PINIA_STATE");
  if (local) {
    store.$state = JSON.parse(local);
  }

  store.$subscribe(({ storeId }, state) => {
    localStorage.setItem(storeId + "_PINIA_STATE", JSON.stringify(state));
  });
});

const app = createApp(App);
app.use(pinia);

// 不在组件里使用
const store = useCounterStore();
console.log("store: ", store);
app.mount("#app");
