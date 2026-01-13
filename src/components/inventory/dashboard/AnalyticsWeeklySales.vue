<script setup>
import { useTheme } from 'vuetify'
import { hexToRgb } from '@layouts/utils'

const moreList = [
  {
    title: 'Refresh',
    value: 'refresh',
  },
  {
    title: 'Update',
    value: 'update',
  },
  {
    title: 'Share',
    value: 'share',
  },
]
const year_list = ref(['2024', '2025', '2026', '2027', '2028', '2029', '2030']);
const year_selected = ref(new Date().getFullYear() + "");
const vuetifyTheme = useTheme()

const sales_for_month_year = async () => {
  try {

    const resp = await $api("kpi/sales_x_month_of_year", {
      method: 'POST',
      body: {
        year: year_selected.value,
      },
      onResponseError({ response }) {
        console.log(response._data.error);
      }
    })
    console.log(resp);
    let categories_labels = [];
    let sales_of_month_year_current = [];
    let sales_of_month_year_before = [];
    resp.sale_x_month_of_year_current.forEach(element => {
      categories_labels.push(element.created_at_format);
      sales_of_month_year_current.push(Number(element.total_sales));
    });
    resp.sale_x_month_of_year_before.forEach(element => {
      sales_of_month_year_before.push(Number(element.total_sales));
    });
    const themeColors = vuetifyTheme.current.value.colors
    const variableTheme = vuetifyTheme.current.value.variables
    const disabledText = `rgba(${hexToRgb(String(themeColors['on-background']))},${variableTheme['disabled-opacity']})`

    chartConfig.value = {
      chart: {
        stacked: true,
        parentHeightOffset: 0,
        toolbar: { show: false },
      },
      tooltip: { enabled: false },
      markers: {
        size: 4,
        strokeWidth: 3,
        fillOpacity: 1,
        strokeOpacity: 1,
        colors: 'rgba(var(--v-theme-surface), 1)',
        strokeColors: themeColors.warning,
      },
      stroke: {
        curve: 'smooth',
        width: [
          0,
          0,
          3,
        ],
        colors: [themeColors.warning],
      },
      colors: [
        `rgba(${hexToRgb(String(themeColors.primary))}, 1)`,
        `rgba(${hexToRgb(String(themeColors.primary))}, 0.12)`,
      ],
      dataLabels: { enabled: false },
      states: {
        hover: { filter: { type: 'none' } },
        active: { filter: { type: 'none' } },
      },
      legend: { show: false },
      grid: {
        yaxis: { lines: { show: false } },
        padding: {
          top: -28,
          left: -6,
          right: -8,
          bottom: -5,
        },
      },
      plotOptions: {
        bar: {
          borderRadius: 8,
          columnWidth: '57%',
          endingShape: 'flat',
          borderRadiusApplication: 'start',
          borderRadiusWhenStacked: 'all',
        },
      },
      xaxis: {
        axisTicks: { show: false },
        axisBorder: { show: false },
        categories: categories_labels,
        labels: {
          style: {
            fontSize: '13px',
            colors: disabledText,
            letterSpacing: '0.4px',
          },
        },
      },
      yaxis: {
        // max: 100,
        // min: -100,
        show: false,
      },
    }
    series.value = [
      {
        type: 'column',
        name: 'Earning',
        data: sales_of_month_year_current,
      },
      {
        type: 'column',
        name: 'Expense',
        data: [
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
        ],
      },
      {
        type: 'line',
        name: 'Expense',
        data: sales_of_month_year_before,
      },
    ]
    salesReport.value = [
      {
        title: 'Salidas - ' + year_selected.value,
        amount: "" + resp.total_sales_year_current,
        avatarColor: '#ACF5C9',
        avatarIcon: 'ri-money-dollar-circle-line',
      },
      {
        title: 'Salidas - ' + (Number(year_selected.value) - 1),
        amount: " " + resp.total_sales_year_before,
        avatarColor: '#ACF5C9',
        avatarIcon: 'ri-money-dollar-circle-line',
      },
    ]
  } catch (error) {
    console.log(error);
  }
}

watch(year_selected, () => {
  sales_for_month_year();
})

const chartConfig = ref(null);

const series = ref([]);

const salesReport = ref([]);

onMounted(() => {
  sales_for_month_year();
})
</script>

<template>
  <VCard class="analytics-card" elevation="0">
    <!-- HEADER -->
    <VCardTitle class="analytics-header">
      <VRow align="center">
        <VCol cols="12" md="8">
          <div class="header-text">
            <h2>Salidas por Año</h2>
          </div>
        </VCol>

        <VCol cols="12" md="4" class="d-flex justify-end">
          <VSelect v-model="year_selected" :items="year_list" label="Año" density="comfortable" variant="outlined"
            hide-details class="year-selector" />
        </VCol>
      </VRow>
    </VCardTitle>

    <VCardText class="pt-2">
      <!-- SUMMARY -->
      <VRow class="sales-summary" dense>
        <VCol v-for="sale in salesReport" :key="sale.title" cols="12" md="6">
          <VCard class="summary-card" elevation="0">
            <div class="d-flex align-center">
              <VAvatar size="52" variant="tonal" :color="sale.avatarColor" class="me-4">
                <VIcon :icon="sale.avatarIcon" size="26" />
              </VAvatar>

              <div>
                <div class="summary-title">
                  {{ sale.title }}
                </div>
                <div class="summary-amount">
                  {{ sale.amount }}
                </div>
              </div>
            </div>
          </VCard>
        </VCol>
      </VRow>

      <!-- CHART -->
      <VRow>
        <VCol cols="12">
          <div class="chart-wrapper">
            <VueApexCharts id="sales-year-chart" type="line" height="320" :options="chartConfig" :series="series" />
          </div>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>


<style scoped lang="scss">
.analytics-card {
  border-radius: 14px;
  background-color: rgb(var(--v-theme-surface));
}

/* HEADER */
.analytics-header {
  padding: 1.5rem 1.5rem 1rem;
}

.header-text {
  h2 {
    font-size: 1.4rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
  }

  .subtitle {
    font-size: 0.85rem;
    color: rgb(var(--v-theme-on-surface), 0.6);
  }
}

/* SELECT */
.year-selector {
  max-width: 160px;

  :deep(.v-field) {
    border-radius: 10px;
  }
}

/* SUMMARY CARDS */
.sales-summary {
  margin-bottom: 1.5rem;
}

.summary-card {
  padding: 1.25rem;
  border-radius: 12px;
  background: linear-gradient(180deg,
      rgba(var(--v-theme-primary), 0.05),
      rgba(var(--v-theme-primary), 0.02));
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  }
}

.summary-title {
  font-size: 0.85rem;
  color: rgb(var(--v-theme-on-surface), 0.65);
}

.summary-amount {
  font-size: 1.25rem;
  font-weight: 700;
}

/* CHART */
.chart-wrapper {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 14px;
  background-color: rgb(var(--v-theme-surface));
}
</style>
