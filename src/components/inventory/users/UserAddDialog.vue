<script setup>

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  sucursales:{
    type:Object,
    required:true,
  }, 
  roles:{
    type:Object,
    required:true,
  }
})

const emit = defineEmits([
  'update:isDialogVisible',
  'addUser',
  'close',
])
const name = ref(null);
const surname  = ref(null);
const email  = ref(null);
const phone  = ref(null);
const type_document  = ref('DUI');
const n_document  = ref(null);
const role_id  = ref(null);
const sucursale_id  = ref(null);
const gender  = ref(null);
const password  = ref(null);
const FILE_AVATAR = ref(null);
const IMAGEN_PREVIZUALIZA = ref(null);

const warning = ref(null);
const error_exits = ref(null);
const success = ref(null);

const store = async() => {
  warning.value = null;
  error_exits.value = null;
  success.value = null;
  if(!name.value){
    setTimeout(() => {
      warning.value = "Se debe llenar el nombre del usuario";
    }, 50);
    return;
  }
  if(!surname.value){
    setTimeout(() => {
      warning.value = "Se debe llenar el apellido del usuario";
    }, 50);
    return;
  }
  if(!email.value){
    setTimeout(() => {
      warning.value = "Se debe llenar el correo del usuario";
    }, 50);
    return;
  }
  if(!role_id.value){
    setTimeout(() => {
      warning.value = "Se debe llenar el rol del usuario";
    }, 50);
    return;
  }
  if(!sucursale_id.value){
    setTimeout(() => {
      warning.value = "Se debe llenar la sucursal del usuario";
    }, 50);
    return;
  }
  if(!phone.value){
    setTimeout(() => {
      warning.value = "Se debe llenar la telefono del usuario";
    }, 50);
    return;
  }
  if(!gender.value){
    setTimeout(() => {
      warning.value = "Se debe seleccionar un genero para el usuario";
    }, 50);
    return;
  }
  if(!FILE_AVATAR.value){
    setTimeout(() => {
      warning.value = "Se debe seleccionar un imagen para el usuario";
    }, 50);
    return;
  }
  if(!password.value){
    setTimeout(() => {
      warning.value = "Se debe llenar una contraseña para el usuario";
    }, 50);
    return;
  }
  
  let formData = new FormData();
  formData.append("name",name.value);
  formData.append("surname",surname.value);
  formData.append("email",email.value);
  formData.append("role_id",role_id.value);
  formData.append("sucursale_id",sucursale_id.value);
  formData.append("gender",gender.value);
  formData.append("password",password.value);
  formData.append("phone",phone.value);
  formData.append("imagen",FILE_AVATAR.value);
  formData.append("state",1);
  if(type_document.value){
    formData.append("type_document",type_document.value);
  }
  if(n_document.value){
    formData.append("n_document",n_document.value);
  }
  try {
    const resp = await $api("users",{
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
      success.value = "El usuario se ha registrado correctamente";
      emit("addUser",resp.user);
      name.value = '';
      surname.value = '';
      email.value = '';
      role_id.value = '';
      sucursale_id.value = '';
      phone.value = '';
      FILE_AVATAR.value = null;
      IMAGEN_PREVIZUALIZA.value = null;
      gender.value = null;
      type_document.value = 'DUI';
      n_document.value = '';
      warning.value = null;
      error_exits.value = null;
      success.value = null;
      onFormReset();
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
    FILE_AVATAR.value = $event.target.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(FILE_AVATAR.value);
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
            Agregar Nuevo Usuario
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
              cols="6"
            >
              <VTextField
                v-model="name"
                label="Nombre"
                placeholder="Ejemplo: Jose"
              />
            </VCol>
            <VCol
              cols="6"
            >
              <VTextField
                v-model="surname"
                label="Apellido"
                placeholder="Ejemplo: Mendoza"
              />
            </VCol>

            <VCol
              cols="6"
            >
              <VTextField
                v-model="email"
                label="Correo"
                placeholder="ejemplo: nombre@gmail.com"
              />
            </VCol>

            <VCol
              cols="6"
            >
              <VTextField
                v-model="phone"
                type="number"
                label="Telefono"
                placeholder="Ejemplo: 9999999"
              />
            </VCol>


            <VCol
              cols="6"
            >
                <VSelect
                    :items="[
                        'DUI',
                        'PASAPORTE'
                    ]"
                    v-model="type_document"
                    label="Tipo de documento"
                    placeholder="Seleccionar documento"
                    eager
                />
            </VCol>

            <VCol
              cols="6"
            >
              <VTextField
                v-model="n_document"
                type="number"
                label="N° de documento"
                placeholder="Example: 9999999"
              />
            </VCol>

            <VCol
              cols="6"
            >
                <VSelect
                    :items="props.roles"
                    item-title="name"
                    item-value="id"
                    v-model="role_id"
                    label="Rol"
                    placeholder="Select Item"
                    eager
                />
            </VCol>

            <VCol
              cols="6"
            >
                <VSelect
                    :items="props.sucursales"
                    item-title="name"
                    item-value="id"
                    v-model="sucursale_id"
                    label="Sucursal"
                    placeholder="Select Item"
                    eager
                />
            </VCol>

            <VCol
              cols="6"
            >
              <VRadioGroup v-model="gender">
                <VRadio
                  label="Masculino"
                  value="M"
                />
                <VRadio
                    label="Femenino"
                    value="F"
                />
              </VRadioGroup>
            </VCol>

            <VCol
              cols="6"
            >
                <VFileInput label="Foto" @change="loadFile($event)" />

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
                <VTextField
                    v-model="password"
                    type="password"
                    label="Contraseña"
                    placeholder="************"
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
                Cancelar
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
