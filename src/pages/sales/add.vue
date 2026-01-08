<script setup>

const isClientSearchDialogVisible = ref(false);
const isClientFinalAddDialogVisible = ref(false);
const isClientCompanyAddDialogVisible = ref(false);

const description = ref(null);
const date_emision = ref(null);
const warehouses = ref([]);
const warehouse_id = ref(null);
const search_client = ref(null);
const list_clients = ref([]);
const client_selected = ref(null);
const warning_client = ref(null);

const units = ref([]);
const unit_id = ref(null);
const quantity = ref(0);
const price_unit = ref(0);
const is_gift = ref(1);
const discount = ref(0);

const sale_details = ref([]);
const igv_total = ref(0);
const discount_total = ref(0);
const subtotal_original = ref(0);
const total_all = ref(0);

const payments = ref([]);
const method_payment = ref(null);
const amount = ref(0);
const payment_total = ref(0);
const warning_payment = ref(null);

const warning_sale = ref(null);
const success_sale = ref(null);
// BUSQUEDA DE PRODUCTO
const loading = ref(false)
const search_product = ref()
const select_product = ref(null)
const items = ref([]);
const warning_warehouse = ref(null);
const warning_client_product = ref(null);
const querySelections = query => {
    loading.value = true

    // Simulated ajax query
    setTimeout(async () => {
        // items.value = states.filter(state => (state || '').toLowerCase().includes((query || '').toLowerCase()))
        try {
            const resp = await $api("sales/search_product?search=" + (search_product.value ? search_product.value : ''), {
                method: 'GET',
                onResponseError({ response }) {
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
    warning_warehouse.value = null; warning_client_product.value = null;
    if (!warehouse_id.value) {
        setTimeout(() => {
            warning_warehouse.value = "En necesario seleccionar un almacen , antes de escoger un producto";
        }, 25);
        return;
    }
    if (!client_selected.value) {
        setTimeout(() => {
            warning_client_product.value = "En necesario seleccionar un cliente , antes de escoger un producto";
        }, 25);
        return;
    }
    if (query.length > 3) {
        querySelections(query)
    } else {
        items.value = [];
    }
})
watch(select_product, value => {
    console.log(value);
    if (value) {
        units.value = value.warehouses.filter((warehouse) => warehouse.warehouse_id == warehouse_id.value).map((wh) => {
            return {
                id: wh.unit_id,
                name: wh.unit.name,
            };
        });
        console.log(units);
        cleanFieldProducts();
    }
})
watch(warehouse_id, value => {
    console.log(value);
    if (select_product.value) {
        units.value = select_product.value.warehouses.filter((warehouse) => warehouse.warehouse_id == value).map((wh) => {
            return {
                id: wh.unit_id,
                name: wh.unit.name,
            };
        });
        cleanFieldProducts();
    }
})
watch(unit_id, value => {
    if (!value) {
        return;
    }
    if (is_gift.value == 2) {
        price_unit.value = 0;
        discount.value = 0;
        return;
    }
    let UNIT_SELECTED = value;
    let TYPE_CLIENT = client_selected.value.type_client;
    let AUTH_USER = JSON.parse(localStorage.getItem("user"));
    // BUSQUEDA DE PRECIO CON LA SUCURSAL DEL USUARIO AUTENTICADO
    let PRICE_SELECTED = select_product.value.wallets.find((wallet) => wallet.type_client == TYPE_CLIENT
        && wallet.unit_id == UNIT_SELECTED &&
        wallet.sucursale_id == AUTH_USER.sucursale_id);
    console.log(PRICE_SELECTED);
    if (PRICE_SELECTED) {
        price_unit.value = PRICE_SELECTED.price;
    } else {
        // BUSQUEDA DE PRECIO CON LA SUCURSAL NULA
        let PRICE_SELECTED = select_product.value.wallets.find((wallet) => wallet.type_client == TYPE_CLIENT
            && wallet.unit_id == UNIT_SELECTED &&
            wallet.sucursale_id == null);
        if (PRICE_SELECTED) {
            price_unit.value = PRICE_SELECTED.price;
        } else {
            // EN CASO DE QUE NO HALLA UN PRECIO MULTIPLE ENCONTRADO
            price_unit.value = TYPE_CLIENT == 1 ? select_product.value.price_general : select_product.value.price_company;
        }
    }
})
watch(is_gift, value => {
    console.log(value);
    if (value == 2) {
        price_unit.value = 0;
        discount.value = 0;
    } else {
        if (select_product.value) {
            let UNIT = unit_id.value;
            unit_id.value = "";
            setTimeout(() => {
                unit_id.value = UNIT;
            }, 25);
        }
    }
})
// FIN DE BUSQUEDA DE PRODUCTO

const radioContent = [
    {
        title: 'Salida',
        // desc: 'A simple start for everyone.',
        value: '1',
        icon: 'ri-shopping-cart-2-fill',
    },
    {
        title: 'Cotización',
        // desc: 'For small to medium businesses.',
        value: '2',
        icon: 'ri-file-list-3-fill',
    },
]

const selectedRadio = ref('1')

watch(selectedRadio, value => {
    console.log(value);
    if (value == 2) {
        payments.value = [];
        cleanFieldPayment();
        payment_total.value = 0;
    }
})

const config = async () => {
    try {
        const resp = await $api("sales/config", {
            method: 'GET',
            onResponseError({ response }) {
                console.log(response._data.error);
            }
        })
        console.log(resp);
        date_emision.value = resp.today;
        let USER_AUTENTICATE = JSON.parse(localStorage.getItem("user"));
        warehouses.value = resp.warehouses.filter((warehouse) => warehouse.sucursale_id == USER_AUTENTICATE.sucursale_id);
    } catch (error) {
        console.log(error);
    }
}

const searchClient = async () => {
    isClientSearchDialogVisible.value = false;
    client_selected.value = null;
    warning_client.value = null;
    try {
        const resp = await $api("sales/search_client?search=" + (search_client.value ? search_client.value : ''), {
            method: 'GET',
            onResponseError({ response }) {
                console.log(response._data.error);
            }
        })
        console.log(resp);
        list_clients.value = resp.clients;
        if (list_clients.value.length == 1) {
            selectedClient(list_clients.value[0]);
        } else {
            if (list_clients.value.length == 0) {
                warning_client.value = 'No se encontro ninguna coincidencia';
            }
            setTimeout(() => {
                isClientSearchDialogVisible.value = true;
            }, 25);
        }
    } catch (error) {
        console.log(error);
    }
}

const addNewClient = (NewClient) => {
    console.log(NewClient);
    selectedClient(NewClient);
}
const selectedClient = (Client) => {
    console.log(Client);
    client_selected.value = Client;
    search_client.value = Client.full_name;
    cleanFieldProducts();
}
const cleanFieldProducts = () => {
    price_unit.value = 0;
    unit_id.value = '';
    is_gift.value = 1;
    discount.value = 0;
    quantity.value = 0;
}

const addProduct = () => {
    warning_warehouse.value = null;
    if (!unit_id.value) {
        setTimeout(() => {
            warning_warehouse.value = "Es necesario seleccionar una unidad";
        }, 25);
        return;
    }
    if (is_gift.value == 1 && (!price_unit.value || price_unit.value == 0)) {
        setTimeout(() => {
            warning_warehouse.value = "Es necesario ingresar un precio";
        }, 25);
        return;
    }
    if (!quantity.value || quantity.value == 0) {
        setTimeout(() => {
            warning_warehouse.value = "Es necesario ingresar una cantidad";
        }, 25);
        return;
    }
    if (is_gift.value == 2) {
        price_unit.value = 0;
        discount.value = 0;
    }

    let UNIT_SELECTED = units.value.find((unit) => unit.id == unit_id.value);
    let IGV = 0;
    if (select_product.value.tax_selected == 2) {
        IGV = 0;
    } else {
        IGV = Number(price_unit.value) * (select_product.value.importe_iva * 0.01);
    }
    let SUBTOTAL = Number(price_unit.value) - Number(discount.value) + IGV;

    let EXIST_PRODUCT_UNIT = sale_details.value.find((sale_detail) => sale_detail.product.id == select_product.value.id
        && sale_detail.unit_id == unit_id.value);

    if (EXIST_PRODUCT_UNIT) {
        setTimeout(() => {
            warning_warehouse.value = "El producto y la unidad ya existe en el detalle, seleccione otro";
        }, 25);
        return;
    }

    if (select_product.value.is_discount == 2) {
        let MAX_DISCOUNT = select_product.value.max_discount * 0.01 * Number(price_unit.value);//EL DESCUENTO MAXIMO
        if (MAX_DISCOUNT < Number(discount.value)) {
            setTimeout(() => {
                warning_warehouse.value = "El descuento maximo del producto es : $" + MAX_DISCOUNT;
            }, 25);
            return;
        }
    }
    if (selectedRadio.value == 1 && select_product.value.disponibilidad == 2) {
        let WAREHOUSE_PRODUCT = select_product.value.warehouses;
        let WAREHOUSE_SELECTED = WAREHOUSE_PRODUCT.find(warehouse => warehouse.warehouse_id == warehouse_id.value &&
            warehouse.unit_id == unit_id.value);
        if (WAREHOUSE_SELECTED) {
            if (parseInt(WAREHOUSE_SELECTED.stock) < parseInt(quantity.value)) {
                setTimeout(() => {
                    warning_warehouse.value = "El stock disponibible de este producto es " + WAREHOUSE_SELECTED.stock;
                }, 25);
                return;
            }
        }
    }
    sale_details.value.push({
        product: select_product.value,
        unit_id: unit_id.value,
        unit: UNIT_SELECTED,
        warehouse_id: warehouse_id.value,
        price: price_unit.value,
        quantity: quantity.value,
        discount: discount.value,
        is_gift: is_gift.value,
        igv: IGV.toFixed(2),
        subtotal: SUBTOTAL.toFixed(2),
        total: (SUBTOTAL * parseInt(quantity.value)).toFixed(2),
    });
    console.log(sale_details.value);
    setTimeout(() => {
        reportDetail();
        cleanFieldProducts();
    }, 25);
}

const reportDetail = () => {

    // 1. SUMA TOTAL DE IMPUESTO

    igv_total.value = sale_details.value.reduce((sum, sale_detail) => sum + (Number(sale_detail.igv) * Number(sale_detail.quantity)), 0);

    // 2. SUM TOTAL DE DESCUENTO

    discount_total.value = sale_details.value.reduce((sum, sale_detail) => sum + (Number(sale_detail.discount) * Number(sale_detail.quantity)), 0);

    // 3. EL SUBTOTAL ORIGINAL

    subtotal_original.value = sale_details.value.reduce((sum, sale_detail) => sum +
        ((Number(sale_detail.price)) * Number(sale_detail.quantity))
        , 0);// + Number(sale_detail.igv)

    // 4. EL TOTAL

    total_all.value = sale_details.value.reduce((sum, sale_detail) => sum + Number(sale_detail.total), 0);

}
const deleteDetail = (index) => {
    warning_warehouse.value = null;
    let TOTAL_DELETE = sale_details.value[index].total;

    if ((total_all.value - TOTAL_DELETE) < payment_total.value) {
        setTimeout(() => {
            warning_warehouse.value = "No se eliminar este producto porque el pago cancelado es mayor";
        }, 25);
        return;
    }

    sale_details.value.splice(index, 1);
    setTimeout(() => {
        reportDetail();
    }, 25);
}

const addPayment = () => {
    warning_payment.value = null;
    if (!method_payment.value) {
        setTimeout(() => {
            warning_payment.value = "El metodo de pago se tiene que seleccionar";
        }, 25);
        return;
    }
    if (amount.value == 0) {
        setTimeout(() => {
            warning_payment.value = "El monto de pago debe ser mayor a 0";
        }, 25);
        return;
    }
    if (total_all.value == 0) {
        setTimeout(() => {
            warning_payment.value = "El total de la venta debe ser mayor a 0 para añadir un pago";
        }, 25);
        return;
    }
    if ((Number(payment_total.value) + Number(amount.value)) > Number(total_all.value)) {
        setTimeout(() => {
            warning_payment.value = "El total pagado no puede ser mayor al total de la venta";
        }, 25);
        return;
    }
    payments.value.unshift({
        method_payment: method_payment.value,
        amount: Number(amount.value),
    });
    paymentTotal();
    cleanFieldPayment();
}

const deletePayment = (index) => {
    payments.value.splice(index, 1);
    paymentTotal();
}

const paymentTotal = () => {
    payment_total.value = payments.value.reduce((sum, payment) => sum + payment.amount, 0);
}
const cleanFieldPayment = () => {
    method_payment.value = '';
    amount.value = 0;
}

const cleanFieldForm = () => {
    payments.value = [];
    description.value = '';
    sale_details.value = [];
    warehouse_id.value = '';
    client_selected.value = null;
    search_client.value = '';
    total_all.value = 0;
    igv_total.value = 0;
    subtotal_original.value = 0;
    discount_total.value = 0;
    payment_total.value = 0;
    cleanFieldPayment();
    cleanFieldProducts();
}

const store = async () => {
    try {
        warning_sale.value = null; success_sale.value = null;
        if (sale_details.value.length == 0) {
            setTimeout(() => {
                warning_sale.value = "En necesario agregar un producto al detallado";
            }, 25);
            return;
        }
        if (!warehouse_id.value) {
            setTimeout(() => {
                warning_sale.value = "En necesario seleccionar un almacen para la venta";
            }, 25);
            return;
        }
        if (!client_selected.value) {
            setTimeout(() => {
                warning_sale.value = "En necesario seleccionar un cliente para la venta";
            }, 25);
            return;
        }
        if (selectedRadio.value == 1) {
            if (payments.value.length == 0) {
                setTimeout(() => {
                    warning_sale.value = "En necesario dar un adelanto para la venta";
                }, 25);
                return;
            }
        }
        //1 es pendiente , 2 es parcial y 3 es completo
        let STATE_PAYMENT = 1;
        if (selectedRadio.value == 1) {
            if (payment_total.value != total_all.value) {
                STATE_PAYMENT = 2;
            }
            if (payment_total.value == total_all.value) {
                STATE_PAYMENT = 3;
            }
        }
        let data = {
            client_id: client_selected.value.id,
            type_client: client_selected.value.type_client,
            discount: discount_total.value,
            subtotal: subtotal_original.value,
            total: total_all.value,
            igv: igv_total.value,
            state_sale: selectedRadio.value,
            state_payment: STATE_PAYMENT,
            debt: total_all.value - payment_total.value,
            paid_out: payment_total.value,
            // date_validation,LA FECHA EN LA QUE LA COTIZACION PASA A VENTA
            // date_pay_complete,LA FECHA EN LA QUE SE PAGA TODO
            description: description.value,
            sale_details: sale_details.value,
            payments: payments.value,
        }

        const resp = await $api("sales", {
            method: 'POST',
            body: data,
            onResponseError({ response }) {
                warning_sale.value = response._data.error;
            }
        })
        console.log(resp);
        success_sale.value = 'La ' + (selectedRadio.value == 1 ? ' VENTA ' : ' COTIZACIÓN ') + ' se ha registrado correctamente';
        cleanFieldForm();
    } catch (error) {
        console.log(error);
    }
}
onMounted(() => {
    config();
})
definePage({ meta: { permission: 'register_sale', } });
</script>
<template>
    <div>
        <div class="d-flex flex-wrap justify-space-between gap-4 mb-6">
            <div class="d-flex flex-column justify-center">
                <h4 class="text-h4 mb-1">
                    Gestión de Ventas o Cotización
                </h4>
                <p class="text-body-1 mb-0">
                    Pedidos realizados en la tienda
                </p>
            </div>
        </div>

        <VCard class="mb-6 py-4 px-4">
            <CustomRadiosWithIcon v-model:selected-radio="selectedRadio" :radio-content="radioContent"
                :grid-column="{ sm: '6', cols: '12' }" />
        </VCard>
        <VCard class="mb-6">
            <VCardText>
                <VRow dense>
                    <!-- DATOS GENERALES -->
                    <VCol cols="12" md="4">
                        <AppDateTimePicker v-model="date_emision" density="compact" label="Fecha de emisión"
                            placeholder="Seleccionar fecha" />
                    </VCol>

                    <VCol cols="12" md="4">
                        <VSelect v-model="warehouse_id" :items="warehouses" density="compact" item-title="name"
                            item-value="id" label="Almacén" placeholder="Seleccionar" />
                    </VCol>

                    <!-- CLIENTE -->
                    <VCol cols="12" md="4">
                        <VRow dense>
                            <VCol cols="12">
                                <VTextField v-model="search_client" density="compact" label="Solicitante"
                                    prepend-inner-icon="ri-user-6-line" @keyup.enter="searchClient()" />
                            </VCol>

                            <VCol cols="12" v-if="client_selected">
                                <div class="client-info">
                                    <div><b>Cliente:</b> {{ client_selected.full_name }}</div>
                                    <div><b>N° Documento:</b> {{ client_selected.n_document }}</div>
                                </div>
                            </VCol>

                            <VCol cols="12" v-if="warning_client">
                                <VAlert color="warning" variant="tonal" closable>
                                    {{ warning_client }}
                                </VAlert>
                            </VCol>
                        </VRow>
                    </VCol>

                    <VCol cols="12" md="4">
                        <VTextField v-model="search_client" density="compact" label="N° Requisición" />
                    </VCol>
                    <VCol cols="12" md="4">
                        <VSelect v-model="warehouse_id" :items="warehouses" density="compact" item-title="name"
                            item-value="id" label="Area" placeholder="Seleccionar" />
                    </VCol>
                    <VCol cols="12" md="4">
                        <VTextField v-model="search_client" density="compact" label="N° Requisición" />
                    </VCol>
                    <!-- ACCIONES -->
                     <VRow dense>
                         <VCol cols="12" md="6" class="d-flex flex-column justify-end gap-2">
                             <VBtn color="primary" block
                                 @click="isClientFinalAddDialogVisible = !isClientFinalAddDialogVisible">
                                 <VIcon start icon="ri-user-add-line" />
                                 Cliente final
                             </VBtn>
                         </VCol>
                         <VCol cols="12" md="6" class="d-flex flex-column justify-end gap-2">
                             <VBtn color="primary" block
                                 @click="isClientCompanyAddDialogVisible = !isClientCompanyAddDialogVisible">
                                 <VIcon start icon="ri-community-line" />
                                 Empresa
                             </VBtn>
                         </VCol>
                     </VRow>
                </VRow>
            </VCardText>
        </VCard>

        <VCard class="mb-6">
            <VCardText>
                <VRow dense>
                    <!-- PRODUCTO -->
                    <VCol cols="12" md="7">
                        <VAutocomplete v-model="select_product" v-model:search="search_product" :loading="loading"
                            density="compact" :items="items" item-title="title" item-value="id" return-object
                            label="Ingresa un código de producto" placeholder="Buscar producto" variant="outlined"
                            :menu-props="{ maxHeight: '200px' }" />

                        <VAlert v-if="warning_warehouse" color="warning" variant="tonal" class="mt-3" closable>
                            {{ warning_warehouse }}
                        </VAlert>

                        <VAlert v-if="warning_client_product" color="warning" variant="tonal" class="mt-2" closable>
                            {{ warning_client_product }}
                        </VAlert>
                    </VCol>

                    <!-- DETALLE -->
                    <VCol cols="12" md="5">
                        <VRow dense>
                            <VCol cols="12" sm="4">
                                <VSelect v-model="unit_id" :items="units" item-title="name" item-value="id"
                                    density="compact" label="Unidades" />
                            </VCol>

                            <VCol cols="12" sm="4">
                                <VTextField v-model="price_unit" label="Precio" type="number" density="compact"
                                    :disabled="is_gift == 2 ? true : null" />
                            </VCol>

                            <VCol cols="12" sm="4">
                                <VTextField v-model="quantity" label="Cantidad" type="number" density="compact" />
                            </VCol>

                            <!-- OPCIONES -->
                            <VCol cols="12" sm="4" v-if="select_product && select_product.is_gift == 2">
                                <p class="my-0 text-caption">¿Regalo?</p>
                                <VCheckbox label="Sí" value="2" v-model="is_gift" />
                            </VCol>

                            <VCol cols="12" sm="4" v-if="select_product && select_product.is_discount == 2">
                                <VTextField v-model="discount" label="Descuento" type="number"
                                    :disabled="is_gift == 2 ? true : null" />
                            </VCol>

                            <!-- ACCIÓN -->
                            <VCol cols="12" class="d-flex justify-end mt-2">
                                <VBtn color="primary" @click="addProduct()">
                                    <VIcon start icon="ri-add-circle-line" />
                                    Agregar
                                </VBtn>
                            </VCol>
                        </VRow>
                    </VCol>
                </VRow>
            </VCardText>
        </VCard>


        <VCard class="mb-6">
            <VCardText>
                <VRow dense>
                    <!-- TABLA -->
                    <VCol cols="12" md="12">
                        <div class="table-responsive">
                            <VTable density="comfortable">
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th>Unidad</th>
                                        <th class="text-end">Precio</th>
                                        <th class="text-end">Cantidad</th>
                                        <!-- <th class="text-end">Descuento</th>
                                        <th class="text-end">Impuesto</th>
                                        <th class="text-end">Subtotal</th> -->
                                        <th class="text-end">Total</th>
                                        <th class="text-center">Acción</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr v-for="(sale_detail, index) in sale_details" :key="index">
                                        <td>{{ sale_detail.product.title }}</td>
                                        <td>{{ sale_detail.unit.name }}</td>
                                        <td class="text-end">$ {{ sale_detail.price }}</td>
                                        <td class="text-end">{{ sale_detail.quantity }}</td>
                                        <!-- <td class="text-end">$ {{ sale_detail.discount }}</td>
                                        <td class="text-end">$ {{ sale_detail.igv }}</td>
                                        <td class="text-end">$ {{ sale_detail.subtotal }}</td> -->
                                        <td class="text-end">$ {{ sale_detail.total }}</td>
                                        <td class="text-center">
                                            <IconBtn size="small" @click="deleteDetail(index)">
                                                <VIcon icon="ri-delete-bin-line" />
                                            </IconBtn>
                                        </td>
                                    </tr>
                                </tbody>
                            </VTable>
                        </div>
                    </VCol>

                    <!-- RESUMEN -->
                    <VCol cols="12" md="12">
                        <VCard variant="outlined">
                            <VCardText density="compact">
                                <div class="summary-row total">
                                    <span>Total</span>
                                    <strong>$ {{ total_all }}</strong>
                                </div>
                            </VCardText>
                        </VCard>
                    </VCol>
                </VRow>
            </VCardText>
        </VCard>
        <VCard class="mb-6">
            <VCardText>
                <VRow dense>
                    <!-- BLOQUE PAGOS -->
                    <VCol cols="12" md="8" v-if="selectedRadio == 1">
                        <!-- INGRESO DE PAGO -->
                        <VRow dense>
                            <VCol cols="12" sm="4">
                                <VSelect v-model="method_payment" density="compact" label="Método de pago" :items="[
                                    'EFECTIVO',
                                    'DEPOSITO',
                                    'TRANSFERENCIA'
                                ]" />
                            </VCol>

                            <VCol cols="12" sm="4">
                                <VTextField v-model="amount" label="Monto" density="compact" type="number" />
                            </VCol>

                            <VCol cols="12" sm="4" class="d-flex align-end">
                                <VBtn block color="primary" @click="addPayment()">
                                    <VIcon start icon="ri-add-circle-line" />
                                    Agregar pago
                                </VBtn>
                            </VCol>

                            <VCol cols="12" v-if="warning_payment">
                                <VAlert color="warning" variant="tonal" closable>
                                    {{ warning_payment }}
                                </VAlert>
                            </VCol>
                        </VRow>

                        <!-- LISTA DE PAGOS -->
                        <VRow dense class="mt-4">
                            <VCol cols="12">
                                <div class="table-responsive">
                                    <VTable density="comfortable">
                                        <thead>
                                            <tr>
                                                <th>Método de pago</th>
                                                <th class="text-end">Monto</th>
                                                <th class="text-center">Acción</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            <tr v-for="(payment, index) in payments" :key="index">
                                                <td>{{ payment.method_payment }}</td>
                                                <td class="text-end">$ {{ payment.amount }}</td>
                                                <td class="text-center">
                                                    <IconBtn size="small" @click="deletePayment(index)">
                                                        <VIcon icon="ri-delete-bin-line" />
                                                    </IconBtn>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td><strong>Total pagado</strong></td>
                                                <td class="text-end">
                                                    <strong>$ {{ payment_total }}</strong>
                                                </td>
                                                <td></td>
                                            </tr>

                                            <tr>
                                                <td><strong>Deuda</strong></td>
                                                <td class="text-end">
                                                    <strong>
                                                        $ {{ (total_all - payment_total).toFixed(2) }}
                                                    </strong>
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tbody>
                                    </VTable>
                                </div>
                            </VCol>
                        </VRow>
                    </VCol>

                    <!-- DESCRIPCIÓN -->
                    <VCol cols="12" md="4">
                        <VTextarea v-model="description" label="Descripción" rows="8" />
                    </VCol>

                    <!-- ALERTAS -->
                    <VCol cols="12" v-if="warning_sale">
                        <VAlert color="warning" variant="tonal" closable>
                            {{ warning_sale }}
                        </VAlert>
                    </VCol>

                    <VCol cols="12" v-if="success_sale">
                        <VAlert color="success" variant="tonal" closable>
                            {{ success_sale }}
                        </VAlert>
                    </VCol>

                    <!-- ACCIÓN FINAL -->
                    <VCol cols="12">
                        <VBtn block size="large" color="primary" @click="store">
                            Crear {{ selectedRadio == 1 ? 'Venta' : 'Cotización' }}
                        </VBtn>
                    </VCol>
                </VRow>
            </VCardText>
        </VCard>

        <ClientSearchDialog v-if="list_clients.length > 0 && isClientSearchDialogVisible"
            v-model:isDialogVisible="isClientSearchDialogVisible" :listClients="list_clients"
            @clientSelected="selectedClient"></ClientSearchDialog>
        <ClientFinalAddDialog v-model:isDialogVisible="isClientFinalAddDialogVisible" @addClient="addNewClient">
        </ClientFinalAddDialog>
        <ClientCompanyAddDialog v-model:isDialogVisible="isClientCompanyAddDialogVisible" @addClient="addNewClient">
        </ClientCompanyAddDialog>
    </div>
</template>
<style scoped>
.custom-radio-icon {
    padding: 0.2rem !important;
}

.text-medium-emphasis {
    display: none;
}

.table-responsive {
    overflow-x: auto;
}

.summary-row {
    display: flex;
    justify-content: space-between;
}

.summary-row.total {
    font-size: 1rem;
}

.table-responsive {
    overflow-x: auto;
}
</style>