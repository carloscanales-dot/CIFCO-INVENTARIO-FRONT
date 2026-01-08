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

const list = async () => {
    try {
        let data = {
            search: searchQuery.value,
            warehouse_id: warehouse_id.value,
            unit_id: unit_id.value,
            provider_id: provider_id.value,
            type_comprobant: type_comprobant.value,
            start_date: range_date.value ? range_date.value.split("to")[0] : null,
            end_date: range_date.value ? range_date.value.split("to")[1] : null,
            search_product: search_product.value,
        }
        const resp = await $api("purchase/index?page=" + currentPage.value, {
            method: 'POST',
            body: data,
            onResponseError({ response }) {
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

watch(currentPage, (val) => {
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

const config = async () => {
    try {
        const resp = await $api("purchase/config", {
            method: 'GET',
            onResponseError({ response }) {
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
    if (INDEX != -1) {
        backup.splice(INDEX, 1);
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
    if (INDEX != -1) {
        list_purchases.value.splice(INDEX, 1);
    }
}

const showPdf = (purchase) => {
    window.open(import.meta.env.VITE_API_BASE_URL + "purchase-pdf/" + purchase.id, '_blank');
}

onMounted(() => {
    list();
    config();
})


definePage({ meta: { permission: 'list_purchase', } });
</script>

<template>
    <VCard title="Gestión de Compras">
        <VCardText>
            <!-- FILTROS -->
            <VRow dense>
                <!-- BLOQUE FILTROS -->
                <VCol cols="12" lg="10">
                    <VRow dense>
                        <!-- FILTROS -->
                        <VCol cols="12" sm="6" md="4" lg="3">
                            <VTextField v-model="searchQuery" label="N° de compra" density="compact"
                                @keyup.enter="list" />
                        </VCol>

                        <VCol cols="12" sm="6" md="4" lg="3">
                            <VSelect v-model="warehouse_id" :items="warehouses" item-title="name" item-value="id"
                                label="Almacén"  density="compact" />
                        </VCol>

                        <VCol cols="12" sm="6" md="4" lg="3">
                            <VSelect v-model="unit_id" :items="units" item-title="name"  density="compact" item-value="id"
                                label="Unidad" />
                        </VCol>

                        <VCol cols="12" sm="6" md="4" lg="3">
                            <VSelect v-model="provider_id" :items="providers" item-title="full_name"  density="compact" item-value="id"
                                label="Proveedor" />
                        </VCol>

                        <VCol cols="12" sm="6" md="4" lg="3">
                            <VSelect v-model="type_comprobant" :items="[
                                'FACTURA ELECTRÓNICA',
                                'CRÉDITO FISCAL',
                                'NOTA DE CREDITO',
                                'NOTA DE DEBITO'
                            ]" label="Tipo de comprobante"  density="compact"/>
                        </VCol>

                        <VCol cols="12" sm="6" md="4" lg="3">
                            <AppDateTimePicker v-model="range_date" density="compact" label="Rango de fecha"
                                :config="{ mode: 'range' }" />
                        </VCol>

                        <VCol cols="12" sm="6" md="4" lg="3">
                            <VTextField v-model="search_product" label="Producto" density="compact"
                                @keyup.enter="list" />
                        </VCol>

                        <!-- ACCIONES -->
                        <VCol cols="12" lg="3">
                            <VRow dense>
                                <VCol cols="12">
                                    <VBtn block color="info" prepend-icon="ri-search-2-line" @click="list">
                                        Buscar
                                    </VBtn>
                                </VCol>
                            </VRow>
                        </VCol>
                         <VCol cols="12" lg="3">
                            <VRow dense>
                                <VCol cols="12">
                                    <VBtn block color="secondary" prepend-icon="ri-restart-line" @click="reset">
                                        Limpiar
                                    </VBtn>
                                </VCol>
                            </VRow>
                        </VCol>
                         <VCol cols="12" lg="3">
                            <VRow dense>
                                <VCol cols="12" v-if="isPermission('register_purchase')">
                                    <VBtn block color="primary" @click="router.push({ name: 'purchase-add' })">
                                        Nueva compra
                                        <VIcon end icon="ri-shopping-cart-2-line" />
                                    </VBtn>
                                </VCol>
                            </VRow>
                        </VCol>
                    </VRow>
                </VCol>


                <!-- NUEVA COMPRA -->
                <VCol cols="12" lg="2" class="d-flex justify-end align-end mt-2 mt-lg-0">

                </VCol>
            </VRow>
        </VCardText>

        <!-- TABLA (SCROLL EN MÓVIL) -->
        <div class="table-responsive">
            <VTable density="comfortable">
                <thead>
                    <tr>
                        <th>N° Compra</th>
                        <th>Almacén</th>
                        <th>Proveedor</th>
                        <th>Fecha emisión</th>
                        <th>Tipo</th>
                        <th>N° comprobante</th>
                        <th>Estado</th>
                        <th class="text-center">Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="purchase in list_purchases" :key="purchase.id">
                        <td>{{ purchase.id }}</td>
                        <td>{{ purchase.warehouse.name }}</td>
                        <td>{{ purchase.provider.full_name }}</td>
                        <td>{{ purchase.date_emision }}</td>
                        <td>{{ purchase.type_comprobant }}</td>
                        <td>{{ purchase.n_comprobant }}</td>
                        <td>
                            <VChip size="small" :color="purchase.state === 1
                                ? 'error'
                                : purchase.state === 2
                                    ? 'warning'
                                    : 'primary'
                                ">
                                {{
                                    purchase.state === 1
                                        ? 'Solicitud'
                                        : purchase.state === 2
                                            ? 'Parcial'
                                            : 'Completo'
                                }}
                            </VChip>
                        </td>
                        <td class="text-center">
                            <div class="d-flex justify-center gap-1">
                                <IconBtn size="small" @click="showPdf(purchase)">
                                    <VIcon icon="ri-file-pdf-2-line" />
                                </IconBtn>

                                <IconBtn size="small" v-if="isPermission('edit_purchase')" @click="editItem(purchase)">
                                    <VIcon icon="ri-pencil-line" />
                                </IconBtn>

                                <IconBtn size="small" v-if="purchase.state === 1 && isPermission('delete_purchase')"
                                    @click="deleteItem(purchase)">
                                    <VIcon icon="ri-delete-bin-line" />
                                </IconBtn>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </VTable>
        </div>

        <!-- PAGINACIÓN -->
        <VCardActions class="justify-center justify-lg-end">
            <VPagination v-model="currentPage" :length="totalPage" />
        </VCardActions>
    </VCard>

    <PurchaseDeleteDialog v-if="purchase_selected_delete && isPurchaseDeleteDialogVisible"
        v-model:isDialogVisible="isPurchaseDeleteDialogVisible" :purchaseSelected="purchase_selected_delete"
        @deletePurchase="addDeletePurchase" />
</template>
<style scoped>
.table-responsive {
    overflow-x: auto;
}
</style>
