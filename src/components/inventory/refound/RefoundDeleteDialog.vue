<script setup>

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  selectedRefoundProduct: {
    type:Object,
    required:true,
  }
})

const emit = defineEmits([
  'update:isDialogVisible',
  'deleteRefoundProduct'
])
const warning = ref(null);
const error_exits = ref(null);
const success = ref(null);

const deleteRefoundProduct = async() => {
  warning.value = null;
  error_exits.value = null;
  success.value = null;
  try {
    const resp = await $api("refound_products/"+props.selectedRefoundProduct.id,{
      method:'DELETE',
      onResponseError({response}){
        error_exits.value = response._data.error;
      }
    })
    console.log(resp);
    emit("deleteRefoundProduct",props.selectedRefoundProduct);
    onFormReset();
  } catch (error) {
    console.log(error);
  }
}

onMounted(() => {
  console.log(props.selectedRefoundProduct);
})

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
            Delete Refound Product : {{ props.selectedRefoundProduct.id }}
          </h4>
        </div>

        <!-- 👉 Form -->
        <VForm
          class="mt-4"
          @submit.prevent="deleteRefoundProduct"
        >
          <VRow>
            <!-- 👉 First Name -->
            <VCol
              cols="12"
            >
              <p>¿Estas seguro de eliminar esta devolución : #{{props.selectedRefoundProduct.product.title }}?</p>
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
              <VBtn type="submit" color="error">
                Eliminar
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
