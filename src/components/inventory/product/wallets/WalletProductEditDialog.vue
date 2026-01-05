<script setup>

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  walletSelected: {
    type: Object,
    required:true,
  },
  sucursales: {
    type: Object,
    required:true
  },
  units: {
    type: Object,
    required:true
  },
  product_id:{
    type:String,
    required:true
  }
})

const emit = defineEmits([
  'update:isDialogVisible',
  'editWalletProduct'
])

const sucursale_id = ref(null);
const unit_id = ref(null);
const price = ref(0);
const type_client = ref(0);
const sucursales = ref([]);
const units = ref([]);

const warning = ref(null);
const error_exits = ref(null);
const success = ref(null);

const update = async() => {
  warning.value = null;
  error_exits.value = null;
  success.value = null;
  if(!unit_id.value){
    setTimeout(() => {
      warning.value = "Necesitas seleccionar un unidad";
    }, 25);
    return;
  }

  if(!type_client.value){
    setTimeout(() => {
      warning.value = "Necesitas seleccionar un tipo de cliente";
    }, 25);
    return;
  }

  if(price.value <= 0){
    setTimeout(() => {
      warning.value = "Necesitas ingresar un precio mayor a 0";
    }, 25);
    return;
  }

  let data = {
    product_id: props.product_id,
    sucursale_id: sucursale_id.value,
    unit_id: unit_id.value,
    price: price.value,
    type_client: type_client.value,
  }

  try {
    const resp = await $api("product-wallet/"+props.walletSelected.id,{
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
      success.value = "El precio se ha editado correctamente";
      emit("editWalletProduct",resp.product_wallet);
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
    sucursale_id.value = props.walletSelected.sucursale_id;
    unit_id.value = props.walletSelected.unit_id;
    price.value = props.walletSelected.price;
    type_client.value = props.walletSelected.type_client;

    sucursales.value = props.sucursales;
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
            Edit Wallet Product : {{ props.walletSelected.id }}
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
                :items="sucursales"
                item-title="name"
                item-value="id"
                placeholder="Select"
                v-model="sucursale_id"
                label="Sucursales"
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
                <VSelect
                  :items="[
                    {
                      id: 1,
                      name: 'Cliente Final'
                    },
                    {
                      id: 2,
                      name: 'Cliente Empresa'
                    },
                  ]"
                  item-title="name"
                  item-value="id"
                  placeholder="Select"
                  label="Tipo de cliente"
                  v-model="type_client"
                />
            </VCol>
            <VCol
                cols="6"
                md="6"
            >
                <VTextField
                  label="Price"
                  type="number"
                  v-model="price"
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
