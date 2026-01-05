<script setup>

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  }
})

const emit = defineEmits([
  'update:isDialogVisible',
  'importExcelProduct'
])
const FILE_EXCEL = ref(null);
const warning = ref(null);
const error_exits = ref(null);
const success = ref(null);

const upload = async() => {
  warning.value = null;
  error_exits.value = null;
  success.value = null;
  if(!FILE_EXCEL.value){
    setTimeout(() => {
      warning.value = "Se debe subir un archivo excel para la importación";
    }, 50);
    return;
  }

  let formData = new FormData();
  formData.append("excel",FILE_EXCEL.value);
  try {
    const resp = await $api("products/import-excel",{
      method:'POST',
      body: formData,
      onResponseError({response}){
        error_exits.value = response._data.error;
      }
    })
    console.log(resp);
    success.value = "La importación se ha realizado correctamente";
    emit("importExcelProduct",200);
    FILE_EXCEL.value = '';
    warning.value = null;
    error_exits.value = null;
    success.value = null;
    onFormReset();
  } catch (error) {
    console.log(error);
  }
}

const loadFile = ($event) => {
    if($event.target.files[0].type.indexOf("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") < 0){
        error_exits.value = "SOLAMENTE PUEDEN SER ARCHIVOS DE TIPO IMAGEN";
        FILE_EXCEL.value = null;
      return;
    }
    error_exits.value = '';
    FILE_EXCEL.value = $event.target.files[0];
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
           Importar productos desde Excel
          </h4>
        </div>

        <!-- 👉 Form -->
        <VForm
          class="mt-4"
          @submit.prevent="upload"
        >
          <VRow>
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
                <VFileInput label="SUBE TU ARCHIVO" @change="loadFile($event)" />
            </VCol>

            <!-- 👉 Submit and Cancel -->
            <VCol
              cols="12"
              class="d-flex flex-wrap justify-center gap-4"
            >
              <VBtn type="submit">
                Importar
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
