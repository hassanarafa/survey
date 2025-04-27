<template>
  <NavBar v-if="!['login'].includes($route.name)" />

  <div id="app">
    <router-view />
  </div>
</template>

<script>
import NavBar from "@/components/NavBar.vue";

export default {
  name: 'App',
  components: {
    NavBar,
  }
};
</script>

<style>
/* You can add your global styles here if necessary */
</style>
