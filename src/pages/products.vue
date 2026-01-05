<script setup>
  import pages1 from '@images/pages/1.png'
  import pages2 from '@images/pages/2.png'
  import avatar1 from '@images/avatars/avatar-1.png'
  import avatar2 from '@images/avatars/avatar-2.png'
  import avatar3 from '@images/avatars/avatar-3.png'
  import avatar4 from '@images/avatars/avatar-4.png'

  const avatars = [
    avatar1,
    avatar2,
    avatar3,
    avatar4,
  ]

  const checkboxOne = ref(true)
  const checkboxTwo = ref(false)

  const capitalizedLabel = (label) => {
    const convertLabelText = label.toString()

    return convertLabelText.charAt(0).toUpperCase() + convertLabelText.slice(1)
  }
  const radioGroup = ref(1)

  const desserts = [
    {
      dessert: 'Frozen Yogurt',
      calories: 159,
      fat: 6,
      carbs: 24,
      protein: 4,
    },
    {
      dessert: 'Ice cream sandwich',
      calories: 237,
      fat: 6,
      carbs: 24,
      protein: 4,
    },
    {
      dessert: 'Eclair',
      calories: 262,
      fat: 6,
      carbs: 24,
      protein: 4,
    },
    {
      dessert: 'Cupcake',
      calories: 305,
      fat: 6,
      carbs: 24,
      protein: 4,
    },
    {
      dessert: 'Gingerbread',
      calories: 356,
      fat: 6,
      carbs: 24,
      protein: 4,
    },
  ]

</script>
<template>
  <div>
    <p>LISTA DE PRODUCTOS</p>
    <VCol cols="12">
      <VTextField
        v-model="amount"
        label="Amount"
        prefix="$"
        type="text"
        placeholder="10.05"
      />
    </VCol>
    <VTable>
      <thead>
        <tr>
          <th class="text-uppercase">
            Desserts(100g Servings)
          </th>
          <th class="text-uppercase">
            calories
          </th>
          <th class="text-uppercase">
            Fat(g)
          </th>
          <th class="text-uppercase">
            Carbs(g)
          </th>
          <th class="text-uppercase">
            protein(g)
          </th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="item in desserts"
          :key="item.dessert"
        >
          <td>
            {{ item.dessert }}
          </td>
          <td>
            {{ item.calories }}
          </td>
          <td>
            {{ item.fat }}
          </td>
          <td>
            {{ item.carbs }}
          </td>
          <td>
            {{ item.protein }}
          </td>
        </tr>
      </tbody>
    </VTable>

    <VFileInput label="File input" />

    <VRow>
      <VCol
        cols="12"
        sm="6"
        md="4"
      >
        <VCard>
          <VImg
            :src="pages1"
            cover
          />
  
          <VCardItem>
            <VCardTitle>Influencing The Influencer</VCardTitle>
          </VCardItem>
  
          <VCardText>
            Cancun is back, better than ever! Over a hundred Mexico resorts have reopened and the state tourism minister predicts Cancun will draw as many visitors in 2006 as it did two years ago.
          </VCardText>
        </VCard>
      </VCol>
      <!-- 👉 Robert Meyer -->
    <VCol
      cols="12"
      sm="6"
      md="4"
    >
      <VCard>
        <VImg :src="pages2" />

        <VCardText class="position-relative">
          <!-- User Avatar -->
          <VAvatar
            size="75"
            class="avatar-center"
            :image="avatar1"
          />

          <!-- Title, Subtitle & Action Button -->
          <div class="d-flex justify-space-between flex-wrap pt-8">
            <div class="me-2 mb-2">
              <VCardTitle class="pa-0">
                Robert Meyer
              </VCardTitle>
              <VCardSubtitle class="text-caption pa-0">
                London, UK
              </VCardSubtitle>
            </div>
            <VBtn>send request</VBtn>
          </div>

          <!--  Mutual Friends -->
          <div class="d-flex justify-space-between align-center mt-8">
            <span class="font-weight-medium">18 mutual friends</span>

            <div class="v-avatar-group">
              <VAvatar
                v-for="avatar in avatars"
                :key="avatar"
                :image="avatar"
                size="40"
              />
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>
    </VRow>

    <VAlert color="primary">
      I'm an alert with primary background color.
    </VAlert>

    <VAlert color="secondary">
      I'm an alert with secondary background color.
    </VAlert>
    
    <div class="demo-space-x">
      <VCheckbox
        v-model="checkboxOne"
        :label="capitalizedLabel(checkboxOne)"
      />

      <VCheckbox
        v-model="checkboxTwo"
        :label="capitalizedLabel(checkboxTwo)"
      />
    </div>

    <VRadioGroup v-model="radioGroup">
      <VRadio
        v-for="n in 2"
        :key="n"
        :label="`Radio ${n}`"
        :value="n"
      />
    </VRadioGroup>

  </div>
</template>