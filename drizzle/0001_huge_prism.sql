CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`type` enum('payment_initiated','payment_completed','payment_failed','config_updated') NOT NULL,
	`transactionId` int,
	`isRead` enum('yes','no') NOT NULL DEFAULT 'no',
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`activeMethod` enum('upi_intent','phonepe_merchant','static_qr') NOT NULL DEFAULT 'upi_intent',
	`upiId` varchar(255) DEFAULT '',
	`merchantName` varchar(255) DEFAULT '',
	`phonepeMerchantId` varchar(255) DEFAULT '',
	`staticQrUrl` text DEFAULT (''),
	`staticQrStorageKey` varchar(255) DEFAULT '',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_config_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `qr_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storageKey` varchar(255) NOT NULL,
	`url` text NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`mimeType` varchar(64) NOT NULL DEFAULT 'image/png',
	`fileSize` int NOT NULL,
	`uploadedBy` int,
	`isActive` enum('yes','no') NOT NULL DEFAULT 'yes',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `qr_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `qr_codes_storageKey_unique` UNIQUE(`storageKey`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referenceId` varchar(64) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'INR',
	`paymentMethod` enum('upi_intent','phonepe_merchant','static_qr') NOT NULL,
	`status` enum('initiated','pending','completed','failed','cancelled') NOT NULL DEFAULT 'initiated',
	`upiDeepLink` text DEFAULT (''),
	`qrCodeUrl` text DEFAULT (''),
	`merchantName` varchar(255) DEFAULT '',
	`description` text DEFAULT (''),
	`externalAppId` varchar(64) DEFAULT '',
	`metadata` text DEFAULT ('{}'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `transactions_referenceId_unique` UNIQUE(`referenceId`)
);
