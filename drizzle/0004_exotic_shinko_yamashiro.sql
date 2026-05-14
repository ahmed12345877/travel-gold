ALTER TABLE `ai_credits` MODIFY COLUMN `balance` decimal(12,2) NOT NULL DEFAULT '0';--> statement-breakpoint
ALTER TABLE `ai_credits` MODIFY COLUMN `totalUsed` decimal(12,2) NOT NULL DEFAULT '0';--> statement-breakpoint
ALTER TABLE `ai_subscriptions` MODIFY COLUMN `monthlyPrice` decimal(10,2) DEFAULT '0';