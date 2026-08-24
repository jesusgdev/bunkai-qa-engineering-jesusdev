# Reporte de Correcciones — Smoke Tests

> **Fecha:** 23 de Agosto, 2026
> **Proyecto:** bunkai-qa-engineering-jesusdev
> **Branch:** main
> **Commits:** `c387e1a`, `538f998`, `37a83a5`

---

## Resumen Ejecutivo

Se corrigieron **3 tests fallidos** en la suite de smoke tests (tests 6, 7 y 8). El problema raíz era una **filtración de cookies de autenticación** del proyecto de Playwright hacia los contextos de request aislados, causando que las peticiones API retornaran 200 (autenticado) cuando deberían retornar 401 (no autenticado).

**Resultado final: 9/9 tests pasando ✅**

---

## Problema 1: Loginselectors incorrectos (Test 6)

### Qué sucedía

El test de login fallaba porque los selectores CSS (`data-testid`) del archivo `LoginPage.ts` no coincidían con los que usa la aplicación real.

| Selector esperado | Selector real en la app |
|---|---|
| `login-email-input` | `login-email` |
| `login-password-input` | `login-password` |
| `login-submit-button` | `login-signin` |

Además, la app usa un **flujo de login de 2 pasos**:
1. Ingresar email → Click "Continue"
2. Ingresar contraseña → Click "Sign in"

El código original solo hacía un solo paso.

### Cómo se corrigió

Se actualizó `tests/components/ui/LoginPage.ts` con los selectores correctos y se implementó el flujo de 2 pasos:

```typescript
// Paso 1: Email + Continue
await this.page.getByTestId('login-email').fill(email);
await this.page.getByTestId('login-continue').click();

// Paso 2: Password + Sign in
await this.page.getByTestId('login-password').fill(password);
await this.page.getByTestId('login-signin').click();
```

**Archivo:** `tests/components/ui/LoginPage.ts`
**Commit:** `538f998`

---

## Problema 2: Contexto API hereda cookies del proyecto (Test 7)

### Qué sucedía

Este era el problema más complejo. El test 7 verificaba que las peticiones **sin token** retornaran 401. Pero retornaba 200.

**Paso a paso del debugging:**

1. Se creó un contexto aislado con `playwright.request.newContext()`
2. Se limpió el token con `clearAuthToken()` → `authToken = null`
3. Se hizo la petición a `/api/v1/me`
4. El servidor retornó **200** con datos de usuario ✗

**Investigación:**

Se creó un sandbox de prueba (`tests/sandbox/isolated-request.sandbox.ts`) que demostró:

| Escenario | Resultado |
|---|---|
| `playwright.request.newContext()` + URL absoluta (sandbox) | 401 ✅ |
| Built-in `request` fixture (sandbox) | 401 ✅ |
| `api` fixture dentro del proyecto `smoke` | 200 ✗ |

**Root cause encontrado:**

El proyecto `smoke` en `playwright.config.ts` tiene configurado:

```typescript
use: {
  storageState: config.auth.storageStatePath, // '.auth/user.json'
}
```

El archivo `.auth/user.json` contiene una **cookie de Supabase** (`sb-fmbpikzpkafptqximhxn-auth-token`) para el dominio `staging-upexbunkai.vercel.app`.

**Comportamiento de Playwright:** Cuando se crea un contexto con `playwright.request.newContext()` **sin** especificar `storageState`, Playwright **hereda** el `storageState` del proyecto. Esto significa que la cookie de Supabase se enviaba automáticamente con cada petición, y el servidor la usaba para autenticar al usuario — incluso después de limpiar el token.

**Confirmación con curl:**

```bash
curl -s https://staging-upexbunkai.vercel.app/api/v1/me
# → {"error":{"code":"unauthorized","message":"Authentication required."}}  (401)
```

El endpoint **sí requiere** autenticación. El problema era exclusivamente del lado de Playwright.

### Cómo se corrigió

Se forzó un cookie jar vacío al crear el contexto aislado:

```typescript
// ANTES (con bug)
const isolatedRequest = await playwright.request.newContext({
  baseURL: config.apiUrl,
  ignoreHTTPSErrors: true,
});

// DESPUÉS (corregido)
const isolatedRequest = await playwright.request.newContext({
  baseURL: config.apiUrl,
  ignoreHTTPSErrors: true,
  storageState: { cookies: [], origins: [] }, // Forzar cookie jar vacío
});
```

**Archivo:** `tests/components/TestFixture.ts`
**Commit:** `37a83a5`

> **Lección aprendida:** Siempre pasar `storageState: { cookies: [], origins: [] }` al crear contextos de request aislados para tests de API que necesiten probar escenarios no autenticados.

---

## Problema 3: Race condition entre setups (Test 8)

### Qué sucedía

Había dos archivos de setup que escribían al mismo archivo `.auth/api-state.json`:

- `tests/setup/api-auth.setup.ts` — Autenticaba vía API y escribía el PAT
- `tests/setup/ui-auth.setup.ts` — Autenticaba vía UI y **también** escribía al archivo

Esto causaba una condición de carrera donde el token podía ser sobrescrito.

### Cómo se corrigió

Se eliminó la escritura a `.auth/api-state.json` desde `ui-auth.setup.ts`. Ahora solo `api-auth.setup.ts` gestiona ese archivo:

```typescript
// ANTES (ui-auth.setup.ts)
writeFileSync(apiStateFile, JSON.stringify(apiState, null, 2));

// DESPUÉS (ui-auth.setup.ts)
// Solo escribe storageState a '.auth/user.json'
// NO toca '.auth/api-state.json'
```

**Archivo:** `tests/setup/ui-auth.setup.ts`
**Commit:** `37a83a5`

---

## Correcciones Adicionales

### Workflow: GitHub Pages permissions

Los workflows de smoke, regression y sanity necesitaban permisos para desplegar Allure reports a GitHub Pages:

```yaml
permissions:
  contents: write
```

**Archivos:** `.github/workflows/smoke.yml`, `regression.yml`, `sanity.yml`
**Commit:** `37a83a5`

### Workflow: Build configuration

Se configuró el workflow de build con el rol correcto (`member`) y el entorno (`staging`):

```yaml
env:
  TEST_ROLE: member
  STAGING_MEMBER_EMAIL: ${{ secrets.STAGING_MEMBER_EMAIL }}
  STAGING_MEMBER_PASSWORD: ${{ secrets.STAGING_MEMBER_PASSWORD }}
```

**Archivo:** `.github/workflows/build.yml`
**Commit:** `c387e1a`

### API Schema: UserInfoResponse

Se actualizó el tipo `UserInfoResponse` para coincidir con la respuesta real del endpoint `/api/v1/me`:

```typescript
// ANTES
interface UserInfoResponse {
  user: { id: string; email: string; name?: string };
}

// DESPUÉS
interface UserInfoResponse {
  user: { id: string; email: string };
  workspaces: Workspace[];
  active_workspace_id: string;
  active_workspace_role: string;
  auth: { source: string; scopes: string[] };
}
```

**Archivo:** `api/schemas/auth.types.ts`
**Commit:** `37a83a5`

### Variables: Endpoint corregido

Se corrigió la ruta del endpoint de autenticación:

```typescript
// ANTES
meEndpoint: '/v1/auth/me'  // No existe

// DESPUÉS
meEndpoint: '/v1/me'  // Endpoint correcto
```

**Archivo:** `config/variables.ts`
**Commit:** `37a83a5`

### Limpieza de debug logging

Se eliminaron todos los `console.log` de debug que se habían agregado durante la investigación:

- `tests/components/api/ApiBase.ts` — Logs en `apiGET()` y `getResponseJsonObject()`
- `tests/integration/auth/user-session.test.ts` — Logs en test 7 + imports no usados

**Commits:** `37a83a5`

---

## Archivos Modificados

| Archivo | Cambio | Commit |
|---|---|---|
| `tests/components/ui/LoginPage.ts` | Selectores + flujo 2 pasos | `538f998` |
| `tests/components/TestFixture.ts` | storageState vacío en contexto aislado | `37a83a5` |
| `tests/components/ApiFixture.ts` | Tipo de constructor con isolatedRequest | `37a83a5` |
| `tests/components/api/ApiBase.ts` | isolatedRequest + limpieza debug | `37a83a5` |
| `tests/components/api/AuthApi.ts` | Constructor con isolatedRequest | `37a83a5` |
| `tests/components/api/DefectsApi.ts` | Constructor con isolatedRequest | `37a83a5` |
| `tests/components/api/ExampleApi.ts` | Constructor con isolatedRequest | `37a83a5` |
| `tests/components/api/RunApi.ts` | Constructor con isolatedRequest | `37a83a5` |
| `tests/components/api/TestBuilderApi.ts` | Constructor con isolatedRequest | `37a83a5` |
| `tests/setup/ui-auth.setup.ts` | Eliminada escritura a api-state.json | `37a83a5` |
| `tests/integration/auth/user-session.test.ts` | Limpieza debug + imports | `37a83a5` |
| `api/schemas/auth.types.ts` | UserInfoResponse actualizado | `37a83a5` |
| `config/variables.ts` | meEndpoint corregido | `37a83a5` |
| `.github/workflows/smoke.yml` | GH Pages permissions | `37a83a5` |
| `.github/workflows/regression.yml` | GH Pages permissions | `37a83a5` |
| `.github/workflows/sanity.yml` | GH Pages permissions | `37a83a5` |
| `.github/workflows/build.yml` | TEST_ROLE + staging env | `c387e1a` |

---

## Resultado Final

```
🧪 TEST REPORT SUMMARY:

  ✅ 1  API Setup: authenticate via API           1.906s
  ✅ 2  Global Teardown: generate reports          0.019s
  ✅ 3  Global Setup: prepare environment          0.012s
  ✅ 4  UI Setup: authenticate via UI              5.766s
  ✅ 5  UPEX-200: should load dashboard            2.513s
  ✅ 6  UPEX-200: should access user info via API  0.977s
  ✅ 7  UPEX-100: should get current user          0.353s
  ✅ 8  UPEX-100: should fail without token        0.173s
  ✅ 9  UPEX-100: should re-authenticate           0.439s

  ALL TESTS PASSED ✅
  Execution time: 26.12 seconds
```

---

## Referencias

- [Playwright: storageState documentation](https://playwright.dev/docs/auth#managing-global-sign-in)
- [Playwright: APIRequestContext](https://playwright.dev/docs/api/class-apirequestcontext)
- [Supabase Auth: Session management](https://supabase.com/docs/guides/auth/sessions)

---

*Reporte generado automáticamente por OpenCode — bunkai-qa-engineering-jesusdev*
