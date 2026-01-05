<script setup>

    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;

    const warehouse_id = ref(null);
    const date_emision = ref(null);
    const type_comprobant = ref(null);
    const n_comprobant = ref(null);
    const provider_id = ref(null);
    const description = ref(null);
    const importe = ref(0);
    const igv = ref(0);
    const total = ref(0);

    const units = ref([]);
    const warehouses = ref([]);
    const providers = ref([]);

    const purchase_details = ref([]);
    const warning_purchase = ref(null);
    const success_purchase = ref(null);

    // BUSQUEDA DE PRODUCTO
    const loading = ref(false)
    const search_product = ref()
    const select_product = ref(null)
    const items = ref([]);
    const warning_warehouse = ref(null);
    const unit_id = ref(null);
    const price_unit = ref(0);
    const quantity = ref(0);
    const querySelections = query => {
        loading.value = true

        // Simulated ajax query
        setTimeout(async () => {
            // items.value = states.filter(state => (state || '').toLowerCase().includes((query || '').toLowerCase()))
            try {
                const resp = await $api("sales/search_product?search="+(search_product.value ? search_product.value : ''),{
                    method: 'GET',
                    onResponseError({response}){
                        console.log(response._data.error);
                    }
                })
                console.log(resp);
                items.value = resp.products.data;
                loading.value = false
            } catch (error) {
                console.log(error);
            }

        }, 500)
    }

    watch(search_product, query => {
        warning_warehouse.value = null;
        if(!warehouse_id.value){
            setTimeout(() => {
                warning_warehouse.value = "En necesario seleccionar un almacen , antes de escoger un producto";
            }, 25);
            return;
        }
        if(query.length > 3){
            querySelections(query)
        }else{
            items.value = [];
        }
    })
    watch(select_product,value => {
        console.log(value);
    })
    watch(warehouse_id,value => {
        console.log(value);
    })
    watch(unit_id, value => {
        console.log(value);
    })
    // FIN DE BUSQUEDA DE PRODUCTO
    const addProduct = () => {
        warning_warehouse.value = null;
        if(!select_product.value){
            setTimeout(() => {
                warning_warehouse.value = "Es necesario seleccionar un producto";
            }, 25);
            return;
        }
        if(!unit_id.value){
            setTimeout(() => {
                warning_warehouse.value = "Es necesario seleccionar una unidad";
            }, 25);
            return;
        }
        if(!price_unit.value){
            setTimeout(() => {
                warning_warehouse.value = "Es necesario digitar un precio unitario para el producto";
            }, 25);
            return;
        }
        if(!quantity.value || quantity.value < 0){
            setTimeout(() => {
                warning_warehouse.value = "Es necesario digitar una cantidad";
            }, 25);
            return;
        }

        let UNIT_SELECTED = units.value.find((unit) => unit.id == unit_id.value);
        purchase_details.value.push({
            product: select_product.value,
            unit_id: unit_id.value,
            unit: UNIT_SELECTED,
            price_unit: price_unit.value,
            quantity: quantity.value,
            total: Number((price_unit.value * quantity.value).toFixed(2))
        });
        console.log(purchase_details.value);
        setTimeout(() => {
            calcTotalPurchase();
            unit_id.value = '';
            price_unit.value = 0;
            quantity.value = 0;
            select_product.value = null;
            search_product.value = '';
        }, 25);
    }

    const calcTotalPurchase = () => {
        importe.value = Number(purchase_details.value.reduce((sum,purchase_detail) => sum + purchase_detail.total,0).toFixed(2));
        igv.value = Number((importe.value * 0.13).toFixed(2));
        total.value = Number((importe.value + igv.value).toFixed(2));
    }

    const deletePurchaseDetail = (purchase_detail,index) => {
        purchase_details.value.splice(index,1);
        calcTotalPurchase();
    }

    const store = async () => {
        try {
            warning_purchase.value = null;success_purchase.value = null;
            if(!warehouse_id.value){
                setTimeout(() => {
                    warning_purchase.value = "Es requerido seleccionar un almacen";
                }, 25);
                return;
            }
            if(!provider_id.value){
                setTimeout(() => {
                    warning_purchase.value = "Es requerido seleccionar un proveedor";
                }, 25);
                return;
            }
            if(!type_comprobant.value){
                setTimeout(() => {
                    warning_purchase.value = "Es requerido seleccionar un tipo de comprobante";
                }, 25);
                return;
            }
            if(!n_comprobant.value){
                setTimeout(() => {
                    warning_purchase.value = "Es requerido digitar un n° de comprobante";
                }, 25);
                return;
            }
            if(purchase_details.value == 0){
                setTimeout(() => {
                    warning_purchase.value = "Es requerido añadir al menos un producto al detallado";
                }, 25);
                return;
            }

            let data = {
                warehouse_id: warehouse_id.value,
                provider_id: provider_id.value,
                date_emision: date_emision.value,
                type_comprobant: type_comprobant.value,
                n_comprobant: n_comprobant.value,
                purchase_details: purchase_details.value,
                description:description.value,
                total: total.value,
                importe: importe.value,
                igv: igv.value
            }

            const resp = await $api("purchase",{
                method:'POST',
                body:data,
                onResponseError({response}){
                    warning_purchase.value = response._data.error;
                }
            })
            console.log(resp);
            success_purchase.value = "LA COMPRA SE HA REGISTRADO CORRECTAMENTE";
            setTimeout(() => {
                warehouse_id.value = '';
                provider_id.value = '';
                type_comprobant.value = '';
                n_comprobant.value = '';
                description.value = '';

                purchase_details.value = [];
                total.value = 0;
                importe.value = 0;
                igv.value = 0;
            }, 25);
        } catch (error) {
            console.log(error);
        }
    }

    const config = async () => {
        try {
            const resp = await $api("purchase/config",{
                method: 'GET',
                onResponseError({response}){
                    console.log(response._data.error);
                }
            })
            console.log(resp);
            warehouses.value = resp.warehouses;
            units.value = resp.units;
            providers.value = resp.providers;
            date_emision.value = resp.today;
        } catch (error) {
            console.log(error);
        }
    }
    onMounted(() => {
        config();
    })
    definePage({ meta: { permission: 'register_purchase', } });
</script>
<template>
    <div>
        <div class="d-flex flex-wrap justify-space-between gap-4 mb-6">
            <div class="d-flex flex-column justify-center">
                <h4 class="text-h4 mb-1">
                    Agregar Nueva Compra
                </h4>
            </div>
        </div>

        <VRow>
            <VCol cols="12">
                <VCard
                    class="mb-6"
                    title="Información General"
                    >
                    <VCardText>
                        <VRow>
                            <VCol cols="3">
                                <VTextField
                                    label="Solicitante"
                                    placeholder=""
                                    disabled
                                    v-model="user.full_name"
                                />
                            </VCol>
                            <VCol cols="3">
                                <VTextField
                                    label="Sucursal"
                                    placeholder=""
                                    disabled
                                    v-model="user.sucursale.name"
                                />
                            </VCol>
                            <VCol cols="3">
                                <VSelect
                                    v-model="warehouse_id"
                                    :items="warehouses"
                                    label="Almacenes"
                                    placeholder="Select Almacen"
                                    item-title="name"
                                    item-value="id"
                                    eager
                                />
                            </VCol>
                            <VCol cols="3">
                                <VSelect
                                    v-model="provider_id"
                                    :items="providers"
                                    label="Proveedores"
                                    placeholder="Select Proveedor"
                                    item-title="full_name"
                                    item-value="id"
                                    eager
                                />
                            </VCol>
                        </VRow>
                        <VRow>
                            <VCol cols="3">
                                <AppDateTimePicker
                                    label="Fecha de emisión"
                                    placeholder="Select date"
                                    v-model="date_emision"
                                />
                            </VCol>
                            <VCol cols="3">
                                <VSelect
                                    :items="[
                                        'FACTURA ELECTRÓNICA',
                                        'CRÉDITO FISCAL',
                                        'NOTA DE CREDITO',
                                        'NOTA DE DEBITO'
                                    ]"
                                    v-model="type_comprobant"
                                    label="Tipo de Comprobantes"
                                    placeholder="Select Tipo"
                                    eager
                                />
                            </VCol>
                            <VCol cols="3">
                                <VTextField
                                   v-model="n_comprobant"
                                    label="N° de Comprobante"
                                    placeholder=""
                                />
                            </VCol>
                            <VCol cols="3">
                                <VTextarea
                                    label="Nota final"
                                    placeholder=""
                                    v-model="description"
                                />
                            </VCol>
                            <VCol cols="12" v-if="warning_purchase">
                                <VAlert
                                    closable
                                    close-label="Close Alert"
                                    color="warning"
                                >
                                {{ warning_purchase }}
                                </VAlert>
                            </VCol>
                            <VCol cols="12" v-if="success_purchase">
                                <VAlert
                                    closable
                                    close-label="Close Alert"
                                    color="success"
                                >
                                {{ success_purchase }}
                                </VAlert>
                            </VCol>
                        </VRow>
                    </VCardText>
                </VCard>
            </VCol>
            <VCol cols="12">
                <VCard
                    class="mb-6"
                    title="Producto Solicitado"
                    >

                    <VCardText>
                        <VRow>
                            <VCol cols="7">
                                <VRow>
                                    <VCol cols="12">
                                        <VAutocomplete
                                            v-model="select_product"
                                            v-model:search="search_product"
                                            :loading="loading"
                                            :items="items"
                                            item-title="title"
                                            item-value="id"
                                            return-object
                                            placeholder="Busca el producto"
                                            label="¿Que desea agregar?"
                                            variant="underlined"
                                            :menu-props="{ maxHeight: '200px' }"
                                        />
                                    </VCol>
                                    <VCol cols="12" v-if="warning_warehouse">
                                        <VAlert
                                            closable
                                            close-label="Close Alert"
                                            color="warning"
                                        >
                                        {{ warning_warehouse }}
                                        </VAlert>
                                    </VCol>
                                </VRow>


                            </VCol>
                            <VCol cols="5">
                                <VRow>
                                    <VCol cols="10">
                                        <VRow>
                                            <VCol cols="4">
                                                <VSelect
                                                    :items="units"
                                                    item-title="name"
                                                    item-value="id"
                                                    placeholder="Select"
                                                    v-model="unit_id"
                                                    label="Unidades"
                                                />
                                            </VCol>
                                            <VCol cols="4">
                                                <VTextField
                                                    label="Precio"
                                                    type="number"
                                                    v-model="price_unit"
                                                    placeholder=""
                                                />
                                            </VCol>
                                            
                                            <VCol cols="4">
                                                <VTextField
                                                    label="Cantidad"
                                                    type="number"
                                                    v-model="quantity"
                                                    placeholder=""
                                                />
                                            </VCol>
                                        </VRow>
                                    </VCol>
                                    <VCol cols="2">
                                        <VBtn color="primary" @click="addProduct()">
                                            <VIcon icon="ri-add-circle-line" />
                                        </VBtn>
                                    </VCol>
                                </VRow>
                            </VCol>
                        </VRow>
                    </VCardText>
                </VCard>
            </VCol>
            <VCol cols="12">
                <VCard
                    class="mb-6"
                    title="Detalle de la compra"
                    >

                    <VTable>
                        <thead>
                            <tr>
                                <th class="text-uppercase">
                                    Producto
                                </th>
                                <th class="text-uppercase">
                                    Unidad
                                </th>
                                <th class="text-uppercase">
                                    Precio Unitario
                                </th>
                                <th class="text-uppercase">
                                    Cantidad
                                </th>
                                <th class="text-uppercase">
                                    Total
                                </th>
                                <th class="text-uppercase">
                                    Acción
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            
                            <tr v-for="(purchase_detail, index) in purchase_details" :key="index">
                                <td>{{ purchase_detail.product.title }}</td>
                                <td>{{ purchase_detail.unit.name }}</td>
                                <td>$. {{ purchase_detail.price_unit }}</td>
                                <td>{{ purchase_detail.quantity }}</td>
                                <td>$. {{ purchase_detail.total }}</td>
                                <td>
                                    <IconBtn
                                        size="small"
                                        @click="deletePurchaseDetail(purchase_detail,index)"
                                    >
                                        <VIcon icon="ri-delete-bin-line" />
                                    </IconBtn>
                                </td>
                            </tr>

                            <tr>
                                <td></td>
                                <td></td>
                                <td>
                                    <VTextField
                                        label="Importe"
                                        placeholder=""
                                        type="number"
                                        v-model="importe"
                                    />
                                </td>
                                <td>
                                    <VTextField
                                        label="iva"
                                        placeholder=""
                                        type="number"
                                        v-model="igv"
                                    />
                                </td>
                                <td>
                                    <VTextField
                                        label="Total"
                                        placeholder=""
                                        type="number"
                                        v-model="total"
                                    />
                                </td>
                                <td>

                                </td>
                            </tr>
                        </tbody>
                    </VTable>
                </VCard>
            </VCol>
            <VCol cols="12">
                <VBtn block @click="store">
                    Registrar una Compra
                </VBtn>
            </VCol>
        </VRow>
    </div>
</template>