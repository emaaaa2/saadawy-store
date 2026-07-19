import fadeIn from '~/directives/fade-in'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('fade-in', fadeIn)
})