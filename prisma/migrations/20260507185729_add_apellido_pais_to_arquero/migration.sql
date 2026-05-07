/*
  Warnings:

  - Added the required column `apellido` to the `Arquero` table without a default value. This is not possible if the table is not empty.

*/
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
    "categoriaId" INTEGER NOT NULL,
    "foto" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Arquero_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Arquero" ("activo", "categoriaId", "createdAt", "dni", "email", "fechaNacimiento", "foto", "id", "nombre", "sexo", "telefono", "updatedAt") SELECT "activo", "categoriaId", "createdAt", "dni", "email", "fechaNacimiento", "foto", "id", "nombre", "sexo", "telefono", "updatedAt" FROM "Arquero";
DROP TABLE "Arquero";
ALTER TABLE "new_Arquero" RENAME TO "Arquero";
CREATE UNIQUE INDEX "Arquero_dni_key" ON "Arquero"("dni");
CREATE UNIQUE INDEX "Arquero_email_key" ON "Arquero"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
