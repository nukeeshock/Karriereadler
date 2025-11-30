-- Delete orphaned order_requests without user_id before setting NOT NULL
-- These are likely abandoned orders that were never completed
DELETE FROM "order_requests" WHERE "user_id" IS NULL;

-- Now safely set user_id to NOT NULL
ALTER TABLE "order_requests" ALTER COLUMN "user_id" SET NOT NULL;