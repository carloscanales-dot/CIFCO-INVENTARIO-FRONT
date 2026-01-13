<script setup>
import accountLogo2 from '@images/logos/logoIndex.jpeg'
import logocifco from '@images/logos/logoindexcifco.png'

const websiteAnalytics = [
  {
    name: 'Marketing Expense',
    slideImg: logocifco,
    data: [
      {
        number: '5k',
        text: 'Operating',
      },
      {
        number: '6k',
        text: 'COGF',
      },
      {
        number: '2k',
        text: 'Financial',
      },
      {
        number: '1k',
        text: 'Expenses',
      },
    ],
  },
  {
    name: 'Accounting',
    slideImg: logocifco,
    data: [
      {
        number: '18',
        text: 'Billing',
      },
      {
        number: '28',
        text: 'Sales',
      },
      {
        number: '30',
        text: 'Leads',
      },
      {
        number: '80',
        text: 'Impression',
      },
    ],
  },
  {
    name: 'Sales Overview',
    slideImg: logocifco,
    data: [
      {
        number: '68',
        text: 'Open',
      },
      {
        number: '52',
        text: 'Converted',
      },
      {
        number: '04',
        text: 'Lost',
      },
      {
        number: '12',
        text: 'Quotations',
      },
    ],
  },
]
const sucursales = ref([]);

const sucursales_reporte_sales = async() => {
  try {
      const resp = await $api("kpi/sucursales_reporte_sales",{
            method: 'POST',
            body:{},
            onResponseError({response}){
                console.log(response._data.error);
            }
        })
    console.log(resp);
    sucursales.value = resp.sucursales;
  } catch (error) {
    console.log(error);
  }
}
onMounted(() => {
  sucursales_reporte_sales()
})
</script>

<template>
  <VCard color="#31395c">
    <VCarousel
      :continuous="false"
      :show-arrows="false"
      hide-delimiter-background
      delimiter-icon="ri-circle-fill"
      height="auto"
      class="carousel-delimiter-top-end dots-active-white"
      v-if="sucursales.length > 0"
    >
      <VCarouselItem
        v-for="item in sucursales"
        :key="item.name"
      >
        <!-- Header Section -->
        <VCardItem class="pb-2">
          <template v-slot:prepend>
            <img
              :src="logocifco"
              class="rounded me-4"
              width="80"
              height="70"
              style="background-color: white; border-radius: 8px; padding: 4px;"
            >
          </template>
          <VCardTitle class="text-h5 text-white mb-1">
            Sucursal {{ item.name }}
          </VCardTitle>
          <VCardSubtitle class="text-white d-flex align-center gap-2">
            Total $. {{ item.sales_total_sucursal }}
            <span 
              :class="item.variation_perncetage_sale_total >= 0 ? 'text-success' : 'text-danger'"
              class="d-flex align-center"
            >
              {{ item.variation_perncetage_sale_total >= 0 ? '+' : '-' }}
              {{ Math.abs(item.variation_perncetage_sale_total) }}%
              <VIcon
                :icon="item.variation_perncetage_sale_total >= 0 ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"
                size="20"
              />
            </span>
          </VCardSubtitle>
        </VCardItem>

        <!-- Stats Grid -->
        <VCardText>
          <VRow>
            <VCol
              v-for="(stat, index) in [
                { value: item.n_sales, label: 'N° de Salidas' },
              ]"
              :key="index"
              cols="12"
              sm="3"
              class="pb-2"
            >
              <div class="d-flex align-center gap-3">
                <div
                  class="rounded px-3 py-2 text-white font-weight-medium"
                  style="background-color: rgba(var(--v-theme-on-surface), 0.12);"
                >
                  {{ stat.value }}
                </div>
                <div class="text-white">
                  {{ stat.label }}
                </div>
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCarouselItem>
    </VCarousel>
  </VCard>
</template>
