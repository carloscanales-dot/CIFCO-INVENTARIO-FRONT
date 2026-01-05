<script setup>

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits([
  'update:isDialogVisible',
  'addProvider'
])
const full_name = ref(null);
const email  = ref(null);
const phone  = ref(null);
const ruc  = ref(null);
const address  = ref(null);
const FILE_IMAGEN = ref(null);
const IMAGEN_PREVIZUALIZA = ref(null);

const warning = ref(null);
const error_exits = ref(null);
const success = ref(null);

const store = async() => {
  warning.value = null;
  error_exits.value = null;
  success.value = null;
  if(!full_name.value){
    setTimeout(() => {
      warning.value = "Se debe llenar el nombre del provedor";
    }, 50);
    return;
  }
  if(!phone.value){
    setTimeout(() => {
      warning.value = "Se debe llenar la telefono del provedor";
    }, 50);
    return;
  }
  if(!ruc.value){
    setTimeout(() => {
      warning.value = "Se debe llenar el ruc del proveedor";
    }, 50);
    return;
  }
  
  let formData = new FormData();
  formData.append("full_name",full_name.value);
  if(email.value){
      formData.append("email",email.value);
  }
  if(address.value){
      formData.append("address",address.value);
  }
  formData.append("phone",phone.value);
  if(FILE_IMAGEN.value){
    formData.append("image",FILE_IMAGEN.value);
  }
  formData.append("state",1);
  formData.append("ruc",ruc.value);

  try {
    const resp = await $api("providers",{
      method:'POST',
      body: formData,
      onResponseError({response}){
        error_exits.value = response._data.error;
      }
    })
    console.log(resp);
    if(resp.message == 403){
      error_exits.value = resp.message_text;
    }else{
      success.value = "El proveedor se ha registrado correctamente";
      emit("addProvider",resp.provider);
      full_name.value = '';
      email.value = '';
      phone.value = '';
      FILE_IMAGEN.value = null;
      IMAGEN_PREVIZUALIZA.value = null;
      ruc.value = '';
      address.value = '';
      warning.value = null;
      error_exits.value = null;
      success.value = null;
      onFormReset();
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
    reader.onloadend = () => IMAGEN_PREVIZUALIZA.value = reader.result;
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
            Nuevo Proveedor
          </h4>
        </div>

        <!-- 👉 Form -->
        <VForm
          class="mt-4"
          @submit.prevent="store"
        >
          <VRow>
            <!-- 👉 First Name -->
            <VCol
              cols="12"
            >
              <VTextField
                v-model="full_name"
                label="Nombre del Proveedor"
                placeholder="Ejemplo: nombre del proveedor"
              />
            </VCol>
            

            <VCol
              cols="6"
            >
              <VTextField
                v-model="email"
                label="Correo"
                placeholder="Example: proveedor@gmail.com"
              />
            </VCol>

            <VCol
              cols="6"
            >
              <VTextField
                v-model="phone"
                type="number"
                label="Telefono"
                placeholder="Example: 22222222"
              />
            </VCol>

            <VCol
              cols="8"
            >
              <VTextField
                v-model="ruc"
                type="number"
                label="NIT"
                placeholder="Example: 1111-111111-111-1"
              />
            </VCol>

            <VCol
              cols="6"
            >
                <VFileInput label="Imagen" @change="loadFile($event)" />

                <VImg
                    v-if="IMAGEN_PREVIZUALIZA"
                 width="250"
                 height="176"
                 :src="IMAGEN_PREVIZUALIZA">

                </VImg>
            </VCol>

            <VCol
              cols="6"
            >
                <VTextarea
                    v-model="address"
                    label="Dirección: "
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
            <VCol
              cols="12"
            >

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
