CREATE TABLE `frontend_case_sessions` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`case_id` int NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`live_structure` json NOT NULL,
	`state` enum('NOT_STARTED','RUNNING','FINISHED') NOT NULL DEFAULT 'NOT_STARTED',
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `frontend_case_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `frontend_cases` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`case_content` json NOT NULL,
	`case_title` varchar(255) NOT NULL,
	`case_description` varchar(1024) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`difficulty` enum('EASY','MEDIUM','HARD') NOT NULL,
	`sector` enum('TECH','FINANCE','CONSULTING','OTHER'),
	`function` enum('DIGITAL','MARKETING','GROWTH','INVESTMENT','M&A'),
	CONSTRAINT `frontend_cases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `frontend_conversation_components` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`case_session_id` int NOT NULL,
	`type` enum('CANDIDATE','INTERVIEWER','COMMAND','SYSTEM') NOT NULL,
	`section_id` varchar(128) NOT NULL,
	`content` text NOT NULL,
	`is_volatile` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `frontend_conversation_components_id` PRIMARY KEY(`id`)
);
