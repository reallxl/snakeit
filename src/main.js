import Vue from 'vue'
import App from './App.vue'

import { DataManager } from './components/DataManager'

export const appDataManager = new DataManager()
export const appEventBus = new Vue();

new Vue({
  el: '#app',
  render: h => h(App),
});
