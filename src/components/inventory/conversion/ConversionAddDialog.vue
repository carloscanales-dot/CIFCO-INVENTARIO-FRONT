<script setup>

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  warehouses: {
    type: Object,
    required:true,
  },
  units: {
    type: Object,
    required:true,
  }
})

const emit = defineEmits([
  'update:isDialogVisible',
  'update:warehouses',
  'addConversion'
])
const warehouse_id = ref(null);
const unit_start_id = ref(null);
const unit_end_id = ref(null);
const quantity_start = ref(null);
const quantity_end = ref(null);
const description = ref(null);
const warehouses = ref([]);
const units = ref([]);
const unit_conversions = ref([]);

const warning = ref(null);
const error_exits = ref(null);
const success = ref(null);

// BUSQUEDA DE PRODUCTO
const loading = ref(false)
const search_product = ref()
const select_product = ref(null)
const items = ref([]);
const warning_warehouse = ref(null);
const unit_id = ref(null);
const price_unit = ref(0);
const quantity = ref(0);
const querySelections = query => {
    loading.value = true

    // Simulated ajax query
    setTimeout(async () => {
        // items.value = states.filter(state => (state || '').toLowerCase().includes((query || '').toLowerCase()))
        try {
            const resp = await $api("sales/search_product?search="+(search_product.value ? search_product.value : ''),{
                method: 'GET',
                onResponseError({response}){
                    console.log(response._data.error);
                }
            })
            console.log(resp);
            items.value = resp.products.data;
            loading.value = false
        } catch (error) {
            console.log(error);
        }

    }, 500)
}

watch(search_product, query => {
    warning_warehouse.value = null;
    if(!warehouse_id.value){
        setTimeout(() => {
            warning_warehouse.value = "En necesario seleccionar un almacen.";
        }, 25);
        return;
    }
    if(query.length > 3){
        querySelections(query)
    }else{
        items.value = [];
    }
})
watch(select_product,value => {
    console.log(value);
    if(value){
        units.value = value.warehouses.filter((warehouse) => warehouse.warehouse_id == warehouse_id.value).map((wh) => {
            return {
                id: wh.unit_id,
                name: wh.unit.name,
            };
        });
    }
})
watch(warehouse_id,value => {
    if(select_product.value){
        units.value = select_product.value.warehouses.filter((warehouse) => warehouse.warehouse_id == value).map((wh) => {
            return {
                id: wh.unit_id,
                name: wh.unit.name,
            };
        });
        unit_start_id.value = '';
        unit_end_id.value = '';
        unit_conversions.value = [];
    }
})
watch(unit_start_id, value => {
    console.log(value);
    let UNIT_SELECTED = props.units.find((unit) => unit.id == value);
    if(UNIT_SELECTED){
        unit_conversions.value = UNIT_SELECTED.conversions;
    }
})
// FIN DE BUSQUEDA DE PRODUCTO

const store = async() => {
  warning.value = null;
  error_exits.value = null;
  success.value = null;
  if(!warehouse_id.value){
    setTimeout(() => {
      warning.value = "Es necesario seleccionar un almacen";
    }, 50);
    return;
  }

  if(!select_product.value){
    setTimeout(() => {
      warning.value = "Es necesario seleccionar un producto";
    }, 50);
    return;
  }

  if(!unit_start_id.value){
    setTimeout(() => {
      warning.value = "Es necesario seleccionar una unidad de inicio";
    }, 50);
    return;
  }

  if(!unit_end_id.value){
    setTimeout(() => {
      warning.value = "Es necesario seleccionar una unidad a convertir";
    }, 50);
    return;
  }

  if(!quantity_start.value || quantity_start.value <= 0){
    setTimeout(() => {
      warning.value = "Se necesita digitar una cantidad de inicio mayor a 0";
    }, 50);
    return;
  }
  if(!quantity_end.value){
    setTimeout(() => {
      warning.value = "Se necesita digitar una cantidad a convertir mayor a 0";
    }, 50);
    return;
  }

  if(!description.value){
    setTimeout(() => {
      warning.value = "Se debe llenar la descripción";
    }, 50);
    return;
  }

  let data = {
    warehouse_id: warehouse_id.value,
    product_id: select_product.value.id,
    unit_start_id: unit_start_id.value,
    unit_end_id: unit_end_id.value,
    quantity_start: quantity_start.value,
    quantity_end: quantity_end.value,
    description: description.value,
  }

  try {
    const resp = await $api("conversions",{
      method:'POST',
      body: data,
      onResponseError({response}){
        error_exits.value = response._data.error;
      }
    })
    console.log(resp);
    if(resp.message == 403){
      error_exits.value = resp.message_text;
    }else{
      success.value = "La conversión se ha registrado correctamente";
      emit("addConversion",resp.conversion);

      warehouse_id.value = '';
      select_product.value = null;
      search_product.value = '';
      units.value = [];
      unit_start_id.value = '';
      unit_end_id.value = '';
      quantity_start.value = 0;
      quantity_end.value = 0;
      description.value = '';

      warning.value = null;
      error_exits.value = null;
      success.value = null;
      onFormReset();
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
    warehouses.value = props.warehouses;
    console.log(props.warehouses)
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
            Add Conversión
          </h4>
        </div>

        <!-- 👉 Form -->
        <VForm
          class="mt-4"
          @submit.prevent="store"
        >
          <VRow>
            <!-- 👉 First Name -->

            <VCol cols="6">
                <VSelect
                    :items="warehouses"
                    item-title="name"
                    item-value="id"
                    placeholder="Select"
                    v-model="warehouse_id"
                    label="Almacenes"
                />
            </VCol>

            <VCol cols="12">

                <VRow>
                    <VCol cols="12">
                        <VRow>
                            <VCol cols="12">
                                <VAutocomplete
                                    v-model="select_product"
                                    v-model:search="search_product"
                                    :loading="loading"
                                    :items="items"
                                    item-title="title"
                                    item-value="id"
                                    return-object
                                    placeholder="Search for a product"
                                    label="¿Que agregamos?"
                                    variant="underlined"
                                    :menu-props="{ maxHeight: '200px' }"
                                />
                            </VCol>
                            <VCol cols="12" v-if="warning_warehouse">
                                <VAlert
                                    closable
                                    close-label="Close Alert"
                                    color="warning"
                                >
                                {{ warning_warehouse }}
                                </VAlert>
                            </VCol>
                        </VRow>
                    </VCol>
                    <VCol cols="12">
                        <VRow>
                            <VCol cols="10">
                                <VRow>
                                    <VCol cols="6">
                                        <VSelect
                                            :items="units"
                                            item-title="name"
                                            item-value="id"
                                            placeholder="Select"
                                            v-model="unit_start_id"
                                            label="Unidad de inicio"
                                        />
                                    </VCol>
                                    
                                    <VCol cols="6">
                                        <VTextField
                                            label="Cantidad"
                                            type="number"
                                            v-model="quantity_start"
                                            placeholder=""
                                        />
                                    </VCol>
                                </VRow>
                            </VCol>
                            <VCol cols="10">
                                <VRow>
                                    <VCol cols="6">
                                        <VSelect
                                            :items="unit_conversions"
                                            item-title="name"
                                            item-value="id"
                                            placeholder="Select"
                                            v-model="unit_end_id"
                                            label="Unidad a convertir"
                                        />
                                    </VCol>
                                    
                                    <VCol cols="6">
                                        <VTextField
                                            label="Cantidad"
                                            type="number"
                                            v-model="quantity_end"
                                            placeholder=""
                                        />
                                    </VCol>
                                </VRow>
                            </VCol>
                        </VRow>
                    </VCol>
                </VRow>

            </VCol>

            <VCol
              cols="12"
            >
                <VTextarea
                    v-model="description"
                    label="Descripción: "
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
                Guardar
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
