'use client';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Receipt, Tag, AlertCircle, Loader2, Sparkles, HelpCircle, Lock } from "lucide-react";
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

    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/checkout/item-details?type=${type}&targetId=${targetId}`);
        const data = await res.json();
        if (data.success && data.details) {
          const det = data.details;
          let calculatedPrice = det.price;
          let title = det.title;

          if (type === 'Subscription') {
            const [, cycle] = targetId.split(':');
            calculatedPrice = cycle === 'yearly' ? det.yearlyPrice : det.monthlyPrice;
            title = `${det.title} (${cycle === 'yearly' ? 'Yearly' : 'Monthly'})`;
          }

          setItemDetails({
            title,
            description: det.description,
            price: calculatedPrice || 499,
            thumbnail: det.thumbnail,
            category: det.category
          });
        } else {
          // Fallback if not found
          setItemDetails({
            title: `${type} Enrollment`,
            price: type === 'Course' ? 499 : 999,
            description: 'Gain immediate entry with verified certification pathways.',
            thumbnail: `https://picsum.photos/seed/${targetId}/800/600`,
            category: type
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
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
        }, 1800);
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
      <div className="w-full min-h-[85vh] flex flex-col items-center justify-center bg-[#FAFCFF] dark:bg-[#030712] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px] pointer-events-none animate-pulse" />
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-4 animate-pulse uppercase tracking-widest">Constructing Checkout Workspace...</p>
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
      
      {/* Decorative background vectors/gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[130px] pointer-events-none" />
      
      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-10 relative z-10">
        
        {/* Header Block */}
        <div className="space-y-2 border-b border-slate-200/60 dark:border-white/5 pb-6">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded font-black text-[9px] uppercase tracking-wider">
              Secure Gateway
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-headline">
            Checkout Workspace
          </h1>
          <p className="text-xs text-slate-450 font-semibold uppercase tracking-wider">Review items, apply promo codes, and complete transaction</p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT/MID PANELS: Item Preview, Coupons, Billing details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Interactive Item Preview Card */}
            <div className="rounded-[24px] bg-white dark:bg-slate-950/40 border border-slate-200/80 dark:border-white/5 p-6 shadow-sm space-y-5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Purchasing Item</span>
              
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                <div className="relative w-full sm:w-40 aspect-video rounded-2xl overflow-hidden border border-slate-150 dark:border-white/5 shadow-inner shrink-0 bg-slate-100 dark:bg-slate-900">
                  <img 
                    src={itemDetails?.thumbnail}
                    alt={itemDetails?.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <Badge className="bg-primary text-primary-foreground border-none text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow">
                      {itemDetails?.category}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1.5 flex-1 text-left">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">{itemDetails?.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-2">
                    {itemDetails?.description}
                  </p>
                  <div className="flex items-center gap-1.5 pt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" /> Lifetime access & verification certificate included
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Coupon Campaign Box */}
            <div className="rounded-[24px] bg-white dark:bg-slate-950/40 border border-slate-200/80 dark:border-white/5 p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Promotional Coupons</span>
                <span className="text-[9px] text-primary font-bold uppercase tracking-wider">Try: WELCOME10</span>
              </div>
              
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ENTER DISCOUNT PROMO CODE"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-white/5 bg-transparent text-xs font-bold uppercase tracking-wider outline-none focus:border-primary/45 transition-colors"
                  />
                </div>
                <Button onClick={handleApplyCoupon} className="h-10 px-5 text-xs font-black bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-800 dark:text-white border border-transparent dark:border-white/5 rounded-xl">
                  Apply
                </Button>
              </div>

              {appliedCoupon && (
                <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1.5 bg-emerald-500/[0.04] p-2.5 rounded-lg border border-emerald-500/20">
                  <Sparkles className="h-3.5 w-3.5" /> Coupon Campaign Active: Saved {appliedCoupon.discount} INR off!
                </span>
              )}
              {couponError && (
                <span className="text-[10px] text-red-500 font-bold flex items-center gap-1.5 bg-red-500/[0.04] p-2.5 rounded-lg border border-red-500/20">
                  <AlertCircle className="h-3.5 w-3.5" /> {couponError}
                </span>
              )}
            </div>

            {/* 3. Address & Corporate GST Billing Details */}
            <div className="rounded-[24px] bg-white dark:bg-slate-950/40 border border-slate-200/80 dark:border-white/5 p-6 shadow-sm space-y-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Billing & Location Details</span>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Complete Billing Address *</span>
                  <textarea
                    rows={2}
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    placeholder="Enter complete billing/shipping street address details"
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/5 bg-transparent text-xs font-semibold"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">GST Number (Optional)</span>
                    <input
                      type="text"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value)}
                      placeholder="e.g. 22AAAAA0000A1Z5"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/5 bg-transparent text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Company Name (Optional)</span>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Corporation Ltd"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/5 bg-transparent text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT PANELS: Billing summary, Gateway selector and pay action */}
          <div className="space-y-6">
            
            {/* 4. Real-time Invoice Price Breakup */}
            <div className="rounded-[24px] bg-white dark:bg-slate-950/40 border border-slate-200/80 dark:border-white/5 p-6 shadow-sm space-y-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Invoice Summary</span>
              
              <div className="space-y-2.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Base Amount</span>
                  <span>{basePrice} INR</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-500 font-bold">
                    <span>Promo Coupon Discount</span>
                    <span>-{discount} INR</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>IGST / CGST (18%)</span>
                  <span>{tax} INR</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2.5 border-t border-slate-100 dark:border-white/5">
                  <span>Grand Total (INR)</span>
                  <span>{grandTotal} INR</span>
                </div>
              </div>
            </div>

            {/* 5. Payments Execution Gateway Selection */}
            <div className="rounded-[24px] bg-white dark:bg-slate-950/40 border border-slate-200/80 dark:border-white/5 p-6 shadow-sm space-y-5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-headline">Select Payment Gateway</span>
              
              <div className="space-y-3">
                {[
                  { id: 'Razorpay', title: 'Razorpay Secure', subtitle: 'UPI / Cards / Netbanking' },
                  { id: 'Stripe', title: 'Stripe Pay', subtitle: 'International Visa & Master Cards' },
                  { id: 'Cashfree', title: 'Cashfree Merchant', subtitle: 'Direct Netbanking Gateways' }
                ].map((g: any) => (
                  <label 
                    key={g.id} 
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${gateway === g.id ? 'border-primary bg-primary/[0.03]' : 'border-slate-150 dark:border-white/5 hover:border-slate-300'}`}
                  >
                    <input
                      type="radio"
                      name="gateway"
                      value={g.id}
                      checked={gateway === g.id}
                      onChange={() => setGateway(g.id)}
                      className="mt-1 accent-primary"
                    />
                    <div className="space-y-0.5 text-left">
                      <span className="text-xs font-black text-slate-800 dark:text-white block">{g.title}</span>
                      <span className="text-[10px] text-slate-450 leading-relaxed font-semibold block">{g.subtitle}</span>
                    </div>
                  </label>
                ))}
              </div>

              {/* T&C Verification */}
              <label className="flex items-start gap-2.5 pt-2 text-[10px] text-slate-450 font-bold tracking-wide cursor-pointer text-left">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 accent-primary"
                />
                <span>I accept terms of enrollment and initial billing cycles policy parameters.</span>
              </label>

              {/* Pay trigger */}
              <div className="pt-2 space-y-3">
                <Button 
                  onClick={handleCheckout} 
                  disabled={processing}
                  className="w-full h-11 bg-primary text-primary-foreground text-xs font-black rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" /> Constructing Checkout...
                    </>
                  ) : (
                    <>
                      Pay {grandTotal} INR <Lock className="h-3.5 w-3.5" />
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
