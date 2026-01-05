<template>
    <div>
        <VCard title="Gestión de Productos">
            <VCardText>
                <!-- Filtros (sin cambios) -->
                <VRow class="">
                    <VCol cols="10">
                        <VRow>
                            <VCol cols="3">
                                <VTextField
                                    placeholder="Buscar producto"
                                    density="compact"
                                    class="me-3"
                                    v-model="searchQuery"
                                    @keyup.enter="list"
                                />
                            </VCol>
                            <VCol cols="3">
                                <VSelect
                                    placeholder="Select"
                                    label="Categoria"
                                    :items="categories"
                                    item-title="name"
                                    item-value="id"
                                    v-model="product_categorie_id"
                                >
                                </VSelect>
                            </VCol>
                            <VCol cols="3">
                                <VSelect
                                    :items="warehouses"
                                    item-title="name"
                                    item-value="id"
                                    placeholder="Select"
                                    v-model="warehouse_stock_id"
                                    label="Almacenes"
                                />
                            </VCol>
                            <VCol cols="3">
                                <VSelect
                                    :items="sucursales"
                                    item-title="name"
                                    item-value="id"
                                    placeholder="Select"
                                    label="Sucursales"
                                    v-model="sucursale_price_id"
                                />
                            </VCol>
                            <VCol cols="4">
                                <VBtn
                                    color="info"
                                    class="mx-1"
                                    prepend-icon="ri-search-2-line"
                                    @click="list()"
                                >
                                    <VTooltip
                                        activator="parent"
                                        location="top"
                                    >
                                        Buscar
                                    </VTooltip>
                                </VBtn>
                                <VBtn
                                    color="secondary"
                                    class="mx-1"
                                    prepend-icon="ri-restart-line"
                                    @click="reset()"
                                >
                                    <VTooltip
                                        activator="parent"
                                        location="top"
                                    >
                                        Limpieza
                                    </VTooltip>
                                </VBtn>
                                <VBtn
                                    color="success"
                                    class="mx-1"
                                    prepend-icon="ri-file-excel-2-line"
                                    @click="downloadExcel()"
                                >
                                    <VTooltip
                                        activator="parent"
                                        location="top"
                                    >
                                        Exportar Productos
                                    </VTooltip>
                                </VBtn>
                                <VBtn
                                    color="success"
                                    class="mx-1"
                                    prepend-icon="ri-file-excel-line"
                                    @click="isImportExcelProductDialogVisible = !isImportExcelProductDialogVisible"
                                >
                                    <VTooltip
                                        activator="parent"
                                        location="top"
                                    >
                                        Importar Productos
                                    </VTooltip>
                                </VBtn>
                            </VCol>
                        </VRow>
                    </VCol>
                    <VCol cols="2" class="text-end">
                        <VBtn v-if="isPermission('register_product')" @click="router.push({name: 'product-add'})">
                            Nuevo Producto
                            <VIcon
                                end
                                icon="ri-product-hunt-fill"
                            />
                        </VBtn>
                    </VCol>
                </VRow>
            </VCardText>
            
            <!-- Tabla Mejorada con Imágenes Cuadradas -->
            <div class="table-container">
                <VTable class="products-table">
                    <thead class="table-header">
                        <tr>
                            <th class="text-uppercase column-producto">
                                Producto
                            </th>
                            <th class="text-uppercase column-sku">
                                SKU
                            </th>
                            <th class="text-uppercase column-categoria">
                                Categoría
                            </th>
                            <th class="text-uppercase column-vencimiento">
                                Vencimiento
                            </th>
                            <!--<th class="text-uppercase column-regalo">
                                ¿Es un regalo?
                            </th>-->
                            <th class="text-uppercase column-descuento">
                                Descuento
                            </th>
                            <th class="text-uppercase column-iva">
                                Importe IVA
                            </th>
                            <th class="text-uppercase column-garantia">
                                Garantía
                            </th>
                            <th class="text-uppercase column-estado">
                                Estado
                            </th>
                            <th class="text-uppercase column-fecha">
                                Fecha de registro
                            </th>
                            <th class="text-uppercase column-acciones">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    
                    <tbody class="table-body">
                        <tr
                            v-for="item in list_products"
                            :key="item.id"
                            class="table-row"
                        >
                            <!-- Columna Producto - CON IMAGEN CUADRADA -->
                            <td class="product-cell">
                                <div class="product-info">
                                    <div class="product-image-container">
                                        <div
                                            class="square-avatar"
                                            :class="item.imagen ? '' : 'no-image'"
                                        >
                                            <VImg
                                                v-if="item.imagen"
                                                :src="item.imagen"
                                                class="product-image"
                                            />
                                            <span
                                                v-else
                                                class="avatar-text"
                                            >{{ avatarText(item.title) }}</span>
                                        </div>
                                    </div>
                                    <div class="product-details">
                                        <div class="product-name">{{ item.title }}</div>
                                        <div class="stock-status">
                                            <VChip 
                                                size="small" 
                                                :color="getStockColor(item.state_stock)"
                                                class="stock-chip"
                                            >
                                                {{ getStockText(item.state_stock) }}
                                            </VChip>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            
                            <!-- Columna SKU -->
                            <td class="sku-cell">
                                <div class="sku-value">{{ item.sku }}</div>
                            </td>
                            
                            <!-- Columna Categoría -->
                            <td class="category-cell">
                                <div class="category-badge">
                                    {{ item.product_categorie.name }}
                                </div>
                            </td>
                            
                            <!-- Columna Vencimiento -->
                            <td class="expiration-cell">
                                <div class="expiration-info">
                                    {{ item.expiration_date }}
                                </div>
                            </td>

                            <!-- Columna Regalo -->
                            <!--<td class="gift-cell">
                                <div class="status-indicator" :class="item.is_gift == 1 ? 'no' : 'yes'">
                                    <span class="status-dot"></span>
                                    {{ item.is_gift == 1 ? 'NO' : 'SÍ' }}
                                </div>
                            </td>-->
                            
                            <!-- Columna Descuento -->
                            <td class="discount-cell">
                                <div class="discount-info">
                                    <div class="status-indicator" :class="item.is_discount == 1 ? 'no' : 'yes'">
                                        <span class="status-dot"></span>
                                        {{ item.is_discount == 1 ? 'NO' : 'SÍ' }}
                                    </div>
                                    <div v-if="item.is_discount == 2" class="discount-amount">
                                        {{ item.max_discount }}% de descuento
                                    </div>
                                </div>
                            </td>
                            
                            <!-- Columna IVA -->
                            <td class="tax-cell">
                                <div class="tax-amount">
                                    {{ (item.importe_iva) }}
                                </div>
                            </td>
                            
                            <!-- Columna Garantía -->
                            <td class="warranty-cell">
                                <div class="warranty-info">
                                    <div class="warranty-icon">
                                        <VIcon icon="ri-shield-check-line" size="18" />
                                    </div>
                                    <span>{{ item.warranty_day }} días</span>
                                </div>
                            </td>
                            
                            <!-- Columna Estado -->
                            <td class="status-cell">
                                <VChip 
                                    size="small" 
                                    :color="item.state == 1 ? 'success' : 'error'"
                                    class="status-chip"
                                >
                                    {{ item.state == 1 ? 'Activo' : 'Inactivo' }}
                                </VChip>
                            </td>
                            
                            <!-- Columna Fecha -->
                            <td class="date-cell">
                                <div class="date-info">
                                    <div class="date-value">{{ formatDate(item.created_at) }}</div>
                                </div>
                            </td>
                            
                            <!-- Columna Acciones -->
                            <td class="actions-cell">
                                <div class="action-buttons">
                                    <IconBtn
                                        size="small"
                                        class="action-btn edit-btn"
                                        @click="editItem(item)"
                                        v-if="isPermission('edit_product')"
                                    >
                                        <VIcon icon="ri-pencil-line" />
                                    </IconBtn>
                                    <IconBtn
                                        size="small"
                                        class="action-btn delete-btn"
                                        @click="deleteItem(item)"
                                        v-if="isPermission('delete_product')"
                                    >
                                        <VIcon icon="ri-delete-bin-line" />
                                    </IconBtn>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </VTable>
            </div>
            
            <VPagination
                v-model="currentPage"
                :length="totalPage"
            />
        </VCard>
        <ImportExcelProduct v-model:isDialogVisible="isImportExcelProductDialogVisible" @importExcelProduct="importProducts()"></ImportExcelProduct>
        <ProductDeleteDialog v-if="product_selected_delete && isProductDeleteDialogVisible" v-model:isDialogVisible="isProductDeleteDialogVisible" :productSelected="product_selected_delete" @deleteProduct="addDeleteProduct"></ProductDeleteDialog>
    </div>
</template>

<script setup>
    const router = useRouter();
    const isProductDeleteDialogVisible = ref(false);
    const isImportExcelProductDialogVisible = ref(false);
    const currentPage = ref(1);
    const totalPage = ref(0);

    const list_products = ref([]);
    const sucursales = ref([]);
    const warehouses = ref([]);
    const units = ref([]);
    const categories = ref([]);
    const searchQuery = ref(null);
    const product_categorie_id = ref(null);
    const warehouse_stock_id = ref(null);
    const unit_stock_id = ref(null);
    const sucursale_price_id = ref(null);
    const disponibilidad = ref(null);
    const is_gift = ref(null);
    const product_selected_delete = ref(null);

    const list = async() => {
        try {
            let data = {
                search:searchQuery.value,
                product_categorie_id: product_categorie_id.value,
                warehouse_id: warehouse_stock_id.value,
                unit_id: unit_stock_id.value,
                sucursale_id: sucursale_price_id.value,
                disponibilidad: disponibilidad.value,
                is_gift: is_gift.value,
            }
            const resp = await $api("products/index?page="+currentPage.value,{
                method:'POST',
                body: data,
                onResponseError({response}){
                    console.log(response._data.error);
                }
            })
            console.log(resp);
            list_products.value = resp.products.data;
            totalPage.value = resp.total_page;
        } catch (error) {
            console.log(error);
        }
    }

    watch(currentPage,(val) => {
        console.log(val);
        list();
    })

    const reset = () => {
        searchQuery.value = '';
        product_categorie_id.value = null;
        warehouse_stock_id.value = null;
        unit_stock_id.value = null;
        sucursale_price_id.value = null;
        disponibilidad.value = null;
        is_gift.value = null;
        currentPage.value = 1;
        list();
    }

    const config = async() => {
        try {
            const resp = await $api("products/config",{
                method:'GET',
                onResponseError({response}){
                    console.log(response._data.error);
                }
            })
            console.log(resp);
            sucursales.value = resp.sucursales;
            warehouses.value = resp.warehouses;
            units.value = resp.units;
            categories.value = resp.categories;
        } catch (error) {
            console.log(error);
        }
    }

    const downloadExcel = () => {
        let QUERY_PARAMS = "";
        if(searchQuery.value){
            QUERY_PARAMS += "&search="+searchQuery.value;
        }
        if(product_categorie_id.value){
            QUERY_PARAMS += "&product_categorie_id="+product_categorie_id.value;
        }
        if(warehouse_stock_id.value){
            QUERY_PARAMS += "&warehouse_id="+warehouse_stock_id.value;
        }
        if(unit_stock_id.value){
            QUERY_PARAMS += "&unit_id="+unit_stock_id.value;
        }
        if(sucursale_price_id.value){
            QUERY_PARAMS += "&sucursale_id="+sucursale_price_id.value;
        }
        if(is_gift.value){
            QUERY_PARAMS += "&is_gift="+is_gift.value;
        }
        if(disponibilidad.value){
            QUERY_PARAMS += "&disponibilidad="+disponibilidad.value;
        }
        window.open(import.meta.env.VITE_API_BASE_URL+'products-excel?z=1'+QUERY_PARAMS,'_blank');
    }

    const importProducts = () => {
        list();
    }

    const addDeleteProduct = (Product) => {
        console.log(Product);
        let backup = list_products.value;
        list_products.value = [];
        let INDEX = backup.findIndex((product) => product.id == Product.id);
        if(INDEX != -1){
            backup.splice(INDEX,1);
        }
        setTimeout(() => {
            list_products.value = backup;
        }, 50);
    }

    const editItem = (product) => {
        console.log(product);
        router.push({
            name: 'product-edit-id',
            params: {
                id: product.id
            }
        });
    }
    const deleteItem = (item) => {
        isProductDeleteDialogVisible.value = true;
        product_selected_delete.value = item;
    }

    const avatarText = value => {
        if (!value)
            return ''
        const nameArray = value.split(' ')
        
        return nameArray.map(word => word.charAt(0).toUpperCase()).join('')
    }

    // Nuevos métodos auxiliares para mejorar la tabla
    const getStockColor = (state) => {
        switch(state) {
            case 1: return 'success';
            case 2: return 'warning';
            case 3: return 'error';
            default: return 'default';
        }
    }
    
    const getStockText = (state) => {
        switch(state) {
            case 1: return 'DISPONIBLE';
            case 2: return 'POR AGOTAR';
            case 3: return 'AGOTADO';
            default: return 'DESCONOCIDO';
        }
    }
    
    const formatCurrency = (value) => {
        // Implementa tu lógica de formato de moneda aquí
        return `$${parseFloat(value).toFixed(2)}`;
    }
    
    const formatDate = (dateString) => {
        // Implementa tu lógica de formato de fecha aquí
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }

    onMounted(() => {
        list();
        config();
    })

    
    definePage({ meta: { permission: 'list_product', } });
</script>

<style scoped>
.table-container {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background-color: white;
    margin: 0 16px 16px;
}

.products-table {
    width: 100%;
    border-collapse: collapse;
}

.table-header {
    background-color: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
}

.table-header th {
    padding: 16px 12px;
    font-weight: 600;
    color: #495057;
    text-align: left;
    font-size: 0.875rem;
    white-space: nowrap;
}

.table-body {
    background-color: white;
}

.table-row {
    border-bottom: 1px solid #e9ecef;
    transition: background-color 0.2s ease;
}

.table-row:hover {
    background-color: #f8f9fa;
}

.table-row td {
    padding: 16px 12px;
    vertical-align: middle;
}

/* Estilos específicos para cada columna */
.product-cell {
    min-width: 240px;
}

.product-info {
    display: flex;
    align-items: center;
    gap: 16px;
}

.product-image-container {
    flex-shrink: 0;
}

/* IMAGENES CUADRADAS */
.square-avatar {
    width: 64px;
    height: 64px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background-color: #ffffff;
    border: 1px solid #e9ecef;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.square-avatar.no-image {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
}

.product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-text {
    font-size: 1.25rem;
    font-weight: 600;
    color: white;
    text-align: center;
}

.product-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
}

.product-name {
    font-weight: 600;
    color: #212529;
    font-size: 0.95rem;
    line-height: 1.3;
}

.stock-chip {
    font-size: 0.75rem;
    height: 20px;
    align-self: flex-start;
}

.sku-cell .sku-value {
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
    color: #6c757d;
}

.category-cell .category-badge {
    display: inline-block;
    padding: 6px 10px;
    background-color: #e9ecef;
    border-radius: 6px;
    font-size: 0.75rem;
    color: #495057;
    font-weight: 500;
}

.status-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.875rem;
}

.status-indicator.yes {
    color: #28a745;
}

.status-indicator.no {
    color: #6c757d;
}

.status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
}

.status-indicator.yes .status-dot {
    background-color: #28a745;
}

.status-indicator.no .status-dot {
    background-color: #6c757d;
}

.discount-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.discount-amount {
    font-size: 0.75rem;
    color: #dc3545;
    font-weight: 500;
    background-color: #fff5f5;
    padding: 4px 8px;
    border-radius: 4px;
    border-left: 3px solid #dc3545;
}

.tax-amount {
    font-weight: 600;
    color: #212529;
    font-size: 0.9rem;
}

.warranty-info {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #495057;
    font-weight: 500;
}

.warranty-icon {
    color: #28a745;
}

.status-chip {
    font-size: 0.75rem;
    height: 20px;
}

.date-cell .date-value {
    font-size: 0.875rem;
    color: #6c757d;
}

.actions-cell {
    width: 100px;
}

.action-buttons {
    display: flex;
    gap: 8px;
    justify-content: center;
}

.action-btn {
    transition: all 0.2s ease;
}

.edit-btn:hover {
    color: #007bff;
    transform: scale(1.1);
}

.delete-btn:hover {
    color: #dc3545;
    transform: scale(1.1);
}

/* Efectos hover para las imágenes */
.square-avatar {
    transition: all 0.3s ease;
}

.square-avatar:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Responsive */
@media (max-width: 1200px) {
    .table-container {
        overflow-x: auto;
    }
    
    .products-table {
        min-width: 1100px;
    }
}

@media (max-width: 768px) {
    .product-info {
        gap: 12px;
    }
    
    .square-avatar {
        width: 56px;
        height: 56px;
    }
    
    .avatar-text {
        font-size: 1.1rem;
    }
}

/* Variantes de tamaño opcionales */
.square-avatar.large {
    width: 80px;
    height: 80px;
}

.square-avatar.small {
    width: 48px;
    height: 48px;
}

.square-avatar.small .avatar-text {
    font-size: 1rem;
}
</style>
