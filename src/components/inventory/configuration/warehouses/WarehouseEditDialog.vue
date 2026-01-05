<script setup>

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  sucursales: {
    type: Object,
    required: true,
  },
  warehouseSelected: {
    type: Object,
    required: true
  }
})

const emit = defineEmits([
  'update:isDialogVisible',
  'editWarehouse',
  "close",
])
const name = ref(null);
const address = ref(null);
const sucursale_id = ref(null);
const state = ref(1);
const warning = ref(null);
const error_exits = ref(null);
const success = ref(null);

const update = async() => {
  warning.value = null;
  error_exits.value = null;
  success.value = null;
  if(!name.value){
    setTimeout(() => {
      warning.value = "Se debe llenar el nombre del almacen";
    }, 50);
    return;
  }
  if(!address.value){
    setTimeout(() => {
      warning.value = "Se debe llenar la dirección del almacen";
    }, 50);
    return;
  }
  if(!sucursale_id.value){
    setTimeout(() => {
      warning.value = "Se debe seleccionar una sucursal para el almacen";
    }, 50);
    return;
  }

  let data = {
    name: name.value,
    address: address.value,
    sucursale_id: sucursale_id.value,
    state: state.value,
  }

  try {
    const resp = await $api("warehouses/"+props.warehouseSelected.id,{
      method:'PATCH',
      body: data,
      onResponseError({response}){
        error_exits.value = response._data.error;
      }
    })
    console.log(resp);
    if (resp.message == 403) {
      error_exits.value = resp.message_text;
    } else {
      success.value = "El Almacen se ha editado correctamente";
      emit("editSucursal", resp.sucursal);
      warning.value = null;
      error_exits.value = null;

      // Espera un momento para mostrar el mensaje y luego cerrar el modal
      setTimeout(() => {
        emit("update:isDialogVisible", false)
        emit("close")
      }, 1000);
    }
  } catch (error) {
    console.log(error);
  }
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

onMounted(() => {
  name.value = props.warehouseSelected.name;  
  address.value = props.warehouseSelected.address;  
  sucursale_id.value = props.warehouseSelected.sucursale_id;  
  state.value = props.warehouseSelected.state;  
})
</script>

<template>
  <VDialog
    max-width="650"
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
            Editar Almacén -> {{ props.warehouseSelected.name }}
          </h4>
        </div>

        <!-- 👉 Form -->
        <VForm
          class="mt-4"
          @submit.prevent="update"
        >
          <VRow>
            <!-- 👉 First Name -->
            <VCol
              cols="12"
            >
              <VTextField
                v-model="name"
                label="Nombre"
                placeholder="Example: Admin"
              />
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
            >
                <VTextarea
                    v-model="address"
                    label="Dirección: "
                    placeholder=""
                />

            </VCol>

            <VCol
              cols="6"
            >
                <VSelect
                    :items="props.sucursales"
                    item-title="name"
                    item-value="id"
                    v-model="sucursale_id"
                    label="Sucursal"
                    placeholder="Select Item"
                    eager
                />
            </VCol>

            <VCol
              cols="6"
            >
                <VSelect
                    :items="[
                        {
                            name: 'Activo',
                            id: 1,
                        },
                        {
                            name: 'Inactivo',
                            id: 2,
                        },
                    ]"
                    item-title="name"
                    item-value="id"
                    v-model="state"
                    label="Estado"
                    placeholder="Select Item"
                    eager
                />
            </VCol>
            <!-- 👉 Submit and Cancel -->
            <VCol
              cols="12"
              class="d-flex flex-wrap justify-center gap-4"
            >
              <VBtn type="submit">
                Editar
              </VBtn>

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
