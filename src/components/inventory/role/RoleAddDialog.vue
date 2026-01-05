<script setup>

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  }
})

const emit = defineEmits([
  'update:isDialogVisible',
  'addRole'
])
const name = ref(null);
console.log(PERMISOS);
const permissions = ref([]);
const warning = ref(null);
const error_exits = ref(null);
const success = ref(null);

const AddEditPermissionDialog = (permission) => {
  let INDEX = permissions.value.findIndex((perm) =>perm == permission);
  if(INDEX != -1){
    permissions.value.splice(INDEX,1);
  }else{
    permissions.value.push(permission);
  }
  console.log(permissions);
}

const store = async() => {
  warning.value = null;
  error_exits.value = null;
  success.value = null;
  if(!name.value){
    setTimeout(() => {
      warning.value = "Se debe llenar el nombre del rol";
    }, 50);
    return;
  }
  if(permissions.value.length == 0){
    setTimeout(() => {
      warning.value = "Se debe seleccionar almenos un permiso";
    }, 50);
    return;
  }

  let data = {
    name: name.value,
    permissions: permissions.value,
  }

  try {
    const resp = await $api("role",{
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
      success.value = "El rol se ha registrado correctamente";
      emit("addRole",resp.role);
      name.value = '';
      permissions.value = [];
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
            Nuevo Rol
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
                v-model="name"
                label="Nombre"
                placeholder="Example: Administrador"
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
            
            <VTable>
              <thead>
                <tr>
                  <th class="text-uppercase">
                    Modulo
                  </th>
                  <th class="text-uppercase">
                    Permisos
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item,index) in PERMISOS"
                  :key="index"
                >
                  <td>
                    {{ item.name }}
                  </td>
                  <td>
                    <ul>
                      <li v-for="(permiso, index2) in item.permisos" :key="index2" style="list-style: none;">
                        <VCheckbox
                          :label="permiso.name"
                          :value="permiso.permiso"
                          @click="AddEditPermissionDialog(permiso.permiso)"
                        />
                      </li>
                    </ul>
                  </td>
                </tr>
              </tbody>
            </VTable>

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
