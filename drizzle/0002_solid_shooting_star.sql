CREATE TABLE `gallery_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`imageUrl` text NOT NULL,
	`title` varchar(255) NOT NULL,
	`titleAr` varchar(255),
	`description` text,
	`descriptionAr` text,
	`category` varchar(100) NOT NULL,
	`categoryAr` varchar(100),
	`location` varchar(255),
	`locationAr` varchar(255),
	`featured` enum('yes','no') NOT NULL DEFAULT 'no',
	`aspect` enum('landscape','portrait','square') NOT NULL DEFAULT 'landscape',
	`sortOrder` int DEFAULT 0,
	`isVisible` enum('visible','hidden') NOT NULL DEFAULT 'visible',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gallery_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gallery_videos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`thumbnailUrl` text NOT NULL,
	`title` varchar(255) NOT NULL,
	`titleAr` varchar(255),
	`youtubeId` varchar(20) NOT NULL,
	`duration` varchar(20),
	`views` varchar(20),
	`sortOrder` int DEFAULT 0,
	`isVisible` enum('visible','hidden') NOT NULL DEFAULT 'visible',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gallery_videos_id` PRIMARY KEY(`id`)
);
