<script setup>
import trophy from '@images/cards/trophy.png'

const client_most_sale = ref(null);
const variation_percentage_client_most_sale = ref(0);
const client_most_sales = async() => {
  try {
      const resp = await $api("kpi/client_most_sales",{
          method: 'POST',
          body:{},
          onResponseError({response}){
              console.log(response._data.error);
          }
      })
      console.log(resp);
      client_most_sale.value = resp.client_most_sale;
      variation_percentage_client_most_sale.value = resp.variation_percentage_client_most_sale;
  } catch (error) {
    console.log(error);
  }
}
onMounted(() => {
  client_most_sales();
})
</script>

<template>
  <!--<VCard class="position-relative">
    <VCardText>
      <div class="mb-3">
        <h5 class="text-h5 text-wrap">
          Congratulations <strong>{{client_most_sale ? client_most_sale.client_most_sale : 'No hay cliente'}}!</strong> <span class="text-high-emphasis">🎉</span>
        </h5>
        <div class="text-subtitle-1">
          Best seller of the month
        </div>
      </div>
      <h4 class="text-h4 text-primary">
        S/. {{ client_most_sale ? client_most_sale.total_sales : 0 }}
      </h4>
      <div class="text-body-1 mb-3 text-success" v-if="variation_percentage_client_most_sale >= 0">
        + {{variation_percentage_client_most_sale}}%<span class="text-high-emphasis">🚀</span>
      </div>
      <div class="text-body-1 mb-3 text-danger" v-if="variation_percentage_client_most_sale < 0">
        - {{variation_percentage_client_most_sale}}%<span class="text-high-emphasis">🚀</span>
      </div>
    </VCardText>-->

    <!-- Trophy 
     //Mujer
    https://cdn-icons-png.flaticon.com/512/6633/6633170.png 
    //Empresa
    https://cdn-icons-png.flaticon.com/512/12287/12287163.png
    
    <VImg
      src="https://cdn-icons-png.flaticon.com/512/4814/4814961.png"
      class="trophy flip-in-rtl"
    />
  </VCard>-->
</template>

<style lang="scss">
.v-card .triangle-bg {
  position: absolute;
  inline-size: 10.375rem;
  inset-block-end: 0;
  inset-inline-end: 0;
}

.v-card .trophy {
  position: absolute;
  inline-size: 6.625rem;
  inset-block-end: 0;
  inset-inline-end: 1.25rem;
}
</style>
