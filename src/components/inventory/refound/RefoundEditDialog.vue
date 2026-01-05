<script setup>

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  selectedRefoundProduct:{
    type: Object,
    required: true,
  }
})

const emit = defineEmits([
  'update:isDialogVisible',
  "refoundEditProduct"
])

const state = ref(1);
const type = ref(1);
const quantity = ref(0);
const description = ref(null);
const description_resolution = ref(null);

const warning = ref(null);
const error_exits = ref(null);
const success = ref(null);

const store = async () => {
    try {
        warning.value = null;error_exits.value = null;success.value=null;
        if(!quantity.value || quantity.value <= 0){
            setTimeout(() => {
                warning.value = "Es requerido que la cantidad sea mayor a 0";
            }, 25);
            return;
        }
        if(!description.value){
            setTimeout(() => {
                warning.value = "Es requerido digitar una razon de la devolución";
            }, 25);
            return;
        }
        let data = {
            quantity:quantity.value,
            description:description.value,
            state: state.value,
            description_resolution: description_resolution.value,
        }
        const resp = await $api("refound_products/"+props.selectedRefoundProduct.id,{
            method:'PATCH',
            body:data,
            onResponseError({response}){
                console.log(response._data.error);
            }
        })
        console.log(resp);
        success.value = "LA DEVOLUCIÓN SE EDITO EXITOSAMENTE";
        emit("refoundEditProduct",resp.refound_product);
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
    state.value = props.selectedRefoundProduct.state;
    type.value = props.selectedRefoundProduct.type;
    quantity.value = props.selectedRefoundProduct.quantity;
    description.value = props.selectedRefoundProduct.description;
    description_resolution.value = props.selectedRefoundProduct.description_resolution;
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
           Editar Devolución : #{{ props.selectedRefoundProduct.id  }}
          </h4>
        </div>

        <!-- 👉 Form -->
        <VForm
          class="mt-4"
          @submit.prevent="store"
        >
          <VRow>

            <VCol
              cols="4"
            >
                <VSelect
                    placeholder="Select"
                    label="Tipo"
                    :items="[
                    {
                        id: 1,
                        title: 'Reparación'
                    },
                    {
                        id: 2,
                        title: 'Remplazado'
                    },
                    {
                        id: 3,
                        title: 'Devolución'
                    }
                    ]"
                    item-title="title"
                    item-value="id"
                    v-model="type"
                    disabled
                >
                </VSelect>
            </VCol>

            <VCol
              cols="4"
              v-if="props.selectedRefoundProduct.type == 1"
            >
                <VSelect
                    placeholder="Select"
                    label="Estado"
                    :items="[
                    {
                        id: 1,
                        title: 'Pendiente'
                    },
                    {
                        id: 2,
                        title: 'Revisión'
                    },
                    {
                        id: 3,
                        title: 'Reparado'
                    },
                    {
                        id: 4,
                        title: 'Descartado'
                    }
                    ]"
                    item-title="title"
                    item-value="id"
                    v-model="state"
                >
                </VSelect>
            </VCol>

            <VCol
              cols="4"
               v-if="props.selectedRefoundProduct.type == 1"
            >
             <VTextField
                    label="Cantidad"
                    placeholder=""
                    type="number"
                    v-model="quantity"
                />
            </VCol>

            <VCol
              cols="6"
            >
                <VTextarea
                    label="Descripción"
                    placeholder=""
                    v-model="description"
                />
            </VCol>

            <VCol
              cols="6"
              v-if="state == 3 || state == 4"
            >
                <VTextarea
                    label="¿Que es lo que sucedio?"
                    placeholder=""
                    v-model="description_resolution"
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
