<script setup>

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  transportDetailSelected: {
    type: Object,
    required:true,
  },
  transport_id: {
    type:String,
    required:true,
  },
  warehouse_start_id:{
    type:Number,
    required:true
  }
})

const emit = defineEmits([
  'update:isDialogVisible',
  'editTransportDetail'
])

const unit_id = ref(null);
const quantity = ref(0);
const price_unit = ref(0);
const units = ref([]);
const description = ref(null);

const warning = ref(null);
const error_exits = ref(null);
const success = ref(null);

const update = async() => {
    warning.value = null;
    error_exits.value = null;
    success.value = null;
    if(!unit_id.value){
        setTimeout(() => {
        warning.value = "Necesitas seleccionar una unidad";
        },25)
        return;
    }
    if(quantity.value < 0){
        setTimeout(() => {
        warning.value = "Necesitas ingresar una cantidad mayor a 0";
        },25)
        return;
  }
    if((!price_unit.value || price_unit.value <= 0)){
        setTimeout(() => {
            warning.value = "Es necesario ingresar un precio";
        }, 25);
        return;
    }


    let data = {
        unit_id: unit_id.value,
        price_unit: price_unit.value ?? 0,
        quantity: quantity.value,
        description: description.value,
        transport_id: props.transport_id,
        total: Number((price_unit.value * quantity.value).toFixed(2))
    }

    try {
        const resp = await $api("transport_details/"+props.transportDetailSelected.id,{
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
            success.value = "El detallado de la solicitud de transporte se ha editado correctamente";
            emit("editTransportDetail",resp);
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
    unit_id.value = props.transportDetailSelected.unit_id;
    quantity.value = props.transportDetailSelected.quantity;
    price_unit.value = props.transportDetailSelected.price_unit;
    description.value = props.transportDetailSelected.description;
    // units.value = props.units;
    units.value = props.transportDetailSelected.product.warehouses.filter((warehouse) => warehouse.warehouse_id == props.warehouse_start_id).map((wh) => {
        return {
            id: wh.unit_id,
            name: wh.unit.name,
        };
    });
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
            Edit Transport Detail : {{ props.transportDetailSelected.id }}
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
                :items="units"
                item-title="name"
                item-value="id"
                placeholder="Select"
                v-model="unit_id"
                label="Unidades"
                :disabled="props.transportDetailSelected.state != 1 ? true : false"
             />
            </VCol>
            <VCol
             cols="6"
             md="6"
            >
             <VTextField
                label="Cantidad"
                type="number"
                v-model="quantity"
                :disabled="props.transportDetailSelected.state != 1 ? true : false"
                placeholder=""
             />
            </VCol>
            <VCol
                cols="4"
            >
             <VTextField
                label="Precio Unitario"
                type="number"
                v-model="price_unit"
                placeholder=""
              />
            </VCol>

            <VCol
              cols="8"
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
