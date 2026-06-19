<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

/* =====================
   ESTADO
===================== */
const loading = ref(false)
const success_message = ref(null)

/* =====================
   CAMPOS
===================== */
const date_emision = ref(null)
const date_document = ref(null)
const warehouse_id = ref(null)
const warehouses = ref([])

const requester = ref(null)
const requisition_number = ref(null)
const area_id = ref(null)
const reference = ref(null)
const description = ref(null)

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

const dispatch_details = ref([])

/* =====================
   CONFIG
===================== */
const config = async () => {
  const resp = await $api('dispatches/config')
  warehouses.value = resp.warehouses ?? []
}

/* =====================
   CARGAR SALIDA
===================== */
const show = async () => {
  loading.value = true
  try {
    const resp = await $api(`dispatches/${route.params.id}`)
    const d = resp.dispatch

    date_emision.value = d.date_emision ?? null
    date_document.value = d.date_document ?? null
    warehouse_id.value = d.warehouse_id ?? null
    requester.value = d.requester?.full_name ?? ''
    requisition_number.value = d.requisition_number ?? null
    area_id.value = d.area_id ?? null
    reference.value = d.reference ?? null
    description.value = d.description ?? null
    dispatch_details.value = d.details ?? []
  } catch (e) {
    console.error(e)
    alert('No se pudo cargar la salida')
    router.push({ name: 'dispatches-list' })
  } finally {
    loading.value = false
  }
}

/* =====================
   ACTUALIZAR
===================== */
const update = async () => {
  try {
    await $api(`dispatches/${route.params.id}`, {
      method: 'PATCH',
      body: {
        warehouse_id: warehouse_id.value,
        requisition_number: requisition_number.value,
        area_id: area_id.value,
        reference: reference.value,
        date_emision: date_emision.value,
        date_document: date_document.value,
        description: description.value,
        details: dispatch_details.value,
      },
    })

    success_message.value = 'Salida actualizada correctamente'
  } catch (e) {
    console.error(e)
    alert('Error al actualizar')
  }
}

onMounted(() => {
  config()
  show()
})

definePage({ meta: { permission: 'edit_dispatch' } })
</script>


<template>
  <VCard>
    <VCardTitle>
      Salida #{{ route.params.id }}
    </VCardTitle>

    <VCardText>
      <VRow dense>
        <VCol cols="12" md="4">
          <AppDateTimePicker v-model="date_emision" label="Fecha emisión" />
        </VCol>

        <VCol cols="12" sm="12" md="4">
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
            :model-value="requester"
            label="Solicitante"
            readonly
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

        <!-- <VCol cols="12">
          <VTextarea v-model="description" label="Descripción" />
        </VCol> -->
      </VRow>
    </VCardText>
  </VCard>

  <!-- DETALLES -->
  <VCard class="mt-4">
    <VTable>
      <thead>
        <tr>
          <th>SKU</th>
          <th>Producto</th>
          <th>Unidad</th>
          <th>Cantidad</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(d, i) in dispatch_details" :key="i">
          <td>{{ d.product.sku }}</td>
          <td>{{ d.product.title }}</td>
          <td>{{ d.unit.name }}</td>
          <td>{{ d.quantity }}</td>
        </tr>
      </tbody>
    </VTable>

    <VCardText>
      <VAlert
        v-if="success_message"
        type="success"
        closable
        @close="success_message = null"
      >
        {{ success_message }}
      </VAlert>

      <VBtn block color="primary" @click="update">
        Actualizar Salida
      </VBtn>
    </VCardText>
  </VCard>
</template>


<style scoped>
.table-responsive {
  overflow-x: auto;
}
</style>
