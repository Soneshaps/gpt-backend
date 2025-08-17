-- CreateTable
CREATE TABLE "public"."speech_requests" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "lyrics" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "voiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "speech_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."speech_requests" ADD CONSTRAINT "speech_requests_voiceId_fkey" FOREIGN KEY ("voiceId") REFERENCES "public"."voices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
