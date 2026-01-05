<script setup>

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  warehouseSelected: {
    type: Object,
    required:true,
  },
  warehouses: {
    type: Object,
    required:true
  },
  units: {
    type: Object,
    required:true
  },
  product_id: {
    type: String,
    required: true,
  }
})

const emit = defineEmits([
  'update:isDialogVisible',
  'editWarehouseProduct'
])

const warehouse_id = ref(null);
const unit_id = ref(null);
const stock = ref(0);
const umbral = ref(0);
const warehouses = ref([]);
const units = ref([]);

const warning = ref(null);
const error_exits = ref(null);
const success = ref(null);

const update = async() => {
  warning.value = null;
  error_exits.value = null;
  success.value = null;
  if(!warehouse_id.value){
    setTimeout(() => {
      warning.value = "Necesitas seleccionar un almacen";
    }, 25);
    return;
  }
  if(!unit_id.value){
    setTimeout(() => {
      warning.value = "Necesitas seleccionar una unidad";
    },25)
    return;
  }
  if(stock.value < 0){
    setTimeout(() => {
      warning.value = "Necesitas ingresar un stock mayor a 0";
    },25)
    return;
  }

  let data = {
    product_id: props.product_id,
    warehouse_id: warehouse_id.value,
    unit_id: unit_id.value,
    stock: stock.value,
    umbral: umbral.value,
  }

  try {
    const resp = await $api("product-warehouse/"+props.warehouseSelected.id,{
      method:'PATCH',
      body: data,
      onResponseError({response}){
        error_exits.value = response._data.error;
      }
    })
    console.log(resp);
    if(resp.message == 403){
      error_exits.value = resp.message_text;
    }else{
      success.value = "La existencia se ha editado correctamente";
      emit("editWarehouseProduct",resp.product_warehouse);
    //   name.value = '';
    //   description.value = '';
      warning.value = null;
      error_exits.value = null;
    //   success.value = null;
    //   onFormReset();
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
    warehouse_id.value = props.warehouseSelected.warehouse_id;
    unit_id.value = props.warehouseSelected.unit_id;
    stock.value = props.warehouseSelected.stock;
    umbral.value = props.warehouseSelected.umbral;

    warehouses.value = props.warehouses;
    units.value = props.units;
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
            Editar Almacén Producto -> {{ props.warehouseSelected.id }}
          </h4>
        </div>

        <!-- 👉 Form -->
        <VForm
          class="mt-4"
          @submit.prevent="update"
        >
          <VRow>
            
            <VCol
                cols="6"
                md="6"
            >
              <VSelect
                :items="warehouses"
                item-title="name"
                item-value="id"
                placeholder="Select"
                v-model="warehouse_id"
                label="Almacenes"
              />
            </VCol>
            <VCol
             cols="6"
             md="6"
            >
             <VSelect
                :items="units"
                item-title="name"
                item-value="id"
                placeholder="Select"
                v-model="unit_id"
                label="Unidades"
             />
            </VCol>
            <VCol
             cols="6"
             md="6"
            >
             <VTextField
                label="Stock"
                type="number"
                v-model="stock"
                placeholder=""
             />
            </VCol>
            <VCol
                cols="6"
                md="6"
            >
             <VTextField
                label="Umbral"
                type="number"
                v-model="umbral"
                placeholder=""
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
                Cancel
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
