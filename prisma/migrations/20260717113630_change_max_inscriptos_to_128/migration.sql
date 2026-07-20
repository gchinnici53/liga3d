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
    "maxInscriptos" INTEGER NOT NULL DEFAULT 128,
    CONSTRAINT "Torneo_temporadaId_fkey" FOREIGN KEY ("temporadaId") REFERENCES "Temporada" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Torneo" ("afiche", "createdAt", "direccion", "fecha", "horario", "id", "lugar", "maxInscriptos", "nombre", "temporadaId", "tipo") SELECT "afiche", "createdAt", "direccion", "fecha", "horario", "id", "lugar", "maxInscriptos", "nombre", "temporadaId", "tipo" FROM "Torneo";
DROP TABLE "Torneo";
ALTER TABLE "new_Torneo" RENAME TO "Torneo";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
