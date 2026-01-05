<script setup>
    const router = useRouter();
    const isPurchaseDeleteDialogVisible = ref(false);

    const currentPage = ref(1);
    const totalPage = ref(0);

    const list_purchases = ref([]);
    
    const warehouses = ref([]);
    const units = ref([]);
    const providers = ref([]);

    const searchQuery = ref(null);

    const warehouse_id = ref(null);
    const unit_id = ref(null);
    const provider_id = ref(null);
    const type_comprobant = ref(null);
    const range_date = ref(null);
    const search_product = ref(null);

    const purchase_selected_delete = ref(null);

    const list = async() => {
        try {
            let data = {
                search:searchQuery.value,
                warehouse_id: warehouse_id.value,
                unit_id: unit_id.value,
                provider_id: provider_id.value,
                type_comprobant: type_comprobant.value,
                start_date: range_date.value ? range_date.value.split("to")[0] : null,
                end_date: range_date.value ? range_date.value.split("to")[1] : null,
                search_product: search_product.value,
            }
            const resp = await $api("purchase/index?page="+currentPage.value,{
                method:'POST',
                body: data,
                onResponseError({response}){
                    console.log(response._data.error);
                }
            })
            console.log(resp);
            list_purchases.value = resp.purchases.data;
            totalPage.value = resp.total_page;
        } catch (error) {
            console.log(error);
        }
    }

    watch(currentPage,(val) => {
        console.log(val);
        list();
    })

    const reset = () => {
        searchQuery.value = '';
        warehouse_id.value = null;
        unit_id.value = null;
        currentPage.value = 1;
        provider_id.value = '';
        range_date.value = null;
        type_comprobant.value = '';
        search_product.value = '';
        list();
    }

    const config = async() => {
        try {
            const resp = await $api("purchase/config",{
                method:'GET',
                onResponseError({response}){
                    console.log(response._data.error);
                }
            })
            console.log(resp);
            warehouses.value = resp.warehouses;
            units.value = resp.units;
            providers.value = resp.providers;
        } catch (error) {
            console.log(error);
        }
    }

    const addDeleteProduct = (Product) => {
        console.log(Product);
        let backup = list_purchases.value;
        list_purchases.value = [];
        let INDEX = backup.findIndex((product) => product.id == Product.id);
        if(INDEX != -1){
            backup.splice(INDEX,1);
        }
        setTimeout(() => {
            list_purchases.value = backup;
        }, 50);
    }

    const editItem = (purchase) => {
        console.log(purchase);
        router.push({
            name: 'purchase-edit-id',
            params: {
                id: purchase.id
            }
        });
    }
    const deleteItem = (item) => {
        isPurchaseDeleteDialogVisible.value = true;
        purchase_selected_delete.value = item;
    }

    const addDeletePurchase = (PurchaseDelete) => {
        let INDEX = list_purchases.value.findIndex((purchase) => purchase.id == PurchaseDelete.id);
        if(INDEX != -1){
            list_purchases.value.splice(INDEX,1);
        }
    }

    const showPdf = (purchase) => {
        window.open(import.meta.env.VITE_API_BASE_URL+"purchase-pdf/"+purchase.id,'_blank');
    }

    onMounted(() => {
        list();
        config();
    })

    
    definePage({ meta: { permission: 'list_purchase', } });
</script>
<template>
    <div>
        <VCard title="Gestión de Compras">
            <VCardText>
                <VRow class="">
                    <VCol cols="10">
                        <VRow>
                            <VCol cols="3">
                                <VTextField
                                    placeholder="Buscar número de compra"
                                    density="compact"
                                    class="me-3"
                                    v-model="searchQuery"
                                    @keyup.enter="list"
                                />
                            </VCol>
                            <VCol cols="3">
                                <VSelect
                                    :items="warehouses"
                                    item-title="name"
                                    item-value="id"
                                    placeholder="Select"
                                    v-model="warehouse_id"
                                    label="Almacenes"
                                />
                            </VCol>
                            <VCol cols="3">
                                <VSelect
                                :items="units"
                                item-title="name"
                                item-value="id"
                                placeholder="Select"
                                v-model="unit_id"
                                label="Unidades"
                                />
                            </VCol>

                            <VCol cols="3">
                                <VSelect
                                    placeholder="Select"
                                    label="Proveedor"
                                    :items="providers"
                                    item-title="full_name"
                                    item-value="id"
                                    v-model="provider_id"
                                >
                                </VSelect>
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
                                <AppDateTimePicker
                                    v-model="range_date"
                                    label="Rango de fecha"
                                    placeholder="Select date"
                                    :config="{ mode: 'range' }"
                                />
                            </VCol>
                            <VCol cols="3">
                                <VTextField
                                    placeholder="Buscar Producto"
                                    density="compact"
                                    class="me-3"
                                    v-model="search_product"
                                    @keyup.enter="list"
                                />
                            </VCol>
                            <VCol cols="2">
                                <VBtn
                                    color="info"
                                    class="mx-1"
                                    prepend-icon="ri-search-2-line"
                                    @click="list()"
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
                                    @click="reset()"
                                >
                                    <VTooltip
                                        activator="parent"
                                        location="top"
                                    >
                                        Limpieza
                                    </VTooltip>
                                </VBtn>
                            </VCol>
                        </VRow>
                    </VCol>
                    <VCol cols="2" class="text-end">
                        <VBtn v-if="isPermission('register_purchase')" @click="router.push({name: 'purchase-add'})">
                            Nueva Compra
                            <VIcon
                                end
                                icon="ri-shopping-cart-2-line"
                            />
                        </VBtn>
                    </VCol>
                </VRow>
            </VCardText>
            
            <VTable>
               <thead>
                <tr>
                    <th class="text-uppercase">
                        N° Purchase
                    </th>
                    <th class="text-uppercase">
                        Almacen
                    </th>
                    <th class="text-uppercase">
                        Proveedor
                    </th>
                    <th class="text-uppercase">
                        Fecha de emisión
                    </th>
                    <th class="text-uppercase">
                       Tipo de Comprobante
                    </th>

                    <th class="text-uppercase">
                       N° de Comprobante
                    </th>

                    <th class="text-uppercase">
                        Estado
                    </th>
                    <th class="text-uppercase">
                        Acciones
                    </th>
                </tr>
               </thead>

              <tbody>
                <tr
                    v-for="purchase in list_purchases"
                    :key="purchase.id"
                >
                    <td>
                        {{ purchase.id }}
                    </td>
                    <td>
                        {{ purchase.warehouse.name }}
                    </td>
                    <td>
                        {{ purchase.provider.full_name }}
                    </td>
                    <td>
                        {{ purchase.date_emision }}
                    </td>
                    <td>
                        {{ purchase.type_comprobant }}
                    </td>
                    <td>
                        {{ purchase.n_comprobant }}
                    </td>
                    <td>
                        <VChip color="error" v-if="purchase.state == 1">
                            Solicitud
                        </VChip>
                        <VChip color="warning" v-if="purchase.state == 2">
                            Parcial
                        </VChip>
                        <VChip color="primary" v-if="purchase.state == 3">
                            Completo
                        </VChip>
                    </td>
                    <td>
                        <div class="d-flex gap-1">
                            <IconBtn
                                size="small"
                                @click="showPdf(purchase)"
                            >
                                <VIcon icon="ri-file-pdf-2-line" />
                            </IconBtn>

                            <IconBtn
                                size="small"
                                @click="editItem(purchase)"
                                v-if="isPermission('edit_purchase')"
                            >
                                <VIcon icon="ri-pencil-line" />
                            </IconBtn>
                            <IconBtn
                                size="small"
                                v-if="purchase.state == 1 && isPermission('delete_purchase')"
                                @click="deleteItem(purchase)"
                            >
                                <VIcon icon="ri-delete-bin-line" />
                            </IconBtn>
                        </div>
                    </td>
                </tr>
               </tbody>
            </VTable>
            <VPagination
                v-model="currentPage"
                :length="totalPage"
            />
        </VCard>
        
        <PurchaseDeleteDialog v-if="purchase_selected_delete && isPurchaseDeleteDialogVisible" 
        v-model:isDialogVisible="isPurchaseDeleteDialogVisible" 
        :purchaseSelected="purchase_selected_delete" 
        @deletePurchase="addDeletePurchase"></PurchaseDeleteDialog>
    </div>
</template>