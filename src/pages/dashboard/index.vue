<script setup>
    import VueApexCharts from 'vue3-apexcharts'
    
    const inventoryStats = ref([])
    const warehouses = ref([])
    const list_products = ref([])
    const inventory_stock = ref([])
    const list_refounds = ref([])
    const lowStockProducts = ref([])
    const expiringProducts = ref([])
    const expiredProducts = ref([])
    const recentMovements = ref([])
    
    // Opciones de gráfica de stock por almacén
    const warehouseChartOptions = ref({
        chart: {
            type: 'bar',
            height: 350,
            toolbar: {
                show: true
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
                endingShape: 'rounded'
            },
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['transparent']
        },
        xaxis: {
            categories: [],
        },
        yaxis: {
            title: {
                text: 'Cantidad de Productos'
            }
        },
        fill: {
            opacity: 1
        },
        tooltip: {
            y: {
                formatter: function (val) {
                    return val + " unidades"
                }
            }
        },
        colors: ['#7367F0', '#28C76F', '#FF9F43']
    })
    
    const warehouseChartSeries = ref([])

    // Opciones de gráfica de movimientos mensuales (entradas vs salidas)
    const movementsChartOptions = ref({
        chart: {
            type: 'area',
            height: 350,
            toolbar: {
                show: true
            },
            zoom: {
                enabled: false
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        xaxis: {
            categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        },
        yaxis: {
            title: {
                text: 'Cantidad'
            }
        },
        colors: ['#28C76F', '#EA5455'],
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.3,
            }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'left'
        }
    })

    const movementsChartSeries = ref([
        {
            name: 'Entradas',
            data: []
        },
        {
            name: 'Salidas',
            data: []
        }
    ])

    definePage({
        meta: {
          permission: 'all'
        },
    })

    // Obtener stock total de un producto
    const getTotalStock = (productId) => {
        return inventory_stock.value
            .filter(s => s.product_id === productId)
            .reduce((total, s) => total + Number(s.quantity), 0)
    }

    // Formatear fecha con zona horaria de El Salvador
    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('es-SV', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: 'America/El_Salvador'
        });
    }

    // Calcular estadísticas del inventario
    const calculateInventoryStats = () => {
        const totalProducts = list_products.value.length
        const activeProducts = list_products.value.filter(p => p.state == 1).length
        
        // Productos con stock bajo (menos de 10 unidades)
        const lowStock = list_products.value.filter(p => getTotalStock(p.id) <= 10)
        lowStockProducts.value = lowStock.slice(0, 5) // Top 5
        
        // Productos por vencer (próximos 30 días)
        const today = new Date()
        const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))
        const expiring = list_products.value.filter(p => {
            if (!p.expiration_date) return false
            const expDate = new Date(p.expiration_date)
            return expDate > today && expDate <= thirtyDaysFromNow
        })
        expiringProducts.value = expiring.slice(0, 5)
        
        // Productos vencidos
        const expired = list_products.value.filter(p => {
            if (!p.expiration_date) return false
            const expDate = new Date(p.expiration_date)
            return expDate <= today
        })
        expiredProducts.value = expired.slice(0, 5)
        
        // Calcular valor total del inventario
        const totalValue = list_products.value.reduce((sum, product) => {
            const stock = getTotalStock(product.id)
            const price = Number(product.price_purchase || 0)
            return sum + (stock * price)
        }, 0)

        inventoryStats.value = [
            {
              title: 'Total Productos',
              color: 'primary',
              icon: 'ri-archive-line',
              stats: totalProducts,
              subtitle: 'En inventario',
            },
            {
              title: 'Productos Activos',
              color: 'success',
              icon: 'ri-checkbox-circle-line',
              stats: activeProducts,
              subtitle: 'Disponibles',
            },
            {
              title: 'Stock Bajo',
              color: 'warning',
              icon: 'ri-alert-line',
              stats: lowStock.length,
              subtitle: 'Requieren atención',
            },
            {
              title: 'Valor Inventario',
              color: 'info',
              icon: 'ri-money-dollar-circle-line',
              stats: `$${totalValue.toFixed(2)}`,
              subtitle: 'Valor total',
            },
        ]
    }

    // Obtener datos de inventario
    const getInventoryData = async() => {
      try {
        const resp = await $api("inventory/list?page=1", {
            method: 'POST',
            body: {},
            onResponseError({response}){
                console.log('❌ Error en inventory/list:', response._data.error);
            }
        })
        
        console.log('📦 Respuesta de inventory/list:', resp)
        console.log('📦 Productos recibidos:', resp.products?.data?.length || 0)
        console.log('📦 Stock recibido:', resp.inventory?.length || 0)
        
        list_products.value = resp.products.data || []
        inventory_stock.value = resp.inventory || []
        
        calculateInventoryStats()
        calculateWarehouseChart()
      } catch (error) {
        console.log('❌ Error en getInventoryData:', error);
      }
    }

    // Obtener configuración de almacenes
    const getConfig = async() => {
      try {
        const resp = await $api("products/config", {
            method: 'GET',
            onResponseError({response}){
                console.log('❌ Error en products/config:', response._data.error);
            }
        })
        
        console.log('🏪 Respuesta de products/config:', resp)
        console.log('🏪 Almacenes recibidos:', resp.warehouses?.length || 0, resp.warehouses)
        
        warehouses.value = resp.warehouses || []
      } catch (error) {
        console.log('❌ Error en getConfig:', error);
      }
    }

    // Calcular datos para gráfica de almacenes
    const calculateWarehouseChart = () => {
        console.log('📊 Ejecutando calculateWarehouseChart...')
        console.log('📊 Almacenes disponibles:', warehouses.value.length, warehouses.value)
        console.log('📊 Productos disponibles:', list_products.value.length)
        console.log('📊 Stock disponible:', inventory_stock.value.length, inventory_stock.value)
        
        if (warehouses.value.length === 0 || list_products.value.length === 0) {
            console.log('⚠️ No hay datos suficientes para el gráfico')
            return
        }
        
        warehouseChartOptions.value.xaxis.categories = warehouses.value.map(w => w.name)
        
        // Calcular stock total por almacén
        const stockByWarehouse = warehouses.value.map(warehouse => {
            const stock = inventory_stock.value
                .filter(s => s.warehouse_id === warehouse.id)
                .reduce((total, s) => total + Number(s.quantity), 0)
            console.log(`📊 Stock en ${warehouse.name} (ID: ${warehouse.id}):`, stock)
            return stock
        })
        
        console.log('📊 Stock final por almacén:', stockByWarehouse)
        
        warehouseChartSeries.value = [{
            name: 'Stock Total',
            data: stockByWarehouse
        }]
        
        console.log('📊 Series del gráfico:', warehouseChartSeries.value)
    }

    // Obtener datos de salidas (refounds)
    const getRefoundsData = async() => {
      try {
        const resp = await $api("refound_products/index?page=1", {
            method: 'POST',
            body: {},
            onResponseError({response}){
                console.log(response._data.error);
            }
        })
        
        list_refounds.value = resp.refound_products.data || []
        recentMovements.value = list_refounds.value.slice(0, 5)
        
        calculateMovementsChart()
      } catch (error) {
        console.log(error);
      }
    }

    // Calcular gráfica de movimientos mensuales
    const calculateMovementsChart = () => {
        // Simular datos de entradas y salidas por mes
        // En producción, estos datos vendrían del backend
        const currentMonth = new Date().getMonth()
        
        // Generar datos simulados basados en las salidas reales
        const monthlyExits = Array(12).fill(0)
        const monthlyEntries = Array(12).fill(0)
        
        // Contar salidas por mes
        list_refounds.value.forEach(refound => {
            if (refound.created_at) {
                const month = new Date(refound.created_at).getMonth()
                monthlyExits[month] += Number(refound.quantity || 0)
            }
        })
        
        // Simular entradas (en producción vendría del backend)
        for (let i = 0; i <= currentMonth; i++) {
            monthlyEntries[i] = Math.floor(Math.random() * 100) + 50
        }
        
        movementsChartSeries.value = [
            {
                name: 'Entradas',
                data: monthlyEntries
            },
            {
                name: 'Salidas',
                data: monthlyExits
            }
        ]
    }

    const avatarText = (text) => {
        if (!text) return '?'
        return text.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()
    }

    const getStockColor = (quantity) => {
        if (quantity === 0) return 'error'
        if (quantity <= 10) return 'warning'
        return 'success'
    }

    onMounted(async () => {
      await getConfig()
      await getInventoryData()
      await getRefoundsData()
    })
</script>
<template>
    <div>
        <VRow class="match-height" v-if="isPermission('dashboard')">
            
            <!-- Título del Dashboard -->
            <VCol cols="12">
                <h2 class="text-h4 mb-2">Dashboard de Inventario</h2>
                <p class="text-body-1 text-medium-emphasis">Monitoreo de entradas y salidas de productos</p>
            </VCol>

            <!-- Estadísticas principales de inventario -->
            <VCol
              cols="12"
              sm="6"
              md="3"
              v-for="stat in inventoryStats"
              :key="stat.title"
            >
                <VCard>
                    <VCardText class="d-flex align-center justify-space-between">
                        <div>
                            <h6 class="text-h6 mb-1">{{ stat.title }}</h6>
                            <p class="text-caption text-medium-emphasis mb-0">{{ stat.subtitle }}</p>
                            <h4 class="text-h4 mt-2">{{ stat.stats }}</h4>
                        </div>
                        <VAvatar
                            :color="stat.color"
                            variant="tonal"
                            size="42"
                        >
                            <VIcon
                                :icon="stat.icon"
                                size="26"
                            />
                        </VAvatar>
                    </VCardText>
                </VCard>
            </VCol>

            <!-- Productos con stock bajo -->
            <VCol cols="12" md="4">
                <VCard title="Alertas de Stock Bajo">
                    <VCardText>
                        <p class="text-body-2 text-medium-emphasis mb-4">
                            Productos que requieren reabastecimiento
                        </p>
                        
                        <VList v-if="lowStockProducts.length > 0" lines="two">
                            <VListItem
                                v-for="product in lowStockProducts"
                                :key="product.id"
                                class="mb-2 pa-2"
                            >
                                <template #prepend>
                                    <VAvatar
                                        size="40"
                                        :color="product.imagen ? '' : 'warning'"
                                        :variant="!product.imagen ? 'tonal' : undefined"
                                    >
                                        <VImg v-if="product.imagen" :src="product.imagen" />
                                        <span v-else class="text-sm">{{ avatarText(product.title) }}</span>
                                    </VAvatar>
                                </template>
                                
                                <VListItemTitle class="font-weight-medium">
                                    {{ product.title }}
                                </VListItemTitle>
                                <VListItemSubtitle>
                                    SKU: {{ product.sku }}
                                </VListItemSubtitle>

                                <template #append>
                                    <VChip
                                        :color="getStockColor(getTotalStock(product.id))"
                                        size="small"
                                    >
                                        {{ getTotalStock(product.id) }}
                                    </VChip>
                                </template>
                            </VListItem>
                        </VList>
                        
                        <div v-else class="text-center py-8">
                            <VIcon 
                                icon="ri-checkbox-circle-line" 
                                size="48"
                                color="success"
                                class="mb-3"
                            />
                            <p class="text-body-2">Todos los productos tienen stock suficiente</p>
                        </div>
                    </VCardText>
                </VCard>
            </VCol>

            <!-- Productos por vencer -->
            <VCol cols="12" md="4">
                <VCard title="Alertas de Stock por Vencer">
                    <VCardText>
                        <p class="text-body-2 text-medium-emphasis mb-4">
                            Productos próximos a vencer (30 días)
                        </p>
                        
                        <VList v-if="expiringProducts.length > 0" lines="two">
                            <VListItem
                                v-for="product in expiringProducts"
                                :key="product.id"
                                class="mb-2 pa-2"
                            >
                                <template #prepend>
                                    <VAvatar
                                        size="40"
                                        :color="product.imagen ? '' : 'warning'"
                                        :variant="!product.imagen ? 'tonal' : undefined"
                                    >
                                        <VImg v-if="product.imagen" :src="product.imagen" />
                                        <span v-else class="text-sm">{{ avatarText(product.title) }}</span>
                                    </VAvatar>
                                </template>
                                
                                <VListItemTitle class="font-weight-medium">
                                    {{ product.title }}
                                </VListItemTitle>
                                <VListItemSubtitle>
                                    Vence: {{ formatDate(product.expiration_date) }}
                                </VListItemSubtitle>

                                <template #append>
                                    <VChip
                                        color="warning"
                                        size="small"
                                    >
                                        {{ getTotalStock(product.id) }}
                                    </VChip>
                                </template>
                            </VListItem>
                        </VList>
                        
                        <div v-else class="text-center py-8">
                            <VIcon 
                                icon="ri-calendar-check-line" 
                                size="48"
                                color="success"
                                class="mb-3"
                            />
                            <p class="text-body-2">No hay productos próximos a vencer</p>
                        </div>
                    </VCardText>
                </VCard>
            </VCol>

            <!-- Productos vencidos -->
            <VCol cols="12" md="4">
                <VCard title="Stock Vencido">
                    <VCardText>
                        <p class="text-body-2 text-medium-emphasis mb-4">
                            Productos con fecha de vencimiento expirada
                        </p>
                        
                        <VList v-if="expiredProducts.length > 0" lines="two">
                            <VListItem
                                v-for="product in expiredProducts"
                                :key="product.id"
                                class="mb-2 pa-2"
                            >
                                <template #prepend>
                                    <VAvatar
                                        size="40"
                                        :color="product.imagen ? '' : 'error'"
                                        :variant="!product.imagen ? 'tonal' : undefined"
                                    >
                                        <VImg v-if="product.imagen" :src="product.imagen" />
                                        <span v-else class="text-sm">{{ avatarText(product.title) }}</span>
                                    </VAvatar>
                                </template>
                                
                                <VListItemTitle class="font-weight-medium">
                                    {{ product.title }}
                                </VListItemTitle>
                                <VListItemSubtitle>
                                    Venció: {{ formatDate(product.expiration_date) }}
                                </VListItemSubtitle>

                                <template #append>
                                    <VChip
                                        color="error"
                                        size="small"
                                    >
                                        {{ getTotalStock(product.id) }}
                                    </VChip>
                                </template>
                            </VListItem>
                        </VList>
                        
                        <div v-else class="text-center py-8">
                            <VIcon 
                                icon="ri-checkbox-circle-line" 
                                size="48"
                                color="success"
                                class="mb-3"
                            />
                            <p class="text-body-2">No hay productos vencidos</p>
                        </div>
                    </VCardText>
                </VCard>
            </VCol>

            <!-- Actividad reciente (Últimas salidas) -->
            <VCol cols="12">
                <VCard title="Movimientos Recientes">
                    <VCardText>
                        <p class="text-body-2 text-medium-emphasis mb-4">
                            Últimas salidas de productos registradas
                        </p>
                        
                        <VTable v-if="recentMovements.length > 0">
                            <thead>
                                <tr>
                                    <th class="text-uppercase">Producto</th>
                                    <th class="text-uppercase">Tipo</th>
                                    <th class="text-uppercase">Cantidad</th>
                                    <th class="text-uppercase">Almacén</th>
                                    <th class="text-uppercase">Estado</th>
                                    <th class="text-uppercase">Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="movement in recentMovements" :key="movement.id">
                                    <td>
                                        <div class="d-flex align-center">
                                            <VAvatar
                                                size="32"
                                                :color="movement.product?.imagen ? '' : 'primary'"
                                                :variant="!movement.product?.imagen ? 'tonal' : undefined"
                                                class="me-3"
                                            >
                                                <VImg v-if="movement.product?.imagen" :src="movement.product.imagen" />
                                                <span v-else class="text-xs">{{ avatarText(movement.product?.title) }}</span>
                                            </VAvatar>
                                            <span class="font-weight-medium">{{ movement.product?.title }}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <VChip
                                            :color="movement.type == 1 ? 'info' : 'warning'"
                                            size="small"
                                        >
                                            {{ movement.type == 1 ? 'Salida' : 'Devolución' }}
                                        </VChip>
                                    </td>
                                    <td>
                                        <span class="font-weight-medium">{{ movement.quantity }}</span>
                                    </td>
                                    <td>{{ movement.warehouse?.name }}</td>
                                    <td>
                                        <VChip
                                            :color="movement.state == 1 ? 'success' : 'error'"
                                            size="small"
                                        >
                                            {{ movement.state == 1 ? 'Activo' : 'Inactivo' }}
                                        </VChip>
                                    </td>
                                    <td>{{ formatDate(movement.created_at) }}</td>
                                </tr>
                            </tbody>
                        </VTable>
                        
                        <div v-else class="text-center py-8">
                            <VIcon 
                                icon="ri-history-line" 
                                size="48"
                                color="info"
                                class="mb-3"
                            />
                            <p class="text-body-2">No hay movimientos recientes</p>
                        </div>
                    </VCardText>
                </VCard>
            </VCol>

            <!-- Gráfico de movimientos mensuales -->
            <VCol cols="12" md="12">
                <VCard title="Movimientos Mensuales de Inventario">
                    <VCardText>
                        <p class="text-body-2 text-medium-emphasis mb-4">
                            Comparación de entradas y salidas de productos por mes
                        </p>
                        <VueApexCharts
                            v-if="movementsChartSeries[0].data.length > 0"
                            type="area"
                            height="350"
                            :options="movementsChartOptions"
                            :series="movementsChartSeries"
                        />
                        <div v-else class="text-center py-10">
                            <VProgressCircular indeterminate color="primary" />
                            <p class="text-body-2 mt-3">Cargando movimientos...</p>
                        </div>
                    </VCardText>
                </VCard>
            </VCol>

            <!-- Gráfico de stock por almacén -->
            <VCol cols="12">
                <VCard title="Stock por Almacén">
                    <VCardText>
                        <p class="text-body-2 text-medium-emphasis mb-4">
                            Distribución de productos en cada almacén
                        </p>
                        <VueApexCharts
                            v-if="warehouseChartSeries.length > 0"
                            type="bar"
                            height="350"
                            :options="warehouseChartOptions"
                            :series="warehouseChartSeries"
                        />
                        <div v-else class="text-center py-10">
                            <VProgressCircular indeterminate color="primary" />
                            <p class="text-body-2 mt-3">Cargando datos...</p>
                        </div>
                    </VCardText>
                </VCard>
            </VCol>

        </VRow>
    </div>
</template>
