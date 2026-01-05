<script setup>
import {
  useDropZone,
  useFileDialog,
  useObjectUrl,
} from '@vueuse/core'
import { useRouter } from 'vue-router'
const dropZoneRef = ref()
const fileData = ref([])
const { open, onChange } = useFileDialog({ accept: 'image/*',multiple:false })
const router = useRouter()
function onDrop(DroppedFiles) {
  DroppedFiles?.forEach(file => {
    if (file.type.slice(0, 6) !== 'image/') {
      alert('Only image files are allowed')
      
      return
    }
    fileData.value.push({
      file,
      url: useObjectUrl(file).value ?? '',
    })
  })
}
onChange(selectedFiles => {
  if(fileData.value.length == 1){
    alert('Solo permite una imagen')
    return
  }
  if (!selectedFiles)
    return
  for (const file of selectedFiles) {
    fileData.value.push({
      file,
      url: useObjectUrl(file).value ?? '',
    })
  }
})
useDropZone(dropZoneRef, onDrop)
const route = useRoute('product-edit-id')
const categories = ref([]);
const sucursales = ref([]);
const units = ref([]);
const warehouses = ref([]);

const product = ref({
  title: '',
  sku: '',
  price_general: 0,
  price_company: 0,
  description: '',
  product_categorie_id: '',
  is_gift: 1,
  is_discount: 1,
  max_discount: 0,
  tax_selected: 1,
  importe_iva: 18,
  disponibilidad: 1,
  state: 1,
  warranty_day: 30,
  expiration_date: null,
});
const isEditWarehouseDialog = ref(false);
const warehouse_selected = ref(null);
const isDeleteWarehouseDialog = ref(false);
const warehouse_delete_selected = ref(null);
const isEditProductWalletDialog = ref(false);
const product_wallet_edit_selected = ref(null);

const isDeleteProductWalletDialog = ref(false);
const product_wallet_delete_selected = ref(null);

const product_selected = ref(null);
const warehouse_stock_id = ref(null);
const unit_stock_id = ref(null);
const stock = ref(0);
const umbral = ref(0);

const sucursale_price_id = ref(null);
const unit_price_id = ref(null);
const type_client_price = ref(null);
const price = ref(0);

const product_warehouses = ref([]);
const product_wallets = ref([]);

const warning_stock = ref(null);
const warning_price = ref(null);
const warning = ref(null);
const error_exits = ref(null);
const success = ref(null);
const config = async() => {
  try {
    const resp = await $api("products/config",{
      method: 'GET',
      onResponseError({response}){
        console.log(response._data.error);
      }
    })
    console.log(resp);
    categories.value = resp.categories;
    sucursales.value = resp.sucursales;
    units.value = resp.units;
    warehouses.value = resp.warehouses;
  } catch (error) { 
    console.log(error);
  }
}

const addStock = async () => {
  warning_stock.value = null;
  if(!warehouse_stock_id.value){
    setTimeout(() => {
      warning_stock.value = "Necesitas seleccionar un almacen";
    }, 25);
    return;
  }
  if(!unit_stock_id.value){
    setTimeout(() => {
      warning_stock.value = "Necesitas seleccionar una unidad";
    },25)
    return;
  }
  if(stock.value <= 0){
    setTimeout(() => {
      warning_stock.value = "Necesitas ingresar un stock mayor a 0";
    },25)
    return;
  }
  let IS_DUPLICITY = product_warehouses.value.find((pw) => pw.warehouse_id == warehouse_stock_id.value && pw.unit_id == unit_stock_id.value);
  console.log(IS_DUPLICITY);
  if(IS_DUPLICITY){
    warning_stock.value = "Esta existencia ya existe, agregar una nueva";
    return;
  }
  let WAREHOUSE_SELECTED = warehouses.value.find((warehouse) => warehouse.id == warehouse_stock_id.value);
  let UNIT_SELECTED = units.value.find((unit) => unit.id == unit_stock_id.value);
  let data = {
    product_id: route.params.id,
    warehouse_id: warehouse_stock_id.value,
    warehouse: WAREHOUSE_SELECTED,
    unit_id: unit_stock_id.value,
    unit: UNIT_SELECTED,
    stock: stock.value,
    umbral: umbral.value
  };

  try {
      const resp = await $api("product-warehouse",{
        method: 'POST',
        body: data,
        onResponseError({response}){
          console.log(response._data.error);
        }
      })
      console.log(resp);
      product_warehouses.value.unshift(resp.product_warehouse);
      setTimeout(() => {
        warehouse_stock_id.value = '';
        unit_stock_id.value = '';
        stock.value = 0;
        umbral.value = 0;
      }, 25);
  } catch (error) {
    console.log(error);
  }

}
const editItem = (item) => {
  isEditWarehouseDialog.value = true;
  warehouse_selected.value = item;
  console.log(isEditWarehouseDialog.value,warehouse_selected.value);
}
const warehouseProductEdit = (warehouseProductUpdate) => {
  let INDEX = product_warehouses.value.findIndex((item) => item.id == warehouseProductUpdate.id);
  if(INDEX != -1){
    product_warehouses.value[INDEX] = warehouseProductUpdate;
  }
}
const warehouseProductDelete = (warehouseProduct) => {
  let INDEX = product_warehouses.value.findIndex((item) => item.id == warehouseProduct.id);
  if(INDEX != -1){
    product_warehouses.value.splice(INDEX,1);
  }
}
const deleteStock = (product_warehouse) => {
  isDeleteWarehouseDialog.value = true;
  warehouse_delete_selected.value = product_warehouse;
}

const addPrice = async () => {
  warning_price.value = null;
  if(!unit_price_id.value){
    setTimeout(() => {
      warning_price.value = "Necesitas seleccionar un unidad";
    }, 25);
    return;
  }

  if(!type_client_price.value){
    setTimeout(() => {
      warning_price.value = "Necesitas seleccionar un tipo de cliente";
    }, 25);
    return;
  }

  if(price.value <= 0){
    setTimeout(() => {
      warning_price.value = "Necesitas ingresar un precio mayor a 0";
    }, 25);
    return;
  }

  let IS_DUPLICITY = product_wallets.value.find((pw) => pw.sucursale_id == sucursale_price_id.value && 
                                                            pw.unit_id == unit_price_id.value && 
                                                          pw.type_client == type_client_price.value)
  console.log(product_wallets.value,IS_DUPLICITY);
  if(IS_DUPLICITY){
    warning_price.value = "Ya existe esta configuración de precio, seleccione uno nuevo";
    return;
  }

  let SUCURSAL_SELECTED = sucursales.value.find((sucursale) => sucursale.id == sucursale_price_id.value);
  let UNIT_SELECTED = units.value.find((unit) => unit.id == unit_price_id.value);

  let data = {
    product_id: route.params.id,
    type_client: type_client_price.value,
    type_client_name: type_client_price.value == 1 ? 'Cliente Final' : 'Cliente Empresa',
    unit_id: unit_price_id.value,
    unit: UNIT_SELECTED,
    sucursale_id: sucursale_price_id.value,
    sucursale: SUCURSAL_SELECTED,
    price: price.value,
  };

  try {
      const resp = await $api("product-wallet",{
        method: 'POST',
        body: data,
        onResponseError({response}){
          console.log(response._data.error);
        }
      })
      console.log(resp);
      product_wallets.value.unshift(resp.product_wallet);
      setTimeout(() => {
        type_client_price.value = '';
        unit_price_id.value = '';
        sucursale_price_id.value = null;
        price.value = 0;
      }, 25);
  } catch (error) {
    console.log(error);
  }
} 

const editProductWalllet = (product_wallet) => {
  isEditProductWalletDialog.value = true;
  product_wallet_edit_selected.value = product_wallet;
}
const walletProductEdit = (product_wallet_edit) => {
  let INDEX = product_wallets.value.findIndex((item) => item.id == product_wallet_edit.id);
  if(INDEX != -1){
    product_wallets.value[INDEX] = product_wallet_edit;
  }
}
const deletePrice = (product_wallet) => {
  isDeleteProductWalletDialog.value = true;
  product_wallet_delete_selected.value = product_wallet;
}

const walletProductDelete = (productWallet) => {
  let INDEX = product_wallets.value.findIndex((item) => item.id == productWallet.id);
  if(INDEX != -1){
    product_wallets.value.splice(INDEX,1);
  }
}

const update = async() => {
  try {
    warning.value = null;error_exits.value = null; success.value = null;
    if(!product.value.title){
      setTimeout(() => {
        warning.value = "Es requerido ingresar un nombre al producto";
      }, 15);
      return;
    }
    if(!product.value.sku){
      setTimeout(() => {
        warning.value = "Es requerido ingresar el SKU del producto";
      }, 15);
      return;
    }
    if(!product.value.price_general){
      setTimeout(() => {
        warning.value = "Es requerido ingresar el precio general del producto";
      }, 15);
      return;
    }
    if(!product.value.price_company){
      setTimeout(() => {
        warning.value = "Es requerido ingresar el precio de tipo empresa al producto";
      }, 15);
      return;
    }
    if(!product.value.description){
      setTimeout(() => {
        warning.value = "Es requerido ingresar una descripción del producto";
      }, 15);
      return;
    }
    if(!product.value.product_categorie_id){
      setTimeout(() => {
        warning.value = "Es requerido seleccionar una categoria para el producto";
      }, 15);
      return;
    }
    if(product.value.importe_iva < 0){
      setTimeout(() => {
        warning.value = "Es requerido ingresar un importe iva mayor a 0 para el producto";
      }, 15);
      return;
    }
    if(product.value.warranty_day < 0){
      setTimeout(() => {
        warning.value = "Es requerido ingresar dias de garantia mayor a 0 para el producto";
      }, 15);
      return;
    }
    // if(fileData.value.length == 0){
    //   setTimeout(() => {
    //     warning.value = "Es requerido agregar una imagen al producto";
    //   }, 15);
    //   return;
    // }
    if(product.value.is_discount == 2 && product.value.max_discount <= 0){
      setTimeout(() => {
        warning.value = "Es requerido agregar una descuento maximo al producto";
      }, 15);
      return;
    }
    // if(product_warehouses.value.length == 0){
    //   setTimeout(() => {
    //     warning.value = "Es requerido agregar al menos una existencia inicial al producto";
    //   }, 15);
    //   return;
    // }
    // if(product_wallets.value.length == 0){
    //   setTimeout(() => {
    //     warning.value = "Es requerido agregar al menos un precio multiple al producto";
    //   }, 15);
    //   return;
    // }

    let formData = new FormData();

    formData.append("title",product.value.title);
    formData.append("sku",product.value.sku);
    formData.append("price_general",product.value.price_general);
    formData.append("price_company",product.value.price_company);
    formData.append("description",product.value.description);
    formData.append("product_categorie_id",product.value.product_categorie_id);
    if(fileData.value.length > 0 && fileData.value[0].file){
        formData.append("image",fileData.value[0].file);
    }
    // formData.append("product_warehouses",JSON.stringify(product_warehouses.value));
    // formData.append("product_wallets",JSON.stringify(product_wallets.value));

    formData.append("is_gift",product.value.is_gift == false ? 1 : product.value.is_gift);
    formData.append("is_discount",product.value.is_discount == false ? 1 : product.value.is_discount);
    if(product.value.is_discount == 2){
      formData.append("max_discount",product.value.max_discount);
    }
    formData.append("tax_selected",product.value.tax_selected);
    formData.append("importe_iva",product.value.importe_iva);
    formData.append("warranty_day",product.value.warranty_day);
    formData.append("disponibilidad",product.value.disponibilidad);
    formData.append("state",product.value.state);

    if (product.value.expiration_date) {
      formData.append("expiration_date", product.value.expiration_date);
    }

    const resp = await $api("products/"+route.params.id,{
      method:'POST',
      body:formData,
      onResponseError({response}){
        error_exits.value = response._data.error;
      }
    })
    console.log(resp);

    if (resp.message == 403) {
      error_exits.value = resp.message_text;
    } else {
      success.value = "El producto se ha editado correctamente";
      warning.value = null;
      error_exits.value = null;

      // Esperar un momento para mostrar el mensaje y luego redirigir
      setTimeout(() => {
        router.push({ name: 'product-list' }) // Cambia el name por el de tu ruta de lista de productos
      }, 1000)
    }

  } catch (error) {
    console.log(error)
  }
}
const resetForm = () => {
  product.value = {
    title: '',
    sku: '',
    price_general: 0,
    price_company: 0,
    description: '',
    product_categorie_id: '',
    is_gift: 1,
    is_discount: 1,
    max_discount: 0,
    tax_selected: 1,
    importe_iva: 18,
    disponibilidad: 1,
    state: 1,
    warranty_day: 30,
    expiration_date: null,
  }
  product_wallets.value = [];
  product_warehouses.value = [];
  fileData.value = [];
}
const show = async() => {
    try {
        const resp = await $api("products/"+route.params.id,{
            method: 'GET',
            onResponseError({response}){
                console.log(response._data.error);
            }
        })
        console.log(resp);
        product_selected.value = resp.product;
        product.value.title = product_selected.value.title;
        product.value.sku = product_selected.value.sku;
        product.value.price_general = product_selected.value.price_general;
        product.value.price_company = product_selected.value.price_company;
        product.value.description = product_selected.value.description;
        product.value.product_categorie_id = product_selected.value.product_categorie_id;
        product.value.is_gift = product_selected.value.is_gift+"";
        product.value.is_discount = product_selected.value.is_discount+"";
        product.value.max_discount = product_selected.value.max_discount;
        product.value.tax_selected = product_selected.value.tax_selected;
        product.value.importe_iva = product_selected.value.importe_iva;
        product.value.disponibilidad = product_selected.value.disponibilidad;
        product.value.state = product_selected.value.state;
        product.value.warranty_day = product_selected.value.warranty_day;
        product.value.expiration_date = product_selected.value.expiration_date;
        fileData.value.push({
            file: null,
            url: product_selected.value.imagen
        })

        product_warehouses.value = product_selected.value.warehouses;
        product_wallets.value = product_selected.value.wallets;
    } catch (error) { 
        console.log(error);
    }
}
onMounted(() => {
  config();
  show();
})

definePage({ meta: { permission: 'edit_product', } });
</script>
<template>
  <div>

    <div class="d-flex flex-wrap justify-space-between gap-4 mb-6">
      <div class="d-flex flex-column justify-center">
        <h4 class="text-h4 mb-1">
          Editar Producto : {{ route.params.id }}
        </h4>
      </div>
    </div>

    <VRow>
      <VCol md="8">
        <VCard
          class="mb-6"
          title="Información del producto"
        >
          <VCardText>
            <VRow>
              <VCol cols="12">
                <VTextField
                  label="Nombre del producto"
                  v-model="product.title"
                  placeholder="Acetamifen Tabletas"
                />
              </VCol>
              <VCol
                cols="12"
                md="4"
              >
                <VTextField
                  label="SKU: "
                  v-model="product.sku"
                  placeholder="FXSK123U"
                />
              </VCol>
              <VCol
                cols="12"
                md="4"
              >
                <VTextField
                  label="Precio cliente:"
                  v-model="product.price_general"
                  placeholder="$. 50"
                />
              </VCol>
              <VCol
                cols="12"
                md="4"
              >
                <VTextField
                  label="Precio empresa:"
                  v-model="product.price_company"
                  placeholder="$. 100"
                />
              </VCol>
              <VCol>
                <VLabel class="mb-1">
                  Descripción
                </VLabel>
                <TiptapEditor
                  v-model="product.description"
                  class="border rounded-lg"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>

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
        </VRow>

        <!-- 👉 Product Image -->
        <VCard class="my-6">
          <VCardItem>
            <template #title>
              Imagen del Producto
            </template>
          </VCardItem>

          <VCardText>
            <div class="flex">
              <div class="w-full h-auto relative">
                <div
                  ref="dropZoneRef"
                  class="cursor-pointer"
                  @click="() => open()"
                >
                  <div
                    v-if="fileData.length === 0"
                    class="d-flex flex-column justify-center align-center gap-y-2 pa-12 border-dashed drop-zone"
                  >
                    <VAvatar
                      variant="tonal"
                      color="secondary"
                      rounded
                    >
                      <VIcon icon="ri-upload-2-line" />
                    </VAvatar>
                    <h4 class="text-h4 text-wrap">
                      Arrastre y suelte su imagen aquí 2.
                    </h4>
                    <span class="text-disabled">or</span>

                    <VBtn
                      variant="outlined"
                      size="small"
                    >
                      Buscar Imagen
                    </VBtn>
                  </div>

                  <div
                    v-else
                    class="d-flex justify-center align-center gap-3 pa-8 border-dashed drop-zone flex-wrap"
                  >
                    <VRow class="match-height w-100">
                      <template
                        v-for="(item, index) in fileData"
                        :key="index"
                      >
                        <VCol
                          cols="12"
                          sm="4"
                        >
                          <VCard :ripple="false">
                            <VCardText
                              class="d-flex flex-column"
                              @click.stop
                            >
                              <VImg
                                :src="item.url"
                                width="200px"
                                height="150px"
                                class="w-100 mx-auto"
                              />
                              <div class="mt-2" v-if="item.file">
                                <span class="clamp-text text-wrap">
                                  {{ item.file.name }}
                                </span>
                                <span>
                                  {{ item.file.size / 1000 }} KB
                                </span>
                              </div>
                            </VCardText>
                            <VCardActions>
                              <VBtn
                                variant="text"
                                block
                                @click.stop="fileData.splice(index, 1)"
                              >
                                Remove
                              </VBtn>
                            </VCardActions>
                          </VCard>
                        </VCol>
                      </template>
                    </VRow>
                  </div>
                </div>
              </div>
            </div>
          </VCardText>
        </VCard>

        <VCard
          title="Existencias"
          class="mb-6"
          v-if="isPermission('show_inventory_product')"
        >
          <VCardText>
            <VRow>
              <VCol
                cols="3"
                md="3"
              >
                <VSelect
                  :items="warehouses"
                  item-title="name"
                  item-value="id"
                  placeholder="Select"
                  v-model="warehouse_stock_id"
                  label="Almacenes"
                />
              </VCol>
              <VCol
                cols="3"
                md="3"
              >
                <VSelect
                  :items="units"
                  item-title="name"
                  item-value="id"
                  placeholder="Select"
                  v-model="unit_stock_id"
                  label="Unidades"
                />
              </VCol>
              <VCol
                cols="3"
                md="3"
              >
                <VTextField
                  label="Stock"
                  type="number"
                  v-model="stock"
                  placeholder=""
                />
              </VCol>
              <VCol
                cols="2"
                md="2"
              >
                <VTextField
                  label="Umbral"
                  type="number"
                  v-model="umbral"
                  placeholder=""
                />
              </VCol>
              <VCol
                cols="1"
                md="1"
              >
                <VBtn
                  prepend-icon="ri-add-line"
                  @click="addStock()"
                >
                </VBtn>
              </VCol>
              <VCol
                cols="12"
                v-if="warning_stock"
              >
                <VAlert
                  closable
                  close-label="Close Alert"
                  color="warning"
                >
                {{ warning_stock }}
                </VAlert>
              </VCol>
            </VRow>
          </VCardText>
          
          <VCardText>
            <VTable>
              <thead>
                <tr>
                  <th class="text-uppercase">
                    Almacen
                  </th>
                  <th class="text-uppercase">
                    Unidad
                  </th>
                  <th class="text-uppercase">
                    Stock
                  </th>
                  <th class="text-uppercase">
                    Umbral
                  </th>
                  <th class="text-uppercase">
                    Estado
                  </th>
                  <th class="text-uppercase">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                  <tr v-for="(product_warehouse, index) in product_warehouses" :key="index">
                    <td>
                      {{ product_warehouse.warehouse.name }}
                    </td>
                    <td>
                      {{ product_warehouse.unit.name }}
                    </td>
                    <td>
                      {{ product_warehouse.stock }}
                    </td>
                    <td>
                      {{ product_warehouse.umbral }}
                    </td>
                    <td>
                      <VChip color="primary" v-if="product_warehouse.state_stock == 1">
                          DISPONIBLE
                      </VChip>
                      <VChip color="warning" v-if="product_warehouse.state_stock == 2">
                          POR AGOTAR
                      </VChip>
                      <VChip color="error" v-if="product_warehouse.state_stock == 3">
                          AGOTADO
                      </VChip>
                    </td>
                    <td>
                      <div class="d-flex gap-1">
                        <IconBtn
                            size="small"
                            @click="editItem(product_warehouse)"
                        >
                            <VIcon icon="ri-pencil-line" />
                        </IconBtn>
                        <IconBtn
                            size="small"
                            @click="deleteStock(product_warehouse)"
                        >
                            <VIcon icon="ri-delete-bin-line" />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
              </tbody>
            </VTable>
          </VCardText>
        </VCard>

        <VCard
          title="Multiples Precios"
          class="mb-6"
          v-if="isPermission('show_wallet_price_product')"
        >
          <VCardText>
            <VRow>
              <VCol
                cols="4"
                md="3"
              >
                <VSelect
                  :items="sucursales"
                  item-title="name"
                  item-value="id"
                  placeholder="Select"
                  label="Sucursales"
                  v-model="sucursale_price_id"
                />
              </VCol>
              <VCol
                cols="4"
                md="3"
              >
                <VSelect
                  :items="units"
                  item-title="name"
                  item-value="id"
                  placeholder="Select"
                  label="Unidades"
                  v-model="unit_price_id"
                />
              </VCol>
              <VCol
                cols="4"
                md="3"
              >
                <VSelect
                  :items="[
                    {
                      id: 1,
                      name: 'Cliente Final'
                    },
                    {
                      id: 2,
                      name: 'Cliente Empresa'
                    },
                  ]"
                  item-title="name"
                  item-value="id"
                  placeholder="Select"
                  label="Tipo de cliente"
                  v-model="type_client_price"
                />
              </VCol>
              <VCol
                cols="3"
                md="2"
              >
                <VTextField
                  label="Price"
                  type="number"
                  v-model="price"
                  placeholder=""
                />
              </VCol>
              <VCol
                cols="1"
                md="1"
              >
                <VBtn
                  prepend-icon="ri-add-line"
                  @click="addPrice()"
                >
                </VBtn>
              </VCol>
              <VCol
                cols="12"
                v-if="warning_price"
              >
                <VAlert
                  closable
                  close-label="Close Alert"
                  color="warning"
                >
                {{ warning_price }}
                </VAlert>
              </VCol>
            </VRow>
          </VCardText>
          
          <VCardText>
            <VTable>
              <thead>
                <tr>
                  <th class="text-uppercase">
                    Sucursal
                  </th>
                  <th class="text-uppercase">
                    Unidad
                  </th>
                  <th class="text-uppercase">
                    Tipo de Cliente
                  </th>
                  <th class="text-uppercase">
                    Precio
                  </th>
                  <th class="text-uppercase">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(product_wallet, index) in product_wallets" :key="index">
                  <td>
                    {{ product_wallet.sucursale ? product_wallet.sucursale.name : '---' }}
                  </td>
                  <td>
                    {{ product_wallet.unit.name }}
                  </td>
                  <td>
                    {{ product_wallet.type_client_name }}
                  </td>
                  <td>
                    {{ product_wallet.price }} Dólares
                  </td>
                  <td>
                    <div class="flex">
                      <IconBtn
                              size="small"
                              @click="editProductWalllet(product_wallet)"
                          >
                              <VIcon icon="ri-pencil-line" />
                          </IconBtn>
                          
                      <IconBtn
                        size="small"
                        @click="deletePrice(product_wallet)"
                        >
                            <VIcon icon="ri-delete-bin-line" />
                        </IconBtn>
                    </div>
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VCardText>
        </VCard>

      </VCol>
      <VCol
        md="4"
        cols="12"
      >

        <!-- 👉 Organize -->
        <VCard title="Adicionales">
          <VCardText>
            <div class="d-flex flex-column gap-y-5">
              <VSelect
                placeholder="Select"
                label="Categoria"
                :items="categories"
                item-title="name"
                item-value="id"
                v-model="product.product_categorie_id"
              >
              </VSelect>
              <div class="d-flex">
                <div>
                  <p class="my-0">¿Tiene Descuento?</p>
                  <VCheckbox
                    label="SI"
                    value="2"
                    v-model="product.is_discount"
                  />
                </div>
                <div class="ml-5" v-if="product.is_discount == 2">
                  <VTextField
                      label="% de descuento maximo:"
                      type="number"
                      v-model="product.max_discount"
                      placeholder="13%"
                    />
                </div>
              </div>

              <VTextField
                label="Dias de Garantia:"
                type="number"
                v-model="product.warranty_day"
                placeholder="30"
              />
              <VTextField
                label="Fecha de Vencimiento:"
                type="date"
                v-model="product.expiration_date"
                placeholder="Seleccionar fecha"
              />
            </div>
          </VCardText>
        </VCard>
        <VCard title="Especificaciones" class="my-5">
          <VCardText>
            <div class="d-flex flex-column gap-y-5">
              <VSelect
                placeholder="Select"
                label="Tipo de Impuesto"
                :items="[
                  {
                    id: 1,
                    title: 'Sujeto a Impuesto',
                  },
                  {
                    id: 2,
                    title: 'Libre de Impuesto',
                  }
                ]"
                item-title="title"
                item-value="id"
                v-model="product.tax_selected"
              >
              </VSelect>
                  
              <VTextField
                label="Importe IVA:"
                type="number"
                v-model="product.importe_iva"
                placeholder="13%"
              />

              <VSelect
                placeholder="Select"
                label="Disponibilidad"
                :items="[
                  {
                    id: 2,
                    title: 'No Vender sin Stock'
                  },
                  {
                    id: 1,
                    title: 'Vender sin Stock'
                  }
                ]"
                item-title="title"
                item-value="id"
                v-model="product.disponibilidad"
              >
              </VSelect>
              <VSelect
                placeholder="Select"
                label="Estado"
                :items="[
                  {
                    id: 1,
                    name: 'Activo'
                  },
                  {
                    id: 2,
                    name: 'Inactivo'
                  }
                ]"
                item-title="name"
                item-value="id"
                v-model="product.state"
              />
            </div>
          </VCardText>
        </VCard>
        <VBtn block @click="update">
          Editar Producto
        </VBtn>

      </VCol>
    </VRow>

    <WarehouseProductEditDialog v-if="warehouse_selected && isEditWarehouseDialog" 
    v-model:isDialogVisible="isEditWarehouseDialog" 
    :warehouseSelected="warehouse_selected" 
    :warehouses="warehouses" 
    :units="units"
    :product_id="route.params.id"
    @editWarehouseProduct="warehouseProductEdit"
    ></WarehouseProductEditDialog>
    <WarehouseProductDeleteDialog
    v-if="warehouse_delete_selected && isDeleteWarehouseDialog"
    v-model:isDialogVisible="isDeleteWarehouseDialog"
    :warehouseSelected="warehouse_delete_selected"
    @deleteWarehouse="warehouseProductDelete"
    ></WarehouseProductDeleteDialog>

    <WalletProductEditDialog 
    v-if="product_wallet_edit_selected && isEditProductWalletDialog"
    v-model:isDialogVisible="isEditProductWalletDialog"
    :walletSelected="product_wallet_edit_selected"
    :sucursales="sucursales"
    :units="units"
    :product_id="route.params.id"
    @editWalletProduct="walletProductEdit"
    ></WalletProductEditDialog>
    <WalletProductDeleteDialog 
    v-if="product_wallet_delete_selected && isDeleteProductWalletDialog"
    v-model:isDialogVisible="isDeleteProductWalletDialog"
    :walletSelected="product_wallet_delete_selected"
    @deleteWallet="walletProductDelete"
    ></WalletProductDeleteDialog>

  </div>
</template>
<style lang="scss" scoped>
  .drop-zone {
    border: 1px dashed rgba(var(--v-theme-on-surface), 0.12);
    border-radius: 8px;
  }
</style>
