import { createApp, effectScope, effect, ref, EffectScope } from "vue";
// import { createPinia } from "pinia";
import { createPinia } from "./pinia";
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
const app = createApp(App);
app.use(pinia);
app.mount("#app");
