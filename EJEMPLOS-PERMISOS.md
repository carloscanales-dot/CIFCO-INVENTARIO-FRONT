# Ejemplos de Uso del Sistema de Permisos

## 1. Usando v-if con isPermission (Método Actual)

```vue
<template>
  <div>
    <!-- Botón que solo se muestra si tiene permiso -->
    <VBtn v-if="isPermission('register_role')">
      Nuevo Rol
    </VBtn>

    <!-- Sección completa condicional -->
    <VCard v-if="isPermission('edit_role')">
      <VCardText>
        Contenido del formulario de edición
      </VCardText>
    </VCard>

    <!-- Botones de acción condicionales -->
    <div class="d-flex gap-1">
      <IconBtn
        v-if="isPermission('edit_role')"
        @click="editItem(item)"
      >
        <VIcon icon="ri-pencil-line" />
      </IconBtn>
      
      <IconBtn
        v-if="isPermission('delete_role')"
        @click="deleteItem(item)"
      >
        <VIcon icon="ri-delete-bin-line" />
      </IconBtn>
    </div>
  </div>
</template>
```

## 2. Usando Directivas Personalizadas (Nuevo - Más Limpio)

```vue
<template>
  <div>
    <!-- Usando v-permission -->
    <VBtn v-permission="'register_role'">
      Nuevo Rol
    </VBtn>

    <!-- Usando v-can (alias más legible) -->
    <VBtn v-can="'edit_product'">
      Editar Producto
    </VBtn>

    <!-- Múltiples permisos (OR) -->
    <VBtn v-any-permission="['edit_role', 'delete_role']">
      Gestionar Roles
    </VBtn>

    <!-- En botones de acción -->
    <IconBtn v-can="'edit_role'" @click="editItem(item)">
      <VIcon icon="ri-pencil-line" />
    </IconBtn>
  </div>
</template>
```

## 3. Usando el Composable (Para Lógica Compleja)

```vue
<script setup>
import { usePermissions } from '@/composables/usePermissions'

const { 
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isSuperAdmin,
  userPermissions,
  currentUser 
} = usePermissions()

// Verificar un permiso
const canEdit = hasPermission('edit_product')

// Verificar múltiples permisos (OR - al menos uno)
const canManageProducts = hasAnyPermission(['edit_product', 'delete_product'])

// Verificar que tenga todos los permisos (AND - todos)
const canFullAccess = hasAllPermissions(['edit_product', 'delete_product', 'create_product'])

// Función que ejecuta acción solo si tiene permiso
const handleDelete = () => {
  if (!hasPermission('delete_role')) {
    $toast.error('No tienes permiso para eliminar roles')
    return
  }
  
  // Ejecutar lógica de eliminación
  deleteRole()
}

// Mostrar diferentes opciones según permisos
const availableActions = computed(() => {
  const actions = []
  
  if (hasPermission('edit_role')) {
    actions.push({ label: 'Editar', action: editRole })
  }
  
  if (hasPermission('delete_role')) {
    actions.push({ label: 'Eliminar', action: deleteRole })
  }
  
  return actions
})
</script>

<template>
  <div>
    <!-- Usar estado reactivo -->
    <VAlert v-if="isSuperAdmin" type="info">
      Tienes acceso completo de administrador
    </VAlert>

    <!-- Mostrar permisos del usuario -->
    <div v-if="userPermissions.length">
      <h3>Tus permisos:</h3>
      <VChip
        v-for="permission in userPermissions"
        :key="permission"
        size="small"
        class="ma-1"
      >
        {{ permission }}
      </VChip>
    </div>

    <!-- Acciones dinámicas -->
    <VBtn
      v-for="action in availableActions"
      :key="action.label"
      @click="action.action"
    >
      {{ action.label }}
    </VBtn>
  </div>
</template>
```

## 4. Configuración de Rutas

### Ruta Pública (Sin autenticación)
```vue
<script setup>
definePage({ 
  meta: { 
    public: true 
  } 
})
</script>
```

### Ruta Solo para No Autenticados
```vue
<script setup>
definePage({ 
  meta: { 
    layout: 'blank',
    unauthenticatedOnly: true 
  } 
})
</script>
```

### Ruta con Permiso Específico
```vue
<script setup>
definePage({ 
  meta: { 
    permission: 'list_product' 
  } 
})
</script>
```

### Ruta Accesible para Todos los Autenticados
```vue
<script setup>
definePage({ 
  meta: { 
    permission: 'all' 
  } 
})
</script>
```

## 5. En Componentes Dialog/Modal

```vue
<script setup>
import { usePermissions } from '@/composables/usePermissions'

const props = defineProps({
  isDialogVisible: Boolean,
  item: Object
})

const emit = defineEmits(['update:isDialogVisible', 'refresh'])

const { hasPermission } = usePermissions()

const handleSave = async () => {
  // Verificar permiso antes de guardar
  if (!hasPermission('edit_role')) {
    $toast.error('No tienes permiso para editar roles')
    return
  }
  
  try {
    // Lógica de guardado
    await saveRole()
    emit('refresh')
    emit('update:isDialogVisible', false)
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <VDialog
    :model-value="isDialogVisible"
    @update:model-value="emit('update:isDialogVisible', $event)"
    max-width="600"
  >
    <VCard>
      <VCardTitle>Editar Rol</VCardTitle>
      
      <VCardText>
        <!-- Formulario -->
      </VCardText>
      
      <VCardActions>
        <VSpacer />
        <VBtn @click="emit('update:isDialogVisible', false)">
          Cancelar
        </VBtn>
        <!-- Solo mostrar botón guardar si tiene permiso -->
        <VBtn 
          v-can="'edit_role'"
          color="primary"
          @click="handleSave"
        >
          Guardar
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
```

## 6. En Tablas/DataTables

```vue
<script setup>
const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Nombre', key: 'name' },
  { title: 'Acciones', key: 'actions' },
]

const items = ref([])
</script>

<template>
  <VDataTable
    :headers="headers"
    :items="items"
  >
    <!-- Columna de acciones con permisos -->
    <template #item.actions="{ item }">
      <div class="d-flex gap-1">
        <!-- Botón editar -->
        <IconBtn
          v-can="'edit_product'"
          size="small"
          @click="editItem(item)"
        >
          <VIcon icon="ri-pencil-line" />
        </IconBtn>
        
        <!-- Botón eliminar -->
        <IconBtn
          v-can="'delete_product'"
          size="small"
          @click="deleteItem(item)"
        >
          <VIcon icon="ri-delete-bin-line" />
        </IconBtn>
        
        <!-- Botón ver (siempre visible para autenticados) -->
        <IconBtn
          size="small"
          @click="viewItem(item)"
        >
          <VIcon icon="ri-eye-line" />
        </IconBtn>
      </div>
    </template>
  </VDataTable>
</template>
```

## 7. Menú Contextual con Permisos

```vue
<script setup>
import { usePermissions } from '@/composables/usePermissions'

const { hasPermission, hasAnyPermission } = usePermissions()

const menuItems = computed(() => {
  const items = []
  
  if (hasPermission('edit_product')) {
    items.push({
      title: 'Editar',
      icon: 'ri-pencil-line',
      action: () => editProduct()
    })
  }
  
  if (hasPermission('duplicate_product')) {
    items.push({
      title: 'Duplicar',
      icon: 'ri-file-copy-line',
      action: () => duplicateProduct()
    })
  }
  
  if (hasPermission('delete_product')) {
    items.push({
      title: 'Eliminar',
      icon: 'ri-delete-bin-line',
      action: () => deleteProduct(),
      color: 'error'
    })
  }
  
  return items
})
</script>

<template>
  <VMenu>
    <template #activator="{ props }">
      <VBtn
        icon="ri-more-2-fill"
        v-bind="props"
      />
    </template>
    
    <VList>
      <VListItem
        v-for="item in menuItems"
        :key="item.title"
        @click="item.action"
      >
        <template #prepend>
          <VIcon :icon="item.icon" :color="item.color" />
        </template>
        <VListItemTitle :class="item.color && `text-${item.color}`">
          {{ item.title }}
        </VListItemTitle>
      </VListItem>
    </VList>
  </VMenu>
</template>
```

## 8. Guardias de Navegación Programática

```vue
<script setup>
import { useRouter } from 'vue-router'
import { usePermissions } from '@/composables/usePermissions'

const router = useRouter()
const { hasPermission } = usePermissions()

const goToEditPage = (id) => {
  // Verificar permiso antes de navegar
  if (!hasPermission('edit_product')) {
    $toast.error('No tienes permiso para editar productos')
    return
  }
  
  router.push({ name: 'product-edit-id', params: { id } })
}

const goToProtectedRoute = async () => {
  // Para rutas que pueden requerir validación adicional
  if (!hasPermission('admin_section')) {
    await router.push({ name: 'not-authorized' })
    return
  }
  
  await router.push({ name: 'admin-dashboard' })
}
</script>
```

## 9. Formularios con Validación de Permisos

```vue
<script setup>
import { usePermissions } from '@/composables/usePermissions'

const { hasPermission, isSuperAdmin } = usePermissions()

const formData = ref({
  name: '',
  price: 0,
  stock: 0,
  isActive: true
})

// Campos que solo super admin puede editar
const canEditPrice = computed(() => 
  isSuperAdmin.value || hasPermission('edit_product_price')
)

const canEditStock = computed(() => 
  hasPermission('edit_product_stock')
)

const isFormDisabled = computed(() => 
  !hasPermission('edit_product')
)
</script>

<template>
  <VForm :disabled="isFormDisabled">
    <VTextField
      v-model="formData.name"
      label="Nombre"
    />
    
    <!-- Campo de precio solo editable con permiso especial -->
    <VTextField
      v-model="formData.price"
      label="Precio"
      type="number"
      :readonly="!canEditPrice"
      :hint="!canEditPrice ? 'No tienes permiso para editar el precio' : ''"
    />
    
    <!-- Campo de stock solo editable con permiso -->
    <VTextField
      v-model="formData.stock"
      label="Stock"
      type="number"
      :readonly="!canEditStock"
      :hint="!canEditStock ? 'No tienes permiso para editar el stock' : ''"
    />
    
    <VSwitch
      v-model="formData.isActive"
      label="Activo"
    />
    
    <VBtn
      v-can="'edit_product'"
      type="submit"
      color="primary"
    >
      Guardar
    </VBtn>
  </VForm>
</template>
```

## Comparación de Métodos

| Método | Ventajas | Cuándo Usar |
|--------|----------|-------------|
| `v-if="isPermission()"` | Simple, directo | Para casos básicos, código existente |
| `v-can` / `v-permission` | Más limpio, menos verboso | Para nuevos componentes, mejor legibilidad |
| `usePermissions()` | Potente, flexible, reactivo | Para lógica compleja, múltiples permisos |
| Directivas custom | Declarativo, reutilizable | Para patrones repetitivos |
