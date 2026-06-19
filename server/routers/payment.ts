import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import * as db from "../db";
import { notifyOwner } from "../_core/notification";
import QRCode from "qrcode";

const InitiatePaymentInput = z.object({
  amount: z.number().positive(),
  description: z.string().optional(),
  externalAppId: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

const UpdateConfigInput = z.object({
  activeMethod: z.enum(["upi_intent", "phonepe_merchant", "static_qr"]).optional(),
  upiId: z.string().optional(),
  merchantName: z.string().optional(),
  phonepeMerchantId: z.string().optional(),
});

function generateReferenceId(): string {
  return `TXN_${Date.now()}_${nanoid(8)}`;
}

async function generateUpiDeepLink(
  upiId: string,
  amount: number,
  merchantName: string,
  referenceId: string
): Promise<string> {
  const encodedName = encodeURIComponent(merchantName);
  const description = encodeURIComponent(`Payment for ${referenceId}`);
  return `upi://pay?pa=${upiId}&pn=${encodedName}&am=${amount}&tn=${description}&tr=${referenceId}&cu=INR`;
}

async function generateQrCode(upiDeepLink: string): Promise<string> {
  try {
    const qrDataUrl = await QRCode.toDataURL(upiDeepLink, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: 300,
      margin: 1,
      color: { dark: "#000000", light: "#FFFFFF" },
    });
    return qrDataUrl;
  } catch (error) {
    console.error("QR Code generation error:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to generate QR code",
    });
  }
}

export const paymentRouter = router({
  getConfig: publicProcedure.query(async () => {
    const config = await db.getPaymentConfig();
    if (!config) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Payment configuration not found",
      });
    }
    return {
      activeMethod: config.activeMethod,
      upiId: config.upiId,
      merchantName: config.merchantName,
      phonepeMerchantId: config.phonepeMerchantId,
      staticQrUrl: config.staticQrUrl,
    };
  }),

  initiatePayment: publicProcedure
    .input(InitiatePaymentInput)
    .mutation(async ({ input }) => {
      const config = await db.getPaymentConfig();
      if (!config) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Payment configuration not available",
        });
      }

      const referenceId = generateReferenceId();
      const amount = parseFloat(input.amount.toFixed(2));
      const activeMethod = config.activeMethod as string;

      let upiDeepLink = "";
      let qrCodeUrl = "";
      let paymentMethod = activeMethod;

      try {
        if (activeMethod === "upi_intent") {
          if (!config.upiId) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "UPI ID not configured",
            });
          }
          upiDeepLink = await generateUpiDeepLink(
            config.upiId,
            amount,
            config.merchantName || "CyberPay",
            referenceId
          );
          qrCodeUrl = await generateQrCode(upiDeepLink);
        } else if (activeMethod === "phonepe_merchant") {
          if (!config.phonepeMerchantId) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "PhonePe Merchant ID not configured",
            });
          }
          paymentMethod = "phonepe_merchant";
        } else if (activeMethod === "static_qr") {
          if (!config.staticQrUrl) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Static QR code not configured",
            });
          }
          qrCodeUrl = config.staticQrUrl;
          paymentMethod = "static_qr";
        }

        await db.createTransaction({
          referenceId,
          amount: amount.toString() as any,
          currency: "INR",
          paymentMethod: paymentMethod as any,
          status: "initiated",
          upiDeepLink,
          qrCodeUrl,
          merchantName: config.merchantName,
          description: input.description,
          externalAppId: input.externalAppId,
          metadata: JSON.stringify(input.metadata || {}),
        });

        await notifyOwner({
          title: "💳 Payment Initiated",
          content: `New payment of ₹${amount} initiated (${referenceId}). Method: ${activeMethod}`,
        });

        return {
          success: true,
          referenceId,
          amount,
          currency: "INR",
          paymentMethod: activeMethod,
          upiDeepLink,
          qrCodeUrl,
          status: "initiated",
        };
      } catch (error) {
        console.error("Payment initiation error:", error);
        throw error;
      }
    }),

  verifyTransaction: publicProcedure
    .input(z.object({ referenceId: z.string() }))
    .query(async ({ input }) => {
      const transaction = await db.getTransaction(input.referenceId);
      if (!transaction) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transaction not found",
        });
      }
      return {
        referenceId: transaction.referenceId,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        paymentMethod: transaction.paymentMethod,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      };
    }),

  getTransactions: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can view all transactions",
        });
      }
      return await db.getAllTransactions(input.limit, input.offset);
    }),

  updateTransactionStatus: protectedProcedure
    .input(
      z.object({
        referenceId: z.string(),
        status: z.enum(["initiated", "pending", "completed", "failed", "cancelled"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update transaction status",
        });
      }

      const transaction = await db.getTransaction(input.referenceId);
      if (!transaction) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transaction not found",
        });
      }

      await db.updateTransactionStatus(input.referenceId, input.status);

      await notifyOwner({
        title: "📊 Transaction Status Updated",
        content: `Transaction ${input.referenceId} status changed to ${input.status}`,
      });

      return { success: true, status: input.status };
    }),

  updateConfig: protectedProcedure
    .input(UpdateConfigInput)
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update payment configuration",
        });
      }

      const updateData: any = {};
      if (input.activeMethod) updateData.activeMethod = input.activeMethod;
      if (input.upiId !== undefined) updateData.upiId = input.upiId;
      if (input.merchantName !== undefined) updateData.merchantName = input.merchantName;
      if (input.phonepeMerchantId !== undefined) updateData.phonepeMerchantId = input.phonepeMerchantId;

      await db.updatePaymentConfig(updateData);

      await notifyOwner({
        title: "⚙️ Payment Config Updated",
        content: `Payment configuration updated. Active method: ${input.activeMethod || "unchanged"}`,
      });

      return { success: true, ...updateData };
    }),
});
