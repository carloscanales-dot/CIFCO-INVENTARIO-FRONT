<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

/* =====================
   PAGINACIÓN
===================== */
const currentPage = ref(1)
const totalPage = ref(0)

/* =====================
   DATA
===================== */
const list_dispatches = ref([])
const deletingId = ref(null)
const isCancelDialogVisible = ref(false)
const dispatchToCancel = ref(null)

/* =====================
   FILTROS
===================== */
const search = ref(null)
const warehouse_id = ref(null)
const area_id = ref(null)
const range_date = ref(null)

/* =====================
   SELECTS
===================== */
const warehouses = ref([])
const areas = ref([])
// Áreas fijas por ID (el backend solo envía area_id como número)
const fallbackAreas = [
  { id: 1, name: 'Informática' },
  { id: 2, name: 'Recursos Humanos' },
  { id: 3, name: 'Contabilidad' },
  { id: 4, name: 'Administración' },
  { id: 5, name: 'Compras' },
  { id: 6, name: 'Logística' },
  { id: 7, name: 'Gerencia' },
  { id: 8, name: 'Operaciones' },
]
/* =====================
   LISTAR
===================== */
const list = async () => {
  const data = {
    search: search.value,
    warehouse_id: warehouse_id.value,
    area_id: area_id.value,
    start_date: range_date.value ? range_date.value.split('to')[0] : '',
    end_date: range_date.value ? range_date.value.split('to')[1] : '',
  }

  try {
    const resp = await $api(`dispatches/index?page=${currentPage.value}`, {
      method: 'POST',
      body: data,
    })

    // Manejo tolerante al formato de respuesta
    const possibleDispatches = resp?.dispatches ?? resp?.data ?? resp

    if (Array.isArray(possibleDispatches)) {
      list_dispatches.value = possibleDispatches
    } else if (possibleDispatches?.data && Array.isArray(possibleDispatches.data)) {
      list_dispatches.value = possibleDispatches.data
    } else {
      list_dispatches.value = []
    }

    totalPage.value =
      resp?.total_page ?? resp?.total_pages ?? resp?.totalPages ?? resp?.last_page ?? 1
  } catch (err) {
    console.error('Error fetching dispatches:', err)
    list_dispatches.value = []
    totalPage.value = 0
  }
}


watch(currentPage, () => list())

/* =====================
   RESET
===================== */
const reset = () => {
  search.value = null
  warehouse_id.value = null
  area_id.value = null
  range_date.value = null
  currentPage.value = 1
  list()
}

/* =====================
   CONFIG
===================== */
const config = async () => {
  const resp = await $api('dispatches/config')
  warehouses.value = resp.warehouses ?? []
  // Usar siempre fallbackAreas ya que el backend solo envía area_id como número
  areas.value = fallbackAreas
}

/* =====================
   ACCIONES
===================== */
const addDispatch = () => {
  router.push({ name: 'dispatches-add' })
}

const showDetail = dispatch => {
  router.push({
    name: 'dispatches-edit-id',
    params: { id: dispatch.id },
  })
}

const openCancelDialog = item => {
  if (!item || item.state !== 1) return
  dispatchToCancel.value = item
  isCancelDialogVisible.value = true
}

const confirmCancelDispatch = async () => {
  const item = dispatchToCancel.value
  if (!item || item.state !== 1) return

  deletingId.value = item.id

  try {
    const resp = await $api(`dispatches/${item.id}/cancel`, {
      method: 'POST',
    })

    const updated = resp?.dispatch ?? resp?.data ?? resp
    const nextState = updated?.state ?? 0

    const index = list_dispatches.value.findIndex(d => d.id === item.id)
    if (index !== -1) {
      list_dispatches.value[index] = {
        ...list_dispatches.value[index],
        state: nextState,
      }
    }
  } catch (error) {
    console.error('Error canceling dispatch:', error)
    alert('No se pudo anular la salida')
  } finally {
    deletingId.value = null
    isCancelDialogVisible.value = false
    dispatchToCancel.value = null
  }
}

// Devuelve el nombre del área basándose en el area_id numérico
const areaLabel = item => {
  if (!item) return '—'
  
  // Obtener el area_id (el backend siempre envía solo el número)
  const areaId = item.area_id ?? item.area
  if (areaId == null) return '—'

  // Buscar en fallbackAreas usando el ID
  const areaFound = fallbackAreas.find(a => a.id === Number(areaId))
  
  return areaFound?.name ?? `ID: ${areaId}`
}

onMounted(() => {
  config()
  list()
})

definePage({ meta: { permission: 'list_dispatch' } })
</script>

<template>
  <VCard title="Salidas de Almacén">
    <VCardText>
      <!-- FILTROS -->
      <VRow dense>
        <VCol cols="12" sm="6" md="3">
          <VTextField
            v-model="search"
            density="compact"
            label="N° Salida"
            @keyup.enter="list"
          />
        </VCol>

        <VCol cols="12" sm="6" md="3">
          <VSelect
            v-model="warehouse_id"
            density="compact"
            label="Almacén"
            :items="warehouses"
            item-title="name"
            item-value="id"
            clearable
          />
        </VCol>

        <VCol cols="12" sm="6" md="3">
          <VSelect
            v-model="area_id"
            density="compact"
            label="Área"
            :items="areas"
            item-title="name"
            item-value="id"
            clearable
          />
        </VCol>

        <VCol cols="12" sm="6" md="3">
          <AppDateTimePicker
            v-model="range_date"
            density="compact"
            label="Rango de fecha"
            :config="{ mode: 'range' }"
          />
        </VCol>

        <VCol cols="12" sm="6" md="3">
          <VBtn block color="primary" @click="addDispatch">
            Nueva salida
            <VIcon end icon="ri-add-line" />
          </VBtn>
        </VCol>

        <VCol cols="12" sm="6" md="3">
          <VBtn block color="info" prepend-icon="ri-search-line" @click="list">
            Buscar
          </VBtn>
        </VCol>

        <VCol cols="12" sm="6" md="3">
          <VBtn block color="secondary" prepend-icon="ri-restart-line" @click="reset">
            Limpiar
          </VBtn>
        </VCol>
      </VRow>
    </VCardText>

    <!-- TABLA -->
    <div class="table-responsive">
      <VTable density="comfortable">
        <thead>
          <tr>
            <th>#</th>
            <th>Solicitante</th>
            <th>Almacén</th>
            <th>N.º de requisición</th>
            <th>Área</th>
            <th>Usuario</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in list_dispatches" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.requester?.full_name ?? '—' }}</td>
            <td>{{ item.warehouse.name }}</td>
            <td>{{ item.requisition_number}}</td>
            <td>{{ areaLabel(item) }}</td>
            <td>{{ item.user?.full_name ?? '—' }}</td>
            <td>{{ item.date_emision }}</td>
            <td>
              <VChip
                size="small"
                :color="item.state == 1 ? 'success' : 'error'"
              >
                {{ item.state == 1 ? 'Activo' : 'Anulado' }}
              </VChip>
            </td>
            <td class="text-center">
              <div class="d-flex justify-center gap-1">
                <IconBtn size="small" @click="showDetail(item)">
                  <VIcon icon="ri-eye-line" />
                </IconBtn>
                <IconBtn
                  size="small"
                  v-if="item.state === 1 && isPermission('delete_dispatch')"
                  :disabled="deletingId === item.id"
                  @click="openCancelDialog(item)"
                >
                  <VIcon icon="ri-delete-bin-line" />
                </IconBtn>
              </div>
            </td>
          </tr>
        </tbody>
      </VTable>
    </div>

    <VDialog
      v-model="isCancelDialogVisible"
      max-width="520"
      persistent
    >
      <VCard>
        <VCardTitle>
          Confirmar anulacion
        </VCardTitle>
        <VCardText>
          Esta accion anula la salida y devuelve el stock al almacen.
          Desea continuar con la salida
          <strong>#{{ dispatchToCancel?.id }}</strong>?
        </VCardText>
        <VCardActions class="justify-end">
          <VBtn
            variant="text"
            :disabled="deletingId === dispatchToCancel?.id"
            @click="isCancelDialogVisible = false"
          >
            Cancelar
          </VBtn>
          <VBtn
            color="error"
            :loading="deletingId === dispatchToCancel?.id"
            @click="confirmCancelDispatch"
          >
            Anular salida
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- PAGINACIÓN -->
    <VCardActions class="justify-center justify-lg-end">
      <VPagination v-model="currentPage" :length="totalPage" />
    </VCardActions>
  </VCard>
</template>
