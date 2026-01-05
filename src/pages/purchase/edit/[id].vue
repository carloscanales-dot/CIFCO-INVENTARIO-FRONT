<script setup>
    import { useRoute, useRouter } from 'vue-router'
    const router = useRouter()
    const route = useRoute('purchase-edit-id');
    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
    const isPurchaseDetailDialogVisible = ref(false);
    const purchase_detail_selected = ref(null);
    const isPurchaseDetailDeleteDialogVisible = ref(false);
    const purchase_detail_delete_selected = ref(null);

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
    const addProduct = async () => {
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
        let data = {
            purchase_id: route.params.id,
            product: select_product.value,
            unit_id: unit_id.value,
            unit: UNIT_SELECTED,
            price_unit: price_unit.value,
            quantity: quantity.value,
            total: Number((price_unit.value * quantity.value).toFixed(2))
        }
        try {
            const resp = await $api("purchase_details/",{
                method:'POST',
                body:data,
                onResponseError({response}){
                    warning_purchase.value = response._data.error;
                }
            })
            console.log(resp);
            purchase_details.value.push(resp.purchase_detail);
            console.log(purchase_details.value);
            importe.value = resp.importe;
            total.value = resp.total;
            igv.value = resp.igv;
            setTimeout(() => {
                unit_id.value = '';
                price_unit.value = 0;
                quantity.value = 0;
                select_product.value = null;
                search_product.value = '';
            }, 25);
        } catch (error) {
            console.log(error);
        }
    }

    const editPurchaseDetail = (purchase_detail) => {
        isPurchaseDetailDialogVisible.value = true;
        purchase_detail_selected.value = purchase_detail;
    }
    const purchaseDetailEdit = (DATA) => {
        const PurchaseDetailUpdate = DATA.purchase_detail;

        let INDEX = purchase_details.value.findIndex((detail) => detail.id == PurchaseDetailUpdate.id);
        if(INDEX != -1){
            purchase_details.value[INDEX] = PurchaseDetailUpdate;
        }

        importe.value = DATA.importe;
        igv.value = DATA.igv;
        total.value = DATA.total;
    }

    const purchaseDetailAttention = async (purchase_detail) => {
        try {
            let data = {
                purchase_id: route.params.id,
                purchase_detail_id: purchase_detail.id,
            }
            const resp = await $api("purchase_details/attention",{
                method:'POST',
                body:data,
                onResponseError({response}){
                    warning_purchase.value = response._data.error;
                }
            })
            console.log(resp);

            let INDEX = purchase_details.value.findIndex((detail) => detail.id == resp.purchase_detail.id);
            if(INDEX != -1){
                purchase_details.value[INDEX] = resp.purchase_detail;
            }
        } catch (error) {
            console.log(error);
        }
    }

    const calcTotalPurchase = () => {
        importe.value = Number(purchase_details.value.reduce((sum,purchase_detail) => sum + purchase_detail.total,0).toFixed(2));
        igv.value = Number((importe.value * 0.18).toFixed(2));
        total.value = Number((importe.value + igv.value).toFixed(2));
    }

    const deletePurchaseDetail = (purchase_detail,index) => {
        isPurchaseDetailDeleteDialogVisible.value = true;
        purchase_detail_delete_selected.value = purchase_detail;
    }

    const purchaseDetailDelete = (DATA) => {
        // purchase_detail_id
        // importe
        // igv
        // total
        let INDEX = purchase_details.value.findIndex((detail) => detail.id == DATA.purchase_detail_id);
        if(INDEX != -1){
            purchase_details.value.splice(INDEX,1);
        }

        importe.value = DATA.importe;
        igv.value = DATA.igv;
        total.value = DATA.total;
    }

    const update = async () => {
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
                // warehouse_id: warehouse_id.value,
                provider_id: provider_id.value,
                // date_emision: date_emision.value,
                type_comprobant: type_comprobant.value,
                n_comprobant: n_comprobant.value,
                description:description.value,
            }

            const resp = await $api("purchase/"+route.params.id,{
                method:'PATCH',
                body:data,
                onResponseError({response}){
                    warning_purchase.value = response._data.error;
                }
            })
            console.log(resp);
            success_purchase.value = "LA COMPRA SE HA ACTUALIZADO CORRECTAMENTE";
            // Esperar 1 segundos y redirigir a la lista de ventas
            setTimeout(() => {
                router.push({ name: 'purchase-list' });
            }, 1000);
            // cleanFieldForm();
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
            // date_emision.value = resp.today;
        } catch (error) {
            console.log(error);
        }
    }

    const show = async() => {
        try {
            const resp = await $api("purchase/"+route.params.id,{
                method: 'GET',
                onResponseError({response}){
                    console.log(response._data.error);
                }
            })
            console.log(resp);
            warehouse_id.value = resp.purchase.warehouse_id;
            provider_id.value = resp.purchase.provider_id;
            date_emision.value = resp.purchase.date_emision;
            type_comprobant.value = resp.purchase.type_comprobant;
            n_comprobant.value = resp.purchase.n_comprobant;
            description.value = resp.purchase.description;
            purchase_details.value = resp.purchase.details;
            importe.value = resp.purchase.importe; 
            igv.value = resp.purchase.igv;
            total.value = resp.purchase.total;
        } catch (error) {
            console.log(error);
        }
    }
    onMounted(() => {
        config();
        show();
    })
    definePage({ meta: { permission: 'edit_purchase', } });
</script>
<template>
    <div>
        <div class="d-flex flex-wrap justify-space-between gap-4 mb-6">
            <div class="d-flex flex-column justify-center">
                <h4 class="text-h4 mb-1">
                    Editar Compra : N° {{ route.params.id }}
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
                                    disabled
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
                                    disabled
                                />
                            </VCol>
                            <VCol cols="3">
                                <VSelect
                                    :items="[
                                        'FACTURA ELECTRÓNICA',
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
                                            placeholder="Buscar producto por nombre"
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

                                </th>
                                <th class="text-uppercase">
                                    Estado E.
                                </th>
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
                                <td>
                                    <VBtn
                                        v-if="purchase_detail.state == 1"
                                        @click="purchaseDetailAttention(purchase_detail)"
                                        icon="ri-contract-line"
                                        variant="text"
                                    />
                                </td>
                                <td>
                                    <VChip color="error" v-if="purchase_detail.state == 1">
                                        Pendiente
                                    </VChip>
                                    <VChip color="primary" v-if="purchase_detail.state == 2">
                                        Entregado
                                    </VChip>
                                </td>
                                <td>{{ purchase_detail.product.title }}</td>
                                <td>{{ purchase_detail.unit.name }}</td>
                                <td>$. {{ purchase_detail.price_unit }}</td>
                                <td>{{ purchase_detail.quantity }}</td>
                                <td>$. {{ purchase_detail.total }}</td>
                                <td class="d-flex align-center"> 
                                    <IconBtn
                                        size="small"
                                        @click="editPurchaseDetail(purchase_detail)"
                                    >
                                        <VIcon icon="ri-pencil-line" />
                                    </IconBtn>
                                    <IconBtn
                                        size="small"
                                        v-if="purchase_detail.state != 2"
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
                <VBtn block @click="update">
                    Editar la Compra
                </VBtn>
            </VCol>
        </VRow>

        <PurchaseDetailEditDialog 
            v-if="purchase_detail_selected && isPurchaseDetailDialogVisible"
            v-model:isDialogVisible="isPurchaseDetailDialogVisible"
            :purchaseDetailSelected="purchase_detail_selected"
            :units="units"
            :purchase_id="route.params.id"
            @editPurchaseDetail="purchaseDetailEdit"
        >

        </PurchaseDetailEditDialog>

        <PurchaseDetailDeleteDialog
            v-if="purchase_detail_delete_selected && isPurchaseDetailDeleteDialogVisible"
            v-model:isDialogVisible="isPurchaseDetailDeleteDialogVisible"
            :purchaseDetailSelected="purchase_detail_delete_selected"
            @deletePurchaseDetail="purchaseDetailDelete"
        >

        </PurchaseDetailDeleteDialog>
    </div>
</template>