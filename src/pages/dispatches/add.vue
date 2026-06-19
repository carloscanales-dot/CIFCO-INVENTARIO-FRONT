<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

/* =====================
   ESTADO GENERAL
===================== */
const isClientSearchDialogVisible = ref(false)
const isClientFinalAddDialogVisible = ref(false)
const isClientCompanyAddDialogVisible = ref(false)
const isConfigLoaded = ref(false)

const date_emision = ref(null)
const date_document = ref(null)
const description = ref(null)

const warehouses = ref([])
const warehouse_id = ref(null)

const search_client = ref(null)
const list_clients = ref([])
const client_selected = ref(null)
const warning_client = ref(null)

/* =====================
   CAMPOS DE SALIDA
===================== */
const requisition_number = ref(null)
const area_id = ref(null)
const areas = ref([
  { id: 1, name: 'Informática' },
  { id: 2, name: 'Recursos Humanos' },
  { id: 3, name: 'Contabilidad' },
  { id: 4, name: 'Administración' },
  { id: 5, name: 'Compras' },
  { id: 6, name: 'Logística' },
  { id: 7, name: 'Gerencia' },
  { id: 8, name: 'Operaciones' },
])

const reference = ref(null)

/* =====================
   PRODUCTOS
===================== */
const loading = ref(false)
const search_product = ref(null)
const select_product = ref(null)
const items = ref([])

const units = ref([])
const unit_id = ref(null)
const quantity = ref(0)

const dispatch_details = ref([])

const warning_warehouse = ref(null)
const warning_client_product = ref(null)
const warning_product_search = ref(null)

let searchTimeout = null

/* =====================
   CONFIG
===================== */
const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const config = async () => {
  try {
    const resp = await $api('dispatches/config')
    date_emision.value = resp.today ?? getTodayDate()
    warehouses.value = resp.warehouses ?? []
    isConfigLoaded.value = true
  } catch (error) {
    console.error('Error cargando configuración:', error)
    date_emision.value = getTodayDate()
    warehouses.value = []
    isConfigLoaded.value = true
  }
}

/* =====================
   BUSCAR CLIENTE
===================== */
const searchClient = async () => {
  warning_client.value = null
  const resp = await $api(
    `dispatches/search_client?search=${search_client.value ?? ''}`
  )

  list_clients.value = resp.clients

  if (list_clients.value.length === 1) {
    selectedClient(list_clients.value[0])
  } else if (list_clients.value.length === 0) {
    warning_client.value = 'No se encontraron resultados'
  } else {
    isClientSearchDialogVisible.value = true
  }
}

const selectedClient = client => {
  client_selected.value = client
  search_client.value = client.full_name
}

/* =====================
   BUSCAR PRODUCTO
===================== */
watch(search_product, async query => {
  warning_warehouse.value = null
  warning_client_product.value = null
  warning_product_search.value = null

  // Cancelar búsqueda anterior si existe
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  if (!warehouse_id.value) {
    warning_warehouse.value = 'Seleccione un almacén primero'
    return
  }

  if (!client_selected.value) {
    warning_client_product.value = 'Seleccione un solicitante primero'
    return
  }

  // Requiere al menos 3 caracteres para buscar SKU
  if (!query || query.length < 3) {
    items.value = []
    return
  }

  // Debounce: esperar 500ms antes de buscar
  searchTimeout = setTimeout(async () => {
    loading.value = true
    try {
      const resp = await $api(`dispatches/search_product?search=${query}`)
      items.value = resp.products?.data ?? resp.products ?? []
      
      if (items.value.length === 0) {
        warning_product_search.value = 'No se encontraron productos con ese SKU'
      }
    } catch (error) {
      console.error('Error buscando producto:', error)
      warning_product_search.value = 'Error al buscar producto. Intente nuevamente.'
      items.value = []
    } finally {
      loading.value = false
    }
  }, 500)
})

watch(select_product, value => {
  if (!value) return

  units.value = value.warehouses
    .filter(w => w.warehouse_id === warehouse_id.value)
    .map(w => ({
      id: w.unit_id,
      name: w.unit.name,
    }))

  unit_id.value = null
  quantity.value = 0
})

/* =====================
   AGREGAR PRODUCTO
===================== */
const addProduct = () => {
  warning_warehouse.value = null

  if (!unit_id.value) {
    warning_warehouse.value = 'Seleccione una unidad'
    return
  }

  if (!quantity.value || quantity.value <= 0) {
    warning_warehouse.value = 'Ingrese una cantidad válida'
    return
  }

  const unit = units.value.find(u => u.id === unit_id.value)

  const exists = dispatch_details.value.find(
    d =>
      d.product.id === select_product.value.id &&
      d.unit_id === unit_id.value
  )

  if (exists) {
    warning_warehouse.value = 'Este producto ya fue agregado'
    return
  }

  dispatch_details.value.push({
    product: select_product.value,
    product_id: select_product.value.id,
    unit_id: unit_id.value,
    unit,
    warehouse_id: warehouse_id.value,
    quantity: quantity.value,
  })

  select_product.value = null
  unit_id.value = null
  quantity.value = 0
}

/* =====================
   ELIMINAR DETALLE
===================== */
const deleteDetail = index => {
  dispatch_details.value.splice(index, 1)
}

/* =====================
   GUARDAR SALIDA
===================== */
const store = async () => {
  if (!warehouse_id.value) {
    alert('Seleccione un almacén')
    return
  }

  if (!client_selected.value) {
    alert('Seleccione un solicitante')
    return
  }

  if (dispatch_details.value.length === 0) {
    alert('Agregue al menos un producto')
    return
  }

  try {
    const payload = {
      warehouse_id: warehouse_id.value,
      requester_id: client_selected.value.id,
      requisition_number: requisition_number.value,
      area_id: area_id.value,
      reference: reference.value,
      date_emision: date_emision.value,
      date_document: date_document.value,
      description: description.value,
      details: dispatch_details.value,
    }

    await $api('dispatches', {
      method: 'POST',
      body: payload,
    })

    alert('Salida registrada correctamente')

    dispatch_details.value = []
    description.value = null
  } catch (error) {
    console.error('❌ Error al registrar salida:', error)
    
    // Mostrar errores de validación si existen
    if (error.data?.errors) {
      const errors = Object.entries(error.data.errors)
        .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
        .join('\n')
      alert(`Error de validación:\n\n${errors}`)
    } else if (error.data?.message) {
      alert(`Error: ${error.data.message}`)
    } else {
      alert('Error al registrar la salida. Por favor, revise los datos e intente nuevamente.')
    }
  }
}

onMounted(config)

onUnmounted(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})
</script>

<template>
  <!-- TÍTULO -->
  <div class="d-flex flex-wrap justify-space-between gap-4 mb-6">
    <div class="d-flex flex-column justify-center">
      <h4 class="text-h4 mb-1">
        Agregar Salida
      </h4>
    </div>
  </div>

  <div v-if="!isConfigLoaded" class="text-center pa-4">
    <VProgressCircular indeterminate color="primary" />
    <p class="mt-2">Cargando...</p>
  </div>

  <template v-else>
    <VCard>
      <VCardText>
        <VRow dense>
          <VCol cols="12" md="4">
            <AppDateTimePicker v-model="date_emision" label="Fecha emisión" />
          </VCol>

          <VCol cols="12"  md="4">
            <AppDateTimePicker v-model="date_document" label="Fecha documento de recepción"
              placeholder="Seleccionar fecha" />
          </VCol>

          <VCol cols="12" md="4">
          <VSelect
            v-model="warehouse_id"
            :items="warehouses"
            item-title="name"
            item-value="id"
            label="Almacén"
          />
        </VCol>

        <VCol cols="12" md="4">
          <VTextField
            v-model="search_client"
            label="Solicitante"
            @keyup.enter="searchClient"
          />
        </VCol>

        <VCol cols="12" md="4">
          <VTextField v-model="requisition_number" label="N° Requisición" />
        </VCol>

        <VCol cols="12" md="4">
          <VSelect
            v-model="area_id"
            :items="areas"
            item-title="name"
            item-value="id"
            label="Área"
          />
        </VCol>

        <VCol cols="12" md="4">
          <VTextField v-model="reference" label="Referencia" />
        </VCol>
      </VRow>
    </VCardText>
  </VCard>

  <VCard class="mt-4">
    <VCardText>
      <VRow dense>
        <VCol cols="12" md="6">
          <VAutocomplete
            v-model="select_product"
            v-model:search="search_product"
            :items="items"
            :loading="loading"
            item-title="sku"
            return-object
            label="Producto (SKU)"
            placeholder="Escriba al menos 5 caracteres"
            clearable
          />
          
          <VAlert
            v-if="warning_warehouse"
            type="warning"
            density="compact"
            class="mt-2"
          >
            {{ warning_warehouse }}
          </VAlert>
          
          <VAlert
            v-if="warning_client_product"
            type="warning"
            density="compact"
            class="mt-2"
          >
            {{ warning_client_product }}
          </VAlert>
          
          <VAlert
            v-if="warning_product_search"
            type="info"
            density="compact"
            class="mt-2"
          >
            {{ warning_product_search }}
          </VAlert>
        </VCol>

        <VCol cols="12" md="3">
          <VSelect
            v-model="unit_id"
            :items="units"
            item-title="name"
            item-value="id"
            label="Unidad"
          />
        </VCol>

        <VCol cols="12" md="2">
          <VTextField v-model="quantity" type="number" label="Cantidad" />
        </VCol>

        <VCol cols="12" md="1">
          <VBtn color="primary" @click="addProduct">+</VBtn>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>

  <VCard class="mt-4">
    <VTable>
      <thead>
        <tr>
          <th>SKU</th>
          <th>Producto</th>
          <th>Unidad</th>
          <th>Cantidad</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(d, i) in dispatch_details" :key="i">
          <td>{{ d.product.sku }}</td>
          <td>{{ d.product.title }}</td>
          <td>{{ d.unit.name }}</td>
          <td>{{ d.quantity }}</td>
          <td>
            <VBtn icon @click="deleteDetail(i)">🗑</VBtn>
          </td>
        </tr>
      </tbody>
    </VTable>

    <VCardText>
      <VBtn block color="primary" @click="store">
        Registrar Salida
      </VBtn>
    </VCardText>
  </VCard>
  </template>
</template>

<style scoped>
.custom-radio-icon {
    padding: 0.2rem !important;
}

.text-medium-emphasis {
    display: none;
}

.table-responsive {
    overflow-x: auto;
}

.summary-row {
    display: flex;
    justify-content: space-between;
}

.summary-row.total {
    font-size: 1rem;
}

.table-responsive {
    overflow-x: auto;
}
</style>

<style>
/* Mejorar visibilidad del texto resaltado en autocomplete - estilos globales */
.v-autocomplete .v-list-item-title mark,
.v-autocomplete mark,
.v-select mark,
.v-menu mark {
    background-color: #90caf9 !important;
    color: #000000 !important;
    font-weight: 500 !important;
    padding: 0 2px;
}

.v-list-item--active mark {
    background-color: #64b5f6 !important;
    color: #ffffff !important;
}
</style>
