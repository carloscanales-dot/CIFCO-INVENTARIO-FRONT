<script setup>

    const route = useRoute('transport-edit-id');
    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
    const isTransportDetailEditDialogVisible = ref(false);
    const isTransportDetailDeleteDialogVisible = ref(false);
    
    const warehouse_start_id = ref(null);
    const warehouse_end_id = ref(null);

    const date_emision = ref(null);
    const description = ref(null);
    const importe = ref(0);
    const igv = ref(0);
    const total = ref(0);
    const state = ref(1);
    const transport_detail_selected = ref(null);
    const transport_detail_delete_selected = ref(null);

    const units = ref([]);
    const warehouses = ref([]);

    const transport_details = ref([]);
    const warning_transport = ref(null);
    const success_transport = ref(null);

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
        if(!warehouse_start_id.value){
            setTimeout(() => {
                warning_warehouse.value = "En necesario seleccionar un almacen de atención , antes de escoger un producto";
            }, 25);
            return;
        }
        if(!warehouse_end_id.value){
            setTimeout(() => {
                warning_warehouse.value = "En necesario seleccionar un almacen de entrega , antes de escoger un producto";
            }, 25);
            return;
        }
        if(warehouse_start_id.value == warehouse_end_id.value){
            setTimeout(() => {
                warning_warehouse.value = "En necesario seleccionar almacenes diferentes , antes de escoger un producto";
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
        if(value){
            units.value = value.warehouses.filter((warehouse) => warehouse.warehouse_id == warehouse_start_id.value).map((wh) => {
                return {
                    id: wh.unit_id,
                    name: wh.unit.name,
                };
            });
        }
    })
    watch(warehouse_start_id,value => {
        if(select_product.value){
            units.value = select_product.value.warehouses.filter((warehouse) => warehouse.warehouse_id == value).map((wh) => {
                return {
                    id: wh.unit_id,
                    name: wh.unit.name,
                };
            });
        }
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
            transport_id: route.params.id,
            product: select_product.value,
            unit_id: unit_id.value,
            unit: UNIT_SELECTED,
            price_unit: price_unit.value,
            quantity: quantity.value,
            total: Number((price_unit.value * quantity.value).toFixed(2))
        }
        try {
            const resp = await $api("transport_details/",{
                method:'POST',
                body:data,
                onResponseError({response}){
                    warning_transport.value = response._data.error;
                }
            })
            console.log(resp);
            if(resp.message == 403){
                warning_transport.value = resp.message_text;
            }else{
                transport_details.value.push(resp.transport_detail);
                console.log(transport_details.value);
                importe.value = resp.importe;
                igv.value = resp.igv;
                total.value = resp.total;
                setTimeout(() => {
                    // calcTotalTransport();
                    unit_id.value = '';
                    price_unit.value = 0;
                    quantity.value = 0;
                    select_product.value = null;
                    search_product.value = '';
                }, 25);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const calcTotalTransport = () => {
        importe.value = Number(transport_details.value.reduce((sum,transport_detail) => sum + transport_detail.total,0).toFixed(2));
        igv.value = Number((importe.value * 0.18).toFixed(2));
        total.value = Number((importe.value + igv.value).toFixed(2));
    }

    const deleteTransportDetail = (transport_detail) => {
        // transport_details.value.splice(index,1);
        // calcTotalTransport();
        isTransportDetailDeleteDialogVisible.value = true;
        transport_detail_delete_selected.value = transport_detail;
    }

    const store = async () => {
        try {
            warning_transport.value = null;success_transport.value = null;
            if(!warehouse_start_id.value){
                setTimeout(() => {
                    warning_transport.value = "Es requerido seleccionar un almacen de atención";
                }, 25);
                return;
            }
            if(!warehouse_end_id.value){
                setTimeout(() => {
                    warning_transport.value = "Es requerido seleccionar un almacen de entrega";
                }, 25);
                return;
            }
            if(warehouse_end_id.value == warehouse_start_id.value){
                setTimeout(() => {
                    warning_transport.value = "Es requerido seleccionar almacenes diferentes";
                }, 25);
                return;
            }
            if(transport_details.value == 0){
                setTimeout(() => {
                    warning_transport.value = "Es requerido añadir al menos un producto al detallado";
                }, 25);
                return;
            }

            let data = {
                warehouse_start_id: warehouse_start_id.value,
                warehouse_end_id: warehouse_end_id.value,
                description:description.value,
                state:state.value,
            }

            const resp = await $api("transports/"+route.params.id,{
                method:'PATCH',
                body:data,
                onResponseError({response}){
                    warning_transport.value = response._data.error;
                }
            })
            console.log(resp);
            if(resp.message == 403){
                warning_transport.value = resp.message_text;
            }else{
                success_transport.value = "LA SOLICITUD DE TRANSPORTE SE HA EDITADO CORRECTAMENTE";
            }
        } catch (error) {
            console.log(error);
        }
    }

    const config = async () => {
        try {
            const resp = await $api("transports/config",{
                method: 'GET',
                onResponseError({response}){
                    console.log(response._data.error);
                }
            })
            console.log(resp);
            warehouses.value = resp.warehouses;
            // units.value = resp.units;
            // date_emision.value = resp.today;
        } catch (error) {
            console.log(error);
        }
    }

    const show = async() => {
        try {
            const resp = await $api("transports/"+route.params.id,{
                method: 'GET',
                onResponseError({response}){
                    console.log(response._data.error);
                }
            })
            console.log(resp);
            warehouse_start_id.value = resp.transport.warehouse_start_id;
            warehouse_end_id.value = resp.transport.warehouse_end_id;
            date_emision.value = resp.transport.date_emision;
            description.value =resp.transport.description;
            transport_details.value = resp.transport.details;
            importe.value = resp.transport.importe;
            igv.value = resp.transport.igv;
            total.value = resp.transport.total;
            state.value = resp.transport.state;
        } catch (error) {
            console.log(error);
        }
    }

    const transportDetailSalida = async (transport_detail) => {
        try {
            let data = {
                transport_detail_id: transport_detail.id,
            }
            warning_transport.value = null;
            const resp = await $api("transport_details/attention_exit",{
                method: 'POST',
                body:data,
                onResponseError({response}){
                    console.log(response._data.error);
                }
            })
            console.log(resp);
            if(resp.message == 403){
                warning_transport.value = resp.message_text;
            }else{
                let INDEX = transport_details.value.findIndex((detail) => detail.id == resp.transport_detail.id);
                if(INDEX != -1){
                    transport_details.value[INDEX] = resp.transport_detail;
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    const transportDetailEntrega = async (transport_detail) => {
        try {
            let data = {
                transport_detail_id: transport_detail.id,
            }
            warning_transport.value = null;
            const resp = await $api("transport_details/attention_in",{
                method: 'POST',
                body:data,
                onResponseError({response}){
                    console.log(response._data.error);
                }
            })
            console.log(resp);
            if(resp.message == 403){
                warning_transport.value = resp.message_text;
            }else{
                let INDEX = transport_details.value.findIndex((detail) => detail.id == resp.transport_detail.id);
                if(INDEX != -1){
                    transport_details.value[INDEX] = resp.transport_detail;
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    const editTransportDetail = (transport_detail) => {
        console.log(transport_detail);
        isTransportDetailEditDialogVisible.value = true;
        transport_detail_selected.value = transport_detail;
    }
    const transportDetailEdit = (DATA) => {
        let TRANSPORT_DETAIL = DATA.transport_detail;
        let INDEX = transport_details.value.findIndex((detail) => detail.id == TRANSPORT_DETAIL.id);
        if(INDEX != -1){
            transport_details.value[INDEX] = TRANSPORT_DETAIL;
        }
        total.value = DATA.total;
        importe.value = DATA.importe;
        igv.value = DATA.igv;
    }

    const transportDetailDelete = (DATA) => {
        
        let INDEX = transport_details.value.findIndex((detail) => detail.id == DATA.transport_detail_id);
        if(INDEX != -1){
            transport_details.value.splice(INDEX,1);
        }
        importe.value = DATA.importe;
        igv.value = DATA.igv;
        total.value = DATA.total;
    }
    onMounted(() => {
        config();
        show();
    })

    definePage({ meta: { permission: 'edit_transport', } });
</script>
<template>
    <div>
        <div class="d-flex flex-wrap justify-space-between gap-4 mb-6">
            <div class="d-flex flex-column justify-center">
                <h4 class="text-h4 mb-1">
                    🚚 Edit Transport : {{ route.params.id }}
                </h4>
                <p class="text-body-1 mb-0">
                Orders placed across your store
                </p>
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
                                    v-model="warehouse_start_id"
                                    :items="warehouses"
                                    label="Almacen de Atención"
                                    placeholder="Select Almacen"
                                    item-title="name"
                                    item-value="id"
                                    eager
                                    :disabled="state >= 3"
                                />
                            </VCol>
                            <VCol cols="3">
                                <VSelect
                                    v-model="warehouse_end_id"
                                    :items="warehouses"
                                    label="Almacen de Entrega"
                                    placeholder="Select Almacen"
                                    item-title="name"
                                    item-value="id"
                                    eager
                                    :disabled="state >= 3"
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
                                <VTextarea
                                    label="Nota final"
                                    placeholder=""
                                    v-model="description"
                                />
                            </VCol>
                            <VCol cols="3">
                                <VSelect
                                        v-model="state"
                                        :items="[
                                            {
                                                id: 1,
                                                name: 'Pendiente',
                                            },
                                            {
                                                id: 2,
                                                name: 'Revisión Salida',
                                            },
                                            {
                                                id: 3,
                                                name: 'Salida',
                                            },
                                            {
                                                id: 4,
                                                name: 'LLegada',
                                            },
                                            {
                                                id: 5,
                                                name: 'Revisión LLegada',
                                            },
                                            {
                                                id: 6,
                                                name: 'Entrega',
                                            }
                                        ]"
                                        label="Estado"
                                        placeholder="Select Almacen"
                                        item-title="name"
                                        item-value="id"
                                        eager
                                    />
                            </VCol>

                            <VCol cols="12" v-if="warning_transport">
                                <VAlert
                                    closable
                                    close-label="Close Alert"
                                    color="warning"
                                >
                                {{ warning_transport }}
                                </VAlert>
                            </VCol>
                            <VCol cols="12" v-if="success_transport">
                                <VAlert
                                    closable
                                    close-label="Close Alert"
                                    color="success"
                                >
                                {{ success_transport }}
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
                                            placeholder="Search for a product"
                                            label="¿Que agregamos?"
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
                    title="Detalle de la S. Transporte"
                    >

                    <VTable>
                        <thead>
                            <tr>
                                <th></th>
                                <th>Estado E.</th>
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
                            
                            <tr v-for="(transport_detail, index) in transport_details" :key="index">
                                <td>
                                    <!-- DAR SALIDA  A LOS PRODUCTOS -->
                                    <VBtn
                                        v-if="transport_detail.state == 1"
                                        @click="transportDetailSalida(transport_detail)"
                                        icon="ri-contract-line"
                                        variant="text"
                                    />

                                    <!-- DAR ENTREGA A LOS PRODUCTOS -->
                                    <VBtn
                                        v-if="transport_detail.state == 2"
                                        @click="transportDetailEntrega(transport_detail)"
                                        icon="ri-file-list-3-line"
                                        variant="text"
                                    />
                                </td>
                                <td>
                                    <VChip color="error" v-if="transport_detail.state == 1">
                                        Pendiente
                                    </VChip>
                                    <VChip color="primary" v-if="transport_detail.state == 2">
                                        Salida
                                    </VChip>
                                    <VChip color="success" v-if="transport_detail.state == 3">
                                        Entregado
                                    </VChip>
                                </td>
                                <td>{{ transport_detail.product.title }}</td>
                                <td>{{ transport_detail.unit.name }}</td>
                                <td>$. {{ transport_detail.price_unit }}</td>
                                <td>{{ transport_detail.quantity }}</td>
                                <td>$. {{ transport_detail.total }}</td>
                                <td>
                                    <IconBtn
                                        size="small"
                                        @click="editTransportDetail(transport_detail)"
                                    >
                                        <VIcon icon="ri-pencil-line" />
                                    </IconBtn>
                                    <IconBtn
                                        size="small"
                                        @click="deleteTransportDetail(transport_detail)"
                                    >
                                        <VIcon icon="ri-delete-bin-line" />
                                    </IconBtn>
                                </td>
                            </tr>

                            <tr>
                                <td></td>
                                <td></td>
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
                                        label="Igv"
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
                    Editar una S. Transporte
                </VBtn>
            </VCol>
        </VRow>

        <TransportDetailEditDialog  
        v-if="transport_detail_selected && isTransportDetailEditDialogVisible"
        v-model:isDialogVisible="isTransportDetailEditDialogVisible"
        :transportDetailSelected="transport_detail_selected"
        :transport_id="route.params.id"
        :warehouse_start_id="warehouse_start_id"
        @editTransportDetail="transportDetailEdit"
        ></TransportDetailEditDialog>

        <TransportDetailDeleteDialog
        v-if="transport_detail_delete_selected && isTransportDetailDeleteDialogVisible"
        v-model:isDialogVisible="isTransportDetailDeleteDialogVisible"
        :transportDetailSelected="transport_detail_delete_selected"
        @deleteTransportDetail="transportDetailDelete"
        >

        </TransportDetailDeleteDialog>
    </div>
</template>