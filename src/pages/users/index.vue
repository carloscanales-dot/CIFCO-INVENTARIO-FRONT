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
            title: 'Email',
            key: 'email',
        },
        {
            title: 'Role',
            key: 'role',
        },
        {
            title: 'Sucursal',
            key: 'sucursale',
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
            title: 'Action',
            key: 'action',
        },
    ]
    const isUserAddDialogVisible = ref(false);
    const isUserEditDialogVisible = ref(false);
    const isUserDeleteDialogVisible = ref(false);
    
    const list_users = ref([]);
    const sucursales = ref([]);
    const roles = ref([]);
    const searchQuery = ref(null);
    const user_selected_edit = ref(null);
    const user_selected_delete = ref(null);

    const list = async() => {
        try {
            const resp = await $api("users?search="+(searchQuery.value ? searchQuery.value : ''),{
                method:'GET',
                onResponseError({response}){
                    console.log(response._data.error);
                }
            })
            console.log(resp);
            list_users.value = resp.users;
        } catch (error) {
            console.log(error);
        }
    }

    const config = async() => {
        try {
            const resp = await $api("users/config",{
                method:'GET',
                onResponseError({response}){
                    console.log(response._data.error);
                }
            })
            console.log(resp);
            sucursales.value = resp.sucursales;
            roles.value = resp.roles;
        } catch (error) {
            console.log(error);
        }
    }

    const addNewUser = (NewUser) => {
        console.log(NewUser);
        let backup = list_users.value;
        list_users.value = [];
        backup.unshift(NewUser);
        setTimeout(() => {
            list_users.value = backup;
        }, 50);
    }

    const addEditUser = (editUser) => {
        console.log(editUser);
        let backup = list_users.value;
        list_users.value = [];
        let INDEX = backup.findIndex((user) => user.id == editUser.id);
        if(INDEX != -1){
            backup[INDEX] = editUser;
        }
        setTimeout(() => {
            list_users.value = backup;
        }, 50);
    }

    const addDeleteUser = (User) => {
        console.log(User);
        let backup = list_users.value;
        list_users.value = [];
        let INDEX = backup.findIndex((user) => user.id == User.id);
        if(INDEX != -1){
            backup.splice(INDEX,1);
        }
        setTimeout(() => {
            list_users.value = backup;
        }, 50);
    }

    const editItem = (item) => {
        console.log(item);
        isUserEditDialogVisible.value = true;
        user_selected_edit.value = item;
    }
    const deleteItem = (item) => {
        isUserDeleteDialogVisible.value = true;
        user_selected_delete.value = item;
    }

    const avatarText = value => {
        if (!value)
            return ''
        const nameArray = value.split(' ')
        
        return nameArray.map(word => word.charAt(0).toUpperCase()).join('')
    }

    onMounted(() => {
        list();
        config();
    })

    
    definePage({ meta: { permission: 'list_user', } });
</script>
<template>
    <div>
        <VCard title="Lista de Usuarios">
            <VCardText>
                <VRow class="justify-space-between">
                    <VCol cols="3">
                        <VTextField
                            placeholder="Buscar usuario"
                            density="compact"
                            class="me-3"
                            v-model="searchQuery"
                            @keyup.enter="list"
                        />
                    </VCol>
                    <VCol cols="2" class="text-end">
                        <VBtn @click="isUserAddDialogVisible = !isUserAddDialogVisible">
                            Nuevo Usuario
                            <VIcon
                                end
                                icon="ri-user-add-line"
                            />
                        </VBtn>
                    </VCol>
                </VRow>
            </VCardText>
            <VDataTable
                :headers="headers"
                :items="list_users"
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
                            :color="item.avatar ? '' : 'primary'"
                            :class="item.avatar ? '' : 'v-avatar-light-bg primary--text'"
                            :variant="!item.avatar ? 'tonal' : undefined"
                        >
                        <VImg
                            v-if="item.avatar"
                            :src="item.avatar"
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

                <template #item.role="{ item }">
                    <span class="text-h6">{{ item.role.name }}</span>
                </template>
                <template #item.sucursale="{ item }">
                    <span class="text-h6">{{ item.sucursale.name }}</span>
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
        <UserAddDialog v-model:isDialogVisible="isUserAddDialogVisible" :sucursales="sucursales" :roles="roles" @addUser="addNewUser"></UserAddDialog>
        <UserEditDialog v-if="user_selected_edit && isUserEditDialogVisible" :sucursales="sucursales" :roles="roles" v-model:isDialogVisible="isUserEditDialogVisible" :selectedUser="user_selected_edit" @editUser="addEditUser"></UserEditDialog>
        <UserDeleteDialog v-if="user_selected_delete && isUserDeleteDialogVisible" v-model:isDialogVisible="isUserDeleteDialogVisible" :userSelected="user_selected_delete" @deleteUser="addDeleteUser"></UserDeleteDialog>
    </div>
</template>