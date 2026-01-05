<script setup>

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  unitSelected: {
    type: Object,
    required:true,
  },
  units: {
    type: Object,
    required: true,
  }
})

const emit = defineEmits([
  'update:isDialogVisible',
  'addConversion'
])
const unit_to_id = ref(null);
const list_units = ref([]);
const list_unit_conversions = ref([]);
const warning = ref(null);
const error_exits = ref(null);
const success = ref(null);

const isUnitConversionDeleteDialogVisible = ref(false);
const unit_selected_conversion = ref(null);

const store = async() => {
  warning.value = null;
  error_exits.value = null;
  success.value = null;

  let data = {
    unit_id: props.unitSelected.id,
    unit_to_id: unit_to_id.value,
  }

  try {
    const resp = await $api("unit-conversions/",{
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
      success.value = "La unidad a convertir se ha añadido correctamente";
      list_unit_conversions.value.unshift(resp.unit_conversion);
    //   emit("addConversion",resp.unit);
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

const list = async() => {
    try {
        const resp = await $api("unit-conversions?unit_id="+props.unitSelected.id,{
            method:'GET',
            onResponseError({response}){
                console.log(response._data.error);
            }
        })
        console.log(resp);
        list_unit_conversions.value = resp.unit_conversion;
    } catch (error) {
        console.log(error);
    }
}

const deleteItem = (item) => {
    isUnitConversionDeleteDialogVisible.value = true;
    unit_selected_conversion.value = item;
}
const deleteUnitConversion = (UnitConversion) => {
    let INDEX = list_unit_conversions.value.findIndex((unit) => unit.id == UnitConversion.id);
    if(INDEX != -1){
        list_unit_conversions.value.splice(INDEX,1);
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
   list_units.value = props.units.filter((unit) => unit.id != props.unitSelected.id);
   list();
})
</script>

<template>
    <div>
        
    </div>
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
            Conversión de Unidades -> {{ props.unitSelected.name }}
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
                <VSelect
                    :items="list_units"
                    item-title="name"
                    item-value="id"
                    v-model="unit_to_id"
                    label="Unidades"
                    placeholder="Select Item"
                    eager
                />
            </VCol>

            <VCol
              cols="6"
            >
                <VBtn type="submit">
                    +
                </VBtn>
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
                    Unidad a Convertir
                    </th>
                    <th class="text-uppercase">
                    Acción
                    </th>
                </tr>
              </thead>

              <tbody>
                <tr
                    v-for="item in list_unit_conversions"
                    :key="item.id"
                >
                    <td>
                        {{ item.unit_to.name }}
                    </td>
                    <td>
                        <IconBtn
                            size="small"
                            @click="deleteItem(item)"
                        >
                            <VIcon icon="ri-delete-bin-line" />
                        </IconBtn>
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
        <UnitConversionDeleteDialog v-if="unit_selected_conversion && isUnitConversionDeleteDialogVisible" v-model:isDialogVisible="isUnitConversionDeleteDialogVisible" :unitConversionSelected="unit_selected_conversion" @deleteUnitConversion="deleteUnitConversion"></UnitConversionDeleteDialog>
      </VCardText>
    </VCard>
  </VDialog>
</template>
