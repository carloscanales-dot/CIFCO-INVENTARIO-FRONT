<script setup>

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  paymentSelected: {
    type: Object,
    required: true
  },
  sale_id:{
    type: String,
    required:true,
  }
})

const emit = defineEmits([
  'update:isDialogVisible',
  'editPayment'
])

const method_payment = ref(null);
const amount = ref(0);

const warning = ref(null);
const error_exits = ref(null);
const success = ref(null);

const update = async() => {
  warning.value = null;
  error_exits.value = null;
  success.value = null;

  let data = {
    method_payment:method_payment.value,
    amount: amount.value,
    sale_id: props.sale_id,
  }

  try {
    const resp = await $api("sale_payments/"+props.paymentSelected.id,{
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
      success.value = "El pago se ha editado correctamente";
      emit("editPayment",resp);
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
  console.log(props.sale_id);
  method_payment.value = props.paymentSelected.method_payment;
  amount.value = props.paymentSelected.amount;
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
            Edit Payment : {{ props.paymentSelected.method_payment }}
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
              cols="6"
            >
              <VSelect
                  :items="[
                      'EFECTIVO',
                      'DEPOSITO',
                      'TRANSFERENCIA',
                      'YAPE',
                      'PLIN'
                  ]"
                  v-model="method_payment"
                  label="Metodo de Pago"
                  placeholder="Select Item"
                  eager
              />
            </VCol>
            <VCol
              cols="6"
            >
                <VTextField
                  label="Monto"
                  type="number"
                  v-model="amount"
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
