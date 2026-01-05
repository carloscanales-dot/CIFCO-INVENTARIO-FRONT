<script setup>
    const headers = [
        {
            title: 'ID',
            key: 'id',
        },
        {
            title: 'Almacen',
            key: 'name',
        },
        {
            title: 'Dirección',
            key: 'address',
        },
        {
            title: 'Sucursal',
            key: 'sucursal123',
        },
        {
            title: 'Estado',
            key: 'state',
        },
        {
            title: 'Fecha de registro',
            key: 'created_at',
        },
        {
            title: 'Acciones',
            key: 'action',
        },
    ]
    const isWarehouseAddDialogVisible = ref(false);
    const isWarehouseEditDialogVisible = ref(false);
    const isWarehouseDeleteDialogVisible = ref(false);
    
    const list_warehouses = ref([]);
    const list_sucursales = ref([]);
    const searchQuery = ref(null);
    const warehouse_selected_edit = ref(null);
    const warehouse_selected_delete = ref(null);

    const list = async() => {
        try {
            const resp = await $api("warehouses?search="+(searchQuery.value ? searchQuery.value : ''),{
                method:'GET',
                onResponseError({response}){
                    console.log(response._data.error);
                }
            })
            console.log(resp);
            list_warehouses.value = resp.warehouses;
            list_sucursales.value = resp.sucursales;
        } catch (error) {
            console.log(error);
        }
    }

    const addNewWarehouse = (NewWarehouses) => {
        console.log(NewWarehouses);
        let backup = list_warehouses.value;
        list_warehouses.value = [];
        backup.unshift(NewWarehouses);
        setTimeout(() => {
            list_warehouses.value = backup;
        }, 50);
    }

    const addEditWarehouse = (editWarehouse) => {
        console.log(editWarehouse);
        let backup = list_warehouses.value;
        list_warehouses.value = [];
        let INDEX = backup.findIndex((wh) => wh.id == editWarehouse.id);
        if(INDEX != -1){
            backup[INDEX] = editWarehouse;
        }
        setTimeout(() => {
            list_warehouses.value = backup;
        }, 50);
    }

    const addDeleteWarehouse = (Warehouse) => {
        console.log(Warehouse);
        let backup = list_warehouses.value;
        list_warehouses.value = [];
        let INDEX = backup.findIndex((wh) => wh.id == Warehouse.id);
        if(INDEX != -1){
            backup.splice(INDEX,1);
        }
        setTimeout(() => {
            list_warehouses.value = backup;
        }, 50);
    }

    const editItem = (item) => {
        console.log(item);
        isWarehouseEditDialogVisible.value = true;
        warehouse_selected_edit.value = item;
    }
    const deleteItem = (item) => {
        isWarehouseDeleteDialogVisible.value = true;
        warehouse_selected_delete.value = item;
    }

    onMounted(() => {
        list();
    })

    definePage({ meta: { permission: 'settings', } });
</script>
<template>
    <div>
        <VCard title="Gestión de Almacenes">
            <VCardText>
                <VRow class="justify-space-between">
                    <VCol cols="3">
                        <VTextField
                            placeholder="Buscar Almacén"
                            density="compact"
                            class="me-3"
                            v-model="searchQuery"
                            @keyup.enter="list"
                        />
                    </VCol>
                    <VCol cols="2" class="text-end">
                        <VBtn @click="isWarehouseAddDialogVisible = !isWarehouseAddDialogVisible">
                            Nuevo Almacén
                            <VIcon
                                end
                                icon="ri-luggage-deposit-line"
                            />
                        </VBtn>
                    </VCol>
                </VRow>
            </VCardText>
            <VDataTable
                :headers="headers"
                :items="list_warehouses"
                :items-per-page="5"
                class="text-no-wrap"
            >
                <template #item.id="{ item }">
                <span class="text-h6">{{ item.id }}</span>
                </template>
                <template #item.sucursal123="{ item }">
                <span class="text-h6">{{ item.sucursal.name }}</span>
                </template>
                <template #item.state="{ item }">
                    <VChip color="primary" v-if="item.state == 1">
                        Activo
                    </VChip>
                    <VChip color="error" v-if="item.state == 2">
                        Inactivo
                    </VChip>
                </template>
                <template #item.action="{ item }">
                    <div class="d-flex gap-1">
                        <IconBtn
                            size="small"
                            @click="editItem(item)"
                        >
                            <VIcon icon="ri-pencil-line" />
                        </IconBtn>
                        <IconBtn
                            size="small"
                            @click="deleteItem(item)"
                        >
                            <VIcon icon="ri-delete-bin-line" />
                        </IconBtn>
                    </div>
                </template>
            </VDataTable>
        </VCard>
        <WarehouseAddDialog v-model:isDialogVisible="isWarehouseAddDialogVisible" :sucursales="list_sucursales" @addWarehouse="addNewWarehouse"></WarehouseAddDialog>
        <WarehouseEditDialog v-if="warehouse_selected_edit && isWarehouseEditDialogVisible" :sucursales="list_sucursales" v-model:isDialogVisible="isWarehouseEditDialogVisible" :warehouseSelected="warehouse_selected_edit" @editWarehouse="addEditWarehouse"></WarehouseEditDialog>
        <WarehouseDeleteDialog v-if="warehouse_selected_delete && isWarehouseDeleteDialogVisible" v-model:isDialogVisible="isWarehouseDeleteDialogVisible" :warehouseSelected="warehouse_selected_delete" @deleteWarehouse="addDeleteWarehouse"></WarehouseDeleteDialog>
    </div>
</template>