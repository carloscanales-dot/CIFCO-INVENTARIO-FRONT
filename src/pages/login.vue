<script setup>
import { ref, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { $api } from '@/utils/api' // tu helper de API
import logonIndex from '@/assets/images/logos/logoIndex.jpeg'
import logoindexcifco from '@/assets/images/logos/logoindexcifco.png'

import { themeConfig } from '@themeConfig'

const form = ref({
  email: '',
  password: '',
  remember: false,
})

const error_exits = ref(null)
const success_exits = ref(null)
const isPasswordVisible = ref(false)
const route = useRoute()
const router = useRouter()

const login = async () => {
  try {
    error_exits.value = null
    success_exits.value = null

    const resp = await $api('auth/login', {
      method: 'POST',
      body: {
        email: form.value.email,
        password: form.value.password,
      },
      onResponseError({ response }) {
        console.log(response)
        error_exits.value = response._data?.error
      },
    })

    localStorage.setItem('token', resp.access_token)
    localStorage.setItem('user', JSON.stringify(resp.user))
    success_exits.value = 1

    await nextTick(() => {
      router.replace(route.query.to ? String(route.query.to) : '/')
    })
  } catch (error) {
    console.log(error)
  }
}

definePage({ meta: { layout: 'blank', unauthenticatedOnly: true } })
</script>

<template>
  <div class="login-wrapper">
    <v-container fluid class="fill-height">
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="5" lg="4">
          <v-card class="login-card" elevation="0">
            <!-- Header -->
            <div class="login-header">
              <img :src="logoindexcifco" alt="CIFCO Inventario" class="login-logo" />
              <h2>CIFCO INVETARIO</h2>
              <p>Accede a tu cuenta institucional</p>
            </div>

            <!-- Form -->
            <VForm @submit.prevent="login">
              <v-row>
                <v-col cols="12">
                  <VTextField v-model="form.email" label="Correo institucional" type="email"
                    placeholder="usuario@cifco.gob.sv" variant="underlined" density="comfortable" hide-details
                    color="primary" prepend-inner-icon="ri-mail-line" class="gov-input" />
                </v-col>

                <v-col cols="12">
                  <VTextField v-model="form.password" label="Contraseña" placeholder="••••••••"
                    :type="isPasswordVisible ? 'text' : 'password'"
                    :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                    @click:append-inner="isPasswordVisible = !isPasswordVisible" variant="underlined"
                    density="comfortable" hide-details color="primary" prepend-inner-icon="ri-lock-line"
                    class="gov-input" />
                </v-col>

                <v-col cols="12">
                  <VAlert v-if="error_exits" type="error" variant="tonal">
                    No se puede iniciar sesión, verifique sus credenciales.
                  </VAlert>

                  <VAlert v-if="success_exits" type="success" variant="tonal">
                    Acceso correcto, redirigiendo…
                  </VAlert>
                </v-col>

                <v-col cols="12">
                  <VBtn type="submit" block size="large" class="login-btn">
                    Iniciar sesión
                  </VBtn>
                </v-col>
              </v-row>
            </VForm>

            <!-- Footer -->
            <div class="login-footer">
              © {{ new Date().getFullYear() }} CIFCO
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>


<style scoped lang="scss">
.login-wrapper {
  min-height: 100vh;
  background: linear-gradient(180deg, #31395c 0%, #1f2440 100%);
}

.login-card {
  padding: 2.5rem 2.25rem;
  border-radius: 14px;
  background-color: #ffffff;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.12);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;

  h2 {
    margin-top: 1rem;
    font-size: 1.4rem;
    font-weight: 700;
    color: #003a8f;
  }

  p {
    margin-top: 0.25rem;
    font-size: 0.9rem;
    color: #6b7280;
  }
}

.login-logo {
  width: 120px;
  margin: 0 auto;
}

.login-btn {
  background-color: #003a8f;
  color: #ffffff;
  font-weight: 600;
  letter-spacing: 0.3px;

  &:hover {
    background-color: #002b6b;
  }
}

.login-footer {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.75rem;
  color: #9ca3af;
}

/* Inputs institucionales */
:deep(.gov-input .v-field__control) {
  background-color: #ffffff;
}
</style>
