-- DropForeignKey
ALTER TABLE "RoutineAssignment" DROP CONSTRAINT "RoutineAssignment_userId_fkey";

-- AddForeignKey
ALTER TABLE "RoutineAssignment" ADD CONSTRAINT "RoutineAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
