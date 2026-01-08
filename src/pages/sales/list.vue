<script setup>
const router = useRouter();
const isSaleDeleteDialogVisible = ref(false);
const isSaleDetailShowDialogVisible = ref(false);
const currentPage = ref(1);
const totalPage = ref(0);

const list_sales = ref([]);
const searchQuery = ref(null);
const type_client = ref(null);
const search_client = ref(null);
const range_date = ref(null);
const type = ref(null);
const state_entrega = ref(null);
const state_payment = ref(null);
const search_product = ref(null);

const sale_selected_delete = ref(null);
const sale_selected_show = ref(null);
const list = async () => {
    try {
        let data = {
            search: searchQuery.value,
            type_client: type_client.value,
            search_client: search_client.value,
            start_date: range_date.value ? range_date.value.split("to")[0] : '',
            end_date: range_date.value ? range_date.value.split("to")[1] : '',
            type: type.value,
            state_entrega: state_entrega.value,
            state_payment: state_payment.value,
            search_product: search_product.value,
        }
        const resp = await $api("sales/index?page=" + currentPage.value, {
            method: 'POST',
            body: data,
            onResponseError({ response }) {
                console.log(response._data.error);
            }
        })
        console.log(resp);
        list_sales.value = resp.sales.data;
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
    type_client.value = '';
    search_client.value = '';
    range_date.value = '';
    type.value = '';
    state_entrega.value = '';
    state_payment.value = '';
    search_product.value = '';
    currentPage.value = 1;
    list();
}

const downloadExcel = () => {
    let QUERY_PARAMS = "";
    if (searchQuery.value) {
        QUERY_PARAMS += "&search=" + searchQuery.value;
    }
    if (type_client.value) {
        QUERY_PARAMS += "&type_client=" + type_client.value;
    }
    if (search_client.value) {
        QUERY_PARAMS += "&search_client=" + search_client.value;
    }
    if (range_date.value) {
        QUERY_PARAMS += "&start_date=" + (range_date.value.split("to")[0]);
        QUERY_PARAMS += "&end_date=" + (range_date.value.split("to")[1]);
    }
    if (type.value) {
        QUERY_PARAMS += "&type=" + type.value;
    }
    if (state_entrega.value) {
        QUERY_PARAMS += "&state_entrega=" + state_entrega.value;
    }
    if (state_payment.value) {
        QUERY_PARAMS += "&state_payment=" + state_payment.value;
    }
    if (search_product.value) {
        QUERY_PARAMS += "&search_product=" + search_product.value;
    }
    window.open(import.meta.env.VITE_API_BASE_URL + 'sales-excel?z=1' + QUERY_PARAMS, '_blank');
}

const addDeleteProduct = (Product) => {
    console.log(Product);
    let backup = list_sales.value;
    list_sales.value = [];
    let INDEX = backup.findIndex((product) => product.id == Product.id);
    if (INDEX != -1) {
        backup.splice(INDEX, 1);
    }
    setTimeout(() => {
        list_sales.value = backup;
    }, 50);
}

const editItem = (sale) => {
    console.log(sale);
    router.push({
        name: 'sales-edit-id',
        params: {
            id: sale.id
        }
    });
}
const deleteItem = (sale) => {
    isSaleDeleteDialogVisible.value = true;
    sale_selected_delete.value = sale;
}
const saleDelete = (SALE) => {

    let INDEX = list_sales.value.findIndex((sale) => sale.id == SALE.id);
    if (INDEX != -1) {
        list_sales.value.splice(INDEX, 1);
    }
}

const showDetails = (sale) => {
    isSaleDetailShowDialogVisible.value = true;
    sale_selected_show.value = sale;
}

const showPdf = (sale) => {
    window.open(import.meta.env.VITE_API_BASE_URL + "sales-pdf/" + sale.id, '_blank');
}

onMounted(() => {
    list();
})


definePage({ meta: { permission: 'list_sale', } });
</script>
<template>
    <div>
        <VCard title="Ventas o Cotizaciones">
            <VCardText>
                <!-- FILTROS -->
                <VRow dense>
                    <VCol cols="12" lg="12">
                        <VRow dense>
                            <VCol cols="12" sm="6" md="4" lg="3">
                                <VTextField v-model="searchQuery" density="compact" label="N° Venta / Cotización" @keyup.enter="list" />
                            </VCol>

                            <VCol cols="12" sm="6" md="4" lg="3">
                                <VSelect v-model="type_client" density="compact" label="Tipo de cliente" :items="[
                                    { id: 1, title: 'Cliente Final' },
                                    { id: 2, title: 'Cliente Empresa' }
                                ]" item-title="title" item-value="id" />
                            </VCol>

                            <VCol cols="12" sm="6" md="4" lg="3">
                                <VTextField v-model="search_client" density="compact" label="Cliente" placeholder="Buscar cliente"
                                    @keyup.enter="list" />
                            </VCol>

                            <VCol cols="12" sm="6" md="4" lg="3">
                                <AppDateTimePicker v-model="range_date" density="compact" label="Rango de fecha"
                                    :config="{ mode: 'range' }" />
                            </VCol>

                            <VCol cols="12" sm="6" md="4" lg="2">
                                <VSelect v-model="type" density="compact" label="Tipo" :items="[
                                    { id: 1, title: 'Venta' },
                                    { id: 2, title: 'Cotización' }
                                ]" item-title="title" item-value="id" />
                            </VCol>

                            <VCol cols="12" sm="6" md="4" lg="3">
                                <VSelect v-model="state_entrega" density="compact" label="Estado de entrega" :items="[
                                    { id: 1, title: 'Pendiente' },
                                    { id: 2, title: 'Parcial' },
                                    { id: 3, title: 'Completo' }
                                ]" item-title="title" item-value="id" />
                            </VCol>

                            <VCol cols="12" sm="6" md="4" lg="3">
                                <VSelect v-model="state_payment" density="compact" label="Estado de pago" :items="[
                                    { id: 1, title: 'Pendiente' },
                                    { id: 2, title: 'Parcial' },
                                    { id: 3, title: 'Completo' }
                                ]" item-title="title" item-value="id" />
                            </VCol>

                            <VCol cols="12" sm="6" md="4" lg="4">
                                <VTextField v-model="search_product" density="compact" label="Producto" placeholder="Buscar producto"
                                    @keyup.enter="list" />
                            </VCol>
                            <VCol cols="12" sm="6" md="3" lg="3" v-if="isPermission('register_sale')">
                                <VBtn block color="primary" @click="router.push({ name: 'sales-add' })">
                                    Nueva venta
                                    <VIcon end icon="ri-shopping-cart-2-line" />
                                </VBtn>
                            </VCol>

                            <VCol cols="12" sm="6" md="3" lg="3">
                                <VBtn block color="info" prepend-icon="ri-search-2-line" @click="list">
                                    Buscar
                                </VBtn>
                            </VCol>

                            <VCol cols="12" sm="6" md="3" lg="3">
                                <VBtn block color="secondary" prepend-icon="ri-restart-line" @click="reset">
                                    Limpiar
                                </VBtn>
                            </VCol>

                            <VCol cols="12" sm="6" md="3" lg="3">
                                <VBtn block color="success" prepend-icon="ri-file-excel-2-line" @click="downloadExcel">
                                    Exportar
                                </VBtn>
                            </VCol>
                        </VRow>
                    </VCol>

                    <!-- ACCIONES -->
                    <VCol cols="12" lg="3">
                        <VRow dense>

                        </VRow>
                    </VCol>
                </VRow>
            </VCardText>

            <!-- TABLA -->
            <div class="table-responsive">
                <VTable density="comfortable">
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Cliente</th>
                            <th>Tipo cliente</th>
                            <th>Asesor</th>
                            <th>Total</th>
                            <th>Pagado</th>
                            <th>Tipo</th>
                            <th>Estado pago</th>
                            <th>Estado entrega</th>
                            <th>Registro</th>
                            <th class="text-center">Acción</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr v-for="item in list_sales" :key="item.id" style="font-size: smaller">
                            <td>{{ item.id }}</td>
                            <td>{{ item.client.full_name }}</td>
                            <td>{{ item.type_client == 1 ? 'CLIENTE FINAL' : 'CLIENTE EMPRESA' }}</td>
                            <td>{{ item.user.full_name }}</td>
                            <td>$. {{ item.total }}</td>
                            <td>$. {{ item.debt }}</td>
                            <td>{{ item.state_sale == 1 ? 'VENTA' : 'COTIZACIÓN' }}</td>
                            <td>
                                <VChip size="small"
                                    :color="item.state_payment == 1 ? 'error' : item.state_payment == 2 ? 'warning' : 'primary'">
                                    {{ item.state_payment == 1 ? 'Pendiente' : item.state_payment == 2 ? 'Parcial' :
                                        'Completo' }}
                                </VChip>
                            </td>
                            <td>
                                <VChip size="small"
                                    :color="item.state_entrega == 1 ? 'warning' : item.state_entrega == 2 ? 'secondary' : 'info'">
                                    {{ item.state_entrega == 1 ? 'Pendiente' : item.state_entrega == 2 ? 'Parcial' :
                                        'Completo' }}
                                </VChip>
                            </td>
                            <td>{{ item.created_at }}</td>
                            <td class="text-center">
                                <div class="d-flex justify-center gap-1">
                                    <IconBtn size="small" @click="showPdf(item)">
                                        <VIcon icon="ri-file-pdf-2-line" />
                                    </IconBtn>

                                    <IconBtn size="small" @click="showDetails(item)">
                                        <VIcon icon="ri-file-list-2-line" />
                                    </IconBtn>

                                    <IconBtn size="small" v-if="isPermission('edit_sale')" @click="editItem(item)">
                                        <VIcon icon="ri-pencil-line" />
                                    </IconBtn>

                                    <IconBtn size="small" v-if="isPermission('delete_sale')" @click="deleteItem(item)">
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

        <!-- DIALOGS -->
        <SaleDeleteDialog v-if="sale_selected_delete && isSaleDeleteDialogVisible"
            v-model:isDialogVisible="isSaleDeleteDialogVisible" :saleSelected="sale_selected_delete"
            @deleteSale="saleDelete" />

        <SaleDetailShowDialog v-if="sale_selected_show && isSaleDetailShowDialogVisible"
            v-model:isDialogVisible="isSaleDetailShowDialogVisible" :saleSelected="sale_selected_show" />
    </div>
</template>
