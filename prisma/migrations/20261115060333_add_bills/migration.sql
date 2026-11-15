-- CreateTable
CREATE TABLE "Bill" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "dueDate" DATE NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Bill_profileId_dueDate_idx" ON "Bill"("profileId", "dueDate");

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
