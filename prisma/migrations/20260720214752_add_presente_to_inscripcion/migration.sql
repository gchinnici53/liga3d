-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Inscripcion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "torneoId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "fechaNacimiento" DATETIME,
    "dni" TEXT,
    "categoria" TEXT NOT NULL,
    "club" TEXT,
    "pagado" BOOLEAN NOT NULL DEFAULT false,
    "presente" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Inscripcion_torneoId_fkey" FOREIGN KEY ("torneoId") REFERENCES "Torneo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Inscripcion" ("apellido", "categoria", "club", "createdAt", "dni", "email", "fechaNacimiento", "id", "nombre", "pagado", "telefono", "torneoId") SELECT "apellido", "categoria", "club", "createdAt", "dni", "email", "fechaNacimiento", "id", "nombre", "pagado", "telefono", "torneoId" FROM "Inscripcion";
DROP TABLE "Inscripcion";
ALTER TABLE "new_Inscripcion" RENAME TO "Inscripcion";
CREATE UNIQUE INDEX "Inscripcion_email_torneoId_key" ON "Inscripcion"("email", "torneoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
