<script setup>

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  saleDetailSelected: {
    type: Object,
    required:true,
  },
  type_client: {
    type:Number,
    required:true,
  },
  type_sale: {
    type:Number,
    required:true
  }
})

const emit = defineEmits([
  'update:isDialogVisible',
  'editSaleDetail'
])

const unit_id = ref(null);
const quantity = ref(0);
const price_unit = ref(0);
const discount = ref(0);
const units = ref([]);
const description = ref(null);

const warning = ref(null);
const error_exits = ref(null);
const success = ref(null);

const update = async() => {
  warning.value = null;
  error_exits.value = null;
  success.value = null;
  if(!unit_id.value){
    setTimeout(() => {
      warning.value = "Necesitas seleccionar una unidad";
    },25)
    return;
  }
  if(quantity.value < 0){
    setTimeout(() => {
      warning.value = "Necesitas ingresar una cantidad mayor a 0";
    },25)
    return;
  }
  if(props.saleDetailSelected.product.is_gift == 1 && (!price_unit.value || price_unit.value <= 0)){
        setTimeout(() => {
            warning.value = "Es necesario ingresar un precio";
        }, 25);
        return;
    }
  if(props.saleDetailSelected.product.is_discount == 2){
        let MAX_DISCOUNT = Number(props.saleDetailSelected.product.max_discount)*0.01 * Number(price_unit.value);//EL DESCUENTO MAXIMO
        if(MAX_DISCOUNT < Number(discount.value)){
            setTimeout(() => {
                warning.value = "El descuento maximo del producto es : S/." + MAX_DISCOUNT;
            }, 25);
            return;
        }
  }
  if(props.type_sale == 1 && props.saleDetailSelected.product.disponibilidad == 2){
        let WAREHOUSE_PRODUCT = props.saleDetailSelected.product.warehouses;
        let WAREHOUSE_SELECTED = WAREHOUSE_PRODUCT.find(warehouse => warehouse.warehouse_id == props.saleDetailSelected.warehouse_id &&
                                                                        warehouse.unit_id == unit_id.value);
        if(WAREHOUSE_SELECTED){
          if(parseInt(WAREHOUSE_SELECTED.stock) < parseInt(quantity.value)){
                setTimeout(() => {
                    warning.value = "El stock disponibible de este producto es " + WAREHOUSE_SELECTED.stock;
                }, 25);
                return;
            }
        }
    }
    let IGV = 0;
    if(props.saleDetailSelected.product.tax_selected == 2){
        IGV = 0;
    }else{
        IGV = Number(price_unit.value) * (props.saleDetailSelected.product.importe_iva*0.01);
    }
  let data = {
    unit_id: unit_id.value,
    price_unit: price_unit.value ?? 0,
    quantity: quantity.value,
    igv: IGV,
    discount: discount.value,
    description: description.value,
  }

  try {
    const resp = await $api("sale_details/"+props.saleDetailSelected.id,{
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
      success.value = "El detallado se ha editado correctamente";
      emit("editSaleDetail",resp);
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

const selectedUnit = () => {
    let UNIT_SELECTED = unit_id.value;
    let TYPE_CLIENT = props.type_client;
    let AUTH_USER = JSON.parse(localStorage.getItem("user"));
    // BUSQUEDA DE PRECIO CON LA SUCURSAL DEL USUARIO AUTENTICADO
    let PRICE_SELECTED = props.saleDetailSelected.product.wallets.find((wallet) => wallet.type_client == TYPE_CLIENT 
                                                                && wallet.unit_id == UNIT_SELECTED &&
                                                            wallet.sucursale_id == AUTH_USER.sucursale_id);
    console.log(TYPE_CLIENT, UNIT_SELECTED);
    if(PRICE_SELECTED){
        price_unit.value = PRICE_SELECTED.price;
    }else{
        // BUSQUEDA DE PRECIO CON LA SUCURSAL NULA
        let PRICE_SELECTED = props.saleDetailSelected.product.wallets.find((wallet) => wallet.type_client == TYPE_CLIENT 
                                                                && wallet.unit_id == UNIT_SELECTED &&
                                                            wallet.sucursale_id == null);
        console.log(PRICE_SELECTED);
        if(PRICE_SELECTED){
            price_unit.value = PRICE_SELECTED.price;
        }else{
            // EN CASO DE QUE NO HALLA UN PRECIO MULTIPLE ENCONTRADO
            price_unit.value = TYPE_CLIENT == 1 ? props.saleDetailSelected.product.price_general : props.saleDetailSelected.product.price_company;
        }
    }
}
onMounted(() => {
    units.value = props.saleDetailSelected.product.warehouses.filter((warehouse) => warehouse.warehouse_id == props.saleDetailSelected.warehouse_id).map((wh) => {
        return {
            id: wh.unit_id,
            name: wh.unit.name,
        };
    });
    unit_id.value = props.saleDetailSelected.unit_id;
    quantity.value = props.saleDetailSelected.quantity;
    price_unit.value = props.saleDetailSelected.price;
    discount.value = props.saleDetailSelected.discount;
    description.value = props.saleDetailSelected.description;
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
            Edit Sale Detail : {{ props.saleDetailSelected.id }}
          </h4>
        </div>

        <!-- 👉 Form -->
        <VForm
          class="mt-4"
          @submit.prevent="update"
        >
          <VRow>
            
            <VCol
             cols="6"
             md="6"
            >
             <VSelect
                :items="units"
                item-title="name"
                item-value="id"
                placeholder="Select"
                v-model="unit_id"
                label="Unidades"
                :disabled="props.saleDetailSelected.state_attention != 1 ? true : false"
                @update:modelValue="selectedUnit()"
             />
            </VCol>
            <VCol
             cols="6"
             md="6"
            >
             <VTextField
                label="Cantidad"
                type="number"
                v-model="quantity"
                placeholder=""
             />
            </VCol>
            <VCol
                cols="6"
                md="6"
            >
             <VTextField
                label="Precio Unitario"
                type="number"
                v-model="price_unit"
                placeholder=""
              />
            </VCol>

            <VCol
                cols="6"
                md="6"
            >
             <VTextField
                label="Descuento"
                type="number"
                v-model="discount"
                placeholder=""
              />
            </VCol>

            <VCol
              cols="12"
            >
                <VTextarea
                    v-model="description"
                    label="Descripción: "
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
