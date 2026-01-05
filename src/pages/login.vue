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
    <div class="login-card">
      <div class="text-center mb-6">
        <img :src="logoindexcifco" alt="CIFCO INVENTARIO" class="login-logo" />
        <br>
        <p>CIFCO INVENTARIO</p>
        </br>
        </div>

      <h3 class="text-center mb-1">Iniciar Sesión</h3>
      <p class="text-center mb-6 text-muted">
        Accede a tu cuenta de CIFCO
      </p>

      <VForm @submit.prevent="login">
        <VTextField
          v-model="form.email"
          label="Correo Electrónico"
          type="email"
          placeholder="usuario@cifco.gob.sv"
          class="mb-4"
          hide-details
          color="#31395c"
        />

        <VTextField
          v-model="form.password"
          label="Contraseña"
          placeholder="••••••••"
          :type="isPasswordVisible ? 'text' : 'password'"
          :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
          @click:append-inner="isPasswordVisible = !isPasswordVisible"
          hide-details
          color="#31395c"
        />

        <VAlert
          v-if="error_exits"
          type="error"
          dense
          class="mt-4"
        >
          No se puede iniciar sesión, intente cambiar las credenciales.
        </VAlert>

        <VAlert
          v-if="success_exits"
          type="success"
          dense
          class="mt-4"
        >
          Las credenciales son correctas, puede ingresar.
        </VAlert>

        <VBtn
          type="submit"
          block
          color="#31395c"
          class="mt-6"
        >
          Iniciar Sesión
        </VBtn>
      </VForm>

      <!--<p class="text-center mt-6 text-muted">
        ¿No tienes una cuenta?
        <RouterLink to="/register" class="text-success fw-bold">
          Regístrate aquí
        </RouterLink>
      </p>-->
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(180deg, #31395c 0%, #1f2440 100%);
}

.login-card {
  background-color: #fff;
  padding: 3rem 2.5rem;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

.login-logo {
  width: 140px;
  margin: 0 auto;
  display: block;
}

.text-muted {
  color: #6c757d;
}
</style>
