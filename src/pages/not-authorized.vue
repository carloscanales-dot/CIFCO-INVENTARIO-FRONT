<template>
  <div class="page-container">
    <!-- Elementos decorativos -->
    <div class="decoration circle-1"></div>
    <div class="decoration circle-2"></div>
    <div class="decoration pill pill-1"></div>
    <div class="decoration pill pill-2"></div>
    <div class="decoration pill pill-3"></div>

    <div class="container">
      <div class="logo">
        <div class="logo-icon">+</div>
      </div>

      <h1>FARMACIA LA ESPERANZA</h1>
      <p class="tagline">Su salud es nuestra prioridad</p>

      <div class="features">
        <div class="feature">
          <div class="feature-icon">💊</div>
          <div class="feature-text">Medicamentos</div>
        </div>
        <div class="feature">
          <div class="feature-icon">👨‍⚕️</div>
          <div class="feature-text">Asesoría</div>
        </div>
        <div class="feature">
          <div class="feature-icon">🏠</div>
          <div class="feature-text">Domicilios</div>
        </div>
      </div>

      <button class="contact-btn">Contáctenos</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "NotAuthorizedPage",
  mounted() {
    // Efecto de aparición suave
    const elements = document.querySelectorAll(".container > *");
    elements.forEach((el, index) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      setTimeout(() => {
        el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, 200 * index);
    });
  },
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.page-container {
  background-color: #e8f9ee;
  font-family: "Montserrat", sans-serif;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #2d5a3d;
  position: relative;
  overflow: hidden;
}

.container {
  text-align: center;
  max-width: 800px;
  padding: 2rem;
  position: relative;
  z-index: 10;
}

.logo {
  margin-bottom: 2rem;
}

.logo-icon {
  width: 80px;
  height: 80px;
  background: #2d5a3d;
  border-radius: 50%;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  box-shadow: 0 4px 12px rgba(45, 90, 61, 0.2);
}

h1 {
  font-family: "Playfair Display", serif;
  font-size: 3.5rem;
  margin-bottom: 1rem;
  line-height: 1.2;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
}

.tagline {
  font-size: 1.2rem;
  margin-bottom: 2.5rem;
  font-weight: 500;
  opacity: 0.9;
}

.features {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.feature {
  background: rgba(255, 255, 255, 0.7);
  padding: 1.5rem 1rem;
  border-radius: 12px;
  width: 160px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.feature:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 0.8rem;
  color: #2d5a3d;
}

.feature-text {
  font-size: 0.9rem;
  font-weight: 500;
}

.contact-btn {
  background: #2d5a3d;
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(45, 90, 61, 0.3);
}

.contact-btn:hover {
  background: #1e3f2a;
  transform: translateY(-2px);
}

.decoration {
  position: absolute;
  z-index: 1;
}

.circle-1 {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: rgba(45, 90, 61, 0.05);
  top: -150px;
  right: -100px;
}

.circle-2 {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(45, 90, 61, 0.05);
  bottom: -100px;
  left: -50px;
}

.pill {
  position: absolute;
  width: 80px;
  height: 30px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.pill-1 {
  top: 20%;
  left: 10%;
  transform: rotate(15deg);
}

.pill-2 {
  bottom: 25%;
  right: 15%;
  transform: rotate(-10deg);
}

.pill-3 {
  top: 40%;
  right: 20%;
  transform: rotate(5deg);
}

@media (max-width: 768px) {
  h1 {
    font-size: 2.5rem;
  }

  .features {
    gap: 1rem;
  }

  .feature {
    width: 140px;
    padding: 1rem 0.5rem;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 2rem;
  }

  .tagline {
    font-size: 1rem;
  }

  .features {
    flex-direction: column;
    align-items: center;
  }

  .feature {
    width: 200px;
  }
}
</style>
