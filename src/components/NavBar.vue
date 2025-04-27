<template>
  <div class="navbar-content" @click="closeSidebar">
    <p class="brand">Employee Management System</p>

    <!-- Hamburger Icon (Always Visible) -->
    <div class="hamburger" @click.stop="toggleMenu">
      <span class="icon-bar"></span>
      <span class="icon-bar"></span>
      <span class="icon-bar"></span>
    </div>

    <!-- Sidebar Menu -->
    <div :class="['sidebar', { open: menuOpen }]">
      <div class="sidebar-content">
<!--        <p @click="navigateAndClose('/home')">Home</p>-->
<!--        <p @click="navigateAndClose('/clock')">Clock</p>-->
<!--        <p @click="navigateAndClose('/todo')">To Do List</p>-->
        <p @click="navigateAndClose('/survey')">Survey</p>
<!--        <p @click="navigateAndClose('/admin')">Admin</p>-->
<!--        <p @click="navigateAndClose('/surAdmin')">SurveyAdmin</p>-->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const menuOpen = ref(false)
const router = useRouter()

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const closeSidebar = (e) => {
  if (!e.target.closest('.sidebar') && !e.target.closest('.hamburger')) {
    menuOpen.value = false
  }
}

const navigateAndClose = (path) => {
  router.push(path)
  menuOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', closeSidebar)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeSidebar)
})
</script>

<style scoped>
.navbar-content {
  padding: 0.4rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  position: relative;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-height: 50px;
}

.brand {
  font-weight: bold;
  font-size: 18px;
  color: #eb804b;
  margin: 0;
}

/* Hamburger Icon */
.hamburger {
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
}

.icon-bar {
  height: 3px;
  width: 25px;
  background-color: #f26822;
  border-radius: 2px;
}

/* Sidebar */
.sidebar {
  position: fixed;
  left: -260px;
  top: 0;
  width: 250px;
  height: 100vh;
  background-color: #fff4ee;
  transition: 0.3s ease;
  z-index: 20;
  padding-top: 60px;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);
}

.sidebar.open {
  left: 0;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  padding: 10px 0;
}

.sidebar-content p {
  margin: 0 0 10px 0;
  padding: 12px 20px;
  color: #f26822;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  border-radius: 4px;
}

.sidebar-content p:hover {
  background-color: #f26822;
  color: white;
}

/* Responsive — Sidebar always triggered with hamburger */
@media (min-width: 769px) {
  .sidebar {
    width: 250px;
  }
}
</style>
