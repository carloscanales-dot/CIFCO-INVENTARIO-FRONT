<script setup>

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits([
  'update:isDialogVisible',
  "refoundAddProduct"
])
const sale_id = ref(null);
const type = ref(1);
const quantity = ref(0);
const sale_detail_id = ref(null);
const description = ref(null);
const sale = ref(null);

const warning = ref(null);
const error_exits = ref(null);
const success = ref(null);

const store = async () => {
    try {
        warning.value = null;error_exits.value = null;success.value=null;
        if(!sale.value){
            setTimeout(() => {
                warning.value = "Necesitas buscar una venta, para la asignación del producto";
            }, 25);
            return;
        }
        if(!sale_detail_id.value){
            setTimeout(() => {
                warning.value = "Es requerido seleccionar un producto";
            }, 25);
            return;
        }
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
            sale_detail_id: sale_detail_id.value,
            type:type.value,
            quantity:quantity.value,
            description:description.value,
            sale_id: sale.value.id,
        }
        const resp = await $api("refound_products/",{
            method:'POST',
            body:data,
            onResponseError({response}){
                console.log(response._data.error);
            }
        })
        console.log(resp);
        if(resp.message == 403){
          error_exits.value = resp.message_text
        }else{
          success.value = "LA DEVOLUCIÓN SE REGISTRO EXITOSAMENTE";
          sale_id.value = null;
          quantity.value = 0;
          sale.value = null;
          description.value = '';
          sale_detail_id.value = null;
          type.value = 1;
          emit("refoundAddProduct",resp.refound_product);
          setTimeout(() => {
            onFormReset();
          }, 25);
        }
    } catch (error) {
        console.log(error);
    }
}

const searchSale = async () => {
    try {
        warning.value = null;
        error_exits.value = null;
        if(!sale_id.value){
            setTimeout(() => {
                warning.value = "Es requerido ingresar el N° DE VENTA";
            }, 25);
            return;
        }
        const resp = await $api("refound_products/search-sale/"+sale_id.value,{
            method:'GET',
            onResponseError({response}){
                console.log(response._data.error);
            }
        })
        if(resp.message == 403){
            setTimeout(() => {
                error_exits.value = resp.message_text;
            }, 25);
            return;
        }
        console.log(resp);
        sale.value = resp.sale;
    } catch (error) {
        console.log(error);
    }
}

const reset = () => {
  sale_id.value = '';
  sale.value = null;
  sale_detail_id.value = null;
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
           Crear Devolución
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
                <VTextField
                    label="N° Venta"
                    placeholder="94454"
                    type="number"
                    v-model="sale_id"
                />
            </VCol>

            <VCol
              cols="4"
            >
                <VBtn
                    color="info"
                    class="mx-1"
                    prepend-icon="ri-search-2-line"
                    @click="searchSale()"
                >
                    <VTooltip
                        activator="parent"
                        location="top"
                    >
                        Buscar
                    </VTooltip>
                </VBtn>
                <VBtn
                    color="secondary"
                    class="mx-1"
                    prepend-icon="ri-restart-line"
                    @click="reset"
                >
                    <VTooltip
                        activator="parent"
                        location="top"
                    >
                        Limpieza
                    </VTooltip>
                </VBtn>
            </VCol>


            <VCol
              cols="12"
              v-if="sale"
            >
                <VRadioGroup v-model="sale_detail_id">
                    <VTable>
                        <thead>
                            <tr>
                                <th class="text-uppercase">
                                    
                                </th>
                                <th class="text-uppercase">
                                    Producto
                                </th>
                                <th class="text-uppercase">
                                    E. Entrega
                                </th>
                                <th class="text-uppercase">
                                    Unidad
                                </th>
                                <th class="text-uppercase">
                                    Cantidad
                                </th>
                            </tr>
                        </thead>
                            <tbody>
                                <tr
                                    v-for="sale_detail in sale.sale_details"
                                    :key="sale_detail.id"
                                >
                                    <td>
                                        <VRadio
                                            label=""
                                            :value="sale_detail.id"
                                            v-if="sale_detail.state_attention != 1"
                                        />
                                    </td>
                                    <td>
                                        <div class="d-flex align-center">
                                            <VAvatar
                                                size="32"
                                                :color="sale_detail.product.imagen ? '' : 'primary'"
                                                :class="sale_detail.product.imagen ? '' : 'v-avatar-light-bg primary--text'"
                                                :variant="!sale_detail.product.imagen ? 'tonal' : undefined"
                                            >
                                            <VImg
                                                :src="sale_detail.product.imagen"
                                            />
                                            </VAvatar>
                                            <div class="d-flex ms-3">
                                                {{ sale_detail.product.title }}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <VChip color="error" v-if="sale_detail.state_attention == 1">
                                            Pendiente
                                        </VChip>
                                        <VChip color="warning" v-if="sale_detail.state_attention == 2">
                                            Parcial
                                        </VChip>
                                        <VChip color="primary" v-if="sale_detail.state_attention == 3">
                                            Completo
                                        </VChip>
                                    </td>
                                    <td>
                                        {{ sale_detail.unit.name }}
                                    </td>
                                    <td>
                                        {{ sale_detail.quantity }}
                                    </td>
                                </tr>
                            </tbody>
                    </VTable>
                </VRadioGroup>
            </VCol>

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
                >
                </VSelect>
            </VCol>

            <VCol
              cols="4"
            >
             <VTextField
                    label="Cantidad"
                    placeholder=""
                    type="number"
                    v-model="quantity"
                />
            </VCol>

            <VCol
              cols="4"
            >
                <VTextarea
                    label="Descripción"
                    placeholder=""
                    v-model="description"
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
