import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { Loader2, AlertCircle, CheckCircle2, Settings, CreditCard, Upload } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { QrUploadDialog } from "@/components/QrUploadDialog";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [activeMethod, setActiveMethod] = useState("upi_intent");
  const [upiId, setUpiId] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [phonepeMerchantId, setPhonepeMerchantId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  const getConfig = trpc.payment.getConfig.useQuery();
  const updateConfig = trpc.payment.updateConfig.useMutation();
  const getTransactions = trpc.payment.getTransactions.useQuery({ limit: 20, offset: 0 });
  const updateTransactionStatus = trpc.payment.updateTransactionStatus.useMutation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    if (user?.role !== "admin") {
      navigate("/");
      return;
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (getConfig.data) {
      setActiveMethod(getConfig.data.activeMethod);
      setUpiId(getConfig.data.upiId || "");
      setMerchantName(getConfig.data.merchantName || "");
      setPhonepeMerchantId(getConfig.data.phonepeMerchantId || "");
      setIsLoading(false);
    }
  }, [getConfig.data]);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      await updateConfig.mutateAsync({
        activeMethod: activeMethod as any,
        upiId,
        merchantName,
        phonepeMerchantId,
      });
      toast.success("Configuration updated successfully");
      getConfig.refetch();
    } catch (error) {
      toast.error("Failed to update configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (referenceId: string, newStatus: string) => {
    try {
      await updateTransactionStatus.mutateAsync({
        referenceId,
        status: newStatus as any,
      });
      toast.success("Transaction status updated");
      getTransactions.refetch();
    } catch (error) {
      toast.error("Failed to update transaction status");
    }
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800 border-red-500/30 p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white text-center mb-2">Access Denied</h2>
          <p className="text-slate-400 text-center">Only admins can access this panel</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="border-b border-cyan-500/10 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-6 h-6 text-cyan-400" />
            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          </div>
          <p className="text-slate-400">Manage payment configuration and transactions</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-purple-400" />
            Payment Configuration
          </h2>

          {isLoading ? (
            <Card className="bg-slate-800 border-slate-700 p-8 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mr-2" />
              <span className="text-slate-300">Loading configuration...</span>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-cyan-500/20 p-6">
                <h3 className="text-lg font-bold text-white mb-6">Payment Method</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-300 mb-2 block">Active Method</Label>
                    <Select value={activeMethod} onValueChange={setActiveMethod}>
                      <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="upi_intent">UPI Intent</SelectItem>
                        <SelectItem value="phonepe_merchant">PhonePe Merchant</SelectItem>
                        <SelectItem value="static_qr">Static QR Code</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-slate-300 mb-2 block">Merchant Name</Label>
                    <Input
                      value={merchantName}
                      onChange={(e) => setMerchantName(e.target.value)}
                      placeholder="Your merchant name"
                      className="bg-slate-900 border-slate-700 text-white placeholder-slate-500"
                    />
                  </div>

                  {activeMethod === "upi_intent" && (
                    <div>
                      <Label className="text-slate-300 mb-2 block">UPI ID</Label>
                      <Input
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="merchant@upi"
                        className="bg-slate-900 border-slate-700 text-white placeholder-slate-500"
                      />
                    </div>
                  )}

                  {activeMethod === "phonepe_merchant" && (
                    <div>
                      <Label className="text-slate-300 mb-2 block">PhonePe Merchant ID</Label>
                      <Input
                        value={phonepeMerchantId}
                        onChange={(e) => setPhonepeMerchantId(e.target.value)}
                        placeholder="MERCHANT123456"
                        className="bg-slate-900 border-slate-700 text-white placeholder-slate-500"
                      />
                    </div>
                  )}

                  {activeMethod === "static_qr" && (
                    <div>
                      <Label className="text-slate-300 mb-2 block">Static QR Code</Label>
                      <Button
                        onClick={() => setQrDialogOpen(true)}
                        variant="outline"
                        className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload QR Code Image
                      </Button>
                    </div>
                  )}

                  <Button
                    onClick={handleSaveConfig}
                    disabled={isSaving}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-bold"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Save Configuration
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-cyan-500/20 p-6">
                <h3 className="text-lg font-bold text-white mb-6">Current Status</h3>
                <div className="space-y-4">
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <p className="text-slate-400 text-sm mb-1">Active Method</p>
                    <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                      {activeMethod === "upi_intent" && "UPI Intent"}
                      {activeMethod === "phonepe_merchant" && "PhonePe Merchant"}
                      {activeMethod === "static_qr" && "Static QR Code"}
                    </Badge>
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <p className="text-slate-400 text-sm mb-1">Merchant Name</p>
                    <p className="text-white font-mono">{merchantName || "Not set"}</p>
                  </div>

                  {activeMethod === "upi_intent" && (
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                      <p className="text-slate-400 text-sm mb-1">UPI ID</p>
                      <p className="text-white font-mono text-sm break-all">{upiId || "Not set"}</p>
                    </div>
                  )}

                  {activeMethod === "phonepe_merchant" && (
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                      <p className="text-slate-400 text-sm mb-1">PhonePe Merchant ID</p>
                      <p className="text-white font-mono text-sm break-all">{phonepeMerchantId || "Not set"}</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Recent Transactions</h2>

          {getTransactions.isLoading ? (
            <Card className="bg-slate-800 border-slate-700 p-8 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mr-2" />
              <span className="text-slate-300">Loading transactions...</span>
            </Card>
          ) : getTransactions.data && getTransactions.data.length > 0 ? (
            <Card className="bg-slate-800/50 border-slate-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-900/50">
                    <TableRow className="border-slate-700/50">
                      <TableHead className="text-cyan-300">Reference ID</TableHead>
                      <TableHead className="text-cyan-300">Amount</TableHead>
                      <TableHead className="text-cyan-300">Method</TableHead>
                      <TableHead className="text-cyan-300">Status</TableHead>
                      <TableHead className="text-cyan-300">Created</TableHead>
                      <TableHead className="text-cyan-300">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getTransactions.data.map((tx: any) => (
                      <TableRow key={tx.id} className="border-slate-700/50 hover:bg-slate-900/30">
                        <TableCell className="font-mono text-sm text-cyan-300">{tx.referenceId}</TableCell>
                        <TableCell className="text-white font-bold">₹{tx.amount}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-purple-300 border-purple-500/30">
                            {tx.paymentMethod === "upi_intent" && "UPI"}
                            {tx.paymentMethod === "phonepe_merchant" && "PhonePe"}
                            {tx.paymentMethod === "static_qr" && "QR"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              tx.status === "completed"
                                ? "bg-green-600 text-white"
                                : tx.status === "failed"
                                ? "bg-red-600 text-white"
                                : tx.status === "initiated"
                                ? "bg-yellow-600 text-white"
                                : "bg-blue-600 text-white"
                            }
                          >
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-400 text-sm">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Select
                            onValueChange={(value) => handleStatusChange(tx.referenceId, value)}
                            defaultValue={tx.status}
                          >
                            <SelectTrigger className="w-24 h-8 bg-slate-900 border-slate-600 text-white text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-700">
                              <SelectItem value="initiated">Initiated</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="failed">Failed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          ) : (
            <Card className="bg-slate-800 border-slate-700 p-8 text-center">
              <p className="text-slate-400">No transactions yet</p>
            </Card>
          )}
        </div>
      </div>

      <QrUploadDialog
        open={qrDialogOpen}
        onOpenChange={setQrDialogOpen}
        onSuccess={() => {
          getConfig.refetch();
          toast.success("QR code updated");
        }}
      />
    </div>
  );
}
