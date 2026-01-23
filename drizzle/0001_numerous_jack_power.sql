CREATE TABLE `analyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submissionId` int NOT NULL,
	`userId` int NOT NULL,
	`credibilityScore` int NOT NULL,
	`scoreCategory` enum('high_misinformation','questionable','likely_credible','highly_credible') NOT NULL,
	`headlineAnalysis` json,
	`bodyAnalysis` json,
	`evidenceAnalysis` json,
	`redFlags` json,
	`publisherReputation` enum('known','unknown','problematic') NOT NULL,
	`journalisticStandards` enum('met','partially_met','not_met') NOT NULL,
	`potentialBias` enum('left','right','center','mixed') NOT NULL,
	`confirmedByCredibleSources` enum('yes','no','partial') NOT NULL,
	`factCheckerConsensus` enum('true','false','mixed','unverified') NOT NULL,
	`keyFindings` json,
	`recommendations` json,
	`rawAnalysis` text,
	`isSaved` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crossReferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`analysisId` int NOT NULL,
	`factCheckSource` varchar(255) NOT NULL,
	`claimMatched` text,
	`verdict` enum('true','false','mixed','unverified') NOT NULL,
	`sourceUrl` varchar(2048),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crossReferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contentType` enum('url','text') NOT NULL,
	`content` text NOT NULL,
	`title` varchar(500),
	`sourceUrl` varchar(2048),
	`status` enum('pending','analyzing','completed','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `visualVerifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`analysisId` int NOT NULL,
	`imageUrl` varchar(2048) NOT NULL,
	`manipulationDetected` boolean NOT NULL,
	`deepfakeScore` int,
	`metadata` json,
	`findings` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `visualVerifications_id` PRIMARY KEY(`id`)
);
