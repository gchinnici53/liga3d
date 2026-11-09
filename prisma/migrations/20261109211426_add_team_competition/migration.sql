-- CreateTable
CREATE TABLE "Equipo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "tipoArco" TEXT NOT NULL,
    "temporadaId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Equipo_temporadaId_fkey" FOREIGN KEY ("temporadaId") REFERENCES "Temporada" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MiembroEquipo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "equipoId" INTEGER NOT NULL,
    "arqueroId" INTEGER NOT NULL,
    CONSTRAINT "MiembroEquipo_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MiembroEquipo_arqueroId_fkey" FOREIGN KEY ("arqueroId") REFERENCES "Arquero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Equipo_nombre_temporadaId_key" ON "Equipo"("nombre", "temporadaId");

-- CreateIndex
CREATE UNIQUE INDEX "MiembroEquipo_equipoId_arqueroId_key" ON "MiembroEquipo"("equipoId", "arqueroId");
