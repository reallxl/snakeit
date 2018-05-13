import Vue from 'vue'
import App from './App.vue'
import appDataManager from './DataManager'

export const DataManager = new Vue(appDataManager);
export const EventBus = new Vue();

new Vue({
  el: '#app',
  render: h => h(App),
});
