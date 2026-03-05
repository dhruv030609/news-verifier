CREATE TABLE `articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`content` text NOT NULL,
	`sourceUrl` varchar(2048),
	`author` varchar(255),
	`publicationDate` timestamp,
	`category` enum('politics','health','science','business','technology','other') NOT NULL DEFAULT 'other',
	`status` enum('draft','submitted','under_review','verified','rejected') NOT NULL DEFAULT 'draft',
	`verificationScore` int,
	`verificationNotes` text,
	`viewCount` int NOT NULL DEFAULT 0,
	`isPublic` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `articles_id` PRIMARY KEY(`id`)
);
