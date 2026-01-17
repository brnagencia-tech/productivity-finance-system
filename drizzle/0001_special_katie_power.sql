CREATE TABLE `support_ticket_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`userId` int,
	`isFromClient` boolean NOT NULL DEFAULT false,
	`message` text NOT NULL,
	`attachments` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `support_ticket_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `support_tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int,
	`siteId` int,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`status` enum('aberto','em_andamento','enviado_dev','resolvido','fechado') NOT NULL DEFAULT 'aberto',
	`type` enum('erro_bug','duvida','solicitacao','melhoria') NOT NULL DEFAULT 'duvida',
	`channel` enum('whatsapp','email','telefone','sistema') NOT NULL DEFAULT 'sistema',
	`assignedTo` int,
	`dueDate` timestamp,
	`escalatedToDev` boolean NOT NULL DEFAULT false,
	`firstResponseAt` timestamp,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `support_tickets_id` PRIMARY KEY(`id`)
);
