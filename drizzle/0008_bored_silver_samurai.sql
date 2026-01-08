ALTER TABLE `variable_expenses` ADD `expenseType` enum('pessoal','compartilhado','empresa') DEFAULT 'pessoal' NOT NULL;--> statement-breakpoint
ALTER TABLE `variable_expenses` ADD `currency` enum('BRL','USD') DEFAULT 'BRL' NOT NULL;--> statement-breakpoint
ALTER TABLE `variable_expenses` ADD `location` enum('BRN','USA') DEFAULT 'BRN';--> statement-breakpoint
ALTER TABLE `variable_expenses` ADD `sharedWith` json;