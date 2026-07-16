-- CreateTable
CREATE TABLE "Patrulla" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "torneoId" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "bis" BOOLEAN NOT NULL DEFAULT false,
    "estaca" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Patrulla_torneoId_fkey" FOREIGN KEY ("torneoId") REFERENCES "Torneo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MiembroPatrulla" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patrullaId" INTEGER NOT NULL,
    "inscripcionId" INTEGER NOT NULL,
    "posicion" TEXT NOT NULL,
    CONSTRAINT "MiembroPatrulla_patrullaId_fkey" FOREIGN KEY ("patrullaId") REFERENCES "Patrulla" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MiembroPatrulla_inscripcionId_fkey" FOREIGN KEY ("inscripcionId") REFERENCES "Inscripcion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Patrulla_torneoId_numero_bis_key" ON "Patrulla"("torneoId", "numero", "bis");

-- CreateIndex
CREATE UNIQUE INDEX "MiembroPatrulla_inscripcionId_key" ON "MiembroPatrulla"("inscripcionId");
