<script setup>
    // Mapeo de áreas según los IDs
    const AREAS = {
        1: 'AUDITORIA INTERNA',
        2: 'DIRECCION ADMINISTRATIVA FINANCIERA',
        3: 'GERENCIA ADMINISTRATIVA',
        4: 'GERENCIA DE BANQUETES',
        5: 'GERENCIA DE MERCADEO',
        6: 'GERENCIA DE OPERACIONES',
        7: 'GERENCIA DE PROYECTOS',
        8: 'GERENCIA DE RECURSOS HUMANOS',
        9: 'GERENCIA DE VENTAS',
        10: 'GERENCIA LEGAL',
        11: 'PRESIDENCIA',
        12: 'SEGURIDAD',
        13: 'UNIDAD DE COMPRAS PUBLICAS',
        14: 'UNIDAD INFORMATICA',
        15: 'UNIDAD DE PLANIFICACION',
    };

    const getAreaName = (areaId) => {
        return AREAS[areaId] || 'N/A';
    };

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
            title: 'Area de Solicitante',
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
    const loading = ref(false);
    const searchQuery = ref(null);
    const client_final_selected_edit = ref(null);
    const client_company_selected_edit = ref(null);
    const client_selected_delete = ref(null);

    const list = async () => {
      try {
        loading.value = true;
        const resp = await $api(
          `clients?page=${currentPage.value}&search=${searchQuery.value ?? ''}`,
          { method: 'GET' }
        )

        // 👇 AQUÍ ESTÁ LA CLAVE
        list_clients.value = resp.clients.data
        totalPage.value = resp.total_page

      } catch (error) {
        console.log(error)
      } finally {
        loading.value = false;
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
        // Todos los clientes son ahora "Cliente Final" con diferentes áreas
        client_final_selected_edit.value = item;
        client_company_selected_edit.value = null;
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
        <VCard title="Gestión de Solicitantes">
            <VCardText>
                <VRow class="justify-space-between">
                    <VCol cols="3">
                        <VTextField
                            placeholder="Buscar Solicitante"
                            density="compact"
                            class="me-3"
                            v-model="searchQuery"
                            @keyup.enter="list"
                        />
                    </VCol>
                    <VCol cols="4">
                        <VRow class="justify-end" >
                            
                                <VBtn  v-if="isPermission('register_client')" @click="isClientFinalAddDialogVisible = !isClientFinalAddDialogVisible">
                                    Solicitante
                                    <VIcon
                                        end
                                        icon="ri-walk-line"
                                    />
                                </VBtn>
                            
                            <!-- <VCol cols="6" class="text-end">
                                <VBtn  v-if="isPermission('register_client')" @click="isClientCompanyAddDialogVisible = !isClientCompanyAddDialogVisible">
                                    Cliente Empresa
                                    <VIcon
                                        end
                                        icon="ri-community-line"
                                    />
                                </VBtn>
                            </VCol> -->
                        </VRow>
                    </VCol>
                </VRow>
            </VCardText>

            <div v-if="loading" class="d-flex justify-center align-center py-10">
                <VProgressCircular
                    indeterminate
                    color="primary"
                    size="64"
                />
            </div>
            <VTable v-else>
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
                        <VChip color="info" size="small">
                            {{ getAreaName(client.type_client) }}
                        </VChip>
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
