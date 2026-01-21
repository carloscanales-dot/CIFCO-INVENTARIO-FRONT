<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { $api } from '@/utils/api'
import avatar1 from '@images/avatars/avatar-1.png'

const userProfileList = [
  /*{ type: 'divider' },
  {
    type: 'navItem',
    icon: 'ri-user-line',
    title: 'Profile',
    href: '#',
  },
  {
    type: 'navItem',
    icon: 'ri-settings-4-line',
    title: 'Settings',
    href: '#',
  },
  {
    type: 'navItem',
    icon: 'ri-file-text-line',
    title: 'Billing Plan',
    href: '#',
    chipsProps: {
      color: 'error',
      text: '4',
      size: 'small',
    },
  },
  { type: 'divider' },
  {
    type: 'navItem',
    icon: 'ri-money-dollar-circle-line',
    title: 'Pricing',
    href: '#',
  },
  {
    type: 'navItem',
    icon: 'ri-question-line',
    title: 'FAQ',
    href: '#',
  },*/
]

const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
const router = useRouter();
const logout = async() => {
  console.log('🔴 Frontend: Iniciando logout...');
  
  // Obtener el token ANTES de hacer nada
  const token = localStorage.getItem("token");
  console.log('🔑 Token obtenido:', token?.substring(0, 20) + '...');
  console.log('👤 Usuario actual:', user?.email);
  
  if (!token) {
    console.warn('⚠️ No hay token, limpiando y redirigiendo...');
    localStorage.clear();
    await router.push('/login');
    return;
  }
  
  try {
    // Usar fetch nativo para evitar la validación de token expirado
    console.log('📡 Enviando petición al backend con fetch...');
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    
    const response = await fetch(`${baseURL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    console.log('📬 Respuesta recibida:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Respuesta del backend:', data);
      console.log('✅ Logout exitoso - Sesión cerrada en BD');
    } else {
      console.warn('⚠️ Respuesta no OK:', response.status);
    }
    
    // Esperar un momento para asegurar que la BD se actualizó
    console.log('⏳ Esperando confirmación de BD...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
  } catch (error) {
    console.error('❌ Error al cerrar sesión:', error);
    console.error('❌ Error detallado:', error.message);
  }
  
  // Solo después de que el backend termine, limpiar localStorage
  console.log('🧹 Backend procesado - Limpiando localStorage...');
  localStorage.removeItem("user");
  localStorage.removeItem("token");

  console.log('🔄 Redirigiendo al login...');
  await router.push('/login');
  
  // Recargar después de redirigir
  setTimeout(() => {
    window.location.reload();
  }, 100);
}
</script>

<template>
  <VBadge
    dot
    bordered
    location="bottom right"
    offset-x="2"
    offset-y="2"
    color="success"
    class="user-profile-badge"
  >
    <VAvatar
      class="cursor-pointer"
      size="38"
    >
      <VImg :src="user && user.avatar ? user.avatar : avatar1" />

      <!-- SECTION Menu -->
      <VMenu
        activator="parent"
        width="230"
        location="bottom end"
        offset="15px"
      >
        <VList>
          <VListItem class="px-4">
            <div class="d-flex gap-x-2 align-center" v-if="user">
              <VAvatar>
                <VImg :src="user.avatar ? user.avatar : avatar1" />
              </VAvatar>

              <div>
                <div class="text-body-2 font-weight-medium text-high-emphasis">
                  {{ user.full_name }}
                </div>
                <div class="text-capitalize text-caption text-disabled">
                  {{ user.role.name }}
                </div>
              </div>
            </div>
          </VListItem>

          <PerfectScrollbar :options="{ wheelPropagation: false }">
            <template
              v-for="item in userProfileList"
              :key="item.title"
            >
              <VListItem
                v-if="item.type === 'navItem'"
                :href="item.href"
                class="px-4"
              >
                <template #prepend>
                  <VIcon
                    :icon="item.icon"
                    size="22"
                  />
                </template>

                <VListItemTitle>{{ item.title }}</VListItemTitle>

                <template
                  v-if="item.chipsProps"
                  #append
                >
                  <VChip
                    v-bind="item.chipsProps"
                    variant="elevated"
                  />
                </template>
              </VListItem>

              <VDivider
                v-else
                class="my-1"
              />
            </template>

            <VListItem class="px-4">
              <VBtn
                block
                color="error"
                size="small"
                append-icon="ri-logout-box-r-line"
                @click="logout"
              >
                Salir
              </VBtn>
            </VListItem>
          </PerfectScrollbar>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>

<style lang="scss">
.user-profile-badge {
  &.v-badge--bordered.v-badge--dot .v-badge__badge::after {
    color: rgb(var(--v-theme-background));
  }
}
</style>
