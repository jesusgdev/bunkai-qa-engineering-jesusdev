# Reporte de Sincronización Jira — `bun run jira:sync-*`

**Fecha**: 2026-05-26
**Proyecto**: Bunkai TMS (key `BK`, id `10137`)
**Instancia Jira**: `https://upexgalaxy67.atlassian.net/`
**Usuario**: `jesusgpythondev@gmail.com`

---

## Resumen Ejecutivo

Se ejecutaron y corrigieron los dos comandos de sincronización con Jira. Ambos ahora completan exitosamente a pesar de que el usuario **no tiene permisos de administrador** en Jira. Los datos parcialmente disponibles (IDs de campos, nombres y IDs de statuses) se capturaron correctamente. Quedan pendientes las **opciones de campos tipo option** y el **mapeo de transiciones**, que requieren permisos elevados.

| Comando | Estado | Archivo generado | Tamaño |
|---------|--------|-------------------|--------|
| `bun run jira:sync-fields --force` | ✅ Complete | `.agents/jira-fields.json` | 10,317 bytes |
| `bun run jira:sync-workflows --force` | ✅ Complete | `.agents/jira-workflows.json` | 4,420 bytes |

---

## 1. `bun run jira:sync-fields`

### Problema original

El script fallaba con:

```
Failed to build fields output: Jira API error: 403 Forbidden
— "Only Jira administrators or users with the edit workflow
permission can access custom field contexts."
```

### Causa raíz

El script llama a `GET /rest/api/3/field/{fieldId}/context` para cada campo tipo `option` (select, radio, cascading). Este endpoint **requiere permisos de administrador** en Jira Cloud. El catch solo manejaba errores 400 y 404 como no-fatales; el 403 relanzaba la excepción y detenía todo.

### Solución aplicada

**Archivo**: `scripts/sync-jira-fields.ts` (línea 937)

Se agregó `|| status === 403` a la condición del catch. Ahora cuando el endpoint de contextos retorna 403, el script:

1. Emite un warning (no un error fatal)
2. Asigna `options: {}` al campo
3. Continúa con el siguiente campo

### Resultado

```
✔ Synced 84 custom fields to .agents/jira-fields.json
  - 41 string      - 19 option     - 6 datetime
  - 5 array        - 3 any         - 3 date
  - 2 number       - 2 option-with-child
  - 1 atlas-project - 1 team       - 1 user
```

### Limitaciones conocidas

7 campos declarados en `jira-required.yaml` tienen `options: {}` vacío porque no se pudieron obtener las opciones:

| Slug | Nombre en Jira | Opciones esperadas |
|------|---------------|-------------------|
| `error_type` | Error Type | content, crash, data, functional, integration, performance, security, visual |
| `severity` | Severity 🚩 | critica, mayor, menor, moderada, trivial |
| `test_environment` | Test Environment 📦️ | dev, production, qa, staging, uat |
| `root_cause` | Root Cause🐞 | code_error, config_env_error, data_error, environment_error, integration_error, requirement_error, third_party_error, working_as_designed |
| `fix` | Fix | bugfix, hotfix |
| `test_status` | Test Status🧪 | blocked, failed, n_r, passed |
| `to_be_automated` | To Be Automated (QA)🧪 | yes, no |

**Impacto**: Los `{{jira.severity.critica}}` no resolverán al ID numérico de la opción, solo al ID del campo (`customfield_10177`).

---

## 2. `bun run jira:sync-workflows`

### Problema original

El script fallaba silenciosamente — los 3 work types terminaban como `skipped` porque:

```
Failed to fetch workflow for story: Jira API error: 403 Forbidden
— "No permission to view workflow."
```

Además, el workflow scheme fallaba con:

```
Only Jira administrators can access workflow scheme associations.
```

### Causa raíz

Dos endpoints requieren permisos de administrador:

| Endpoint | Uso | ¿Manejado antes? |
|----------|-----|------------------|
| `GET /rest/api/3/workflowscheme/project?projectId={id}` | Resolver el workflow scheme | ✅ Sí (warning + continúa) |
| `POST /rest/api/3/workflows` | Obtener definición completa del workflow (transiciones) | ❌ No (retornaba null y perdía todo) |

### Solución aplicada

**Archivo**: `scripts/sync-jira-workflows.ts`

Tres cambios:

1. **Líneas 998-1007** (catch de `fetchWorkflowDefinition`): ya no retorna `null` ante un 403. Emite un warning y continúa con `workflow = null`.

2. **Línea 1011** (resolución de `workflowId`): se envuelve en `if (workflow)` para evitar crash por `null`.

3. **Líneas 1038-1349** (mapeo de transiciones): se envuelve en `if (workflow)` para saltar el mapeo de transiciones cuando no hay definición del workflow.

### Resultado

```
✔ Synced workflows for 3 work_type(s) to .agents/jira-workflows.json
  - story:      13 statuses mapped,  0 transitions mapped, 0 missing required
  - bug:        11 statuses mapped,  0 transitions mapped, 0 missing required
  - test_case:  10 statuses mapped,  0 transitions mapped, 0 missing required
```

### Statuses mapeados por work type

| Story | Bug | Test Case |
|-------|-----|-----------|
| Backlog | Open | Draft |
| Shift-Left QA | In Progress | In Design |
| Estimation | In Review | READY |
| Ready For Dev | Ready For QA | In Review |
| In Progress | Closed | Candidate |
| In Review | Deferred | In Automation |
| Ready For QA | Cannot Reproduce | Pull Request |
| In Test | Duplicated | AUTOMATED |
| BLOCKED | REJECTED | MANUAL |
| QA Approved | Enhancement | DEPRECATED |
| Ready For Release | ABORTED | |
| Deployed to Production | | |
| ABORTED | | |

### Limitaciones conocidas

Las **34 transiciones requeridas** NO están mapeadas porque el endpoint `POST /rest/api/3/workflows` requiere permisos de administrador. Sin las transiciones, las skills no podrán usar `{{jira.transition.story.qa_sign_off}}` para mover tickets entre estados vía API.

---

## 3. Estado actual según `bun run jira:check`

```
Summary: ✅ 50 OK   ❌ 59 missing   ⚠️ 7 mismatched
```

| Categoría | Cantidad | Detalle |
|-----------|----------|---------|
| ✅ OK | 50 | 19 custom fields bien mapeados + 31 statuses mapeados |
| ⚠️ Mismatched | 7 | Campos option sin opciones (explicado arriba) |
| ❌ Missing | 59 | 34 transiciones (story 22 + bug 14 + test_case 23) + resto de campos requeridos que el manifiesto pide |

---

## 4. Recomendaciones para el Administrador de Jira

### 4.1. Otorgar permisos de administrador (recomendado)

Para que los scripts funcionen al 100%, la cuenta `jesusgpythondev@gmail.com` necesita uno de estos:

- **Opción A** — Rol de **Administrador de Jira** en el sitio (`upexgalaxy67.atlassian.net`)
- **Opción B** — Permiso **"Edit workflow"** a nivel de proyecto (más granular, menos riesgo)

Con permisos de administrador, ejecutar:

```bash
bun run jira:sync-fields --force   # Obtendrá todas las opciones de campos
bun run jira:sync-workflows --force # Obtendrá todas las transiciones
```

Esto resolverá los 59 ❌ y 7 ⚠️ que reporta `jira:check`.

### 4.2. Alternativa: Admin ejecuta los comandos una vez

Si no se desea otorgar permisos permanentes, un administrador puede ejecutar los comandos desde su máquina y compartir los archivos generados:

```bash
# En su máquina local (clonando el repo):
cd bunkai-qa-engineering-jesusdev
bun install
bun run jira:sync-fields --force
bun run jira:sync-workflows --force
```

Luego reemplazar los archivos en `.agents/` del proyecto local:

| Archivo a reemplazar | Tamaño actual |
|----------------------|--------------|
| `.agents/jira-fields.json` | 10 KB |
| `.agents/jira-workflows.json` | 4 KB |

### 4.3. Sin permisos de admin (situación actual)

Los comandos funcionan y producen resultados útiles. Las limitaciones son:

- Los 7 campos tipo `option` tienen `options: {}` — no se pueden usar `{{jira.severity.critica}}` etc.
- Las transiciones no están mapeadas — no se pueden usar `{{jira.transition.story.qa_sign_off}}`
- Los **IDs de campos** (`customfield_XXXXX`) y los **IDs de statuses** sí están disponibles

---

## 5. Cambios realizados en el código

| Archivo | Línea | Cambio |
|---------|-------|--------|
| `scripts/sync-jira-fields.ts` | 937 | `|| status === 403` añadido al catch para tratar 403 como no-fatal |
| `scripts/sync-jira-workflows.ts` | 998-1007 | Catch de `fetchWorkflowDefinition` ya no retorna null en 403 |
| `scripts/sync-jira-workflows.ts` | 1011-1017 | Resolución de `workflowId` envuelta en `if (workflow)` |
| `scripts/sync-jira-workflows.ts` | 1038-1349 | Mapeo de transiciones envuelto en `if (workflow)` |
