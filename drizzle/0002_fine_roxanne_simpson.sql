CREATE TABLE `ticket_status_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`oldStatus` enum('aberto','em_andamento','enviado_dev','resolvido'),
	`newStatus` enum('aberto','em_andamento','enviado_dev','resolvido') NOT NULL,
	`changedBy` int NOT NULL,
	`changedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ticket_status_history_id` PRIMARY KEY(`id`)
);
