<script setup>
    const router = useRouter();
    const isTransportDeleteDialogVisible = ref(false);

    const currentPage = ref(1);
    const totalPage = ref(0);

    const list_transports = ref([]);
    
    const warehouses = ref([]);
    const units = ref([]);

    const searchQuery = ref(null);

    const warehouse_start_id = ref(null);
    const warehouse_end_id = ref(null);
    const unit_id = ref(null);
    const range_date = ref(null);
    const search_product = ref(null);

    const transport_selected_delete = ref(null);

    const list = async() => {
        try {
            let data = {
                search:searchQuery.value,
                warehouse_start_id: warehouse_start_id.value,
                warehouse_end_id: warehouse_end_id.value,
                unit_id: unit_id.value,
                start_date: range_date.value ? range_date.value.split("to")[0] : null,
                end_date: range_date.value ? range_date.value.split("to")[1] : null,
                search_product: search_product.value,
            }
            const resp = await $api("transports/index?page="+currentPage.value,{
                method:'POST',
                body: data,
                onResponseError({response}){
                    console.log(response._data.error);
                }
            })
            console.log(resp);
            list_transports.value = resp.transports.data;
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
        warehouse_start_id.value = null;
        warehouse_end_id.value = null;
        unit_id.value = null;
        currentPage.value = 1;
        range_date.value = null;
        search_product.value = '';
        list();
    }

    const config = async() => {
        try {
            const resp = await $api("transports/config",{
                method:'GET',
                onResponseError({response}){
                    console.log(response._data.error);
                }
            })
            console.log(resp);
            warehouses.value = resp.warehouses;
            units.value = resp.units;
        } catch (error) {
            console.log(error);
        }
    }

    const editItem = (transport) => {
        console.log(transport);
        router.push({
            name: 'transport-edit-id',
            params: {
                id: transport.id
            }
        });
    }
    const deleteItem = (item) => {
        isTransportDeleteDialogVisible.value = true;
        transport_selected_delete.value = item;
    }

    const addDeleteTransport = (TransportDelete) => {
        let INDEX = list_transports.value.findIndex((transport) => transport.id == TransportDelete.id);
        if(INDEX != -1){
            list_transports.value.splice(INDEX,1);
        }
    }

    const showPdf = (transport) => {
        window.open(import.meta.env.VITE_API_BASE_URL+"transport-pdf/"+transport.id,'_blank');
    }

    onMounted(() => {
        list();
        config();
    })

    
    definePage({ meta: { permission: 'list_transport', } });
</script>
<template>
    <div>
        <VCard title="🚚 Transports">
            <VCardText>
                <VRow class="">
                    <VCol cols="10">
                        <VRow>
                            <VCol cols="3">
                                <VTextField
                                    placeholder="Search N° Transport"
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
                                    v-model="warehouse_start_id"
                                    label="Almacen de atención"
                                />
                            </VCol>
                            <VCol cols="3">
                                <VSelect
                                    :items="warehouses"
                                    item-title="name"
                                    item-value="id"
                                    placeholder="Select"
                                    v-model="warehouse_end_id"
                                    label="Almacenen de entrega"
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
                                <AppDateTimePicker
                                    v-model="range_date"
                                    label="Rango de fecha"
                                    placeholder="Select date"
                                    :config="{ mode: 'range' }"
                                />
                            </VCol>
                            <VCol cols="3">
                                <VTextField
                                    placeholder="Search Product"
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
                        <VBtn v-if="isPermission('register_transport')" @click="router.push({name: 'transport-add'})">
                            Add Transport
                            <VIcon
                                end
                                icon="ri-add-line"
                            />
                        </VBtn>
                    </VCol>
                </VRow>
            </VCardText>
            
            <VTable>
               <thead>
                <tr>
                    <th class="text-uppercase">
                        N° Transport
                    </th>
                    <th class="text-uppercase">
                        Solicitante
                    </th>
                    <th class="text-uppercase">
                        Almacen de atención
                    </th>
                    <th class="text-uppercase">
                        Almacen de entrega
                    </th>
                    <th class="text-uppercase">
                        Fecha de emisión
                    </th>
                    <th class="text-uppercase">
                        Estado de E.
                    </th>
                    <th class="text-uppercase">
                        Action
                    </th>
                </tr>
               </thead>

              <tbody>
                <tr
                    v-for="transport in list_transports"
                    :key="transport.id"
                >
                    <td>
                        {{ transport.id }}
                    </td>
                    <td>
                        {{ transport.user.full_name }}
                    </td>
                    <td>
                        {{ transport.warehouse_start.name }}
                    </td>
                    <td>
                        {{ transport.warehouse_end.name }}
                    </td>

                    <td>
                        {{ transport.date_emision }}
                    </td>
                    <td>
                        <VChip color="error" v-if="transport.state == 1">
                            Solicitud
                        </VChip>
                        <VChip color="warning" v-if="transport.state == 3">
                            Salida
                        </VChip>
                        <VChip color="primary" v-if="transport.state == 6">
                            Entregado
                        </VChip>
                    </td>
                    <td>
                        <div class="d-flex gap-1">
                            <IconBtn
                                size="small"
                                @click="showPdf(transport)"
                            >
                                <VIcon icon="ri-file-pdf-2-line" />
                            </IconBtn>

                            <IconBtn
                                size="small"
                                @click="editItem(transport)"
                                v-if="isPermission('edit_transport')"
                            >
                                <VIcon icon="ri-pencil-line" />
                            </IconBtn>
                            <IconBtn
                                size="small"
                                v-if="transport.state < 3 && isPermission('delete_transport')"
                                @click="deleteItem(transport)"
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
        
        <TransportDeleteDialog v-if="transport_selected_delete && isTransportDeleteDialogVisible" 
        v-model:isDialogVisible="isTransportDeleteDialogVisible" 
        :transportSelected="transport_selected_delete" 
        @deleteTransport="addDeleteTransport"></TransportDeleteDialog>
    </div>
</template>