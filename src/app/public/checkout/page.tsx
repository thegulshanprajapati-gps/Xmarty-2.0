'use client';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Receipt, Tag, AlertCircle, Loader2 } from "lucide-react";
import { createOrderAction, applyCouponAction, verifyPaymentAction } from "@/app/actions/subscription";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = searchParams.get('type') as 'Course' | 'Bundle' | 'Subscription';
  const targetId = searchParams.get('targetId') as string;

  const [itemDetails, setItemDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Billing Form States
  const [gstNumber, setGstNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Coupon States
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");

  // Gateway Selection
  const [gateway, setGateway] = useState<'Razorpay' | 'Stripe' | 'Cashfree'>('Razorpay');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!type || !targetId) {
      router.push('/public/pricing');
      return;
    }

    const fetchItemDetails = async () => {
      try {
        if (type === 'Subscription') {
          const [planId, cycle] = targetId.split(':');
          const res = await fetch('/api/plans');
          const data = await res.json();
          if (data.success) {
            const plan = data.plans.find((p: any) => p.id === planId);
            if (plan) {
              setItemDetails({
                title: `${plan.name} (${cycle === 'yearly' ? 'Yearly' : 'Monthly'})`,
                price: cycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice,
                description: plan.description
              });
            }
          }
        } else {
          // Fallback or course/bundle lookup placeholder
          setItemDetails({
            title: `${type} Enrollment`,
            price: type === 'Course' ? 499 : 999,
            description: `Unlock immediate access to your allotted ${type.toLowerCase()}.`
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [type, targetId, router]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !itemDetails) return;
    setCouponError("");
    const res = await applyCouponAction(couponCode.trim(), itemDetails.price);
    if (res.success) {
      setAppliedCoupon(res);
    } else {
      setCouponError(res.error || "Failed to apply coupon");
      setAppliedCoupon(null);
    }
  };

  const handleCheckout = async () => {
    if (!billingAddress.trim()) {
      alert("Please specify your billing address.");
      return;
    }
    if (!termsAccepted) {
      alert("Please accept the terms and conditions to proceed.");
      return;
    }

    setProcessing(true);
    try {
      const orderRes = await createOrderAction(
        type,
        targetId,
        { gstNumber, companyName, billingAddress },
        appliedCoupon?.couponCode
      );

      if (orderRes.success && orderRes.orderId) {
        // Simulate Gateway Checkout Response (Sandbox/Production verification triggers)
        setTimeout(async () => {
          const verifyRes = await verifyPaymentAction(
            orderRes.orderId,
            `pay_mock_${Date.now()}`,
            `sig_mock_${Date.now()}`
          );

          if (verifyRes.success) {
            router.push('/public/payment/success');
          } else {
            router.push('/public/payment/failed');
          }
        }, 1500);
      } else {
        alert(orderRes.error || "Order initialization failed");
        setProcessing(false);
      }
    } catch (e) {
      console.error(e);
      alert("An unexpected error occurred during checkout");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center bg-[#FAFCFF] dark:bg-[#030712]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-4 animate-pulse">LOADING CHECKOUT DETAILS...</p>
      </div>
    );
  }

  const basePrice = itemDetails?.price || 0;
  const discount = appliedCoupon?.discount || 0;
  const subtotal = basePrice - discount;
  const tax = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + tax;

  return (
    <div className="w-full min-h-screen bg-[#FAFCFF] dark:bg-[#030712] py-20 px-4 relative overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Background radial glows */}
      <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-white/5 pb-6">
          <h1 className="text-3xl font-black tracking-tight font-headline flex items-center gap-2">
            Secure Checkout
          </h1>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Review items and choose payment details</p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* LEFT: Order Summary & Billing */}
          <div className="space-y-6">
            <div className="p-6 rounded-[24px] bg-white dark:bg-slate-950/40 border border-slate-200/80 dark:border-white/5 shadow-sm space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-450 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" /> Order Summary
              </h3>
              <div className="space-y-2 py-2">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{itemDetails?.title}</h4>
                    <p className="text-[10px] text-slate-450 leading-relaxed font-semibold mt-0.5">{itemDetails?.description}</p>
                  </div>
                  <span className="text-xs font-bold shrink-0">{basePrice} INR</span>
                </div>
              </div>

              {/* Coupon Box */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-white/5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Apply Coupon</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ENTER COUPON CODE"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 h-9 px-3 rounded-lg border border-slate-200 dark:border-white/5 bg-transparent text-xs font-bold uppercase tracking-wider"
                  />
                  <Button onClick={handleApplyCoupon} className="h-9 px-4 text-xs font-bold bg-slate-200 dark:bg-white/10 hover:bg-slate-350 dark:hover:bg-white/15 text-slate-800 dark:text-white border border-transparent dark:border-white/5">
                    Apply
                  </Button>
                </div>
                {appliedCoupon && (
                  <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1.5">
                    <Tag className="h-3 w-3" /> Coupon applied: Saved {appliedCoupon.discount} INR!
                  </span>
                )}
                {couponError && (
                  <span className="text-[10px] text-red-500 font-bold flex items-center gap-1.5">
                    <AlertCircle className="h-3 w-3" /> {couponError}
                  </span>
                )}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-white/5 text-xs font-medium">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span>{basePrice} INR</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-500">
                    <span>Discount</span>
                    <span>-{discount} INR</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>GST (18%)</span>
                  <span>{tax} INR</span>
                </div>
                <div className="flex justify-between text-sm font-black pt-2 border-t border-slate-100 dark:border-white/5 text-slate-900 dark:text-white">
                  <span>Grand Total</span>
                  <span>{grandTotal} INR</span>
                </div>
              </div>
            </div>

            {/* Billing Details */}
            <div className="p-6 rounded-[24px] bg-white dark:bg-slate-950/40 border border-slate-200/80 dark:border-white/5 shadow-sm space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-450">Billing Address & GST</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Billing Address *</span>
                  <textarea
                    rows={2}
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    placeholder="Enter complete billing address"
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-white/5 bg-transparent text-xs font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">GST Number (Optional)</span>
                    <input
                      type="text"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value)}
                      placeholder="e.g. 22AAAAA0000A1Z5"
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-white/5 bg-transparent text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Company Name (Optional)</span>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Corp"
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-white/5 bg-transparent text-xs font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Payment Gateway Selection */}
          <div className="space-y-6">
            <div className="p-6 rounded-[24px] bg-white dark:bg-slate-950/40 border border-slate-200/80 dark:border-white/5 shadow-sm space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-450">Payment Method</h3>
              
              <div className="space-y-3">
                {[
                  { id: 'Razorpay', label: 'Razorpay (Cards, UPI, Netbanking)', desc: 'Pay securely using local Indian UPI modes.' },
                  { id: 'Stripe', label: 'Stripe (Credit / Debit Cards)', desc: 'International visa and master cards processes.' },
                  { id: 'Cashfree', label: 'Cashfree Pay', desc: 'Secure direct merchant payment gateways.' }
                ].map((g: any) => (
                  <label 
                    key={g.id} 
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${gateway === g.id ? 'border-primary bg-primary/[0.02]' : 'border-slate-150 dark:border-white/5 hover:border-slate-300'}`}
                  >
                    <input
                      type="radio"
                      name="gateway"
                      value={g.id}
                      checked={gateway === g.id}
                      onChange={() => setGateway(g.id)}
                      className="mt-1 accent-primary"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-white block">{g.label}</span>
                      <span className="text-[10px] text-slate-450 leading-relaxed block">{g.desc}</span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2.5 pt-2 text-[10px] text-slate-450 font-semibold tracking-wide cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 accent-primary"
                />
                <span>I accept the membership policies, refund rules, and terms of service.</span>
              </label>

              {/* Action Button */}
              <div className="pt-4 space-y-3">
                <Button 
                  onClick={handleCheckout} 
                  disabled={processing}
                  className="w-full h-11 bg-primary text-primary-foreground text-xs font-black rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" /> Processing Checkout...
                    </>
                  ) : (
                    <>
                      Pay {grandTotal} INR <ShieldCheck className="h-4 w-4" />
                    </>
                  )}
                </Button>
                <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" /> SECURE 256-BIT SSL ENCRYPTION
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
