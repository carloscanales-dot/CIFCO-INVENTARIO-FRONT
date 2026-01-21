# Verificación del Logout - Backend

## ✅ Cambios Realizados en el Frontend

**Archivo modificado:** `src/layouts/components/UserProfile.vue`

Ahora cuando un usuario hace clic en "Salir":
1. ✅ Llama al endpoint `POST /api/auth/logout` del backend
2. ✅ El backend cierra la sesión y actualiza `logout_at` e `is_active`
3. ✅ Luego limpia el localStorage
4. ✅ Recarga la página

---

## 🔧 Verificar el Backend

Asegúrate de que tu `AuthController.php` tenga el método `logout` implementado correctamente:

```php
public function logout(Request $request)
{
    $user = auth()->user();
    
    // Cerrar la sesión activa del usuario
    $this->closeUserSession($user);
    
    // Revocar el token actual
    $request->user()->currentAccessToken()->delete();
    
    return response()->json([
        'message' => 'Sesión cerrada exitosamente'
    ]);
}

/**
 * Cerrar la sesión activa del usuario
 */
protected function closeUserSession($user)
{
    // Buscar la sesión activa del usuario
    $session = UserSession::where('user_id', $user->id)
        ->where('is_active', true)
        ->orderBy('login_at', 'desc')
        ->first();
    
    if ($session) {
        $session->update([
            'is_active' => false,
            'logout_at' => now(),
        ]);
    }
}
```

---

## 🧪 Cómo Probar

1. **Inicia sesión** en la aplicación
2. **Ve a la vista de sesiones** (`/users/sessions`)
3. Verifica que tu sesión aparezca como **"Activa"**
4. **Cierra sesión** usando el botón "Salir" del menú de usuario
5. **Inicia sesión nuevamente** (ahora como admin)
6. **Ve a la vista de sesiones**
7. ✅ La sesión anterior debe aparecer como **"Inactiva"** con fecha de salida

---

## 🔍 Debug

Si todavía no funciona, verifica en la consola del navegador (F12 > Network):

1. Busca la petición `POST /api/auth/logout`
2. Verifica que la respuesta sea exitosa (200 OK)
3. Si da error, revisa el mensaje del backend

También puedes agregar console.log temporal:

```vue
const logout = async() => {
  try {
    console.log('🔴 Cerrando sesión...');
    
    const response = await $api('auth/logout', {
      method: 'POST',
      onResponseError({ response }) {
        console.log('❌ Error al cerrar sesión:', response);
      },
    });
    
    console.log('✅ Sesión cerrada correctamente:', response);
  } catch (error) {
    console.log('❌ Error:', error);
  } finally {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.reload();
  }
}
```

---

## 📋 Checklist

- [x] Frontend llama al endpoint `POST /api/auth/logout`
- [ ] Backend tiene el método `logout()` implementado
- [ ] Backend llama a `closeUserSession()` para actualizar la tabla
- [ ] La sesión se marca como `is_active = false`
- [ ] La sesión registra el `logout_at` con timestamp actual

---

Si el problema persiste después de verificar el backend, comparte el código de tu `AuthController.php` completo.
