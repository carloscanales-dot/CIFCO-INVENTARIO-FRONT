<script setup>
    const headers = [
        {
            title: 'ID',
            key: 'id',
        },
        {
            title: 'Sucursal',
            key: 'name',
        },
        {
            title: 'Dirección',
            key: 'address',
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
    const isSucursalAddDialogVisible = ref(false);
    const isSucursalEditDialogVisible = ref(false);
    const isSucursalDeleteDialogVisible = ref(false);
    
    const list_sucursales = ref([]);
    const searchQuery = ref(null);
    const sucursal_selected_edit = ref(null);
    const sucursal_selected_delete = ref(null);

    const list = async() => {
        try {
            const resp = await $api("sucursales?search="+(searchQuery.value ? searchQuery.value : ''),{
                method:'GET',
                onResponseError({response}){
                    console.log(response._data.error);
                }
            })
            console.log(resp);
            list_sucursales.value = resp.sucursales;
        } catch (error) {
            console.log(error);
        }
    }

    const addNewSucursal = (NewSucursal) => {
        console.log(NewSucursal);
        let backup = list_sucursales.value;
        list_sucursales.value = [];
        backup.unshift(NewSucursal);
        setTimeout(() => {
            list_sucursales.value = backup;
        }, 50);
    }

    const addEditSucursal = (editSucursal) => {
        console.log(editSucursal);
        let backup = list_sucursales.value;
        list_sucursales.value = [];
        let INDEX = backup.findIndex((rol) => rol.id == editSucursal.id);
        if(INDEX != -1){
            backup[INDEX] = editSucursal;
        }
        setTimeout(() => {
            list_sucursales.value = backup;
        }, 50);
    }

    const addDeleteSucursal = (Sucursal) => {
        console.log(Sucursal);
        let backup = list_sucursales.value;
        list_sucursales.value = [];
        let INDEX = backup.findIndex((rol) => rol.id == Sucursal.id);
        if(INDEX != -1){
            backup.splice(INDEX,1);
        }
        setTimeout(() => {
            list_sucursales.value = backup;
        }, 50);
    }

    const editItem = (item) => {
        console.log(item);
        isSucursalEditDialogVisible.value = true;
        sucursal_selected_edit.value = item;
    }
    const deleteItem = (item) => {
        isSucursalDeleteDialogVisible.value = true;
        sucursal_selected_delete.value = item;
    }

    onMounted(() => {
        list();
    })

    definePage({ meta: { permission: 'settings', } });
</script>
<template>
    <div>
        <VCard title="Gestión de Sucursales">
            <VCardText>
                <VRow class="justify-space-between">
                    <VCol cols="3">
                        <VTextField
                            placeholder="Buscar Sucursal"
                            density="compact"
                            class="me-3"
                            v-model="searchQuery"
                            @keyup.enter="list"
                        />
                    </VCol>
                    <VCol cols="2" class="text-end">
                        <VBtn @click="isSucursalAddDialogVisible = !isSucursalAddDialogVisible">
                            Nueva Sucursal
                            <VIcon
                                end
                                icon="ri-store-2-line"
                            />
                        </VBtn>
                    </VCol>
                </VRow>
            </VCardText>
            <VDataTable
                :headers="headers"
                :items="list_sucursales"
                :items-per-page="5"
                class="text-no-wrap"
            >
                <template #item.id="{ item }">
                <span class="text-h6">{{ item.id }}</span>
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
        <SucursalAddDialog v-model:isDialogVisible="isSucursalAddDialogVisible" @addSucursal="addNewSucursal"></SucursalAddDialog>
        <SucursalEditDialog v-if="sucursal_selected_edit && isSucursalEditDialogVisible" v-model:isDialogVisible="isSucursalEditDialogVisible" :sucursalSelected="sucursal_selected_edit" @editSucursal="addEditSucursal"></SucursalEditDialog>
        <SucursalDeleteDialog v-if="sucursal_selected_delete && isSucursalDeleteDialogVisible" v-model:isDialogVisible="isSucursalDeleteDialogVisible" :sucursalSelected="sucursal_selected_delete" @deleteSucursal="addDeleteSucursal"></SucursalDeleteDialog>
    </div>
</template>