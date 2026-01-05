export default [
  {
    title: 'Dashboard',
    to: { name: 'dashboard' },
    permission: "all",
    icon: { icon: 'ri-bar-chart-fill' },
  },
  { heading: 'Accesos',permissions: ['list_role','list_user','settings'] },
  {
    title: 'Roles y Permisos',
    to: { name: 'roles-permisos' },
    permission: 'list_role',
    icon: { icon: 'ri-git-repository-private-line' },
  },
  {
    title: 'Empleados',
    to: { name: 'users' },
    permission: 'list_user',
    icon: { icon: 'ri-group-3-line' },
  },
  {
    title: 'Configuraciones',
    icon: { icon: 'ri-list-settings-line' },
    children: [
      {
        title: 'Sucursales',
        to: 'configuration-sucursales',
        permission: 'settings',
        icon: { icon: 'ri-capsule-fill' },
      },
      {
        title: 'Almacenes',
        to: 'configuration-warehouses',
        permission: 'settings',
        icon: { icon: 'ri-capsule-fill' },
      },
      {
        title: 'Categorias',
        to: 'configuration-categories',
        permission: 'settings',
        icon: { icon: 'ri-capsule-fill' },
      },
      {
        title: 'Proveedores',
        to: 'configuration-providers',
        permission: 'settings',
        icon: { icon: 'ri-capsule-fill' },
      },
      {
        title: 'Unidades',
        to: 'configuration-units',
        permission: 'settings',
        icon: { icon: 'ri-capsule-fill' },
      },
    ],
  },
  { heading: 'productos',permissions: ['list_product','register_product','list_client','register_sale','list_sale','return'] },
  {
    title: 'Productos',
    icon: { icon: 'ri-product-hunt-line' },
    children: [
      {
        title: 'Registrar',
        to: 'product-add',
        permission: 'register_product',
        icon: { icon: 'ri-capsule-fill' },
      },
      {
        title: 'Listado',
        to: 'product-list',
        permission: 'list_product',
        icon: { icon: 'ri-capsule-fill' },
      },
    ],
  },
  { heading: 'Clientes',permissions: ['list_product','register_product','list_client','register_sale','list_sale','return'] },
  {
    title: 'Clientes',
    icon: { icon: 'ri-team-line' },
    permission: 'list_client',
    to: 'client-list',
  },
  { heading: 'Ventas',permissions: ['list_product','register_product','list_client','register_sale','list_sale','return'] },
    {
    title: 'Ventas',
    icon: { icon: 'ri-exchange-dollar-line' },
    children: [
      {
        title: 'Registrar',
        to: 'sales-add',
        permission: 'register_sale',
        icon: { icon: 'ri-capsule-fill' },
      },
      {
        title: 'Listado',
        to: 'sales-list',
        permission: 'list_sale',
        icon: { icon: 'ri-capsule-fill' },
      },
    ],
  },
  /*{
    title: 'Devolución',
    icon: { icon: 'ri-loop-right-line' },
    permission: 'return',
    to: 'refound-list',
  },*/
  { heading: 'Compras',permissions: ['register_purchase','list_purchase','register_transport','list_transport','conversions','kardex'] },
  {
    title: 'Compras',
    icon: { icon: 'ri-shopping-cart-line' },
    children: [
      {
        title: 'Registrar',
        to: 'purchase-add',
        permission: 'register_purchase',
        icon: { icon: 'ri-capsule-fill' },
      },
      {
        title: 'Listado',
        to: 'purchase-list',
        permission: 'list_purchase',
        icon: { icon: 'ri-capsule-fill' },
      },
    ],
  },
  /*{
    title: 'Transporte',
    icon: { icon: 'ri-translate' },
    children: [
      {
        title: 'Registrar',
        to: 'transport-add',
        permission: 'register_transport',
        icon: { icon: 'ri-capsule-fill' },
      },
      {
        title: 'Listado',
        to: 'transport-list',
        permission: 'list_transport',
        icon: { icon: 'ri-capsule-fill' },
      },
    ],
  },
  {
    title: 'Conversión',
    icon: { icon: 'ri-file-ppt-2-line' },
    permission: 'conversions',
    to: 'conversion-list',
  },
  {
    title: 'Kardex',
    to: { name: 'kardex' },
    permission: 'kardex',
    icon: { icon: 'ri-draft-line' },
  },*/
]
