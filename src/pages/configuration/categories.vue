<script setup>
    const headers = [
        {
            title: 'ID',
            key: 'id',
        },
        {
            title: 'Categoria',
            key: 'name',
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
    const isCategorieAddDialogVisible = ref(false);
    const isCategorieEditDialogVisible = ref(false);
    const isCategorieDeleteDialogVisible = ref(false);
    
    const list_categories = ref([]);
    const searchQuery = ref(null);
    const categorie_selected_edit = ref(null);
    const categorie_selected_delete = ref(null);

    const list = async() => {
        try {
            const resp = await $api("categories?search="+(searchQuery.value ? searchQuery.value : ''),{
                method:'GET',
                onResponseError({response}){
                    console.log(response._data.error);
                }
            })
            console.log(resp);
            list_categories.value = resp.categories;
        } catch (error) {
            console.log(error);
        }
    }

    const addNewCategorie = (NewCategorie) => {
        console.log(NewCategorie);
        let backup = list_categories.value;
        list_categories.value = [];
        backup.unshift(NewCategorie);
        setTimeout(() => {
            list_categories.value = backup;
        }, 50);
    }

    const addEditCategorie = (editCategorie) => {
        console.log(editCategorie);
        let backup = list_categories.value;
        list_categories.value = [];
        let INDEX = backup.findIndex((categ) => categ.id == editCategorie.id);
        if(INDEX != -1){
            backup[INDEX] = editCategorie;
        }
        setTimeout(() => {
            list_categories.value = backup;
        }, 50);
    }

    const addDeleteCategorie = (Categorie) => {
        console.log(Categorie);
        let backup = list_categories.value;
        list_categories.value = [];
        let INDEX = backup.findIndex((categorie) => categorie.id == Categorie.id);
        if(INDEX != -1){
            backup.splice(INDEX,1);
        }
        setTimeout(() => {
            list_categories.value = backup;
        }, 50);
    }

    const editItem = (item) => {
        console.log(item);
        isCategorieEditDialogVisible.value = true;
        categorie_selected_edit.value = item;
    }
    const deleteItem = (item) => {
        isCategorieDeleteDialogVisible.value = true;
        categorie_selected_delete.value = item;
    }

    onMounted(() => {
        list();
    })

    definePage({ meta: { permission: 'settings', } });
</script>
<template>
    <div>
        <VCard title="Gestión de Categorias">
            <VCardText>
                <VRow class="justify-space-between">
                    <VCol cols="3">
                        <VTextField
                            placeholder="Buscar categoria"
                            density="compact"
                            class="me-3"
                            v-model="searchQuery"
                            @keyup.enter="list"
                        />
                    </VCol>
                    <VCol cols="2" class="text-end">
                        <VBtn @click="isCategorieAddDialogVisible = !isCategorieAddDialogVisible">
                            Nueva Categoria
                            <VIcon
                                end
                                icon="ri-todo-line"
                            />
                        </VBtn>
                    </VCol>
                </VRow>
            </VCardText>
            <VDataTable
                :headers="headers"
                :items="list_categories"
                :items-per-page="5"
                class="text-no-wrap"
            >
                <template #item.id="{ item }">
                <span class="text-h6">{{ item.id }}</span>
                </template>

                <template #item.name="{ item }">
                    <div class="d-flex align-center">
                        <VAvatar
                            size="32"
                            :color="item.imagen ? '' : 'primary'"
                            :class="item.imagen ? '' : 'v-avatar-light-bg primary--text'"
                            :variant="!item.imagen ? 'tonal' : undefined"
                        >
                        <VImg
                            :src="item.imagen"
                        />
                        </VAvatar>
                        <div class="d-flex flex-column ms-3">
                            <span class="d-block font-weight-medium text-high-emphasis text-truncate">{{ item.title }}</span>
                            <!-- <small>{{ item.post }}</small> -->
                        </div>
                    </div>
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

        <CategorieAddDialog v-model:isDialogVisible="isCategorieAddDialogVisible" @addCategorie="addNewCategorie"></CategorieAddDialog>
        <CategorieEditDialog v-if="categorie_selected_edit && isCategorieEditDialogVisible" v-model:isDialogVisible="isCategorieEditDialogVisible" :categorieSelected="categorie_selected_edit" @editCategorie="addEditCategorie"></CategorieEditDialog>
        <CategorieDeleteDialog v-if="categorie_selected_delete && isCategorieDeleteDialogVisible" v-model:isDialogVisible="isCategorieDeleteDialogVisible" :categorieSelected="categorie_selected_delete" @deleteCategorie="addDeleteCategorie"></CategorieDeleteDialog>
    </div>
</template>