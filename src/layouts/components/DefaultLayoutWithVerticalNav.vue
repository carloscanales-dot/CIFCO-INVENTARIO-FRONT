<script setup>
import navItems from '@/navigation/vertical'
import { useConfigStore } from '@core/stores/config'
import { themeConfig } from '@themeConfig'

// Components
import Footer from '@/layouts/components/Footer.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import UserProfile from '@/layouts/components/UserProfile.vue'
import NavBarI18n from '@core/components/I18n.vue'

// @layouts plugin
import { VerticalNavLayout } from '@layouts'

// SECTION: Loading Indicator
const isFallbackStateActive = ref(false)
const refLoadingIndicator = ref(null)

watch([
  isFallbackStateActive,
  refLoadingIndicator,
], () => {
  if (isFallbackStateActive.value && refLoadingIndicator.value)
    refLoadingIndicator.value.fallbackHandle()
  if (!isFallbackStateActive.value && refLoadingIndicator.value)
    refLoadingIndicator.value.resolveHandle()
}, { immediate: true })

// !SECTION
const configStore = useConfigStore()

// ℹ️ Provide animation name for vertical nav collapse icon.
const verticalNavHeaderActionAnimationName = ref(null)

watch([
  () => configStore.isVerticalNavCollapsed,
  () => configStore.isAppRTL,
], val => {
  if (configStore.isAppRTL)
    verticalNavHeaderActionAnimationName.value = val[0] ? 'rotate-back-180' : 'rotate-180'
  else
    verticalNavHeaderActionAnimationName.value = val[0] ? 'rotate-180' : 'rotate-back-180'
}, { immediate: true })

const navItemsV = ref([]);

onMounted(() => {
    let USER = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
    if(USER){
      // LA LISTA DE PERMISOS DEL USUARIO AUTENTICADO
      let permissions = USER.permissions;
      navItems.forEach((nav) => {
        // SI EL USUARIO ES SUPER-ADMIN, ENTONCES TENDRA ACCESO A TODO
        if(USER.role.name == 'Super-Admin'){
          navItemsV.value.push(nav);
        }else{
          // LOS NAV QUE TENGAN EL PERMISO ALL PUEDEN SER VISTO POR CUALQUIER USUARIO
          if(nav.permission == 'all'){
            navItemsV.value.push(nav);
          }

          if(nav.heading){
            // ['pera','manzana','uva','naranja','fresa','mango']
            // ['durazno'].filter((fruta) => {
            //   if(['pera','manzana','uva','naranja','fresa','mango'].includes(fruta)){
            //     return true;
            //   }
            //   return false;
            // })
            // []
            let headingF = nav.permissions.filter((permission) => {
              if(permissions.includes(permission)){
                return true;
              }
              return false;
            })
            if(headingF.length > 0){
              navItemsV.value.push(nav);
            }
          }

          if(nav.children){
            let navT = nav;
            // FILTRAREMOS LOS SUBMENUS O CHILDREN PARA VALIDAR SI PUEDEN SER VISTO POR EL USUARIO AUTENTICADO
            let newChildren = nav.children.filter((subnav) => {
              if(permissions.includes(subnav.permission)){
                return true;
              }
              return false;
            })
            if(newChildren.length > 0){
              navT.children = newChildren;
              navItemsV.value.push(navT);
            }
          }else{
          // VERIFICAR SI LOS PERMISOS DEL USUARIO AUTENTICADO PUEDEN VER EL NAV INDIVIDUAL
            if(permissions.includes(nav.permission)){
              navItemsV.value.push(nav);
            }
          }
        }
      })
    }
})

</script>

<template>
  <VerticalNavLayout :nav-items="navItemsV">
    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center">
        <IconBtn
          id="vertical-nav-toggle-btn"
          class="ms-n2 d-lg-none"
          @click="toggleVerticalOverlayNavActive(true)"
        >
          <VIcon icon="ri-menu-line" />
        </IconBtn>

        <NavbarThemeSwitcher />

        <VSpacer />

        <NavBarI18n
          v-if="themeConfig.app.i18n.enable && themeConfig.app.i18n.langConfig?.length"
          :languages="themeConfig.app.i18n.langConfig"
        />
        <UserProfile />
      </div>
    </template>

    <AppLoadingIndicator ref="refLoadingIndicator" />

    <!-- 👉 Pages -->
    <RouterView v-slot="{ Component }">
      <Suspense
        :timeout="0"
        @fallback="isFallbackStateActive = true"
        @resolve="isFallbackStateActive = false"
      >
        <Component :is="Component" />
      </Suspense>
    </RouterView>

    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>

    <!-- 👉 Customizer -->
    <!-- <TheCustomizer /> -->
  </VerticalNavLayout>
</template>

<style lang="scss">
@keyframes rotate-180 {
  from { transform: rotate(0deg); }
  to { transform: rotate(180deg); }
}

@keyframes rotate-back-180 {
  from { transform: rotate(180deg); }
  to { transform: rotate(0deg); }
}

.layout-vertical-nav {
  .nav-header {
    .header-action {
      animation-duration: 0.35s;
      animation-fill-mode: forwards;
      animation-name: v-bind(verticalNavHeaderActionAnimationName);
      transform: rotate(0deg);
    }
  }
}
</style>
