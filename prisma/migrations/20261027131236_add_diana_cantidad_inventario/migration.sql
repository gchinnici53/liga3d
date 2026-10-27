-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Diana" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "cantidadZonas" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "costoCompra" REAL,
    "vidaUtilUsosZona" INTEGER,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Diana" ("activa", "cantidadZonas", "costoCompra", "createdAt", "id", "nombre", "vidaUtilUsosZona") SELECT "activa", "cantidadZonas", "costoCompra", "createdAt", "id", "nombre", "vidaUtilUsosZona" FROM "Diana";
DROP TABLE "Diana";
ALTER TABLE "new_Diana" RENAME TO "Diana";
CREATE TABLE "new_RecorridoEstacion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "recorridoId" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "dianaId" INTEGER NOT NULL,
    "zonaVital" INTEGER NOT NULL,
    "cantidadUsada" INTEGER NOT NULL DEFAULT 1,
    "metros" REAL NOT NULL,
    CONSTRAINT "RecorridoEstacion_recorridoId_fkey" FOREIGN KEY ("recorridoId") REFERENCES "Recorrido" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecorridoEstacion_dianaId_fkey" FOREIGN KEY ("dianaId") REFERENCES "Diana" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RecorridoEstacion" ("dianaId", "id", "metros", "numero", "recorridoId", "zonaVital") SELECT "dianaId", "id", "metros", "numero", "recorridoId", "zonaVital" FROM "RecorridoEstacion";
DROP TABLE "RecorridoEstacion";
ALTER TABLE "new_RecorridoEstacion" RENAME TO "RecorridoEstacion";
CREATE UNIQUE INDEX "RecorridoEstacion_recorridoId_numero_key" ON "RecorridoEstacion"("recorridoId", "numero");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
