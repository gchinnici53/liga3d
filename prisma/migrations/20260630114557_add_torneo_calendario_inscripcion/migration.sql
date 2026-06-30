-- CreateTable
CREATE TABLE "Inscripcion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "torneoId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "categoria" TEXT NOT NULL,
    "club" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Inscripcion_torneoId_fkey" FOREIGN KEY ("torneoId") REFERENCES "Torneo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Torneo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "lugar" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'REGULAR',
    "temporadaId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "horario" TEXT,
    "direccion" TEXT,
    "afiche" TEXT,
    "maxInscriptos" INTEGER NOT NULL DEFAULT 130,
    CONSTRAINT "Torneo_temporadaId_fkey" FOREIGN KEY ("temporadaId") REFERENCES "Temporada" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Torneo" ("createdAt", "fecha", "id", "lugar", "nombre", "temporadaId", "tipo") SELECT "createdAt", "fecha", "id", "lugar", "nombre", "temporadaId", "tipo" FROM "Torneo";
DROP TABLE "Torneo";
ALTER TABLE "new_Torneo" RENAME TO "Torneo";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Inscripcion_email_torneoId_key" ON "Inscripcion"("email", "torneoId");
