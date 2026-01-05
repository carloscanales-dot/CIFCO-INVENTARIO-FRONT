<template>
  <footer class="h-100 d-flex align-center justify-space-between text-medium-emphasis px-4 py-2 border-t">
    <!-- 👉 Footer: left content -->
    <div class="d-flex align-center text-base">
      <VIcon icon="ri-git-repository-private-fill" color="primary" size="1.2rem" class="me-2" />
      <span>
        &copy; {{ new Date().getFullYear() }} — 
        <strong class="text-primary">CIFCO INVENTARIO</strong>
      </span>
    </div>

    <!-- 👉 Footer: right content -->
    <div class="d-none d-md-flex align-center gap-x-4">
      <a
        href="https://wa.me/50300000000"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary d-flex align-center"
      >
        <VIcon icon="ri-whatsapp-fill" size="1.2rem" class="me-1" /> WhatsApp
      </a>

      <a
        href="mailto:contacto@farmacialaesperanza.com"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary d-flex align-center"
      >
        <VIcon icon="ri-mail-fill" size="1.2rem" class="me-1" /> Contacto
      </a>

      <a
        href="https://maps.google.com/?q=Farmacia+La+Esperanza"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary d-flex align-center"
      >
        <VIcon icon="ri-map-pin-2-fill" size="1.2rem" class="me-1" /> Ubicación
      </a>
    </div>
  </footer>
</template>

<style scoped>
footer {
  background-color: #f9fafb;
  border-top: 1px solid #e0e0e0;
  font-size: 0.9rem;
  border-top: 1px solid #e0e0e0;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
}
.text-primary {
  font-weight: 600;
}
</style>
