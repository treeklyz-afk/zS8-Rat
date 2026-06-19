import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "../db";
import { storagePut } from "../storage";
import { notifyOwner } from "../_core/notification";
import { nanoid } from "nanoid";

const UploadQrCodeInput = z.object({
  fileName: z.string(),
  fileData: z.string(), // base64 encoded
  mimeType: z.string().default("image/png"),
});

export const qrcodeRouter = router({
  uploadQrCode: protectedProcedure
    .input(UploadQrCodeInput)
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can upload QR codes",
        });
      }

      try {
        // Validate file size (max 5MB)
        const buffer = Buffer.from(input.fileData, "base64");
        const fileSizeInMB = buffer.length / (1024 * 1024);
        if (fileSizeInMB > 5) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "File size must be less than 5MB",
          });
        }

        // Validate MIME type
        if (!input.mimeType.startsWith("image/")) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "File must be an image",
          });
        }

        // Generate unique storage key
        const storageKey = `qr-codes/${Date.now()}_${nanoid(8)}.${input.mimeType.split("/")[1]}`;

        // Upload to S3
        const { url } = await storagePut(storageKey, buffer, input.mimeType);

        // Deactivate previous QR codes
        const previousQrCode = await db.getActiveQrCode();
        if (previousQrCode) {
          // Note: We can't delete from DB directly, but we can mark as inactive
          // For now, we'll just create a new one and the system will use the latest
        }

        // Create QR code record
        await db.createQrCode({
          storageKey,
          url,
          fileName: input.fileName,
          mimeType: input.mimeType,
          fileSize: buffer.length,
          uploadedBy: ctx.user.id,
          isActive: "yes",
        });

        // Update payment config with new QR URL
        await db.updatePaymentConfig({
          staticQrUrl: url,
          staticQrStorageKey: storageKey,
        });

        // Send owner notification
        await notifyOwner({
          title: "📸 QR Code Uploaded",
          content: `New static QR code uploaded: ${input.fileName}`,
        });

        return {
          success: true,
          url,
          storageKey,
          fileName: input.fileName,
        };
      } catch (error) {
        console.error("QR code upload error:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload QR code",
        });
      }
    }),

  getActiveQrCode: protectedProcedure.query(async () => {
    const qrCode = await db.getActiveQrCode();
    if (!qrCode) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No active QR code found",
      });
    }
    return {
      id: qrCode.id,
      url: qrCode.url,
      fileName: qrCode.fileName,
      uploadedAt: qrCode.createdAt,
    };
  }),
});
