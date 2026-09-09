import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BellRing,
  Bike,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Handshake,
  LayoutDashboard,
  MapPinned,
  Megaphone,
  MessageCircle,
  Navigation,
  PackageCheck,
  ReceiptText,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  TrendingUp,
  UserRound,
  UtensilsCrossed,
  Zap,
} from "lucide-react";
import "./AgentPartnerLanding.css";

const whatsappNumber = "8801329613145";
const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  "আমি ফুড ভার্স এজেন্ট হওয়ার বিষয়ে বিস্তারিত জানতে চাই।",
)}`;

const copy = {
  bn: {
    langButton: "English",
    brandSubtitle: "এজেন্ট হওয়ার সুযোগ",
    systemLabel: "ফুড ভার্স ব্যবস্থা",
    navSystem: "সম্পূর্ণ ব্যবস্থা",
    navBenefits: "নিয়ন্ত্রণ",
    navProcess: "শুরু করার ধাপ",
    navCta: "হোয়াটসঅ্যাপে কথা বলুন",
    heroBadge: "ফুড ভার্স এজেন্ট হওয়ার সুযোগ",
    heroKicker: "নিজের এলাকায় • নিজের পরিচয়ে • নিজের ব্যবসা",
    heroTitle: "নিজের ডেলিভারি ব্যবসা গড়ুন",
    heroHighlight: "ফুড ভার্সের সম্পূর্ণ প্রযুক্তি নিয়ে",
    heroDesc: "গ্রাহক, রেস্টুরেন্ট, রাইডার ও হিসাব—পুরো ব্যবসা চালানোর প্রস্তুত ব্যবস্থা পাবেন এক জায়গায়।",
    heroPoints: [
      "অ্যাপ বা ওয়েবসাইট তৈরির ঝামেলা নেই",
      "অর্ডার, রেস্টুরেন্ট ও রাইডার—এক জায়গায়",
      "নিজের এলাকায় শক্তিশালী ডেলিভারি নেটওয়ার্ক",
    ],
    heroCta: "এখনই এজেন্ট হওয়ার কথা বলুন",
    heroSecondary: "পুরো ব্যবস্থা দেখুন",
    heroNote: "হোয়াটসঅ্যাপে সরাসরি ফুড ভার্স দলের সঙ্গে কথা বলুন",
    dashboardTitle: "আপনার জোনের কন্ট্রোল সেন্টার",
    dashboardLive: "সরাসরি ব্যবসার তথ্য",
    todayOrders: "আজকের অর্ডার",
    activeRiders: "সক্রিয় রাইডার",
    zoneRestaurants: "রেস্টুরেন্ট",
    liveOrder: "নতুন অর্ডার এসেছে",
    riderAssigned: "রাইডার যুক্ত হয়েছে",
    reportReady: "আজকের হিসাব প্রস্তুত",
    orderGrowth: "অর্ডারের অগ্রগতি",
    liveActivity: "সরাসরি কার্যক্রম",
    weekStart: "শনিবার",
    today: "আজ",
    riderNetwork: "রাইডার নেটওয়ার্ক",
    liveConnected: "সক্রিয় ও সংযুক্ত",
    restaurantLabel: "রেস্টুরেন্ট",
    orderAccepted: "অর্ডার গ্রহণ করেছে",
    proofItems: ["সম্পূর্ণ অ্যাপ ব্যবস্থা", "নিজস্ব জোন নিয়ন্ত্রণ", "সরাসরি অর্ডার পরিচালনা", "বিক্রয় ও ব্যবসার হিসাব"],
    ecosystemEyebrow: "একটি ব্যবসা • একটি সম্পূর্ণ ব্যবস্থা",
    ecosystemTitle: "শুধু ড্যাশবোর্ড নয়—পুরো ব্যবসার প্রযুক্তি",
    ecosystemDesc: "গ্রাহকের অর্ডার থেকে রাইডারের ডেলিভারি ও আপনার হিসাব—সব ধাপ একই ব্যবস্থায় সংযুক্ত।",
    platforms: [
      {
        title: "গ্রাহক অ্যাপ",
        subtitle: "অর্ডার শুরু হয় এখান থেকে",
        desc: "গ্রাহক খাবার খুঁজবে, অর্ডার করবে এবং অর্ডারের অবস্থা দেখবে।",
        bullets: ["খাবার ও রেস্টুরেন্ট খোঁজা", "চেকআউট ও ডেলিভারি চার্জ", "অর্ডার অনুসরণ ও সহায়তা"],
        type: "customer",
      },
      {
        title: "রেস্টুরেন্ট অ্যাপ",
        subtitle: "রেস্টুরেন্টের নিজস্ব নিয়ন্ত্রণ",
        desc: "রেস্টুরেন্ট নতুন অর্ডার নেবে, প্রস্তুতির খবর দেবে এবং খাবারের তালিকা চালাবে।",
        bullets: ["তাৎক্ষণিক অর্ডার সংকেত", "গ্রহণ ও প্রস্তুতি নিয়ন্ত্রণ", "খাবারের তালিকা ও প্রাপ্যতা"],
        type: "restaurant",
      },
      {
        title: "রাইডার অ্যাপ",
        subtitle: "ডেলিভারি দলের সরাসরি সহকারী",
        desc: "রাইডার অর্ডার নেবে, ডেলিভারি শেষ করবে এবং নিজের আয় ও কাজ দেখবে।",
        bullets: ["সক্রিয় ডেলিভারি ধাপ", "পথ ও গ্রাহকের অবস্থান", "আয়, রেটিং ও ইতিহাস"],
        type: "rider",
      },
      {
        title: "এজেন্ট ড্যাশবোর্ড",
        subtitle: "সবকিছুর নিয়ন্ত্রণ আপনার হাতে",
        desc: "নিজের জোনের অর্ডার, রেস্টুরেন্ট, রাইডার, চার্জ ও হিসাব এক জায়গায় দেখুন।",
        bullets: ["জোনভিত্তিক অর্ডার নিয়ন্ত্রণ", "ডেলিভারি ও প্ল্যাটফর্ম ফি", "বিক্রয়, হিসাব ও প্রতিবেদন"],
        type: "dashboard",
      },
    ],
    connectedLabel: "চারটি ব্যবস্থা একই সঙ্গে কাজ করে",
    controlEyebrow: "ব্যবসার নিয়ন্ত্রণ আপনার হাতে",
    controlTitle: "প্রতিদিনের কাজ চালানোর শক্তিশালী নিয়ন্ত্রণ",
    controlDesc: "অর্ডার, রেস্টুরেন্ট, রাইডার, চার্জ ও হিসাব—তথ্য দেখে দ্রুত সিদ্ধান্ত নিন।",
    controls: [
      { title: "অর্ডার নিয়ন্ত্রণ", desc: "নতুন অর্ডার থেকে ডেলিভারি পর্যন্ত প্রতিটি অবস্থা দেখুন।", icon: PackageCheck, color: "blue" },
      { title: "রেস্টুরেন্ট নেটওয়ার্ক", desc: "নিজের এলাকার রেস্টুরেন্ট যুক্ত ও পরিচালনা করুন।", icon: Store, color: "orange" },
      { title: "রাইডার ব্যবস্থাপনা", desc: "রাইডারের অবস্থা, ডেলিভারি ও কাজ পর্যবেক্ষণ করুন।", icon: Bike, color: "green" },
      { title: "ডেলিভারি চার্জ", desc: "গ্রাহকের চার্জ ও রাইডারের আয় নির্ধারণ করুন।", icon: MapPinned, color: "cyan" },
      { title: "হিসাব ও প্রতিবেদন", desc: "দৈনিক, সাপ্তাহিক ও মাসিক বিক্রয় পরিষ্কারভাবে দেখুন।", icon: BarChart3, color: "violet" },
      { title: "প্রচার সহায়তা", desc: "স্থানীয় রেস্টুরেন্ট ও গ্রাহক বাড়াতে সহায়তা নিন।", icon: Megaphone, color: "pink" },
    ],
    processEyebrow: "শুরু করার পথ",
    processTitle: "চার ধাপে নিজের জোন চালু করুন",
    processDesc: "যোগাযোগ থেকে ব্যবসা চালু—ফুড ভার্স দল পাশে থাকবে।",
    steps: [
      { title: "কথা বলুন", desc: "হোয়াটসঅ্যাপে আপনার এলাকা ও আগ্রহ জানান।", icon: MessageCircle },
      { title: "জোন যাচাই", desc: "এলাকার সম্ভাবনা ও পরিকল্পনা নিয়ে আলোচনা হবে।", icon: MapPinned },
      { title: "প্রশিক্ষণ নিন", desc: "অ্যাপ ও ড্যাশবোর্ড চালানো শিখুন।", icon: LayoutDashboard },
      { title: "ব্যবসা চালু করুন", desc: "রেস্টুরেন্ট ও রাইডার নিয়ে ডেলিভারি শুরু করুন।", icon: Rocket },
    ],
    supportEyebrow: "শুরু থেকে উন্নতি পর্যন্ত",
    supportTitle: "আপনি ব্যবসা গড়বেন, প্রযুক্তি থাকবে পাশে",
    supportDesc: "পরিচিত ব্র্যান্ড, সংযুক্ত অ্যাপ ও গোছানো ড্যাশবোর্ড—বিশ্বাসযোগ্য ব্যবসার শক্তি।",
    supportItems: [
      { title: "পেশাদার পরিচিতি", desc: "ফুড ভার্সের ব্র্যান্ড ও ডিজিটাল উপস্থিতি", icon: BadgeCheck },
      { title: "ডেলিভারি সরঞ্জাম", desc: "মাঠের কাজের জন্য প্রয়োজনীয় সহায়তা", icon: ShoppingBag },
      { title: "পরিচালনা সহায়তা", desc: "কাজের ধাপ বুঝতে নিয়মিত দিকনির্দেশনা", icon: Handshake },
      { title: "প্রযুক্তি ব্যবস্থা", desc: "সংযুক্ত অ্যাপ ও ব্যবসার প্রয়োজনীয় উপকরণ", icon: Zap },
    ],
    finalEyebrow: "আপনার শহরের পরবর্তী সুযোগ",
    finalTitle: "ফুড ভার্সের সঙ্গে ব্যবসা করুন, নিজের পায়ে দাঁড়ান",
    finalDesc: "নিজের এলাকার ডেলিভারি ব্যবসার নেতৃত্ব নিন। আজকের সিদ্ধান্তই হতে পারে আপনার নতুন শুরু।",
    finalCta: "এখনই ফুড ভার্স এজেন্ট হোন",
    finalCall: "সরাসরি কল করুন",
    response: "দ্রুত হোয়াটসঅ্যাপ উত্তর",
    footerText: "নিজের এলাকায় ফুড ভার্স ডেলিভারি ব্যবসা গড়ার সুযোগ",
    footerContact: "এজেন্ট সহায়তা",
  },
  en: {
    langButton: "বাংলা",
    brandSubtitle: "Agent opportunity",
    systemLabel: "Food Verse system",
    navSystem: "Ecosystem",
    navBenefits: "Controls",
    navProcess: "How it starts",
    navCta: "Talk on WhatsApp",
    heroBadge: "Food Verse agent opportunity",
    heroKicker: "Your area • Your identity • Your business",
    heroTitle: "Build your delivery business",
    heroHighlight: "with Food Verse technology",
    heroDesc: "Get the connected tools to run customers, restaurants, riders and business accounts from one place.",
    heroPoints: ["No app or website to build", "Orders, restaurants and riders in one place", "Build a strong local delivery network"],
    heroCta: "Talk about becoming an Agent",
    heroSecondary: "See the ecosystem",
    heroNote: "Talk directly with the Food Verse team on WhatsApp",
    dashboardTitle: "Your zone control centre",
    dashboardLive: "LIVE BUSINESS",
    todayOrders: "Today’s orders",
    activeRiders: "Active riders",
    zoneRestaurants: "Restaurants",
    liveOrder: "New order received",
    riderAssigned: "Rider assigned",
    reportReady: "Today’s report ready",
    orderGrowth: "Order growth",
    liveActivity: "Live activity",
    weekStart: "Sat",
    today: "Today",
    riderNetwork: "Rider network",
    liveConnected: "Live & connected",
    restaurantLabel: "Restaurant",
    orderAccepted: "Order accepted",
    proofItems: ["Complete app ecosystem", "Dedicated zone control", "Live order operation", "Sales & business reports"],
    ecosystemEyebrow: "One business • One complete ecosystem",
    ecosystemTitle: "More than a dashboard—a complete business system",
    ecosystemDesc: "From customer order to rider delivery and accounts, every step stays connected.",
    platforms: [
      { title: "Customer App", subtitle: "Every order starts here", desc: "Customers discover food, order and follow delivery status.", bullets: ["Food and restaurant discovery", "Checkout and delivery charge", "Order tracking and support"], type: "customer" },
      { title: "Restaurant App", subtitle: "Restaurant operations made simple", desc: "Restaurants accept orders, update preparation and manage menus.", bullets: ["Instant order alerts", "Acceptance and preparation", "Menu and availability"], type: "restaurant" },
      { title: "Rider App", subtitle: "A live tool for delivery teams", desc: "Riders manage jobs, complete deliveries and see their performance.", bullets: ["Active delivery workflow", "Route and customer location", "Earnings, ratings and history"], type: "rider" },
      { title: "Agent Dashboard", subtitle: "Every control in your hands", desc: "Control orders, restaurants, riders, rates and accounts for your zone.", bullets: ["Zone order control", "Delivery and platform fees", "Sales, accounts and reports"], type: "dashboard" },
    ],
    connectedLabel: "Four systems working together",
    controlEyebrow: "Real business control",
    controlTitle: "Powerful controls for daily operations",
    controlDesc: "Use live information to make faster decisions across your zone.",
    controls: [
      { title: "Order Control", desc: "Follow every stage from a new order to delivery.", icon: PackageCheck, color: "blue" },
      { title: "Restaurant Network", desc: "Onboard and manage restaurants in your area.", icon: Store, color: "orange" },
      { title: "Rider Management", desc: "Monitor rider status, deliveries and activity.", icon: Bike, color: "green" },
      { title: "Delivery Charges", desc: "Set customer charges and rider earnings.", icon: MapPinned, color: "cyan" },
      { title: "Accounts & Reports", desc: "See daily, weekly and monthly sales clearly.", icon: BarChart3, color: "violet" },
      { title: "Marketing Support", desc: "Grow local restaurants and customers.", icon: Megaphone, color: "pink" },
    ],
    processEyebrow: "Your path to launch",
    processTitle: "Launch your zone in four steps",
    processDesc: "Food Verse stays beside you from first contact to launch.",
    steps: [
      { title: "Talk to us", desc: "Share your area and interest on WhatsApp.", icon: MessageCircle },
      { title: "Verify the zone", desc: "Discuss the opportunity and plan for your area.", icon: MapPinned },
      { title: "Get trained", desc: "Learn to use the apps and dashboard.", icon: LayoutDashboard },
      { title: "Launch", desc: "Start delivery with restaurants and riders.", icon: Rocket },
    ],
    supportEyebrow: "From launch to growth",
    supportTitle: "You build the business. Technology stays beside you.",
    supportDesc: "A trusted brand, connected apps and an organised dashboard give your business strength.",
    supportItems: [
      { title: "Professional Identity", desc: "Food Verse brand and digital presence", icon: BadgeCheck },
      { title: "Delivery Equipment", desc: "Practical support for field operations", icon: ShoppingBag },
      { title: "Operational Support", desc: "Guidance for everyday workflows", icon: Handshake },
      { title: "Technology Platform", desc: "Connected apps and business tools", icon: Zap },
    ],
    finalEyebrow: "Your city’s next opportunity",
    finalTitle: "Build with Food Verse. Build your independence.",
    finalDesc: "Lead the delivery business in your area. One decision today can begin a new journey.",
    finalCta: "Become a Food Verse Agent",
    finalCall: "Call us directly",
    response: "Fast WhatsApp response",
    footerText: "An opportunity to build a Food Verse delivery business in your area",
    footerContact: "Agent Support",
  },
};

const visualCopy = {
  bn: {
    deliverTo: "পৌঁছে দিন • বাসা", search: "খাবার বা রেস্টুরেন্ট খুঁজুন", categories: ["বিরিয়ানি", "বার্গার", "পানীয়"],
    popular: "জনপ্রিয় রেস্টুরেন্ট", viewAll: "সব দেখুন", restaurants: ["লক্ষ্মীপুর ক্যাফে", "রয়েল বিরিয়ানি"], fast: "দ্রুত ডেলিভারি", updates: "সরাসরি অর্ডারের খবর",
    greeting: "শুভ অপরাহ্ণ", restaurantPanel: "রেস্টুরেন্ট প্যানেল", newOrder: "নতুন অর্ডার", justNow: "এইমাত্র", itemsCash: "৩টি খাবার • ক্যাশ অন ডেলিভারি",
    burger: "চিকেন বার্গার × ২", cheese: "অতিরিক্ত চিজ", fries: "ফ্রেঞ্চ ফ্রাই × ১", regular: "সাধারণ", decline: "বাতিল", accept: "অর্ডার নিন", today: "আজ", orders: "১৮টি অর্ডার", status: "অবস্থা", open: "খোলা",
    riderOnline: "রাইডার সক্রিয়", ready: "ডেলিভারির জন্য প্রস্তুত", activeDelivery: "সক্রিয় ডেলিভারি", progress: "চলমান", customer: "গ্রাহক", road: "নোয়াখালী সড়ক", details: "ডেলিভারির বিস্তারিত দেখুন", earning: "আজকের আয়", rating: "রেটিং", restaurantMeta: "৪.৮ • ২৫ মিনিট", distance: "৪.৮ কিমি",
  },
  en: {
    deliverTo: "DELIVER TO • HOME", search: "Search food or restaurant", categories: ["Biryani", "Burger", "Drinks"],
    popular: "Popular restaurants", viewAll: "View all", restaurants: ["Lakshmipur Cafe", "Royal Biryani"], fast: "Fast delivery", updates: "Live order updates",
    greeting: "Good afternoon", restaurantPanel: "Restaurant Panel", newOrder: "NEW ORDER", justNow: "just now", itemsCash: "3 items • Cash on delivery",
    burger: "Chicken Burger × 2", cheese: "Extra cheese", fries: "French Fries × 1", regular: "Regular", decline: "Decline", accept: "Accept order", today: "Today", orders: "18 orders", status: "Status", open: "Open",
    riderOnline: "RIDER ONLINE", ready: "Ready to deliver", activeDelivery: "Active delivery", progress: "In progress", customer: "Customer", road: "Noakhali Road", details: "Open delivery details", earning: "Today’s earning", rating: "Rating", restaurantMeta: "4.8 • 25 min", distance: "4.8 km",
  },
};

const gradients = {
  blue: "from-blue-600 to-indigo-600",
  orange: "from-orange-500 to-amber-500",
  green: "from-emerald-500 to-green-600",
  cyan: "from-cyan-500 to-sky-600",
  violet: "from-violet-600 to-purple-600",
  pink: "from-pink-500 to-rose-500",
};

function Brand({ subtitle }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
      <div className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-indigo-600 to-cyan-400 text-xs font-black text-white shadow-[0_10px_28px_rgba(37,99,235,.28)] sm:h-11 sm:w-11 sm:text-sm">
        FV<span className="absolute -bottom-2 -right-2 h-5 w-5 rounded-full bg-white/25" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[15px] font-black leading-none tracking-[-.02em] text-slate-950 sm:text-[17px]">Food Verse</p>
        <p className="mt-1 truncate text-[8px] font-extrabold tracking-[.13em] text-blue-700 sm:text-[9px] sm:tracking-[.2em]">{subtitle}</p>
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, desc, light = false, align = "center" }) {
  const centered = align === "center";
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <span className={`fv-eyebrow ${light ? "border-white/15 bg-white/10 text-cyan-100" : "border-blue-200 bg-blue-50 text-blue-700"}`}>{eyebrow}</span>
      <h2 className={`mt-4 text-[1.9rem] font-black leading-[1.16] tracking-[-.025em] sm:text-4xl sm:leading-[1.12] lg:text-[3rem] ${light ? "text-white" : "text-slate-950"}`}>{title}</h2>
      {desc && <p className={`mt-4 text-[15px] leading-7 sm:text-[17px] ${light ? "text-blue-100/85" : "text-slate-600"}`}>{desc}</p>}
    </div>
  );
}

function PhoneShell({ children }) {
  return (
    <div className="fv-phone-live relative mx-auto w-full max-w-[218px] rounded-[32px] border-[7px] border-slate-950 bg-white p-2 shadow-[0_30px_70px_rgba(15,23,42,.24)] sm:max-w-[244px]">
      <div className="absolute left-1/2 top-1.5 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-slate-950" />
      <div className="overflow-hidden rounded-[21px] bg-slate-50 sm:rounded-[23px]">{children}</div>
    </div>
  );
}

function CustomerScreen({ u }) {
  return (
    <div className="min-h-[350px] bg-[#f7f5ff] pb-3 sm:min-h-[378px]">
      <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-fuchsia-500 px-3 pb-6 pt-8 text-white">
        <div className="flex items-center justify-between text-[7px] font-bold sm:text-[8px]"><span>{u.deliverTo}</span><BellRing className="h-3.5 w-3.5" /></div>
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-[7px] font-semibold text-slate-400 shadow-lg sm:text-[8px]"><UtensilsCrossed className="h-3.5 w-3.5 text-purple-600" />{u.search}</div>
      </div>
      <div className="px-3">
        <div className="-mt-3 grid grid-cols-3 gap-1.5">
          {u.categories.map((item, index) => <div key={item} className="fv-app-card rounded-xl bg-white p-2 text-center shadow-sm" style={{ animationDelay: `${index * 180}ms` }}><div className={`mx-auto h-7 w-7 rounded-full ${["bg-orange-100", "bg-amber-100", "bg-cyan-100"][index]}`} /><p className="mt-1 text-[6px] font-bold text-slate-700 sm:text-[7px]">{item}</p></div>)}
        </div>
        <div className="mt-4 flex items-center justify-between"><p className="text-[9px] font-black text-slate-900 sm:text-[10px]">{u.popular}</p><span className="text-[6px] font-bold text-purple-700 sm:text-[7px]">{u.viewAll}</span></div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {u.restaurants.map((item, index) => <div key={item} className="overflow-hidden rounded-xl bg-white shadow-sm"><div className={`h-14 p-2 sm:h-16 ${index ? "bg-gradient-to-br from-orange-200 to-red-300" : "bg-gradient-to-br from-amber-100 to-orange-300"}`}><div className="h-full w-full rounded-lg border border-white/60 bg-white/30" /></div><div className="p-2"><p className="truncate text-[6px] font-black text-slate-900 sm:text-[7px]">{item}</p><div className="mt-1 flex items-center gap-1 text-[5px] text-slate-500 sm:text-[6px]"><Star className="h-2 w-2 fill-amber-400 text-amber-400" />{u.restaurantMeta}</div></div></div>)}
        </div>
        <div className="mt-3 rounded-xl bg-white p-3 shadow-sm"><div className="flex items-center gap-2"><div className="grid h-7 w-7 place-items-center rounded-lg bg-purple-100 text-purple-700"><Bike className="h-3.5 w-3.5" /></div><div className="flex-1"><p className="text-[7px] font-black sm:text-[8px]">{u.fast}</p><p className="text-[5px] text-slate-500 sm:text-[6px]">{u.updates}</p></div><ArrowRight className="h-3 w-3 text-slate-400" /></div></div>
      </div>
    </div>
  );
}

function RestaurantScreen({ u }) {
  return (
    <div className="min-h-[350px] bg-[#f7f9fc] pb-3 sm:min-h-[378px]">
      <div className="bg-slate-950 px-3 pb-5 pt-8 text-white"><div className="flex items-center justify-between"><div><p className="text-[6px] text-slate-400 sm:text-[7px]">{u.greeting}</p><p className="text-[10px] font-black sm:text-[11px]">{u.restaurantPanel}</p></div><Store className="h-5 w-5 text-orange-400" /></div></div>
      <div className="px-3">
        <div className="fv-order-pulse -mt-3 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 p-3 text-white shadow-lg"><div className="flex items-center justify-between"><span className="text-[7px] font-bold sm:text-[8px]">{u.newOrder}</span><span className="rounded-full bg-white/20 px-2 py-1 text-[5px] sm:text-[6px]">{u.justNow}</span></div><p className="mt-2 text-[15px] font-black sm:text-[16px]">#FV-2048</p><p className="text-[6px] text-orange-50 sm:text-[7px]">{u.itemsCash}</p></div>
        <div className="mt-3 rounded-2xl bg-white p-3 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2"><div className="grid h-8 w-8 place-items-center rounded-xl bg-orange-50"><UtensilsCrossed className="h-4 w-4 text-orange-600" /></div><div><p className="text-[7px] font-black sm:text-[8px]">{u.burger}</p><p className="text-[5px] text-slate-500 sm:text-[6px]">{u.cheese}</p></div></div>
          <div className="mt-2 flex items-center gap-2 border-b border-slate-100 pb-2"><div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-50"><ShoppingBag className="h-4 w-4 text-amber-600" /></div><div><p className="text-[7px] font-black sm:text-[8px]">{u.fries}</p><p className="text-[5px] text-slate-500 sm:text-[6px]">{u.regular}</p></div></div>
          <div className="mt-3 grid grid-cols-2 gap-2"><span className="rounded-lg border border-rose-200 py-2 text-center text-[6px] font-black text-rose-600 sm:text-[7px]">{u.decline}</span><span className="rounded-lg bg-emerald-500 py-2 text-center text-[6px] font-black text-white sm:text-[7px]">{u.accept}</span></div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-xl bg-white p-2.5 shadow-sm"><p className="text-[5px] text-slate-500 sm:text-[6px]">{u.today}</p><p className="mt-1 text-[11px] font-black sm:text-[12px]">{u.orders}</p></div><div className="rounded-xl bg-white p-2.5 shadow-sm"><p className="text-[5px] text-slate-500 sm:text-[6px]">{u.status}</p><p className="mt-1 text-[8px] font-black text-emerald-600 sm:text-[9px]">● {u.open}</p></div></div>
      </div>
    </div>
  );
}

function RiderScreen({ u }) {
  return (
    <div className="min-h-[350px] bg-[#f8f7fb] pb-3 sm:min-h-[378px]">
      <div className="bg-gradient-to-br from-slate-950 via-[#2b0b3d] to-fuchsia-800 px-3 pb-7 pt-8 text-white"><div className="flex items-center justify-between"><div><p className="text-[6px] text-fuchsia-200 sm:text-[7px]">{u.riderOnline}</p><p className="text-[10px] font-black sm:text-[11px]">{u.ready}</p></div><div className="fv-live-dot h-3 w-3 rounded-full border-2 border-white bg-emerald-400" /></div></div>
      <div className="px-3"><div className="-mt-4 rounded-2xl bg-white p-3 shadow-lg">
        <div className="flex items-center justify-between"><p className="text-[7px] font-black sm:text-[8px]">{u.activeDelivery}</p><span className="rounded-full bg-rose-50 px-2 py-1 text-[5px] font-bold text-rose-600 sm:text-[6px]">{u.progress}</span></div>
        <div className="relative mt-3 h-24 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-100 via-sky-100 to-indigo-100"><div className="fv-map-lines absolute inset-0 opacity-40" /><div className="absolute left-5 top-5 grid h-7 w-7 place-items-center rounded-full bg-white text-emerald-600 shadow"><Store className="h-3.5 w-3.5" /></div><div className="fv-route-line absolute left-[44px] top-[40px] h-[2px] w-[95px] -rotate-12 bg-gradient-to-r from-emerald-500 to-fuchsia-600" /><div className="fv-rider-marker absolute bottom-4 right-5 grid h-7 w-7 place-items-center rounded-full bg-fuchsia-700 text-white shadow"><Navigation className="h-3.5 w-3.5" /></div></div>
        <div className="mt-3 flex items-center justify-between"><div><p className="text-[5px] text-slate-500 sm:text-[6px]">{u.customer}</p><p className="text-[7px] font-black sm:text-[8px]">{u.road}</p></div><p className="text-[8px] font-black text-fuchsia-700 sm:text-[9px]">{u.distance}</p></div>
        <div className="mt-3 w-full rounded-xl bg-fuchsia-700 py-2.5 text-center text-[6px] font-black text-white sm:text-[7px]">{u.details}</div>
      </div><div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-xl bg-white p-2.5 shadow-sm"><p className="text-[5px] text-slate-500 sm:text-[6px]">{u.earning}</p><p className="mt-1 text-[11px] font-black sm:text-[12px]">৳ 680</p></div><div className="rounded-xl bg-white p-2.5 shadow-sm"><p className="text-[5px] text-slate-500 sm:text-[6px]">{u.rating}</p><p className="mt-1 flex items-center gap-1 text-[10px] font-black sm:text-[11px]"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />4.9</p></div></div></div>
    </div>
  );
}

function DashboardScreen({ compact = false, t }) {
  return (
    <div className={`fv-dashboard-live overflow-hidden rounded-[22px] border border-slate-200 bg-[#f5f8fc] shadow-[0_25px_70px_rgba(15,23,42,.16)] ${compact ? "min-h-[310px] sm:min-h-[330px]" : "min-h-[350px] sm:min-h-[390px]"}`}>
      <div className="flex h-9 items-center gap-1.5 border-b border-slate-200 bg-white px-3"><span className="h-2 w-2 rounded-full bg-rose-400" /><span className="h-2 w-2 rounded-full bg-amber-400" /><span className="h-2 w-2 rounded-full bg-emerald-400" /><div className="ml-2 h-4 flex-1 rounded-md bg-slate-100" /></div>
      <div className="flex"><div className="w-10 shrink-0 bg-[#071329] px-1.5 py-3 sm:w-12 sm:px-2"><div className="grid h-7 w-7 place-items-center rounded-lg bg-blue-600 text-[7px] font-black text-white">FV</div><div className="mt-5 grid gap-3">{[LayoutDashboard, PackageCheck, Store, Bike, BarChart3].map((Icon, index) => <div key={index} className={`grid h-7 w-7 place-items-center rounded-lg ${index === 0 ? "bg-blue-600 text-white" : "text-slate-500"}`}><Icon className="h-3.5 w-3.5" /></div>)}</div></div>
        <div className="min-w-0 flex-1 p-2.5 sm:p-3"><div className="rounded-xl bg-gradient-to-r from-[#0b1d46] to-blue-700 p-3 text-white"><p className="text-[5px] font-bold tracking-[.13em] text-blue-200 sm:text-[6px]">{t.dashboardLive}</p><p className="mt-1 text-[10px] font-black sm:text-[12px]">{t.dashboardTitle}</p></div>
          <div className="mt-3 grid grid-cols-3 gap-1.5 sm:gap-2">{[{ label: t.todayOrders, value: "28", color: "bg-blue-50 text-blue-700" }, { label: t.activeRiders, value: "12", color: "bg-emerald-50 text-emerald-700" }, { label: t.zoneRestaurants, value: "31", color: "bg-orange-50 text-orange-700" }].map((item) => <div key={item.label} className="rounded-xl border border-slate-100 bg-white p-2 shadow-sm"><span className={`inline-flex rounded-md px-1.5 py-1 text-[7px] font-black ${item.color}`}>{item.value}</span><p className="mt-2 truncate text-[5px] font-bold text-slate-500 sm:text-[5.5px]">{item.label}</p></div>)}</div>
          <div className="mt-3 grid grid-cols-[1.15fr_.85fr] gap-1.5 sm:gap-2"><div className="rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm sm:p-3"><div className="flex items-center justify-between"><p className="text-[6px] font-black sm:text-[7px]">{t.orderGrowth}</p><TrendingUp className="h-3 w-3 text-emerald-500" /></div><div className="mt-4 flex h-14 items-end gap-1 sm:h-16 sm:gap-1.5">{[32, 48, 42, 67, 54, 82, 71, 94].map((height, index) => <div key={index} className="fv-live-bar flex-1 rounded-t bg-gradient-to-t from-blue-700 to-cyan-400" style={{ height: `${height}%`, animationDelay: `${index * 110}ms` }} />)}</div><div className="mt-2 flex justify-between text-[5px] text-slate-400"><span>{t.weekStart}</span><span>{t.today}</span></div></div>
            <div className="rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm sm:p-3"><p className="text-[6px] font-black sm:text-[7px]">{t.liveActivity}</p><div className="mt-3 grid gap-2">{[[t.liveOrder, "bg-blue-500"], [t.riderAssigned, "bg-emerald-500"], [t.reportReady, "bg-violet-500"]].map(([label, color], index) => <div key={label} className="flex items-center gap-1.5 sm:gap-2"><span className={`fv-live-dot h-1.5 w-1.5 shrink-0 rounded-full ${color}`} style={{ animationDelay: `${index * 300}ms` }} /><span className="truncate text-[4.7px] font-semibold text-slate-500 sm:text-[5.5px]">{label}</span></div>)}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductVisual({ type, t, u }) {
  if (type === "dashboard") return <DashboardScreen compact t={t} />;
  return <PhoneShell>{type === "customer" ? <CustomerScreen u={u} /> : type === "restaurant" ? <RestaurantScreen u={u} /> : <RiderScreen u={u} />}</PhoneShell>;
}

function EcosystemCard({ item, index, t, u }) {
  const icons = [UserRound, Store, Bike, LayoutDashboard];
  const Icon = icons[index];
  return (
    <article className={`fv-product-card fv-reveal grid items-center gap-7 rounded-[26px] border border-slate-200/80 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,.08)] sm:rounded-[30px] sm:p-8 lg:grid-cols-2 lg:gap-14 ${index % 2 ? "lg:[&_.fv-copy]:order-2 lg:[&_.fv-visual]:order-1" : ""}`}>
      <div className="fv-copy"><div className="flex items-center gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-700 to-cyan-500 text-white shadow-lg sm:h-12 sm:w-12"><Icon className="h-5 w-5 sm:h-6 sm:w-6" /></div><div><p className="text-[8px] font-black tracking-[.13em] text-blue-700 sm:text-[10px] sm:tracking-[.2em]">0{index + 1} • {t.systemLabel}</p><h3 className="mt-1 text-[1.35rem] font-black leading-tight tracking-[-.02em] text-slate-950 sm:text-2xl">{item.title}</h3></div></div><p className="mt-5 text-base font-extrabold text-slate-800 sm:text-lg">{item.subtitle}</p><p className="mt-2 text-sm leading-7 text-slate-600 sm:mt-3 sm:text-[15px]">{item.desc}</p><div className="mt-5 grid gap-2.5">{item.bullets.map((bullet) => <div key={bullet} className="flex items-start gap-3"><span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Check className="h-3.5 w-3.5 stroke-[3]" /></span><span className="text-sm font-semibold leading-6 text-slate-700">{bullet}</span></div>)}</div></div>
      <div className="fv-visual fv-visual-stage relative flex min-h-[360px] items-center overflow-hidden rounded-[24px] bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,#f0f9ff_35%,#eef2ff_100%)] p-4 sm:min-h-[390px] sm:rounded-[28px] sm:p-8"><div className="absolute left-5 top-5 h-16 w-16 rounded-full bg-blue-300/30 blur-2xl" /><div className="absolute bottom-5 right-5 h-20 w-20 rounded-full bg-cyan-300/30 blur-2xl" /><div className="fv-scan-line" /><div className="relative w-full"><ProductVisual type={item.type} t={t} u={u} /></div></div>
    </article>
  );
}

export default function AgentPartnerLanding() {
  const [lang, setLang] = useState("bn");
  const t = useMemo(() => copy[lang], [lang]);
  const u = useMemo(() => visualCopy[lang], [lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = lang === "bn" ? "ফুড ভার্স এজেন্ট হোন | নিজের ডেলিভারি ব্যবসা গড়ুন" : "Become a Food Verse Agent | Build Your Delivery Business";
  }, [lang]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7faff] text-slate-900 selection:bg-blue-200 selection:text-blue-950">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl"><div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-2 px-4 sm:h-[72px] sm:px-6 lg:px-8"><a href="#top" aria-label="Food Verse Agent Opportunity" className="min-w-0"><Brand subtitle={t.brandSubtitle} /></a><nav className="hidden items-center gap-7 lg:flex"><a href="#ecosystem" className="text-sm font-bold text-slate-600 transition hover:text-blue-700">{t.navSystem}</a><a href="#benefits" className="text-sm font-bold text-slate-600 transition hover:text-blue-700">{t.navBenefits}</a><a href="#process" className="text-sm font-bold text-slate-600 transition hover:text-blue-700">{t.navProcess}</a></nav><div className="flex shrink-0 items-center gap-2"><button type="button" onClick={() => setLang((value) => value === "bn" ? "en" : "bn")} className="rounded-full border border-blue-200 bg-white px-3 py-2 text-[10px] font-extrabold text-blue-700 shadow-sm transition hover:border-blue-400 sm:px-4 sm:text-xs">{t.langButton}</button><a href={whatsappLink} target="_blank" rel="noreferrer" className="hidden items-center gap-2 rounded-full bg-[#0b63e5] px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(37,99,235,.25)] transition hover:-translate-y-0.5 hover:bg-blue-700 sm:inline-flex"><MessageCircle className="h-4 w-4" />{t.navCta}</a></div></div></header>

      <main id="top" className="pt-[68px] sm:pt-[72px]">
        <section className="relative overflow-hidden border-b border-blue-100 bg-[linear-gradient(135deg,#f5f9ff_0%,#edf5ff_45%,#f7fbff_100%)] px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-20"><div className="fv-grid-bg absolute inset-0 opacity-50" /><div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" /><div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-cyan-300/25 blur-3xl" /><div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.02fr_.98fr] lg:gap-16"><div className="min-w-0"><div className="fv-eyebrow border-blue-200 bg-white text-blue-700 shadow-sm"><Sparkles className="h-3.5 w-3.5" />{t.heroBadge}</div><p className="mt-5 text-[10px] font-black tracking-[.13em] text-cyan-700 sm:text-xs sm:tracking-[.18em]">{t.heroKicker}</p><h1 className="fv-hero-title mt-3 max-w-3xl text-[2.25rem] font-black leading-[1.17] tracking-[-.025em] text-slate-950 sm:text-5xl sm:leading-[1.1] lg:text-[4rem]"><span className="block">{t.heroTitle}</span><span className="mt-2 block bg-gradient-to-r from-blue-800 via-blue-600 to-cyan-500 bg-clip-text text-transparent">{t.heroHighlight}</span></h1><p className="mt-5 max-w-2xl text-[15px] leading-7 text-slate-600 sm:mt-6 sm:text-lg sm:leading-8">{t.heroDesc}</p><div className="mt-5 grid gap-2.5 sm:mt-6 sm:gap-3">{t.heroPoints.map((point) => <div key={point} className="flex items-center gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Check className="h-4 w-4 stroke-[3]" /></span><span className="text-sm font-bold leading-6 text-slate-700 sm:text-[15px]">{point}</span></div>)}</div><div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row"><a href={whatsappLink} target="_blank" rel="noreferrer" className="fv-primary-button"><MessageCircle className="h-5 w-5" />{t.heroCta}<ArrowRight className="h-5 w-5" /></a><a href="#ecosystem" className="fv-secondary-button">{t.heroSecondary}<ArrowRight className="h-5 w-5" /></a></div><p className="mt-4 flex items-start gap-2 text-xs font-semibold leading-5 text-slate-500"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />{t.heroNote}</p></div>
          <div className="fv-dashboard-stage relative mx-auto w-full max-w-[620px] lg:mx-0"><div className="absolute -inset-6 rounded-[50px] bg-gradient-to-br from-blue-400/20 to-cyan-300/20 blur-2xl" /><div className="relative rounded-[28px] border border-white/80 bg-white/60 p-2.5 shadow-[0_35px_100px_rgba(37,99,235,.18)] backdrop-blur-xl sm:rounded-[34px] sm:p-5"><DashboardScreen t={t} /></div><div className="fv-float absolute -bottom-7 -left-2 hidden items-center gap-3 rounded-2xl border border-white bg-white p-3 shadow-[0_18px_45px_rgba(15,23,42,.16)] sm:flex lg:-left-8 sm:p-4"><div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><Bike className="h-5 w-5" /></div><div><p className="text-[10px] font-bold text-slate-500">{t.riderNetwork}</p><p className="text-sm font-black text-slate-900">{t.liveConnected}</p></div></div><div className="fv-float-delayed absolute -right-2 -top-6 hidden items-center gap-3 rounded-2xl bg-slate-950 p-3 text-white shadow-[0_18px_45px_rgba(15,23,42,.2)] sm:flex lg:-right-7 sm:p-4"><div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500 text-white"><Store className="h-5 w-5" /></div><div><p className="text-[10px] font-bold text-slate-400">{t.restaurantLabel}</p><p className="text-sm font-black">{t.orderAccepted}</p></div></div></div></div></section>

        <section className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6 sm:py-6 lg:px-8"><div className="mx-auto grid max-w-7xl grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">{t.proofItems.map((item, index) => { const icons = [UserRound, MapPinned, PackageCheck, ReceiptText]; const Icon = icons[index]; return <div key={item} className="flex items-center gap-2 rounded-2xl p-1.5 sm:gap-3 sm:p-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700 sm:h-10 sm:w-10"><Icon className="h-4 w-4 sm:h-5 sm:w-5" /></span><span className="text-[10px] font-extrabold leading-4 text-slate-700 sm:text-sm sm:leading-5">{item}</span></div>; })}</div></section>

        <section id="ecosystem" className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24"><div className="mx-auto max-w-7xl"><SectionHeading eyebrow={t.ecosystemEyebrow} title={t.ecosystemTitle} desc={t.ecosystemDesc} /><div className="relative mt-9 grid gap-6 sm:mt-12 sm:gap-7"><div className="absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-blue-200 to-transparent lg:block" />{t.platforms.map((item, index) => <EcosystemCard key={item.title} item={item} index={index} t={t} u={u} />)}</div><div className="mx-auto mt-7 flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[11px] font-extrabold text-emerald-800 sm:mt-8 sm:text-sm"><CheckCircle2 className="h-4 w-4" />{t.connectedLabel}</div></div></section>

        <section id="benefits" className="relative overflow-hidden bg-[#071329] px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24"><div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" /><div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" /><div className="relative mx-auto max-w-7xl"><SectionHeading eyebrow={t.controlEyebrow} title={t.controlTitle} desc={t.controlDesc} light /><div className="mt-9 grid gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">{t.controls.map((item, index) => { const Icon = item.icon; return <article key={item.title} className="fv-control-card group rounded-[22px] border border-white/10 bg-white/[.07] p-4 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[.11] sm:rounded-[26px] sm:p-6" style={{ animationDelay: `${index * 120}ms` }}><div className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${gradients[item.color]} text-white shadow-lg sm:h-12 sm:w-12`}><Icon className="h-5 w-5 sm:h-6 sm:w-6" /></div><h3 className="mt-4 text-lg font-black text-white sm:mt-5 sm:text-xl">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-300 sm:mt-3 sm:leading-7">{item.desc}</p></article>; })}</div></div></section>

        <section id="process" className="border-y border-slate-200 bg-white px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24"><div className="mx-auto max-w-7xl"><SectionHeading eyebrow={t.processEyebrow} title={t.processTitle} desc={t.processDesc} /><div className="relative mt-9 grid gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4"><div className="absolute left-[12.5%] right-[12.5%] top-8 hidden h-px bg-gradient-to-r from-blue-200 via-cyan-400 to-blue-200 lg:block" />{t.steps.map((item, index) => { const Icon = item.icon; return <article key={item.title} className="fv-reveal relative rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,.06)] sm:rounded-[26px] sm:p-6"><div className="relative z-10 flex items-center justify-between"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-700 to-cyan-500 text-white shadow-lg sm:h-16 sm:w-16"><Icon className="h-6 w-6 sm:h-7 sm:w-7" /></div><span className="text-3xl font-black text-blue-100 sm:text-4xl">0{index + 1}</span></div><h3 className="mt-5 text-lg font-black text-slate-950 sm:mt-6 sm:text-xl">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600 sm:mt-3 sm:leading-7">{item.desc}</p></article>; })}</div></div></section>

        <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24"><div className="mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-gradient-to-br from-[#102b66] via-blue-700 to-cyan-500 p-5 shadow-[0_30px_90px_rgba(37,99,235,.24)] sm:rounded-[34px] sm:p-10 lg:p-14"><div className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-10"><SectionHeading eyebrow={t.supportEyebrow} title={t.supportTitle} desc={t.supportDesc} light align="left" /><div className="grid gap-3 sm:grid-cols-2">{t.supportItems.map((item) => { const Icon = item.icon; return <div key={item.title} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"><div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-blue-700"><Icon className="h-5 w-5" /></span><div><p className="text-sm font-black text-white">{item.title}</p><p className="mt-1 text-xs leading-5 text-blue-100/80">{item.desc}</p></div></div></div>; })}</div></div></div></section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28"><div className="relative mx-auto max-w-7xl overflow-hidden rounded-[30px] bg-[#061126] p-6 text-white shadow-[0_35px_100px_rgba(15,23,42,.28)] sm:rounded-[36px] sm:p-10 lg:p-14"><div className="fv-grid-dark absolute inset-0 opacity-40" /><div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl" /><div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" /><div className="relative grid gap-8 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:gap-10"><div><span className="fv-eyebrow border-white/15 bg-white/10 text-cyan-100">{t.finalEyebrow}</span><h2 className="mt-5 text-[2rem] font-black leading-[1.15] tracking-[-.025em] sm:text-5xl sm:leading-[1.08] lg:text-[3.5rem]">{t.finalTitle}</h2><p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-300 sm:mt-5 sm:text-lg sm:leading-8">{t.finalDesc}</p></div><div className="rounded-[24px] border border-white/10 bg-white/[.08] p-4 backdrop-blur sm:rounded-[28px] sm:p-7"><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500"><MessageCircle className="h-6 w-6" /></span><div><p className="text-xs font-bold text-slate-400">{t.response}</p><p className="text-xl font-black">01329-613145</p></div></div><a href={whatsappLink} target="_blank" rel="noreferrer" className="mt-6 flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 px-5 text-center text-sm font-black text-white shadow-[0_18px_45px_rgba(34,197,94,.24)] transition hover:-translate-y-0.5 sm:text-base">{t.finalCta}<ArrowRight className="h-5 w-5" /></a><a href="tel:+8801329613145" className="mt-3 flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 text-sm font-extrabold text-white transition hover:bg-white/15"><CircleDollarSign className="h-4 w-4" />{t.finalCall}</a></div></div></div></section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><Brand subtitle={t.brandSubtitle} /><p className="max-w-md text-sm leading-6 text-slate-500 sm:text-right">{t.footerText}<br /><span className="font-extrabold text-blue-700">{t.footerContact}: 01329-613145</span></p></div></footer>
      <a href={whatsappLink} target="_blank" rel="noreferrer" className="fixed bottom-4 left-4 right-4 z-40 flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 text-center text-xs font-black text-white shadow-[0_18px_50px_rgba(16,185,129,.35)] sm:hidden"><MessageCircle className="h-5 w-5" />{t.finalCta}<ArrowRight className="h-5 w-5" /></a>
    </div>
  );
}
