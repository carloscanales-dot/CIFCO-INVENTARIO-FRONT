<script setup>
import { $api } from '@/utils/api';

// Estados reactivos
const sessions = ref([]);
const stats = ref(null);
const loading = ref(false);
const loadingStats = ref(false);
const searchQuery = ref('');
const statusFilter = ref('all');
const page = ref(1);
const perPage = ref(15);
const totalSessions = ref(0);

// Diálogo para confirmar cierre de sesión
const confirmCloseDialog = ref(false);
const sessionToClose = ref(null);

// Opciones de filtro
const statusOptions = [
  { title: 'Todas las sesiones', value: 'all' },
  { title: 'Solo activas', value: 'active' },
  { title: 'Solo inactivas', value: 'inactive' },
];

// Headers de la tabla
const headers = [
  { title: 'ID', key: 'id', sortable: false },
  { title: 'Usuario', key: 'user', sortable: false },
  { title: 'IP Address', key: 'ip_address', sortable: false },
  { title: 'Dispositivo', key: 'device_type', sortable: false },
  { title: 'Navegador', key: 'browser', sortable: false },
  { title: 'Plataforma', key: 'platform', sortable: false },
  { title: 'Inicio de Sesión', key: 'login_at', sortable: false },
  { title: 'Estado', key: 'is_active', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false },
];

// Obtener lista de sesiones
const fetchSessions = async () => {
  try {
    loading.value = true;
    
    // Construir parámetros de consulta
    const params = new URLSearchParams({
      page: page.value,
      per_page: perPage.value,
    });

    if (searchQuery.value) {
      params.append('search', searchQuery.value);
    }

    if (statusFilter.value === 'active') {
      params.append('status', 'active');
    } else if (statusFilter.value === 'inactive') {
      params.append('status', 'inactive');
    }

    const resp = await $api(`user-sessions?${params.toString()}`, {
      method: 'GET',
      onResponseError({ response }) {
        console.error('Error al obtener sesiones:', response._data);
      },
    });

    console.log('📊 Sesiones obtenidas:', resp);
    console.log('📊 Total de sesiones:', resp.data?.length);
    
    // Log detallado de cada sesión
    resp.data?.forEach((session, index) => {
      console.log(`   ${index + 1}. Usuario: ${session.user?.name} (ID: ${session.user?.id})`);
      console.log(`      Estado: ${session.is_active ? '🟢 ACTIVA' : '🔴 INACTIVA'}`);
      console.log(`      Login: ${session.login_at}`);
      console.log(`      Logout: ${session.logout_at || 'N/A'}`);
      console.log(`      ---`);
    });
    
    sessions.value = resp.data || [];
    totalSessions.value = resp.meta?.total || 0;
  } catch (error) {
    console.error('Error al cargar sesiones:', error);
  } finally {
    loading.value = false;
  }
};

// Obtener estadísticas
const fetchStats = async () => {
  try {
    loadingStats.value = true;
    const resp = await $api('user-sessions/stats', {
      method: 'GET',
      onResponseError({ response }) {
        console.error('Error al obtener estadísticas:', response._data);
      },
    });

    console.log('Estadísticas obtenidas:', resp);
    stats.value = resp;
  } catch (error) {
    console.error('Error al cargar estadísticas:', error);
  } finally {
    loadingStats.value = false;
  }
};

// Cerrar sesión manualmente
const openCloseConfirmation = (session) => {
  sessionToClose.value = session;
  confirmCloseDialog.value = true;
};

const closeSession = async () => {
  if (!sessionToClose.value) return;

  try {
    const resp = await $api(`user-sessions/${sessionToClose.value.id}/close`, {
      method: 'PUT',
      onResponseError({ response }) {
        console.error('Error al cerrar sesión:', response._data);
      },
    });

    console.log('Sesión cerrada:', resp);
    
    // Actualizar la lista
    fetchSessions();
    fetchStats();
    
    // Cerrar diálogo
    confirmCloseDialog.value = false;
    sessionToClose.value = null;
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
};

// Formatear fecha con zona horaria de El Salvador (UTC-6)
const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('es-SV', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/El_Salvador',
  });
};

// Obtener iniciales del avatar
const avatarText = (value) => {
  if (!value) return '';
  const nameArray = value.split(' ');
  return nameArray.map(word => word.charAt(0).toUpperCase()).join('');
};

// Obtener color del chip según el dispositivo
const getDeviceColor = (deviceType) => {
  const colors = {
    desktop: 'primary',
    mobile: 'success',
    tablet: 'warning',
  };
  return colors[deviceType] || 'secondary';
};

// Obtener icono según el navegador
const getBrowserIcon = (browser) => {
  const icons = {
    Chrome: 'ri-chrome-line',
    Firefox: 'ri-firefox-line',
    Safari: 'ri-safari-line',
    Edge: 'ri-edge-line',
    Opera: 'ri-opera-line',
  };
  return icons[browser] || 'ri-global-line';
};

// Watchers para búsqueda y filtros
watch([searchQuery, statusFilter], () => {
  page.value = 1;
  fetchSessions();
});

// Cargar datos al montar
onMounted(() => {
  fetchSessions();
  fetchStats();
});

// Definir permisos de la página
definePage({ 
  meta: { 
    permission: 'list_user', // Puedes cambiar esto a un permiso específico como 'view_sessions'
  } 
});
</script>

<template>
  <div>
    <!-- Estadísticas -->
    <VRow class="mb-6">
      <VCol cols="12" md="3">
        <VCard>
          <VCardText>
            <div class="d-flex align-center">
              <VAvatar size="44" color="primary" variant="tonal" rounded class="me-3">
                <VIcon icon="ri-user-line" size="26" />
              </VAvatar>
              <div>
                <p class="text-sm mb-0">Sesiones Activas</p>
                <h3 class="text-h5">
                  <VSkeletonLoader v-if="loadingStats" type="text" width="50" />
                  <span v-else>{{ stats?.active_sessions || 0 }}</span>
                </h3>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" md="3">
        <VCard>
          <VCardText>
            <div class="d-flex align-center">
              <VAvatar size="44" color="success" variant="tonal" rounded class="me-3">
                <VIcon icon="ri-calendar-line" size="26" />
              </VAvatar>
              <div>
                <p class="text-sm mb-0">Hoy</p>
                <h3 class="text-h5">
                  <VSkeletonLoader v-if="loadingStats" type="text" width="50" />
                  <span v-else>{{ stats?.today_logins || 0 }}</span>
                </h3>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" md="3">
        <VCard>
          <VCardText>
            <div class="d-flex align-center">
              <VAvatar size="44" color="warning" variant="tonal" rounded class="me-3">
                <VIcon icon="ri-calendar-event-line" size="26" />
              </VAvatar>
              <div>
                <p class="text-sm mb-0">Esta Semana</p>
                <h3 class="text-h5">
                  <VSkeletonLoader v-if="loadingStats" type="text" width="50" />
                  <span v-else>{{ stats?.week_logins || 0 }}</span>
                </h3>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" md="3">
        <VCard>
          <VCardText>
            <div class="d-flex align-center">
              <VAvatar size="44" color="info" variant="tonal" rounded class="me-3">
                <VIcon icon="ri-calendar-check-line" size="26" />
              </VAvatar>
              <div>
                <p class="text-sm mb-0">Este Mes</p>
                <h3 class="text-h5">
                  <VSkeletonLoader v-if="loadingStats" type="text" width="50" />
                  <span v-else>{{ stats?.month_logins || 0 }}</span>
                </h3>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Gráficas de estadísticas -->
    <VRow class="mb-6" v-if="stats">
      <VCol cols="12" md="4">
        <VCard>
          <VCardText>
            <h4 class="text-h6 mb-4">Navegadores Más Usados</h4>
            <div v-if="loadingStats" class="text-center py-6">
              <VProgressCircular indeterminate color="primary" />
            </div>
            <div v-else>
              <div 
                v-for="(browser, index) in stats.top_browsers?.slice(0, 5)" 
                :key="index"
                class="d-flex align-center justify-space-between mb-3"
              >
                <div class="d-flex align-center">
                  <VIcon :icon="getBrowserIcon(browser.browser)" class="me-2" />
                  <span>{{ browser.browser }}</span>
                </div>
                <VChip size="small" color="primary">{{ browser.count }}</VChip>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" md="4">
        <VCard>
          <VCardText>
            <h4 class="text-h6 mb-4">Plataformas</h4>
            <div v-if="loadingStats" class="text-center py-6">
              <VProgressCircular indeterminate color="primary" />
            </div>
            <div v-else>
              <div 
                v-for="(platform, index) in stats.top_platforms?.slice(0, 5)" 
                :key="index"
                class="d-flex align-center justify-space-between mb-3"
              >
                <div class="d-flex align-center">
                  <VIcon icon="ri-computer-line" class="me-2" />
                  <span>{{ platform.platform }}</span>
                </div>
                <VChip size="small" color="success">{{ platform.count }}</VChip>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" md="4">
        <VCard>
          <VCardText>
            <h4 class="text-h6 mb-4">Tipos de Dispositivo</h4>
            <div v-if="loadingStats" class="text-center py-6">
              <VProgressCircular indeterminate color="primary" />
            </div>
            <div v-else>
              <div 
                v-for="(device, index) in stats.device_types" 
                :key="index"
                class="d-flex align-center justify-space-between mb-3"
              >
                <div class="d-flex align-center">
                  <VIcon 
                    :icon="device.device_type === 'desktop' ? 'ri-computer-line' : device.device_type === 'mobile' ? 'ri-smartphone-line' : 'ri-tablet-line'" 
                    class="me-2" 
                  />
                  <span class="text-capitalize">{{ device.device_type }}</span>
                </div>
                <VChip size="small" :color="getDeviceColor(device.device_type)">
                  {{ device.count }}
                </VChip>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Tabla de sesiones -->
    <VCard title="Sesiones de Usuarios">
      <VCardText>
        <VRow class="mb-4">
          <VCol cols="12" md="6">
            <VTextField
              v-model="searchQuery"
              placeholder="Buscar por nombre o email..."
              density="compact"
              prepend-inner-icon="ri-search-line"
              clearable
            />
          </VCol>
          <VCol cols="12" md="3">
            <VSelect
              v-model="statusFilter"
              :items="statusOptions"
              density="compact"
              label="Filtrar por estado"
            />
          </VCol>
          <VCol cols="12" md="3" class="d-flex align-center justify-end">
            <VBtn
              prepend-icon="ri-refresh-line"
              @click="() => { fetchSessions(); fetchStats(); }"
              :loading="loading"
            >
              Actualizar
            </VBtn>
          </VCol>
        </VRow>

        <VDataTable
          :headers="headers"
          :items="sessions"
          :loading="loading"
          :items-per-page="perPage"
          hide-default-footer
        >
          <!-- Usuario -->
          <template #item.user="{ item }">
            <div class="d-flex align-center py-2">
              <div>
                <div class="font-weight-medium">{{ item.user?.name }}</div>
                <div class="text-caption text-medium-emphasis">{{ item.user?.email }}</div>
              </div>
            </div>
          </template>

          <!-- Dispositivo -->
          <template #item.device_type="{ item }">
            <VChip
              size="small"
              :color="getDeviceColor(item.device_type)"
              class="text-capitalize"
            >
              {{ item.device_type }}
            </VChip>
          </template>

          <!-- Navegador -->
          <template #item.browser="{ item }">
            <div class="d-flex align-center">
              <VIcon :icon="getBrowserIcon(item.browser)" class="me-2" size="20" />
              <span>{{ item.browser }}</span>
            </div>
          </template>

          <!-- Fecha de inicio -->
          <template #item.login_at="{ item }">
            <div>
              <div>{{ formatDate(item.login_at) }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.duration }}</div>
            </div>
          </template>

          <!-- Estado -->
          <template #item.is_active="{ item }">
            <VChip
              :color="item.is_active ? 'success' : 'error'"
              size="small"
            >
              {{ item.is_active ? 'Activa' : 'Inactiva' }}
            </VChip>
          </template>

          <!-- Acciones -->
          <template #item.actions="{ item }">
            <VBtn
              v-if="item.is_active"
              icon
              size="small"
              variant="text"
              color="error"
              @click="openCloseConfirmation(item)"
            >
              <VIcon icon="ri-logout-box-line" />
              <VTooltip activator="parent" location="top">
                Cerrar Sesión
              </VTooltip>
            </VBtn>
            <span v-else class="text-caption text-medium-emphasis">-</span>
          </template>

          <!-- Loading -->
          <template #loading>
            <div class="text-center py-6">
              <VProgressCircular indeterminate color="primary" />
            </div>
          </template>

          <!-- Sin resultados -->
          <template #no-data>
            <div class="text-center py-6">
              <VIcon icon="ri-file-list-line" size="48" class="mb-2" />
              <p>No se encontraron sesiones</p>
            </div>
          </template>
        </VDataTable>

        <!-- Paginación -->
        <VRow class="mt-4" v-if="totalSessions > perPage">
          <VCol cols="12" class="d-flex justify-center">
            <VPagination
              v-model="page"
              :length="Math.ceil(totalSessions / perPage)"
              @update:modelValue="fetchSessions"
              total-visible="7"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Diálogo de confirmación para cerrar sesión -->
    <VDialog
      v-model="confirmCloseDialog"
      max-width="500"
    >
      <VCard>
        <VCardTitle class="d-flex align-center">
          <VIcon icon="ri-error-warning-line" color="warning" class="me-2" />
          Confirmar Cierre de Sesión
        </VCardTitle>
        <VCardText>
          <p>¿Estás seguro de que deseas cerrar esta sesión?</p>
          <div v-if="sessionToClose" class="mt-4 pa-3 bg-surface rounded">
            <div class="d-flex align-center mb-2">
              <VAvatar size="32" class="me-2">
                {{ avatarText(sessionToClose.user?.name) }}
              </VAvatar>
              <div>
                <div class="font-weight-medium">{{ sessionToClose.user?.name }}</div>
                <div class="text-caption">{{ sessionToClose.user?.email }}</div>
              </div>
            </div>
            <div class="text-caption">
              <div><strong>IP:</strong> {{ sessionToClose.ip_address }}</div>
              <div><strong>Dispositivo:</strong> {{ sessionToClose.device_type }}</div>
              <div><strong>Navegador:</strong> {{ sessionToClose.browser }}</div>
            </div>
          </div>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            variant="outlined"
            @click="confirmCloseDialog = false"
          >
            Cancelar
          </VBtn>
          <VBtn
            color="error"
            @click="closeSession"
          >
            Cerrar Sesión
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped>
.text-capitalize {
  text-transform: capitalize;
}
</style>
