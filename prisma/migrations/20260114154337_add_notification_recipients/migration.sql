-- CreateTable
CREATE TABLE "public"."NotificationRecipient" (
    "id" TEXT NOT NULL,
    "notificationHistoryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "error" TEXT,
    "openedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotificationRecipient_notificationHistoryId_idx" ON "public"."NotificationRecipient"("notificationHistoryId");

-- CreateIndex
CREATE INDEX "NotificationRecipient_userId_idx" ON "public"."NotificationRecipient"("userId");

-- AddForeignKey
ALTER TABLE "public"."NotificationRecipient" ADD CONSTRAINT "NotificationRecipient_notificationHistoryId_fkey" FOREIGN KEY ("notificationHistoryId") REFERENCES "public"."NotificationHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotificationRecipient" ADD CONSTRAINT "NotificationRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
