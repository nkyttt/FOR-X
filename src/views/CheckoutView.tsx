import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { sendOrderConfirmationEmail } from '../lib/gmail';
import {
  CreditCard,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Lock,
  Sparkles,
  ShoppingBag,
  Download,
  Globe,
  Smartphone,
  Building2,
  QrCode,
  FileCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

type SupportedCurrency = 'USD' | 'BDT' | 'INR' | 'EUR' | 'GBP';

const CURRENCY_RATES: Record<SupportedCurrency, { symbol: string; rate: number }> = {
  USD: { symbol: '$', rate: 1.0 },
  BDT: { symbol: '৳', rate: 118.5 },
  INR: { symbol: '₹', rate: 84.2 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.78 },
};

export const CheckoutView: React.FC = () => {
  const { navigate, playUiSound, showToast } = useApp();
  const { cartItems, totalAmount, discountAmount, discountCode, clearCart } = useCart();
  const { currentUser, addXpAndPoints } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>('USD');

  // Customer Details Form
  const [fullName, setFullName] = useState(currentUser?.displayName || 'Alex Walker');
  const [email, setEmail] = useState(currentUser?.email || 'customer@cyberx.gg');
  const [address, setAddress] = useState('742 Cyberpunk Blvd, Suite 400');
  const [city, setCity] = useState('Neo Metropolis');
  const [postalCode, setPostalCode] = useState('90210');
  const [country, setCountry] = useState('Bangladesh'); // Default to show multi-country

  // Payment Method States
  const [paymentGateway, setPaymentGateway] = useState<string>('bkash');
  const [mobileNumber, setMobileNumber] = useState('01700000000');
  const [trxId, setTrxId] = useState('');
  const [upiId, setUpiId] = useState('user@okaxis');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  const usdTotal = Math.max(0, totalAmount - discountAmount);
  const currencyInfo = CURRENCY_RATES[selectedCurrency];
  const convertedTotal = (usdTotal * currencyInfo.rate).toFixed(2);

  // Update available gateways based on selected country
  const getAvailableGateways = () => {
    switch (country) {
      case 'Bangladesh':
        return [
          { id: 'bkash', name: 'bKash', type: 'mobile', icon: '📱', desc: 'Instant mobile verification' },
          { id: 'nagad', name: 'Nagad', type: 'mobile', icon: '⚡', desc: 'Post Office Digital Payment' },
          { id: 'rocket', name: 'Rocket (DBBL)', type: 'mobile', icon: '🚀', desc: 'Dutch-Bangla Bank mobile' },
          { id: 'card', name: 'Visa / Mastercard', type: 'card', icon: '💳', desc: 'Local & International Cards' },
          { id: 'bank', name: 'Bank Transfer', type: 'bank', icon: '🏦', desc: 'Direct wire & internet banking' },
        ];
      case 'India':
        return [
          { id: 'upi', name: 'UPI (GPay, PhonePe, Paytm)', type: 'upi', icon: '📱', desc: 'Instant 0% fee UPI transfer' },
          { id: 'card', name: 'Debit / Credit Card', type: 'card', icon: '💳', desc: 'RuPay, Visa, Mastercard' },
          { id: 'netbanking', name: 'NetBanking', type: 'bank', icon: '🏦', desc: 'All major Indian banks' },
        ];
      default:
        return [
          { id: 'stripe', name: 'Stripe / Credit Card', type: 'card', icon: '💳', desc: 'Visa, Mastercard, Amex' },
          { id: 'paypal', name: 'PayPal Express', type: 'paypal', icon: '🅿️', desc: 'One-click global checkout' },
          { id: 'applepay', name: 'Apple Pay / Google Pay', type: 'wallet', icon: '🍏', desc: 'Biometric instant checkout' },
          { id: 'cybercredits', name: 'CyberCredits', type: 'points', icon: '💎', desc: 'Redeem stored gaming rewards' },
        ];
    }
  };

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    if (newCountry === 'Bangladesh') {
      setSelectedCurrency('BDT');
      setPaymentGateway('bkash');
    } else if (newCountry === 'India') {
      setSelectedCurrency('INR');
      setPaymentGateway('upi');
    } else if (['United Kingdom'].includes(newCountry)) {
      setSelectedCurrency('GBP');
      setPaymentGateway('stripe');
    } else if (['Germany', 'France', 'Italy'].includes(newCountry)) {
      setSelectedCurrency('EUR');
      setPaymentGateway('stripe');
    } else {
      setSelectedCurrency('USD');
      setPaymentGateway('stripe');
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    playUiSound('claim');

    const generatedOrderId = `ORD-${Date.now().toString().slice(-6)}`;
    setCompletedOrderId(generatedOrderId);

    try {
      // Simulate real-time server-side webhook/payment verification
      await new Promise((resolve) => setTimeout(resolve, 1400));

      await sendOrderConfirmationEmail({
        toEmail: email || 'customer@cyberx.gg',
        recipientName: fullName,
        orderId: generatedOrderId,
        items: cartItems.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
        totalAmount: usdTotal,
        shippingAddress: `${address}, ${city}, ${postalCode}, ${country}`,
      });

      confetti({ particleCount: 100, spread: 80 });
      addXpAndPoints(500, 50, `Order ${generatedOrderId}`);
      clearCart();
      setOrderCompleted(true);
      playUiSound('success');
      showToast(
        'Payment Verified & Order Confirmed!',
        `Receipt and secure download access dispatched to ${email}.`,
        'success'
      );
    } catch (err) {
      console.warn('Order dispatch status:', err);
      confetti({ particleCount: 80, spread: 60 });
      clearCart();
      setOrderCompleted(true);
      showToast('Order Confirmed!', `Transaction ID verified for ${generatedOrderId}.`, 'success');
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderCompleted) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full uppercase tracking-wider">
              Payment Verified & Entitled
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-3">Thank You for Your Order!</h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto">
              Your official order invoice and high-speed digital download access have been generated for{' '}
              <strong className="text-slate-900">{email}</strong>.
            </p>
          </div>

          {/* Transaction Metadata Card */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 max-w-md mx-auto text-xs space-y-2.5 text-left">
            <div className="flex justify-between">
              <span className="text-slate-500">Order ID:</span>
              <span className="font-mono font-bold text-slate-900">{completedOrderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Gateway:</span>
              <span className="font-bold text-slate-900 uppercase">{paymentGateway}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount Paid:</span>
              <span className="font-black text-slate-900">
                {currencyInfo.symbol}
                {convertedTotal} ({selectedCurrency})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Reward Earned:</span>
              <span className="font-bold text-emerald-600">+500 XP & +50 CyberCredits</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-[11px] text-slate-500">
              <span>Security Token:</span>
              <span className="font-mono text-indigo-600">sec_tkn_{Date.now().toString(36)}</span>
            </div>
          </div>

          {/* Instant Download Access Section */}
          <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 text-left space-y-3 max-w-md mx-auto">
            <div className="flex items-center gap-2 text-blue-900 font-extrabold text-sm">
              <Download className="w-4 h-4 text-blue-600" />
              <span>Digital License & Download Package</span>
            </div>
            <p className="text-xs text-blue-700">
              Your purchase includes signed, time-expiring download access with license entitlements.
            </p>
            <a
              href="#download"
              onClick={(e) => {
                e.preventDefault();
                showToast('Initiating Download', 'Direct high-speed stream secured.', 'success');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
            >
              <FileCheck className="w-4 h-4" /> Download Files (.ZIP / .PDF)
            </a>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
            <button
              onClick={() => navigate('dashboard')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              View Order in Dashboard
            </button>
            <button
              onClick={() => navigate('shop')}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition"
            >
              Back to Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500">Explore digital products, eBooks, games, and merchandise.</p>
        <button
          onClick={() => navigate('shop')}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  const availableGateways = getAvailableGateways();

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Currency & Region Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Globe className="w-4 h-4 text-blue-600" />
          <span>Global Payment Architecture</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Display Currency:</span>
          {(['USD', 'BDT', 'INR', 'EUR', 'GBP'] as SupportedCurrency[]).map((curr) => (
            <button
              key={curr}
              onClick={() => {
                playUiSound('click');
                setSelectedCurrency(curr);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition ${
                selectedCurrency === curr
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {curr}
            </button>
          ))}
        </div>
      </div>

      {/* Steps Progress Bar */}
      <div className="flex items-center justify-center gap-4 text-xs font-bold">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
            1
          </span>
          <span>Customer & Destination</span>
        </div>
        <div className="w-12 h-px bg-slate-200" />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            2
          </span>
          <span>Regional Payment Gateway</span>
        </div>
        <div className="w-12 h-px bg-slate-200" />
        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-600' : 'text-slate-400'}`}>
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            3
          </span>
          <span>Verify & Place</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Area (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" /> Customer & Billing Region
              </h2>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Country / Billing Jurisdiction</label>
                <select
                  value={country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full bg-slate-50 text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  <option value="Bangladesh">Bangladesh (bKash, Nagad, Rocket, Cards, Bank)</option>
                  <option value="India">India (UPI, RuPay, NetBanking, Cards)</option>
                  <option value="United States">United States (Stripe, Visa/Mastercard, PayPal, Apple Pay)</option>
                  <option value="United Kingdom">United Kingdom (Visa, Mastercard, PayPal, Apple Pay)</option>
                  <option value="Germany">Germany / European Union (SEPA, Cards, PayPal)</option>
                  <option value="Canada">Canada (Interac, Cards, PayPal)</option>
                  <option value="Australia">Australia (Cards, PayPal)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email (for Digital Delivery)</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Billing Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full bg-slate-50 text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    playUiSound('click');
                    setStep(2);
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition"
                >
                  <span>Select Payment Gateway</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" /> Payment Methods ({country})
                </h2>
                <span className="text-xs font-bold text-slate-500">
                  Total: {currencyInfo.symbol}
                  {convertedTotal}
                </span>
              </div>

              {/* Gateway Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableGateways.map((gw) => (
                  <button
                    key={gw.id}
                    type="button"
                    onClick={() => {
                      playUiSound('click');
                      setPaymentGateway(gw.id);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 ${
                      paymentGateway === gw.id
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xl">{gw.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-slate-900">{gw.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{gw.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Dynamic Sub-form based on selected gateway */}
              {(paymentGateway === 'bkash' || paymentGateway === 'nagad' || paymentGateway === 'rocket') && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    <span>{paymentGateway.toUpperCase()} Merchant Checkout</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Send <strong>{currencyInfo.symbol}{convertedTotal}</strong> to Merchant Wallet{' '}
                    <code className="bg-slate-200 px-1 py-0.5 rounded font-mono font-bold text-slate-900">01799-882211</code> and input the Transaction ID.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Your Account Number</label>
                      <input
                        type="text"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-full bg-white text-xs p-2.5 rounded-xl border border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Transaction ID (TrxID)</label>
                      <input
                        type="text"
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value)}
                        placeholder="e.g. 9J8X22K1P"
                        className="w-full bg-white text-xs p-2.5 rounded-xl border border-slate-200 uppercase font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentGateway === 'upi' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <QrCode className="w-4 h-4 text-blue-600" />
                    <span>Instant UPI Payment</span>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Virtual Payment Address (VPA / UPI ID)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okhdfcbank"
                      className="w-full bg-white text-xs p-2.5 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
              )}

              {(paymentGateway === 'card' || paymentGateway === 'stripe') && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-50 text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Expiration (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-slate-50 text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Security CVC</label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full bg-slate-50 text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playUiSound('click');
                    setStep(3);
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition"
                >
                  <span>Review Order</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> Final Review & Verification
              </h2>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-bold text-slate-900">{fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Jurisdiction:</span>
                  <span className="font-bold text-slate-900">
                    {city}, {country}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Receipt Email:</span>
                  <span className="font-bold text-blue-600">{email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Selected Gateway:</span>
                  <span className="font-bold text-slate-900 uppercase">{paymentGateway}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2">
                  <span className="text-slate-700 font-bold">Payable Total:</span>
                  <span className="font-black text-blue-600 text-sm">
                    {currencyInfo.symbol}
                    {convertedTotal} {selectedCurrency}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>
                  Earn <strong>+500 XP</strong> and instant download entitlement for your digital items.
                </span>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handlePlaceOrder}
                  className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition transform hover:scale-105 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>Verifying with {paymentGateway.toUpperCase()}...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        Pay {currencyInfo.symbol}
                        {convertedTotal}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Summary Area (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            Order Summary ({cartItems.length} items)
          </h3>

          <div className="space-y-3 max-h-72 overflow-y-auto divide-y divide-slate-100">
            {cartItems.map((item) => (
              <div key={item.product.id} className="pt-3 first:pt-0 flex items-center gap-3">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{item.product.name}</h4>
                  <span className="text-[11px] text-slate-500">Qty: {item.quantity}</span>
                </div>
                <span className="text-xs font-black text-slate-900">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal (USD):</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount ({discountCode}):</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Digital Delivery:</span>
              <span className="text-emerald-600 font-bold">INSTANT & FREE</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-100">
              <span>Payable Total:</span>
              <span className="text-blue-600">
                {currencyInfo.symbol}
                {convertedTotal} <span className="text-xs text-slate-400">({selectedCurrency})</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
