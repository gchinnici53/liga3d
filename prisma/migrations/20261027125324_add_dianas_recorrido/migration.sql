-- CreateTable
CREATE TABLE "Diana" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "cantidadZonas" INTEGER NOT NULL,
    "costoCompra" REAL,
    "vidaUtilUsosZona" INTEGER,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Recorrido" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "torneoId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Recorrido_torneoId_fkey" FOREIGN KEY ("torneoId") REFERENCES "Torneo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecorridoEstacion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "recorridoId" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "dianaId" INTEGER NOT NULL,
    "zonaVital" INTEGER NOT NULL,
    "metros" REAL NOT NULL,
    CONSTRAINT "RecorridoEstacion_recorridoId_fkey" FOREIGN KEY ("recorridoId") REFERENCES "Recorrido" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecorridoEstacion_dianaId_fkey" FOREIGN KEY ("dianaId") REFERENCES "Diana" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Recorrido_torneoId_key" ON "Recorrido"("torneoId");

-- CreateIndex
CREATE UNIQUE INDEX "RecorridoEstacion_recorridoId_numero_key" ON "RecorridoEstacion"("recorridoId", "numero");
