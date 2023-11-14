CREATE TABLE `frontend_video_analysis_components` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`case_session_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`anger_likelihood` enum('UNKNOWN','VERY_UNLIKELY','UNLIKELY','POSSIBLE','LIKELY','VERY_LIKELY'),
	`joy_likelihood` enum('UNKNOWN','VERY_UNLIKELY','UNLIKELY','POSSIBLE','LIKELY','VERY_LIKELY'),
	`surprise_likelihood` enum('UNKNOWN','VERY_UNLIKELY','UNLIKELY','POSSIBLE','LIKELY','VERY_LIKELY'),
	`sorrow_likelihood` enum('UNKNOWN','VERY_UNLIKELY','UNLIKELY','POSSIBLE','LIKELY','VERY_LIKELY'),
	CONSTRAINT `frontend_video_analysis_components_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `frontend_cases` MODIFY COLUMN `sector` enum('TECH','FINANCE','CONSULTING');