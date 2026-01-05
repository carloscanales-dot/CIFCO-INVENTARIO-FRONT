<script setup>
    const statisticsWithImages = ref([])
    const statisticsVertical = ref([])
    definePage({
        meta: {
          permission: 'all'
        },
    })

    const information_general = async() => {
      try {
        
        const resp = await $api("kpi/information_general",{
            method: 'POST',
            body:{},
            onResponseError({response}){
                console.log(response._data.error);
            }
        })
        console.log(resp);
        /*statisticsVertical.value = [
            {
              title: 'Total Sales',
              color: 'primary',
              icon: 'ri-shopping-cart-line',
              stats: '$. '+resp.total_sales_month_current,
              change: resp.variation_percentage_total_sales,
            },
            {
              title: resp.sucursales_most_sales_month_current ?  resp.sucursales_most_sales_month_current.sucursale_most_sales : 'No hay una sucursal',
              color: 'success',
              icon: 'ri-handbag-line',
              stats: resp.sucursales_most_sales_month_current ? '$. '+resp.sucursales_most_sales_month_current.total_sales : 0,
              change: resp.variation_percentage_sucursal_most_sale,
            },
            {
              title: 'Total Purchase',
              color: 'secondary',
              icon: 'ri-truck-line',
              stats: '$. '+resp.purchase_total_month_current,
              change: resp.variation_percentage_purchase,
            },
          ]*/
      } catch (error) {
        console.log(error);
      }
    }

    const asesor_most_sales = async() => {
      try {

        const resp = await $api("kpi/asesor_most_sales",{
            method: 'POST',
            body:{},
            onResponseError({response}){
                console.log(response._data.error);
            }
        })
        console.log(resp);
        /*statisticsWithImages.value = [
          {
              title: 'Asesor Comercial',
              subtitle: resp.asesores_m_most_sales_month_current ? resp.asesores_m_most_sales_month_current.asesor_full_name : 'No hay',
              stats: resp.asesores_m_most_sales_month_current ? 'S/. '+Number(resp.asesores_m_most_sales_month_current.total_sales).toFixed(2) : 0,
              change: resp.variation_percentage_asesor_m_most_sales,
              image: 'https://cdn-icons-png.flaticon.com/512/3271/3271504.png',
              imgWidth: 99,
              color: 'primary',
          },
          {
              title: 'Asesora Comercial',
              subtitle: resp.asesores_f_most_sales_month_current ? resp.asesores_f_most_sales_month_current.asesor_full_name : 'No hay',
              stats: resp.asesores_f_most_sales_month_current ? 'S/. '+Number(resp.asesores_f_most_sales_month_current.total_sales).toFixed(2) : 0,
              change: resp.variation_percentage_asesor_f_most_sales,
              image: 'https://cdn-icons-png.flaticon.com/512/3271/3271502.png',
              imgWidth: 85,
              color: 'success',
          },
      ]*/
      } catch (error) {
        console.log(error);
      }
    }

    onMounted(() => {
      information_general();
      asesor_most_sales();
    })
</script>
<template>
    <div>
        <VRow class="match-height" v-if="isPermission('dashboard')">

            <VCol
              cols="12"
              md="12"
            >
            
              <EcommerceMarketingSales />
            </VCol>

            <!-- compras -->
            <VCol
                cols="12"
                md="12"
            >
                <AnalyticsWeeklySales />
            </VCol>

            <!-- 👉 Top Referral Sources -->
            <VCol
              cols="12"
              md="12"
            >
              <EcommerceTopReferralSources />
            </VCol>
        </VRow>
    </div>
</template>
