CREATE TABLE `frontend_conversation_evaluation_components` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`case_session_id` int NOT NULL,
	`content` text NOT NULL,
	`speech_clarity` int NOT NULL,
	`speech_speed` int NOT NULL,
	CONSTRAINT `frontend_conversation_evaluation_components_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `frontend_conversation_components` MODIFY COLUMN `type` enum('CANDIDATE','INTERVIEWER','COMMAND','SYSTEM','UNDEFINED') NOT NULL;