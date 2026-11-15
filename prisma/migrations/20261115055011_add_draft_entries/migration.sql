-- CreateTable
CREATE TABLE "DraftEntry" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DraftEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DraftEntry_profileId_createdAt_idx" ON "DraftEntry"("profileId", "createdAt");

-- AddForeignKey
ALTER TABLE "DraftEntry" ADD CONSTRAINT "DraftEntry_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
