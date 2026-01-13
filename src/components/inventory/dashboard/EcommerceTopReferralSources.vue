<script setup>
import mobile2 from '@images/cards/apple-iPhone-13-pro.png'
import desktop1 from '@images/cards/apple-mac-mini.png'
import desktop3 from '@images/cards/dell-inspiron-3000.png'
import mobile4 from '@images/cards/google-pixel-6.png'
import desktop2 from '@images/cards/hp-envy-x360.png'
import console3 from '@images/cards/nintendo-switch.png'
import mobile3 from '@images/cards/oneplus-9-pro.png'
import mobile1 from '@images/cards/samsung-s22.png'
import console1 from '@images/cards/sony-play-station-5.png'
import console2 from '@images/cards/xbox-series-x.png'

const currentTab = ref('')

const categories = ref([]);
const products = ref([]);

/*const productData = {
  mobile: [
    {
      status: 'Out of Stock',
      revenue: '12.5k',
      conversion: 24,
      product: 'Samsung s22',
      image: mobile1,
    },
    {
      status: 'In Stock',
      revenue: '45k',
      conversion: -18,
      product: 'Apple iPhone 13 Pro',
      image: mobile2,
    },
    {
      status: 'Comming Soon',
      revenue: '98.2k',
      conversion: 55,
      product: 'Oneplus 9 Pro',
      image: mobile3,
    },
    {
      status: 'In Stock',
      revenue: '210k',
      conversion: 8,
      product: 'Google Pixel 6',
      image: mobile4,
    },
  ],
  desktop: [
    {
      status: 'In Stock',
      revenue: '94.6k',
      conversion: 16,
      product: 'Apple Mac Mini',
      image: desktop1,
    },
    {
      status: 'Comming Soon',
      revenue: '76.5k',
      conversion: 27,
      product: 'Newest HP Envy x360',
      image: desktop2,
    },
    {
      status: 'Out of Stock',
      revenue: '69.3k',
      conversion: -9,
      product: 'Dell Inspiron 3000',
      image: desktop3,
    },
  ],
  console: [
    {
      status: 'Comming Soon',
      revenue: '18.6k',
      conversion: 34,
      product: 'Sony Play Station 5',
      image: console1,
    },
    {
      status: 'Out of Stock',
      revenue: '29.7k',
      conversion: -21,
      product: 'XBOX Series X',
      image: console2,
    },
    {
      status: 'In Stock',
      revenue: '10.4k',
      conversion: 38,
      product: 'Nintendo Switch',
      image: console3,
    },
  ],
}*/

const resolveChipColor = status => {
  if (status === 1)
    return 'success'
  if (status === 2)
    return 'primary'
  if (status === 3)
    return 'warning'
}

const moreList = [
  {
    title: 'Last 28 Days',
    value: 'Last 28 Days',
  },
  {
    title: 'Last Month',
    value: 'Last Month',
  },
  {
    title: 'Last Year',
    value: 'Last Year',
  },
]

const month_list = ref([
        {
            id: '01',
            name: 'Enero',
        },
        {
            id: '02',
            name: 'Febrero',
        },
        {
            id: '03',
            name: 'Marzo'
        },
        {
            id: '04',
            name: 'Abril',
        },
        {
            id: '05',
            name: 'Mayo',
        },
        {
            id: '06',
            name: 'Junio'
        },
        {
            id: '07',
            name: 'Julio',
        },
        {
            id: '08',
            name: 'Agosto',
        },
        {
            id: '09',
            name: 'Septiembre'
        },
        {
            id: '10',
            name: 'Octubre',
        },
        {
            id: '11',
            name: 'Noviembre',
        },
        {
            id: '12',
            name: 'Diciembre'
        }
]);

const year_list = ref(['2023','2024','2025','2026','2027','2028']);

const month_selected = ref(((new Date().getMonth() + 1) <= 9 ? "0"+(new Date().getMonth() + 1) : (new Date().getMonth() + 1) + ''));
const year_selected = ref(new Date().getFullYear()+"");

const categories_most_sales = async() => {
  try {
    const resp = await $api("kpi/categories_most_sales",{
        method: 'POST',
        body:{
          year: year_selected.value,
          month: month_selected.value,
        },
        onResponseError({response}){
            console.log(response._data.error);
        }
    })
    console.log(resp);
    categories.value = resp.categories_products;
    currentTab.value = categories.value.length > 0 ? categories.value[0].name : '';
    products.value = categories.value.length > 0 ? categories.value[0].products : '';
  } catch (error) {
    console.log(error);
  }
}
const categorieSelected = (category) => {
  products.value = category.products;
  currentTab.value = category.name;
}

watch(month_selected,() => {
  categories_most_sales();
})
watch(year_selected,() => {
  categories_most_sales();
})
onMounted(() => {
  categories_most_sales()
})
</script>

<template>

</template>

<style lang="scss" scoped>
.selected-category {
  border: 2px solid rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.05);
}

.not-selected-category {
  border: 2px dashed rgba(var(--v-border-color), var(--v-border-opacity));
}

.hover-effect {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.custom-table {
  border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  
  .hover-row:hover {
    background: rgba(var(--v-theme-primary), 0.05);
  }

  th {
    font-size: 0.875rem;
    font-weight: 600;
    background: rgba(var(--v-theme-surface), 1) !important;
    padding: 0.75rem 1rem;
  }

  td {
    padding: 0.75rem 1rem;
  }
}
</style>
