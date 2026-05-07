-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'ARQUERO',
    "arqueroId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_arqueroId_fkey" FOREIGN KEY ("arqueroId") REFERENCES "Arquero" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Arquero" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "Temporada" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVA',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Torneo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "lugar" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'REGULAR',
    "temporadaId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Torneo_temporadaId_fkey" FOREIGN KEY ("temporadaId") REFERENCES "Temporada" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Resultado" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "arqueroId" INTEGER NOT NULL,
    "torneoId" INTEGER NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "puntajeRonda1" INTEGER,
    "puntajeRonda2" INTEGER,
    "puntajeTotal" INTEGER NOT NULL,
    "posicion" INTEGER NOT NULL,
    "esMedallista" BOOLEAN NOT NULL DEFAULT false,
    "puntosTemporada" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Resultado_arqueroId_fkey" FOREIGN KEY ("arqueroId") REFERENCES "Arquero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Resultado_torneoId_fkey" FOREIGN KEY ("torneoId") REFERENCES "Torneo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Resultado_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_arqueroId_key" ON "User"("arqueroId");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nombre_key" ON "Categoria"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Arquero_dni_key" ON "Arquero"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Arquero_email_key" ON "Arquero"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Resultado_arqueroId_torneoId_key" ON "Resultado"("arqueroId", "torneoId");
