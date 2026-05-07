-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Arquero" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "pais" TEXT NOT NULL DEFAULT 'Argentina',
    "dni" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "fechaNacimiento" DATETIME NOT NULL,
    "sexo" TEXT NOT NULL,
    "foto" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Arquero" ("activo", "apellido", "createdAt", "dni", "email", "fechaNacimiento", "foto", "id", "nombre", "pais", "sexo", "telefono", "updatedAt") SELECT "activo", "apellido", "createdAt", "dni", "email", "fechaNacimiento", "foto", "id", "nombre", "pais", "sexo", "telefono", "updatedAt" FROM "Arquero";
DROP TABLE "Arquero";
ALTER TABLE "new_Arquero" RENAME TO "Arquero";
CREATE UNIQUE INDEX "Arquero_dni_key" ON "Arquero"("dni");
CREATE UNIQUE INDEX "Arquero_email_key" ON "Arquero"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
