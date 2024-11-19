<template>
    <aside class="w-64 bg-gray-100 h-full shadow-md flex flex-col">
      <div class="p-4 text-center font-bold border-b">Logo</div>
      <nav class="flex-1 p-4 space-y-2">
        <router-link to="/calendar" class="block p-2 hover:bg-gray-200 rounded">Calendar</router-link>
        <router-link to="/profile" class="block p-2 hover:bg-gray-200 rounded">Profile</router-link>
        <router-link to="/approvals" class="block p-2 hover:bg-gray-200 rounded">Approvals</router-link>
        <router-link to="/employee" class="block p-2 hover:bg-gray-200 rounded">Employee List</router-link>
        <router-link to="/admin" class="block p-2 hover:bg-gray-200 rounded">Admin Page</router-link>
      </nav>
    </aside>
  </template>
  
  <style scoped>
  .h-full {
    height: 100vh;
  }
  </style>

  
  