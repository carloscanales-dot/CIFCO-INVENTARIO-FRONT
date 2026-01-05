<script setup>

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  listClients: {
    type: Object,
    required: true,
  }
})

const emit = defineEmits([
  'update:isDialogVisible',
  'clientSelected'
])

const warning = ref(null);
const error_exits = ref(null);
const success = ref(null);

const clientSelected = (client) => {
  console.log(client);
  emit("clientSelected",client);
  onFormReset();
}

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
            Clients
          </h4>
        </div>

        <!-- 👉 Form -->
        <VForm
          class="mt-4"
        >
          <VRow>

            <VCol
              cols="12"
            >
            <VTable>
                <thead>
                    <tr>
                        <th class="text-uppercase">
                         Cliente
                        </th>
                        <th class="text-uppercase">
                         N° Documento
                        </th>
                        <th class="text-uppercase">
                         Tipo de Cliente
                        </th>
                        <th class="text-uppercase">
                         Acción
                        </th>
                    </tr>
                </thead>
                <tbody>
                  <tr v-for="(list_client, index) in props.listClients" :key="index">
                    <td>
                      {{ list_client.full_name }}
                    </td>
                    <td>
                      {{ list_client.n_document }}
                    </td>
                    <td>
                      {{ list_client.type_client == 1 ? 'CLIENTE FINAL' : 'CLIENTE EMPRESA' }}
                    </td>
                    <td>
                      <VBtn color="primary" @click="clientSelected(list_client)">
                          <VIcon icon="ri-add-circle-line" />
                      </VBtn>
                    </td>
                  </tr>
                </tbody>
            </VTable>
            </VCol>


            <!-- 👉 First Name -->
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
            <!-- 👉 Submit and Cancel -->
            <VCol
              cols="12"
              class="d-flex flex-wrap justify-center gap-4"
            >

              <VBtn
                color="secondary"
                variant="outlined"
                @click="onFormReset"
              >
                Cancel
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
