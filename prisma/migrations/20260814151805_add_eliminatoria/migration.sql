-- CreateTable
CREATE TABLE "Eliminatoria" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "torneoId" INTEGER NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "tamano" INTEGER NOT NULL,
    "llave" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Eliminatoria_torneoId_fkey" FOREIGN KEY ("torneoId") REFERENCES "Torneo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Eliminatoria_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Eliminatoria_torneoId_categoriaId_key" ON "Eliminatoria"("torneoId", "categoriaId");
