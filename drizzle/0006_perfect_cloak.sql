CREATE TABLE `marketing_calendar` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contentId` int,
	`title` varchar(500) NOT NULL,
	`description` text,
	`platform` varchar(50),
	`scheduledDate` bigint NOT NULL,
	`status` enum('draft','scheduled','published','cancelled') NOT NULL DEFAULT 'draft',
	`colorTag` varchar(20) DEFAULT '#D4A853',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketing_calendar_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketing_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('social_media','email','trip_description','blog_seo','ad_copy') NOT NULL,
	`platform` varchar(50),
	`title` varchar(500),
	`content` text NOT NULL,
	`prompt` text NOT NULL,
	`language` varchar(10) DEFAULT 'en',
	`tone` varchar(50),
	`destination` varchar(255),
	`hashtags` json,
	`creditsCost` decimal(10,2) DEFAULT '1',
	`isFavorite` enum('yes','no') NOT NULL DEFAULT 'no',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `marketing_content_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketing_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` enum('social_media','email','trip_description','blog_seo','ad_copy') NOT NULL,
	`platform` varchar(50),
	`templateContent` text NOT NULL,
	`systemPrompt` text,
	`category` varchar(100),
	`icon` varchar(50),
	`isBuiltIn` enum('yes','no') NOT NULL DEFAULT 'no',
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `marketing_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `marketing_calendar` ADD CONSTRAINT `marketing_calendar_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `marketing_calendar` ADD CONSTRAINT `marketing_calendar_contentId_marketing_content_id_fk` FOREIGN KEY (`contentId`) REFERENCES `marketing_content`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `marketing_content` ADD CONSTRAINT `marketing_content_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;