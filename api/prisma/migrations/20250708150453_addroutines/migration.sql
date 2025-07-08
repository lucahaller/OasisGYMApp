-- CreateTable
CREATE TABLE "RoutineBase" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reusable" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RoutineBase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineAssignment" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "routineBaseId" INTEGER,
    "customFile" TEXT,
    "evaluated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoutineAssignment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RoutineAssignment" ADD CONSTRAINT "RoutineAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineAssignment" ADD CONSTRAINT "RoutineAssignment_routineBaseId_fkey" FOREIGN KEY ("routineBaseId") REFERENCES "RoutineBase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
