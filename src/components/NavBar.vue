<template>
  <div class="navbar-content" @click="closeSidebar">
    <p class="brand">Employee Management System</p>

    <div class="hamburger" @click.stop="toggleMenu">
      <span class="icon-bar"></span>
      <span class="icon-bar"></span>
      <span class="icon-bar"></span>
    </div>

    <div :class="['sidebar', { open: menuOpen }]">
      <div class="sidebar-content">
        <p @click="navigateAndClose('/surveys')">Survey</p>
        <p @click="logout" class="logout">Log Out</p>
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

const logout = () => {
  console.log('Logging out...');
  localStorage.removeItem('authToken');
  router.replace('/');  // Redirect to login
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
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  border-radius: 4px;
}

.sidebar-content p{
  color: #f26822;
}

.sidebar-content p:hover {
  background-color: #f26822;
  color: white;
}

.logout {
  color: #f26822;
  font-weight: bold;
  border-radius: 4px;
  text-align: center;
}

.logout:hover {
  background-color: #f26822;
}

@media (min-width: 769px) {
  .sidebar {
    width: 250px;
  }
}
</style>
