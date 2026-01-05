<script setup>

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  categorieSelected: {
    type: Object,
    required:true
  }
})

const emit = defineEmits([
  'update:isDialogVisible',
  'editCategorie',
  "close",
])
const name = ref(null);
const FILE_IMAGEN = ref(null);
const PREVIZUALIZA_IMAGEN = ref(null);
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
      warning.value = "Se debe llenar un nombre para la categoria";
    }, 50);
    return;
  }
    //   if(!FILE_IMAGEN.value){
    //     setTimeout(() => {
    //       warning.value = "Se debe subir una imagen para la categoria";
    //     }, 50);
    //     return;
    //   }

  let formData = new FormData();
  formData.append("title",name.value);
  if(FILE_IMAGEN.value){
      formData.append("image",FILE_IMAGEN.value);
  }
  formData.append("state",state.value);
  try {
    const resp = await $api("categories/"+props.categorieSelected.id,{
      method:'POST',
      body: formData,
      onResponseError({response}){
        error_exits.value = response._data.error;
      }
    })
    console.log(resp);
    if (resp.message == 403) {
      error_exits.value = resp.message_text;
    } else {
      success.value = "La categoria se ha editado correctamente";
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

const loadFile = ($event) => {
    if($event.target.files[0].type.indexOf("image") < 0){
        error_exits.value = "SOLAMENTE PUEDEN SER ARCHIVOS DE TIPO IMAGEN";
      return;
    }
    error_exits.value = '';
    FILE_IMAGEN.value = $event.target.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(FILE_IMAGEN.value);
    reader.onloadend = () => PREVIZUALIZA_IMAGEN.value = reader.result;
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
  name.value = props.categorieSelected.title;
  state.value = props.categorieSelected.state;
  PREVIZUALIZA_IMAGEN.value = props.categorieSelected.imagen;  
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
            Editar Categoria -> {{ props.categorieSelected.title }}
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
                placeholder="Example: Memory"
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
              cols="6"
            >
                <VFileInput label="Imagen" @change="loadFile($event)" />

                <VImg
                    v-if="PREVIZUALIZA_IMAGEN"
                 width="250"
                 height="176"
                 :src="PREVIZUALIZA_IMAGEN">

                </VImg>
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
