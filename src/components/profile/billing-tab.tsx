'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Receipt, CreditCard, RefreshCw, Sparkles, Check, HelpCircle, FileText, Printer, AlertTriangle } from "lucide-react";
import { toggleAutoRenewAction, requestRefundAction } from "@/app/actions/subscription";

export default function StudentBillingTab() {
  const [subscription, setSubscription] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Refund Dialog State
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [refundReason, setRefundReason] = useState("");
  const [submittingRefund, setSubmittingRefund] = useState(false);

  const fetchBillingData = async () => {
    try {
      const res = await fetch('/api/profile/billing');
      const data = await res.json();
      if (data.success) {
        setSubscription(data.subscription || null);
        setOrders(data.orders || []);
        setInvoices(data.invoices || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  const handleToggleAutoRenew = async () => {
    if (!subscription) return;
    const nextState = !subscription.autoRenew;
    const res = await toggleAutoRenewAction(subscription._id || subscription.id, nextState);
    if (res.success) {
      setSubscription((prev: any) => ({ ...prev, autoRenew: nextState }));
    } else {
      alert(res.error || "Failed to update renewal state");
    }
  };

  const handleRequestRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !refundReason.trim()) return;

    setSubmittingRefund(true);
    const res = await requestRefundAction(selectedOrder._id || selectedOrder.id, refundReason.trim());
    if (res.success) {
      alert("Refund request submitted! Under review by administrator.");
      setSelectedOrder(null);
      setRefundReason("");
      fetchBillingData();
    } else {
      alert(res.error || "Refund request failed");
    }
    setSubmittingRefund(false);
  };

  if (loading) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-3">LOADING BILLING HISTORY...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      
      {/* 1. MEMBERSHIP STATUS */}
      <div className="p-6 rounded-[24px] bg-white dark:bg-slate-950/40 border border-slate-200/80 dark:border-white/5 shadow-sm space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-450 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" /> Subscription & Membership
        </h3>
        
        {subscription ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase px-2 py-0.5">
                  Active
                </Badge>
                <span className="text-xs text-slate-400 font-bold">Billing Gateway: {subscription.paymentGateway}</span>
              </div>
              <h4 className="text-xl font-extrabold tracking-tight">Active Membership</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                Your subscription renovates automatically on <span className="text-primary font-bold">{new Date(subscription.renewalDate || subscription.expiryDate).toLocaleDateString()}</span> ({subscription.billingCycle} billing cycle).
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
              <Button 
                onClick={handleToggleAutoRenew}
                className="h-10 text-xs font-bold bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-800 dark:text-white"
              >
                {subscription.autoRenew ? "Disable Auto-Renew" : "Enable Auto-Renew"}
              </Button>
              <Button asChild className="h-10 text-xs font-bold bg-primary text-primary-foreground">
                <a href="/public/pricing">Upgrade Plan</a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-semibold">
              You are currently on the Free Trial/Visitor tier. Subscribe to a membership plan to unlock all verified certificates and course modules.
            </p>
            <Button asChild className="bg-primary text-primary-foreground font-bold text-xs h-10 px-6 rounded-xl">
              <a href="/public/pricing">Explore Membership Plans</a>
            </Button>
          </div>
        )}
      </div>

      {/* 2. TRANSACTION HISTORY */}
      <div className="p-6 rounded-[24px] bg-white dark:bg-slate-950/40 border border-slate-200/80 dark:border-white/5 shadow-sm space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-450 flex items-center gap-2">
          <Receipt className="h-4 w-4 text-primary" /> Purchase & Payment Logs
        </h3>

        {orders.length === 0 ? (
          <p className="text-xs text-slate-400 font-medium py-4 text-center">No transactions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs font-medium border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 text-slate-400 uppercase tracking-wider text-[9px] font-black">
                  <th className="py-3 px-2">Order No</th>
                  <th className="py-3 px-2">Item Type</th>
                  <th className="py-3 px-2">Amount</th>
                  <th className="py-3 px-2">Tax</th>
                  <th className="py-3 px-2">Total</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {orders.map((o) => (
                  <tr key={o._id || o.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                    <td className="py-3.5 px-2 font-bold">{o.orderNumber}</td>
                    <td className="py-3.5 px-2 uppercase font-black text-[10px] text-primary">{o.type}</td>
                    <td className="py-3.5 px-2">{o.amount} INR</td>
                    <td className="py-3.5 px-2">{o.tax} INR</td>
                    <td className="py-3.5 px-2 font-bold">{o.total} INR</td>
                    <td className="py-3.5 px-2">
                      <Badge className={o.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' : o.paymentStatus === 'Refunded' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}>
                        {o.paymentStatus}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-2">
                      {o.paymentStatus === 'Paid' && (
                        <button 
                          onClick={() => setSelectedOrder(o)}
                          className="text-[10px] text-slate-450 hover:text-primary font-bold hover:underline"
                        >
                          Request Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. INVOICES */}
      <div className="p-6 rounded-[24px] bg-white dark:bg-slate-950/40 border border-slate-200/80 dark:border-white/5 shadow-sm space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-450 flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" /> Invoice History
        </h3>

        {invoices.length === 0 ? (
          <p className="text-xs text-slate-400 font-medium py-4 text-center">No invoices generated yet.</p>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => (
              <div key={inv._id || inv.id} className="p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-transparent flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-primary">{inv.invoiceNumber}</span>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    <span>Date: {new Date(inv.createdAt).toLocaleDateString()}</span>
                    {inv.gstNumber && <span className="bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-bold">GST: {inv.gstNumber}</span>}
                    <span>Total: {inv.grandTotal} INR</span>
                  </div>
                </div>
                <Button 
                  onClick={() => window.print()}
                  variant="outline" 
                  className="h-8 text-[10px] font-bold gap-1 rounded-lg border-slate-200"
                >
                  Print <Printer className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* REFUND MODAL DIALOG */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[99999] animate-in fade-in duration-200">
          <form 
            onSubmit={handleRequestRefundSubmit}
            className="w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-sm font-black uppercase tracking-wider">Request Refund</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              Please state the reason why you are requesting a refund for order <span className="font-bold text-slate-900 dark:text-white">{selectedOrder.orderNumber}</span>. Refund requests are subject to approval.
            </p>
            <textarea
              required
              rows={3}
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Provide reason for refund request..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent text-xs font-semibold"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                type="button" 
                onClick={() => setSelectedOrder(null)}
                variant="ghost" 
                className="h-9 px-4 text-xs font-bold rounded-lg"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submittingRefund}
                className="h-9 px-4 bg-primary text-primary-foreground text-xs font-black rounded-lg"
              >
                {submittingRefund ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

// Simple loader helper local import fallback
const Loader2 = ({ className }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
