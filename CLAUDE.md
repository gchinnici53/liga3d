# CLAUDE.md — Liga3D

## Descripción del proyecto
App de gestión para una liga de tiro con arco. Permite administrar arqueros,
temporadas, torneos y finales. Se despliega como subdominio en un VPS con Nginx y PM2.

## Stack
- **Framework**: Next.js 14 con App Router
- **Lenguaje**: TypeScript (strict mode)
- **Estilos**: Tailwind CSS
- **ORM**: Prisma 5 + SQLite (se usa v5, NO actualizar a v7 — rompe la API para SQLite sin adapters)
- **Auth**: NextAuth.js (roles: ADMIN y ARQUERO)
- **Excel import**: librería `xlsx` (SheetJS) — ya aprobada
- **Deploy**: VPS Hostinger, Nginx como proxy, PM2 como process manager

## Estructura de carpetas
src/
  app/
    (portal)/     → vistas públicas para arqueros
    (admin)/      → backend de administración (requiere rol ADMIN)
    auth/         → login y rutas de NextAuth
  components/     → componentes reutilizables
  lib/            → prisma client, utilidades, helpers
  types/          → tipos TypeScript compartidos
prisma/
  schema.prisma   → esquema de la base de datos
public/
  uploads/
    profiles/     → fotos de perfil de arqueros

## Convenciones de código
- Componentes: PascalCase (ej: ArqueroCard.tsx)
- Funciones y variables: camelCase
- Archivos de ruta: page.tsx, layout.tsx (convención Next.js)
- Server Actions para mutaciones de datos (no API routes salvo necesidad explícita)
- Siempre tipar con TypeScript, nunca usar `any`
- Comentarios en español
- Mobile-first con Tailwind (sin CSS inline)

## Entidades principales
- **Arquero**: nombre, apellido, pais, DNI, email, teléfono, fecha de nacimiento, sexo, foto, activo/inactivo
  - `nombre` y `apellido` son campos separados
  - `nombreCompleto` se computa: `nombre + " " + apellido` (ver lib/scoring.ts)
  - `mesNacimiento` se computa desde `fechaNacimiento` (para saludos mensuales)
  - **Sin categoriaId**: la categoría se define al inscribirse a cada torneo, no en el arquero
- **Categoria**: tabla separada. Se define al inscribirse al torneo combinando la disciplina con el sexo del arquero.
  - Categorías con sexo: CM / CW (Compuesto), BM / BW (Raso/Barebow), LM / LW (Longbow), TM / TW (Tradicional)
  - Categorías unisex (por edad, propias de la liga): ESC (Escuela), JUN (Junior)
  - Al registrar un resultado, el sexo del arquero sugiere M o W; para ESC y JUN no aplica el sexo
- **Temporada**: nombre, año, estado (ACTIVA | CERRADA)
- **Torneo**: nombre, lugar, fecha, tipo (REGULAR | FINAL), pertenece a una Temporada
  - Una Final es un Torneo con tipo=FINAL. No hay modelo Final separado.
  - Una temporada tiene 4-5 torneos REGULAR + 1 torneo FINAL
- **Resultado**: arquero + torneo + categoría (del torneo, no del arquero) + puntajes + posición
- **User**: autenticación, rol ADMIN o ARQUERO, opcionalmente vinculado a un Arquero

## Sistema de puntos de temporada (fijo, en lib/scoring.ts)
| Posición | Torneo regular | Final (×2) |
|----------|---------------|------------|
| 1 (ORO)  | 18            | 36         |
| 2 (PLATA)| 16            | 32         |
| 3 (BRONCE)| 15           | 30         |
| 4        | 12            | 24         |
| 5        | 11            | 22         |
| 6        | 10            | 20         |
| 7        | 9             | 18         |
| 8        | 8             | 16         |
| 9+       | 7             | 14         |

## Campeón de temporada
- Se calcula dinámicamente (Opción A): arquero con más `puntosTemporada` acumulados en la temporada por categoría.
- No se almacena en la DB. Se computa en la query de ranking.

## Importación de arqueros desde Excel
Columnas esperadas: Nombre, Apellido, email, tel, DNI, Fecha Nacimiento, pais
Columnas ignoradas (calculadas): Nombre completo, Mes de nacimiento
Campos que se asignan en la importación: sexo (la categoría se asigna al inscribir al arquero en un torneo)

## Flujo de carga de resultados de torneo
1. Se selecciona la categoría
2. Paso 1: ingresar puntajeRonda1 y puntajeRonda2 por arquero
3. Paso 2: registrar posiciones de la ronda de medallas (1°/2°/3°/4°) por categoría
4. El sistema asigna puntosTemporada automáticamente según la tabla fija
5. Si el torneo es tipo FINAL, los puntos se duplican automáticamente

## Reglas importantes
- **No modificar el esquema de Prisma sin avisar primero y pedir confirmación**
- Cada migración de Prisma debe tener un nombre descriptivo en inglés
- Las imágenes de arqueros van en /public/uploads/profiles/
- No usar librerías externas sin consultar primero (xlsx ya está aprobada)
- Mantener consistencia visual con Tailwind (no mezclar con CSS inline)

## Estado actual del proyecto
- [x] Etapa 1: Setup base + esquema Prisma
- [ ] Etapa 2: ABM Arqueros (incluye importación desde Excel)
- [ ] Etapa 3: Temporadas y Torneos
- [ ] Etapa 4: Carga de resultados y medallas
- [ ] Etapa 5: Vistas públicas (ranking, historial, campeones)
- [ ] Etapa 6: Deploy y configuración Nginx
