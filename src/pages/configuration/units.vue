<script setup>
    const headers = [
        {
            title: 'ID',
            key: 'id',
        },
        {
            title: 'Unidad',
            key: 'name',
        },
        {
            title: 'Descripción',
            key: 'description',
        },
        {
            title: 'Fecha de registro',
            key: 'created_at',
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
    const isUnitAddDialogVisible = ref(false);
    const isUnitEditDialogVisible = ref(false);
    const isUnitDeleteDialogVisible = ref(false);
    const isUnitConversionAddDialogVisible = ref(false);

    const list_units = ref([]);
    const searchQuery = ref(null);
    const unit_selected_edit = ref(null);
    const unit_selected_delete = ref(null);
    const unit_selected_conversion = ref(null);

    const list = async() => {
        try {
            const resp = await $api("units?search="+(searchQuery.value ? searchQuery.value : ''),{
                method:'GET',
                onResponseError({response}){
                    console.log(response._data.error);
                }
            })
            console.log(resp);
            list_units.value = resp.units;
        } catch (error) {
            console.log(error);
        }
    }

    const addNewUnit = (NewUnit) => {
        console.log(NewUnit);
        let backup = list_units.value;
        list_units.value = [];
        backup.unshift(NewUnit);
        setTimeout(() => {
            list_units.value = backup;
        }, 50);
    }

    const addEditUnit = (editUnit) => {
        console.log(editUnit);
        let backup = list_units.value;
        list_units.value = [];
        let INDEX = backup.findIndex((unit) => unit.id == editUnit.id);
        if(INDEX != -1){
            backup[INDEX] = editUnit;
        }
        setTimeout(() => {
            list_units.value = backup;
        }, 50);
    }

    const addDeleteUnit = (Unit) => {
        console.log(Unit);
        let backup = list_units.value;
        list_units.value = [];
        let INDEX = backup.findIndex((unit) => unit.id == Unit.id);
        if(INDEX != -1){
            backup.splice(INDEX,1);
        }
        setTimeout(() => {
            list_units.value = backup;
        }, 50);
    }

    const editItem = (item) => {
        console.log(item);
        isUnitEditDialogVisible.value = true;
        unit_selected_edit.value = item;
    }
    const deleteItem = (item) => {
        isUnitDeleteDialogVisible.value = true;
        unit_selected_delete.value = item;
    }
    const addConversion = (item) => {
        isUnitConversionAddDialogVisible.value = true;
        unit_selected_conversion.value = item;
    }
    onMounted(() => {
        list();
    })

    definePage({ meta: { permission: 'settings', } });
</script>
<template>
    <div>
        <VCard title="Gestión de Unidades">
            <VCardText>
                <VRow class="justify-space-between">
                    <VCol cols="3">
                        <VTextField
                            placeholder="Buscar unidad"
                            density="compact"
                            class="me-3"
                            v-model="searchQuery"
                            @keyup.enter="list"
                        />
                    </VCol>
                    <VCol cols="2" class="text-end">
                        <VBtn @click="isUnitAddDialogVisible = !isUnitAddDialogVisible">
                            Nueva Unidad
                            <VIcon
                                end
                                icon="ri-sticky-note-add-line"
                            />
                        </VBtn>
                    </VCol>
                </VRow>
            </VCardText>
            <VDataTable
                :headers="headers"
                :items="list_units"
                :items-per-page="5"
                class="text-no-wrap"
            >
                <template #item.id="{ item }">
                <span class="text-h6">{{ item.id }}</span>
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
                            @click="addConversion(item)"
                        >
                            <VIcon icon="ri-git-repository-commits-line" />
                        </IconBtn>
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
        <UnitAddDialog v-model:isDialogVisible="isUnitAddDialogVisible" @addUnit="addNewUnit"></UnitAddDialog>
        <UnitEditDialog v-if="unit_selected_edit && isUnitEditDialogVisible" v-model:isDialogVisible="isUnitEditDialogVisible" :unitSelected="unit_selected_edit" @editUnit="addEditUnit"></UnitEditDialog>
        <UnitDeleteDialog v-if="unit_selected_delete && isUnitDeleteDialogVisible" v-model:isDialogVisible="isUnitDeleteDialogVisible" :unitSelected="unit_selected_delete" @deleteUnit="addDeleteUnit"></UnitDeleteDialog>
        <UnitConversionAddDialog v-if="unit_selected_conversion && isUnitConversionAddDialogVisible" v-model:isDialogVisible="isUnitConversionAddDialogVisible" :units="list_units" :unitSelected="unit_selected_conversion"></UnitConversionAddDialog>
    </div>
</template>