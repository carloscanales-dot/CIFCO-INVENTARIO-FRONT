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
            title: 'Tipo Cliente',
            key: 'type_client',
        },
        {
            title: 'Documento',
            key: 'n_document',
        },
        // {
        //     title: 'Sucursal',
        //     key: 'sucursale',
        // },
        {
            title: 'Email',
            key: 'email',
        },
        {
            title: 'Telefono',
            key: 'phone',
        },
        {
            title: 'Dirección',
            key: 'region',
        },
        {
            title: 'Estado',
            key: 'state',
        },
        {
            title: 'Acciones',
            key: 'action',
        },
    ]
    const isClientFinalAddDialogVisible = ref(false);
    const isClientCompanyAddDialogVisible = ref(false);
    const isClientEditDialogVisible = ref(false);
    const isClientDeleteDialogVisible = ref(false);
    
    const list_clients = ref([]);
    const currentPage = ref(1);
    const totalPage = ref(0);
    const searchQuery = ref(null);
    const client_final_selected_edit = ref(null);
    const client_company_selected_edit = ref(null);
    const client_selected_delete = ref(null);

    const list = async() => {
        try {
            const resp = await $api("clients?page="+currentPage.value+"&search="+(searchQuery.value ? searchQuery.value : ''),{
                method:'GET',
                onResponseError({response}){
                    console.log(response._data.error);
                }
            })
            console.log(resp);
            list_clients.value = resp.clients.data;
            totalPage.value = resp.total_page;
        } catch (error) {
            console.log(error);
        }
    }

    const addNewClient = (NewClient) => {
        console.log(NewClient);
        let backup = list_clients.value;
        list_clients.value = [];
        backup.unshift(NewClient);
        setTimeout(() => {
            list_clients.value = backup;
        }, 50);
    }

    const addEditClient = (editClient) => {
        console.log(editClient);
        let backup = list_clients.value;
        list_clients.value = [];
        let INDEX = backup.findIndex((client) => client.id == editClient.id);
        if(INDEX != -1){
            backup[INDEX] = editClient;
        }
        setTimeout(() => {
            list_clients.value = backup;
        }, 50);
    }

    const addDeleteClient = (Client) => {
        console.log(Client);
        let backup = list_clients.value;
        list_clients.value = [];
        let INDEX = backup.findIndex((pv) => pv.id == Client.id);
        if(INDEX != -1){
            backup.splice(INDEX,1);
        }
        setTimeout(() => {
            list_clients.value = backup;
        }, 50);
    }

    const editItem = (item) => {
        console.log(item);
        isClientEditDialogVisible.value = true;
        if(item.type_client == 1) {//CLIENTE FINAL
            client_final_selected_edit.value = item;
            client_company_selected_edit.value = null;
        }else{
            client_company_selected_edit.value = item;
            client_final_selected_edit.value = null;
        }
    }
    const deleteItem = (item) => {
        isClientDeleteDialogVisible.value = true;
        client_selected_delete.value = item;
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

    watch(currentPage,(page) => {
        console.log(page);
        list();
    })
    
    definePage({ meta: { permission: 'list_client', } });
</script>
<template>
    <div>
        <VCard title="Gestión de Clientes">
            <VCardText>
                <VRow class="justify-space-between">
                    <VCol cols="3">
                        <VTextField
                            placeholder="Buscar Cliente"
                            density="compact"
                            class="me-3"
                            v-model="searchQuery"
                            @keyup.enter="list"
                        />
                    </VCol>
                    <VCol cols="4">
                        <VRow>
                            <VCol cols="6" class="text-end">
                                <VBtn  v-if="isPermission('register_client')" @click="isClientFinalAddDialogVisible = !isClientFinalAddDialogVisible">
                                    Cliente Final
                                    <VIcon
                                        end
                                        icon="ri-walk-line"
                                    />
                                </VBtn>
                            </VCol>
                            <VCol cols="6" class="text-end">
                                <VBtn  v-if="isPermission('register_client')" @click="isClientCompanyAddDialogVisible = !isClientCompanyAddDialogVisible">
                                    Cliente Empresa
                                    <VIcon
                                        end
                                        icon="ri-community-line"
                                    />
                                </VBtn>
                            </VCol>
                        </VRow>
                    </VCol>
                </VRow>
            </VCardText>

            <VTable>
              <thead>
                <tr>
                    <th class="text-uppercase" v-for="(header, index) in headers" :key="index">
                        {{ header.title }}
                    </th>
                </tr>
              </thead>

              <tbody>
                <tr
                    v-for="client in list_clients"
                    :key="client.id"
                >
                    <td>{{ client.id }}</td>
                    <td>{{ client.full_name }}</td>
                    <td>
                        <span v-if="client.type_client == 1">Cliente Final</span>
                        <span v-if="client.type_client == 2">Cliente Empresa</span>
                    </td>
                    <td>
                        <span>{{ client.type_document }}</span>
                        <br>
                        <span>{{ client.n_document }}</span>
                    </td>
                    <!-- <td>
                        {{ client.sucursale.name }}
                    </td> -->
                    <td>
                        {{ client.email }}
                    </td>
                    <td>
                        {{ client.phone }}
                    </td>
                    <td>
                        <!--{{ client.region }} / {{ client.provincia }} / {{ client.distrito }}-->
                        {{ client.address }}
                    </td>
                    <td>
                        <VChip color="primary" v-if="client.state == 1">
                            Activo
                        </VChip>
                        <VChip color="error" v-if="client.state == 2">
                            Inactivo
                        </VChip>
                    </td>
                    <td>
                        <div class="d-flex gap-1">
                            <IconBtn
                                size="small"
                                @click="editItem(client)"
                                 v-if="isPermission('edit_client')"
                            >
                                <VIcon icon="ri-pencil-line" />
                            </IconBtn>
                            <IconBtn
                                size="small"
                                @click="deleteItem(client)"
                                 v-if="isPermission('delete_client')"
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
        <ClientFinalAddDialog v-model:isDialogVisible="isClientFinalAddDialogVisible" @addClient="addNewClient"></ClientFinalAddDialog>
        <ClientCompanyAddDialog v-model:isDialogVisible="isClientCompanyAddDialogVisible" @addClient="addNewClient"></ClientCompanyAddDialog>
        <ClientFinalEditDialog v-if="client_final_selected_edit && isClientEditDialogVisible" 
        v-model:isDialogVisible="isClientEditDialogVisible" 
        :clientSelected="client_final_selected_edit" 
        @editClient="addEditClient"></ClientFinalEditDialog>
        <ClientCompanyEditDialog v-if="client_company_selected_edit && isClientEditDialogVisible" 
        v-model:isDialogVisible="isClientEditDialogVisible" 
        :clientSelected="client_company_selected_edit" 
        @editClient="addEditClient"></ClientCompanyEditDialog>

        <ClientDeleteDialog v-if="client_selected_delete && isClientDeleteDialogVisible" 
        v-model:isDialogVisible="isClientDeleteDialogVisible" 
        :clientSelected="client_selected_delete" 
        @deleteClient="addDeleteClient"></ClientDeleteDialog>
    </div>
</template>