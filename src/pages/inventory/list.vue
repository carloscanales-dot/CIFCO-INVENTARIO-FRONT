<template>
    <div>
        <VCard title="Inventario de Productos">
            <VCardText>
                <VRow dense>
                    <!-- FILTROS -->
                    <VCol cols="12" lg="12">
                        <VRow dense>
                            <VCol cols="12" sm="6" md="4" lg="3">
                                <VTextField v-model="searchQuery" label="Producto" placeholder="Buscar producto"
                                    density="compact" @keyup.enter="list" />
                            </VCol>

                            <VCol cols="12" sm="6" md="4" lg="3">
                                <VSelect v-model="product_categorie_id" :items="categories" item-title="name" density="compact"
                                    item-value="id" label="Categoría" />
                            </VCol>

                            <VCol cols="12" sm="6" md="4" lg="3">
                                <VSelect v-model="warehouse_stock_id" :items="warehouses" item-title="name" density="compact"
                                    item-value="id" label="Almacén" />
                            </VCol>

                            <VCol cols="12" sm="6" md="4" lg="3">
                                <VSelect v-model="sucursale_price_id" :items="sucursales" item-title="name" density="compact"
                                    item-value="id" label="Sucursal" />
                            </VCol>
                        </VRow>
                        <VRow dense>
                            <VCol cols="12" md="4">
                                <VBtn block color="info" prepend-icon="ri-search-2-line" @click="list">
                                    Buscar
                                </VBtn>
                            </VCol>

                            <VCol cols="12" md="4">
                                <VBtn block color="secondary" prepend-icon="ri-restart-line" @click="reset">
                                    Limpiar
                                </VBtn>
                            </VCol>

                            <VCol cols="12" md="4">
                                <VBtn block color="success" prepend-icon="ri-file-excel-2-line" @click="downloadExcel" disabled>
                                    Exportar
                                </VBtn>
                            </VCol>
                        </VRow>
                    </VCol>
                </VRow>
            </VCardText>

            <!-- Tabla de Inventario -->
            <div class="table-container">
                <VTable class="inventory-table">
                    <thead class="table-header">
                        <tr>
                            <th class="text-uppercase">Producto</th>
                            <th class="text-uppercase">SKU</th>
                            <th class="text-uppercase">Categoría</th>
                            <th v-for="warehouse in warehouses" :key="warehouse.id" class="text-uppercase">
                                {{ warehouse.name }}
                            </th>
                            <th class="text-uppercase">Stock Total</th>
                        </tr>
                    </thead>

                    <tbody class="table-body">
                        <tr v-for="item in list_products" :key="item.id" class="table-row">
                            <!-- Columna Producto -->
                            <td class="product-cell">
                                <div class="product-info">
                                    <div class="product-image-container">
                                        <div class="square-avatar" :class="item.imagen ? '' : 'no-image'">
                                            <VImg v-if="item.imagen" :src="item.imagen" class="product-image" />
                                            <span v-else class="avatar-text">{{ avatarText(item.title) }}</span>
                                        </div>
                                    </div>
                                    <div class="product-details">
                                        <div class="product-name">{{ item.title }}</div>
                                    </div>
                                </div>
                            </td>

                            <!-- Columna SKU -->
                            <td class="sku-cell">{{ item.sku }}</td>

                            <!-- Columna Categoría -->
                            <td class="category-cell">{{ item.product_categorie?.name }}</td>

                            <!-- Columnas de Stock por Almacén -->
                            <td v-for="warehouse in warehouses" :key="warehouse.id" class="stock-cell">
                                <VChip size="small"
                                    :color="getStockColor(getWarehouseStock(item.id, warehouse.id))"
                                    class="stock-chip">
                                    {{ getWarehouseStock(item.id, warehouse.id) }}
                                </VChip>
                            </td>

                            <!-- Stock Total -->
                            <td class="total-stock-cell">
                                <VChip size="small" color="info" class="stock-chip">
                                    {{ getTotalStock(item.id) }}
                                </VChip>
                            </td>
                        </tr>

                        <!-- Mensaje si no hay productos -->
                        <tr v-if="list_products.length === 0">
                            <td :colspan="warehouses.length + 4" class="text-center py-6">
                                <div class="text-medium-emphasis">No se encontraron productos</div>
                            </td>
                        </tr>
                    </tbody>
                </VTable>
            </div>

            <!-- Paginación -->
            <div class="d-flex align-center justify-center gap-4 flex-wrap my-6" v-if="totalPage > 1">
                <VPagination v-model="currentPage" :length="totalPage" color="primary" />
            </div>
        </VCard>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const currentPage = ref(1)
const totalPage = ref(0)

const list_products = ref([])
const inventory_stock = ref([]) // Almacenaremos el stock aquí
const sucursales = ref([])
const warehouses = ref([])
const categories = ref([])

const searchQuery = ref(null)
const product_categorie_id = ref(null)
const warehouse_stock_id = ref(null)
const sucursale_price_id = ref(null)

// Obtener stock de un producto en un almacén específico
const getWarehouseStock = (productId, warehouseId) => {
    const stock = inventory_stock.value.find(s =>
        s.product_id === productId && s.warehouse_id === warehouseId
    )
    return stock ? Number(stock.quantity) : 0
}

// Calcular stock total de un producto
const getTotalStock = (productId) => {
    return inventory_stock.value
        .filter(s => s.product_id === productId)
        .reduce((total, s) => total + Number(s.quantity), 0)
}

// Determinar color del stock
const getStockColor = (quantity) => {
    if (quantity === 0) return 'error'
    if (quantity <= 10) return 'warning'
    return 'success'
}

// Avatar text - primeras letras
const avatarText = (text) => {
    if (!text) return '?'
    return text.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()
}

// Obtener lista de inventario
const list = async () => {
    try {
        let data = {
            search: searchQuery.value,
            product_categorie_id: product_categorie_id.value,
            warehouse_id: warehouse_stock_id.value,
            sucursale_id: sucursale_price_id.value,
        }

        const resp = await $api("inventory/list?page=" + currentPage.value, {
            method: 'POST',
            body: data,
            onResponseError({ response }) {
                console.error('Error:', response._data.error)
            }
        })

        list_products.value = resp.products.data
        inventory_stock.value = resp.inventory || []
        totalPage.value = resp.total_page || 1
    } catch (error) {
        console.error(error)
    }
}

// Watch para cambios en página
watch(currentPage, () => {
    list()
})

// Resetear filtros
const reset = () => {
    searchQuery.value = null
    product_categorie_id.value = null
    warehouse_stock_id.value = null
    sucursale_price_id.value = null
    currentPage.value = 1
    list()
}

// Obtener configuración (almacenes, sucursales, categorías)
const config = async () => {
    try {
        const resp = await $api("products/config", {
            method: 'GET',
            onResponseError({ response }) {
                console.error('Error:', response._data.error)
            }
        })

        sucursales.value = resp.sucursales
        warehouses.value = resp.warehouses
        categories.value = resp.categories
    } catch (error) {
        console.error(error)
    }
}

// Descargar Excel
const downloadExcel = () => {
    let queryParams = "?z=1"
    if (searchQuery.value) queryParams += "&search=" + searchQuery.value
    if (product_categorie_id.value) queryParams += "&product_categorie_id=" + product_categorie_id.value
    if (warehouse_stock_id.value) queryParams += "&warehouse_id=" + warehouse_stock_id.value
    if (sucursale_price_id.value) queryParams += "&sucursale_id=" + sucursale_price_id.value

    window.open(import.meta.env.VITE_API_BASE_URL + 'inventory-excel' + queryParams, '_blank')
}

// Inicializar
onMounted(() => {
    config()
    list()
})

definePage({ meta: { permission: 'list_product', } })
</script>

<style scoped>
.table-container {
    overflow-x: auto;
    width: 100%;
}

.inventory-table {
    width: 100%;
    border-collapse: collapse;
}

.table-header {
    background-color: #f5f5f5;
    font-weight: 600;
}

.table-header th {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 2px solid #e0e0e0;
    font-size: 0.75rem;
}

.table-body tr {
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.2s;
}

.table-body tr:hover {
    background-color: #fafafa;
}

.product-cell,
.sku-cell,
.category-cell,
.stock-cell,
.total-stock-cell {
    padding: 12px 16px;
}

.product-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.product-image-container {
    flex-shrink: 0;
}

.square-avatar {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f0f0f0;
    overflow: hidden;
}

.square-avatar.no-image {
    background-color: #e3f2fd;
    color: #1976d2;
    font-size: 0.875rem;
    font-weight: 500;
}

.product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.product-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.product-name {
    font-weight: 500;
    font-size: 0.875rem;
}

.stock-chip {
    min-width: 50px;
    display: flex;
    justify-content: center;
}

.sku-cell {
    font-family: monospace;
    font-size: 0.875rem;
}

.category-cell {
    font-size: 0.875rem;
}

.total-stock-cell {
    font-weight: 600;
}
</style>
