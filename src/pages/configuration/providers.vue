<script setup>
    const headers = [
        {
            title: 'ID',
            key: 'id',
        },
        {
            title: 'Nombre Completo',
            key: 'full_name',
        },
        {
            title: 'nit',
            key: 'ruc',
        },
        {
            title: 'Correo',
            key: 'email',
        },
        {
            title: 'Telefono',
            key: 'phone',
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
    const isProviderAddDialogVisible = ref(false);
    const isProviderEditDialogVisible = ref(false);
    const isProviderDeleteDialogVisible = ref(false);
    
    const list_providers = ref([]);
    const searchQuery = ref(null);
    const provider_selected_edit = ref(null);
    const provider_selected_delete = ref(null);

    const list = async() => {
        try {
            const resp = await $api("providers?search="+(searchQuery.value ? searchQuery.value : ''),{
                method:'GET',
                onResponseError({response}){
                    console.log(response._data.error);
                }
            })
            console.log(resp);
            list_providers.value = resp.providers;
        } catch (error) {
            console.log(error);
        }
    }

    const addNewProvider = (NewProvider) => {
        console.log(NewProvider);
        let backup = list_providers.value;
        list_providers.value = [];
        backup.unshift(NewProvider);
        setTimeout(() => {
            list_providers.value = backup;
        }, 50);
    }

    const addEditProvider = (editProvider) => {
        console.log(editProvider);
        let backup = list_providers.value;
        list_providers.value = [];
        let INDEX = backup.findIndex((provider) => provider.id == editProvider.id);
        if(INDEX != -1){
            backup[INDEX] = editProvider;
        }
        setTimeout(() => {
            list_providers.value = backup;
        }, 50);
    }

    const addDeleteProvider = (Provider) => {
        console.log(Provider);
        let backup = list_providers.value;
        list_providers.value = [];
        let INDEX = backup.findIndex((pv) => pv.id == Provider.id);
        if(INDEX != -1){
            backup.splice(INDEX,1);
        }
        setTimeout(() => {
            list_providers.value = backup;
        }, 50);
    }

    const editItem = (item) => {
        console.log(item);
        isProviderEditDialogVisible.value = true;
        provider_selected_edit.value = item;
    }
    const deleteItem = (item) => {
        isProviderDeleteDialogVisible.value = true;
        provider_selected_delete.value = item;
    }

    const avatarText = value => {
        if (!value)
            return ''
        const nameArray = value.split(' ')
        
        return nameArray.map(word => word.charAt(0).toUpperCase()).join('')
    }

    onMounted(() => {
        list();
    })

    
    definePage({ meta: { permission: 'settings', } });
</script>
<template>
    <div>
        <VCard title="Gestión de Proveedores">
            <VCardText>
                <VRow class="justify-space-between">
                    <VCol cols="3">
                        <VTextField
                            placeholder="Buscar Proveedor"
                            density="compact"
                            class="me-3"
                            v-model="searchQuery"
                            @keyup.enter="list"
                        />
                    </VCol>
                    <VCol cols="2" class="text-end">
                        <VBtn @click="isProviderAddDialogVisible = !isProviderAddDialogVisible">
                            Nuevo Proveedor
                            <VIcon
                                end
                                icon="ri-user-location-line"
                            />
                        </VBtn>
                    </VCol>
                </VRow>
            </VCardText>
            <VDataTable
                :headers="headers"
                :items="list_providers"
                :items-per-page="5"
                class="text-no-wrap"
            >
                <template #item.id="{ item }">
                <span class="text-h6">{{ item.id }}</span>
                </template>
                <template #item.full_name="{item}">
                    <div class="d-flex align-center">
                        <VAvatar
                            size="32"
                            :color="item.imagen ? '' : 'primary'"
                            :class="item.imagen ? '' : 'v-avatar-light-bg primary--text'"
                            :variant="!item.imagen ? 'tonal' : undefined"
                        >
                        <VImg
                            v-if="item.imagen"
                            :src="item.imagen"
                        />
                        <span
                            v-else
                            class="text-sm"
                        >{{ avatarText(item.full_name) }}</span>
                        </VAvatar>
                        <div class="d-flex flex-column ms-3">
                            <span class="d-block font-weight-medium text-high-emphasis text-truncate">{{ item.full_name }}</span>
                            <!-- <small>{{ item.post }}</small> -->
                        </div>
                    </div>
                </template>

                <template #item.state="{item}">
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
        <ProviderAddDialog v-model:isDialogVisible="isProviderAddDialogVisible" @addProvider="addNewProvider"></ProviderAddDialog>
        <ProviderEditDialog v-if="provider_selected_edit && isProviderEditDialogVisible" v-model:isDialogVisible="isProviderEditDialogVisible" :providerSelected="provider_selected_edit" @editProvider="addEditProvider"></ProviderEditDialog>
        <ProviderDeleteDialog v-if="provider_selected_delete && isProviderDeleteDialogVisible" v-model:isDialogVisible="isProviderDeleteDialogVisible" :providerSelected="provider_selected_delete" @deleteProvider="addDeleteProvider"></ProviderDeleteDialog>
    </div>
</template>