CREATE TABLE `frontend_evaluation_components` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`evaluation_id` int NOT NULL,
	`section_id` varchar(128) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`score` float NOT NULL,
	`feedback` text NOT NULL,
	CONSTRAINT `frontend_evaluation_components_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `frontend_evaluations` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`case_session_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`overall_score` float NOT NULL,
	`overall_feedback` text NOT NULL,
	CONSTRAINT `frontend_evaluations_id` PRIMARY KEY(`id`)
);
