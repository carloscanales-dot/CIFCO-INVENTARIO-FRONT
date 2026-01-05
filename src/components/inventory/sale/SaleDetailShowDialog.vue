<script setup>

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  saleSelected: {
    type: Object,
    required:true,
  }
})

const emit = defineEmits([
  'update:isDialogVisible',
])
const name = ref(null);
const description = ref(null);
const state = ref(null);
const warning = ref(null);
const error_exits = ref(null);
const success = ref(null);


const onFormSubmit = () => {
  emit('update:isDialogVisible', false)
  emit('submit', userData.value)
}

const onFormReset = () => {
  emit('update:isDialogVisible', false)
}

const dialogVisibleUpdate = val => {
  emit('update:isDialogVisible', val)
}

onMounted(() => {
})
</script>

<template>
  <VDialog
    max-width="850"
    :model-value="props.isDialogVisible"
    @update:model-value="dialogVisibleUpdate"
  >
    <VCard class="pa-sm-11 pa-3">
      <!-- 👉 dialog close btn -->
      <DialogCloseBtn
        variant="text"
        size="default"
        @click="onFormReset"
      />

      <VCardText class="pt-5">
        <div class="text-center pb-6">
          <h4 class="text-h4 mb-2">
           Detallado de la Venta : {{ props.saleSelected.id }}
          </h4>
        </div>

        <!-- 👉 Form -->
        <VForm
          class="mt-4"
          @submit.prevent=""
        >
          <VRow>
            <!-- 👉 First Name -->
            <VCol
              cols="12"
            >
                <VTable>
                    <thead>
                        <tr>
                            <th class="text-uppercase">
                                Producto
                            </th>
                            <th class="text-uppercase">
                                E. Entrega
                            </th>
                            <th class="text-uppercase">
                                Unidad
                            </th>
                            <th class="text-uppercase">
                                Cantidad
                            </th>
                            <th class="text-uppercase">
                                Total
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr
                            v-for="sale_detail in props.saleSelected.sale_details"
                            :key="sale_detail.id"
                        >
                            <td>
                                <div class="d-flex align-center">
                                    <VAvatar
                                        size="32"
                                        :color="sale_detail.product.imagen ? '' : 'primary'"
                                        :class="sale_detail.product.imagen ? '' : 'v-avatar-light-bg primary--text'"
                                        :variant="!sale_detail.product.imagen ? 'tonal' : undefined"
                                    >
                                    <VImg
                                        :src="sale_detail.product.imagen"
                                    />
                                    </VAvatar>
                                    <div class="d-flex ms-3">
                                        {{ sale_detail.product.title }}
                                    </div>
                                </div>
                            </td>
                            <td>
                                <VChip color="error" v-if="sale_detail.state_attention == 1">
                                    Pendiente
                                </VChip>
                                <VChip color="warning" v-if="sale_detail.state_attention == 2">
                                    Parcial
                                </VChip>
                                <VChip color="primary" v-if="sale_detail.state_attention == 3">
                                    Completo
                                </VChip>
                            </td>
                            <td>
                                {{ sale_detail.unit.name }}
                            </td>
                            <td>
                                {{ sale_detail.quantity }}
                            </td>
                            <td style="text-wrap-mode: nowrap;">
                                  $. {{ sale_detail.total }}
                            </td>
                        </tr>
                    </tbody>
                </VTable>
            </VCol>

            <VCol
              cols="12"
              v-if="warning"
            >
              <VAlert
                closable
                close-label="Close Alert"
                color="warning"
              >
              {{ warning }}
              </VAlert>
            </VCol>
            <VCol
              cols="12"
              v-if="error_exits"
            >
              <VAlert
                closable
                close-label="Close Alert"
                color="error"
              >
              {{ error_exits }}
              </VAlert>
            </VCol>
            <VCol
              cols="12"
              v-if="success"
            >
              <VAlert
                closable
                close-label="Close Alert"
                color="success"
              >
              {{ success }}
              </VAlert>
            </VCol>

            <VCol
              cols="12"
              class="d-flex flex-wrap justify-center gap-4"
            >
              <VBtn
                color="secondary"
                variant="outlined"
                @click="onFormReset"
              >
                Cancelar
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
