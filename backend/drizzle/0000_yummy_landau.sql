CREATE TABLE `email_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email_id` int NOT NULL,
	`event` varchar(50) NOT NULL,
	`message` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`recipient` varchar(255) NOT NULL,
	`subject` varchar(500) NOT NULL,
	`body` text NOT NULL,
	`scheduled_at` timestamp NOT NULL,
	`status` enum('SCHEDULED','PROCESSING','SENT','FAILED') NOT NULL DEFAULT 'SCHEDULED',
	`job_id` varchar(255),
	`sent_at` timestamp,
	`error_message` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emails_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `email_logs_email_id_idx` ON `email_logs` (`email_id`);--> statement-breakpoint
CREATE INDEX `emails_user_id_idx` ON `emails` (`user_id`);--> statement-breakpoint
CREATE INDEX `emails_status_idx` ON `emails` (`status`);--> statement-breakpoint
CREATE INDEX `emails_scheduled_at_idx` ON `emails` (`scheduled_at`);