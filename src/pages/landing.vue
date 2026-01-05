<script setup>
import logonIndex from '@/assets/images/logos/logoIndex.jpeg'
</script>

<template>
  <div class="home-wrapper">
    <!-- Header -->
    <header class="home-header">
      <div class="container">
        <div class="d-flex align-center justify-space-between py-4">
          <div class="d-flex align-center gap-2">
            <img :src="logoIndex" alt="Farmacias La Esperanza" class="logo-img" />
            <span class="app-title">CIFCO INVENTARIO</span>
          </div>

          <div class="links">
            <RouterLink to="/login" class="text-success fw-bold me-3">Iniciar Sesión</RouterLink>
            <RouterLink to="/register" class="text-success fw-bold">Registrarse</RouterLink>
          </div>
        </div>
      </div>
    </header>

    <!-- Hero -->
    <section class="home-hero text-center">
      <img :src="logoIndex" alt="Farmacias La Esperanza" class="hero-logo mb-4" />
      <h2 class="fw-bold mb-2">Bienvenido a Farmacias La Esperanza</h2>
      <p class="text-muted fs-5">
        Trabajamos cada día para cuidar tu salud con calidad, calidez y compromiso.
      </p>
    </section>

    <!-- Features -->
    <section class="features text-center py-5">
      <div class="container">
        <div class="row">
          <div class="col-md-4 mb-4 mb-md-0">
            <div class="feature">
              <i class="ri-capsule-fill feature-icon" style="color:#ff4081;"></i>
              <h5 class="fw-bold mt-3">Productos de Calidad</h5>
              <p class="text-muted mb-0">Medicamentos certificados y garantizados.</p>
            </div>
          </div>

          <div class="col-md-4 mb-4 mb-md-0">
            <div class="feature">
              <i class="ri-time-fill feature-icon" style="color:#6a1b9a;"></i>
              <h5 class="fw-bold mt-3">Atención 24/7</h5>
              <p class="text-muted mb-0">Siempre disponibles para tu salud.</p>
            </div>
          </div>

          <div class="col-md-4">
            <div class="feature">
              <i class="ri-heart-3-fill feature-icon" style="color:#e53935;"></i>
              <h5 class="fw-bold mt-3">Confianza y Compromiso</h5>
              <p class="text-muted mb-0">Más de 10 años cuidando a las familias.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="text-center py-3 text-muted small border-top">
      CIFCO INVENTARIO © 2025. Todos los derechos reservados.
    </footer>
  </div>
</template>

<style scoped lang="scss">
.home-wrapper {
  background: linear-gradient(180deg, #eaf9ef 0%, #e3f9eb 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.home-header {
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
}

.logo-img {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  object-fit: cover;
}

.app-title {
  font-weight: 600;
  font-size: 1.1rem;
  color: #2e7d32;
}

.home-hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
}

.hero-logo {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  object-fit: cover;
}

.features {
  background-color: #fff;
  margin-top: auto;
}

.feature-icon {
  font-size: 2rem;
}

footer {
  background-color: #fafafa;
}
</style>
