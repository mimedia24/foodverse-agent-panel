import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bike,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Globe,
  Megaphone,
  MessageCircle,
  Package,
  ShieldCheck,
  Sparkles,
  Store,
  Wallet,
} from "lucide-react";

const whatsappLink = "https://wa.me/8801329613145";

const copy = {
  en: {
    navButton: "WhatsApp",
    langButton: "বাংলা",
    heroBadge: "FOOD VERSE AGENT RECRUITMENT",
    heroTitle1: "Build Your Own",
    heroTitle2: "Food Delivery Zone Business",
    heroDesc:
      "Food Verse already has the full ecosystem: customer app, restaurant app, rider app, website, admin panel and agent control dashboard. You do not start from zero — you start with a complete business system.",
    stat1: "Zone control",
    stat2: "App ecosystem",
    stat3: "Reports & growth",
    primaryCta: "Contact on WhatsApp",
    secondaryCta: "See benefits",
    panelEyebrow: "COMPLETE BUSINESS SETUP",
    panelTitle: "Powerful System. Best Income Opportunity.",
    panelText:
      "Control orders, restaurants, riders, accounts and growth from one aggressive, modern platform designed for scaling local delivery operations.",
    mini1Title: "Customer App",
    mini1Text: "Customers can place orders from a ready-to-launch mobile app.",
    mini2Title: "Restaurant App",
    mini2Text: "Restaurant partners can manage menus and orders faster.",
    mini3Title: "Rider App",
    mini3Text: "Riders can handle deliveries inside a structured live system.",
    mini4Title: "Agent Admin",
    mini4Text: "Monitor your zone with reports, controls and performance data.",
    ecoEyebrow: "WHY FOOD VERSE",
    ecoTitle: "Everything is already built for growth",
    ecoDesc:
      "This is not just a landing page. It is a complete operational ecosystem that helps a new agent launch faster and look more professional from day one.",
    benefitsEyebrow: "AGENT BENEFITS",
    benefitsTitle: "What you get as a Food Verse agent",
    benefitsDesc:
      "Every feature is built to help you run your area, manage operations and grow into a strong local delivery business.",
    reasonsEyebrow: "BUSINESS VALUE",
    reasonsTitle: "Why people will be attracted to this opportunity",
    reasonsDesc:
      "Food Verse gives ambitious people a structured path to income, independence and local business ownership potential.",
    contactEyebrow: "START TODAY",
    contactTitle: "Launch your zone with Food Verse",
    contactDesc:
      "If you want to build a serious food delivery business in your area, contact us now on WhatsApp and talk to our team.",
    contactNumber: "Contact Number",
    responseTime: "Response Time",
    responseValue: "Fast WhatsApp Response",
    finalCta: "Chat on WhatsApp now",
    footer: "Food Verse Agent Opportunity",
    bagTitle: "Premium Delivery Bag",
    bagText: "Waterproof, heatproof, durable and professional-quality delivery bag support.",
    marketingTitle: "Marketing Support",
    marketingText: "We help promote your zone with stronger branding and local marketing support.",
    incomeTitle: "Income Opportunity",
    incomeText: "A real chance to build income and become more independent through your own zone.",
    zoneTitle: "Zone Ownership",
    zoneText: "Grow your own area with structure, control and long-term business potential.",
    features: [
      {
        title: "Order Control",
        desc: "Monitor orders, update delivery flow and manage operations from one dashboard.",
        icon: Package,
      },
      {
        title: "Restaurant Control",
        desc: "Manage restaurant partners, menu flow and daily order activity inside your zone.",
        icon: Store,
      },
      {
        title: "Rider Control",
        desc: "Track riders, coordinate deliveries and improve field performance efficiently.",
        icon: Bike,
      },
      {
        title: "Reports & Accounts",
        desc: "See daily sales, totals, performance and business numbers in a clean dashboard.",
        icon: Wallet,
      },
      {
        title: "Website & Online Presence",
        desc: "A strong digital presence builds customer trust and business credibility.",
        icon: Globe,
      },
      {
        title: "Smart Admin System",
        desc: "A modern admin ecosystem gives you structure, speed and serious business control.",
        icon: Briefcase,
      },
    ],
    reasons: [
      "A real path to income and independence",
      "A ready-made digital ecosystem instead of starting from zero",
      "Professional structure with app, website and dashboard support",
      "Strong local business potential inside your own zone",
      "A scalable delivery model built for long-term growth",
    ],
  },
  bn: {
    navButton: "হোয়াটসঅ্যাপ",
    langButton: "English",
    heroBadge: "FOOD VERSE AGENT RECRUITMENT",
    heroTitle1: "নিজের",
    heroTitle2: "ফুড ডেলিভারি জোন বিজনেস তৈরি করুন",
    heroDesc:
      "Food Verse-এর রয়েছে customer app, restaurant app, rider app, website, admin panel এবং agent control dashboard। তাই আপনি শূন্য থেকে শুরু করছেন না — একটি complete business system দিয়ে শুরু করছেন।",
    stat1: "জোন কন্ট্রোল",
    stat2: "অ্যাপ ইকোসিস্টেম",
    stat3: "রিপোর্ট ও গ্রোথ",
    primaryCta: "হোয়াটসঅ্যাপে যোগাযোগ করুন",
    secondaryCta: "সুবিধা দেখুন",
    panelEyebrow: "COMPLETE BUSINESS SETUP",
    panelTitle: "শক্তিশালী সিস্টেম। বাস্তব আয়ের সুযোগ।",
    panelText:
      "একটি aggressive, modern platform থেকে order, restaurant, rider, accounts এবং growth control করুন।",
    mini1Title: "Customer App",
    mini1Text: "কাস্টমাররা ready-to-launch mobile app থেকে order করতে পারবে।",
    mini2Title: "Restaurant App",
    mini2Text: "রেস্টুরেন্ট পার্টনাররা দ্রুত menu ও order manage করতে পারবে।",
    mini3Title: "Rider App",
    mini3Text: "রাইডাররা structured live system-এর মাধ্যমে delivery handle করবে।",
    mini4Title: "Agent Admin",
    mini4Text: "reports, controls এবং performance data দিয়ে পুরো zone monitor করুন।",
    ecoEyebrow: "WHY FOOD VERSE",
    ecoTitle: "গ্রোথের জন্য সবকিছু আগেই তৈরি আছে",
    ecoDesc:
      "এটি শুধু একটি landing page না। এটি একটি complete operational ecosystem, যা নতুন agent-কে দ্রুত launch করতে এবং প্রথম দিন থেকেই professional দেখাতে সাহায্য করে।",
    benefitsEyebrow: "AGENT BENEFITS",
    benefitsTitle: "Food Verse agent হিসেবে আপনি যা পাবেন",
    benefitsDesc:
      "প্রতিটি feature এমনভাবে তৈরি করা হয়েছে যাতে আপনি নিজের area চালাতে, operations manage করতে এবং local delivery business grow করতে পারেন।",
    reasonsEyebrow: "BUSINESS VALUE",
    reasonsTitle: "কেন মানুষ এই সুযোগে আকৃষ্ট হবে",
    reasonsDesc:
      "Food Verse উচ্চাকাঙ্ক্ষী মানুষকে income, independence এবং local business ownership-এর structured path দেয়।",
    contactEyebrow: "START TODAY",
    contactTitle: "Food Verse-এর সাথে আপনার জোন শুরু করুন",
    contactDesc:
      "আপনি যদি নিজের এলাকায় একটি serious food delivery business তৈরি করতে চান, তাহলে এখনই WhatsApp-এ যোগাযোগ করুন।",
    contactNumber: "যোগাযোগ নম্বর",
    responseTime: "রেসপন্স টাইম",
    responseValue: "দ্রুত WhatsApp রেসপন্স",
    finalCta: "এখনই WhatsApp-এ কথা বলুন",
    footer: "Food Verse Agent Opportunity",
    bagTitle: "প্রিমিয়াম ডেলিভারি ব্যাগ",
    bagText: "Waterproof, heatproof, durable এবং professional-quality delivery bag support।",
    marketingTitle: "মার্কেটিং সাপোর্ট",
    marketingText: "আপনার zone promote করার জন্য branding ও local marketing support থাকবে।",
    incomeTitle: "আয়ের সুযোগ",
    incomeText: "নিজের zone-এর মাধ্যমে income তৈরি এবং স্বাবলম্বী হওয়ার বাস্তব সুযোগ।",
    zoneTitle: "নিজস্ব জোন",
    zoneText: "structure, control এবং long-term business potential নিয়ে নিজের area grow করুন।",
    features: [
      {
        title: "Order Control",
        desc: "একটি dashboard থেকে order monitor, delivery flow update এবং operation manage করুন।",
        icon: Package,
      },
      {
        title: "Restaurant Control",
        desc: "নিজের zone-এর restaurant partners, menu flow ও daily order activity manage করুন।",
        icon: Store,
      },
      {
        title: "Rider Control",
        desc: "rider track করুন, delivery coordinate করুন এবং field performance improve করুন।",
        icon: Bike,
      },
      {
        title: "Reports & Accounts",
        desc: "daily sales, totals, performance এবং business numbers clean dashboard-এ দেখুন।",
        icon: Wallet,
      },
      {
        title: "Website & Online Presence",
        desc: "strong digital presence customer trust এবং business credibility বাড়ায়।",
        icon: Globe,
      },
      {
        title: "Smart Admin System",
        desc: "modern admin ecosystem আপনাকে structure, speed এবং strong business control দেয়।",
        icon: Briefcase,
      },
    ],
    reasons: [
      "income এবং independence-এর বাস্তব পথ",
      "শূন্য থেকে নয়, ready-made digital ecosystem দিয়ে শুরু",
      "app, website এবং dashboard support-এর professional structure",
      "নিজের zone-এর ভেতর শক্তিশালী local business potential",
      "long-term growth-এর জন্য scalable delivery model",
    ],
  },
};

function SectionHeading({ eyebrow, title, desc }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.24em] text-blue-700 sm:text-xs">
        {eyebrow}
      </div>
      <h2 className="mt-3 text-[1.6rem] font-black leading-[1.08] tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-3 text-[14px] leading-6 text-slate-600 sm:text-base sm:leading-7">{desc}</p>
    </div>
  );
}

function StatPill({ text }) {
  return (
    <div className="rounded-2xl border border-blue-200/80 bg-white/95 px-3 py-3 text-center text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-700 shadow-sm sm:rounded-full sm:px-4 sm:text-sm">
      {text}
    </div>
  );
}

export default function AgentPartnerLanding() {
  const [lang, setLang] = useState("en");
  const t = useMemo(() => copy[lang], [lang]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#eef5ff_0%,#ffffff_22%,#edf4ff_100%)] text-slate-900">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-80px] top-[-60px] h-48 w-48 rounded-full bg-blue-500/20 blur-3xl animate-pulse" />
        <div className="absolute right-[-100px] top-[120px] h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-[-100px] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-500/15 blur-3xl animate-pulse" />
      </div>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/70 bg-white/90 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="text-[1.05rem] font-black leading-none tracking-tight text-slate-950 sm:text-xl">Food Verse</p>
            <p className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.28em] text-blue-700 sm:text-[11px]">
              AGENT Opportunity
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => setLang(lang === "en" ? "bn" : "en")}
              className="rounded-full border border-blue-200 bg-white px-3 py-2 text-[11px] font-extrabold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:px-4 sm:text-xs"
            >
              {t.langButton}
            </button>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-800 via-blue-600 to-cyan-500 px-3.5 py-2.5 text-[11px] font-extrabold text-white shadow-[0_14px_30px_rgba(37,99,235,0.28)] transition hover:-translate-y-0.5 sm:gap-2 sm:px-5 sm:text-sm"
            >
              <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {t.navButton}
            </a>
          </div>
        </div>
      </header>

      <main className="pt-[72px] sm:pt-[82px]">
        <section className="px-3 pb-8 pt-6 sm:px-6 lg:px-8 lg:pt-10">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.24em] text-blue-700 shadow-sm sm:text-xs">
                <Sparkles className="h-3.5 w-3.5" />
                {t.heroBadge}
              </div>

              <h1 className="mt-4 text-[2.1rem] font-black leading-[0.98] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                {t.heroTitle1}
                <span className="mt-1.5 block bg-gradient-to-r from-blue-900 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  {t.heroTitle2}
                </span>
              </h1>

              <p className="mt-4 max-w-3xl text-[14px] leading-6 text-slate-600 sm:text-lg sm:leading-8">
                {t.heroDesc}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                <StatPill text={t.stat1} />
                <StatPill text={t.stat2} />
                <div className="col-span-2 sm:col-span-1">
                  <StatPill text={t.stat3} />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-2xl">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-800 via-blue-600 to-cyan-500 px-5 text-sm font-extrabold text-white shadow-[0_18px_40px_rgba(37,99,235,0.28)] transition hover:-translate-y-0.5"
                >
                  {t.primaryCta}
                  <ArrowRight className="h-5 w-5" />
                </a>
                <a
                  href="#benefits"
                  className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-5 text-sm font-bold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {t.secondaryCta}
                  <ChevronRight className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="px-3 pb-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-[28px] border border-blue-100 bg-[linear-gradient(135deg,#081129_0%,#12357d_52%,#0ea5e9_100%)] p-4 shadow-[0_30px_80px_rgba(59,130,246,0.26)] sm:p-6">
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-cyan-300/20 blur-2xl" />
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-cyan-300 via-white to-blue-400" />

              <div className="relative">
                <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.24em] text-cyan-100 sm:text-xs">
                  {t.panelEyebrow}
                </div>
                <h3 className="mt-3 max-w-xl text-[1.8rem] font-black leading-[1.02] text-white sm:text-4xl">
                  {t.panelTitle}
                </h3>
                <p className="mt-3 max-w-xl text-[14px] leading-6 text-blue-50/90 sm:text-base sm:leading-7">
                  {t.panelText}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {[
                    { title: t.mini1Title, text: t.mini1Text },
                    { title: t.mini2Title, text: t.mini2Text },
                    { title: t.mini3Title, text: t.mini3Text },
                    { title: t.mini4Title, text: t.mini4Text },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-[22px] border border-white/10 bg-white/10 p-3.5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white/15 sm:p-4"
                    >
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-cyan-100 sm:text-[11px]">
                        {item.title}
                      </p>
                      <p className="mt-2 text-[1rem] font-black leading-tight text-white sm:text-lg">{item.title}</p>
                      <p className="mt-2 text-[12px] leading-5 text-blue-50/90 sm:text-sm sm:leading-6">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-3 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeading eyebrow={t.ecoEyebrow} title={t.ecoTitle} desc={t.ecoDesc} />

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4 sm:gap-4">
              {[
                { title: t.marketingTitle, text: t.marketingText, icon: Megaphone },
                { title: t.bagTitle, text: t.bagText, icon: ShieldCheck },
                { title: t.incomeTitle, text: t.incomeText, icon: Wallet },
                { title: t.zoneTitle, text: t.zoneText, icon: BarChart3 },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="group rounded-[24px] border border-blue-100 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_rgba(37,99,235,0.16)] sm:rounded-[28px] sm:p-5"
                  >
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${idx % 2 === 0 ? "from-blue-700 to-cyan-500" : "from-slate-900 to-blue-700"} text-white shadow-lg sm:h-14 sm:w-14`}>
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <h3 className="mt-4 text-[1.05rem] font-black leading-tight text-slate-950 sm:text-xl">{item.title}</h3>
                    <p className="mt-2 text-[12px] leading-5 text-slate-600 sm:text-sm sm:leading-7">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="benefits" className="px-3 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeading eyebrow={t.benefitsEyebrow} title={t.benefitsTitle} desc={t.benefitsDesc} />

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-3 sm:gap-4">
              {t.features.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="group relative overflow-hidden rounded-[24px] border border-blue-100 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_60px_rgba(37,99,235,0.18)] sm:rounded-[30px] sm:p-6"
                  >
                    <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-blue-100/60 blur-2xl transition duration-300 group-hover:bg-cyan-100" />
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${index % 2 === 0 ? "from-blue-800 to-cyan-500" : "from-slate-900 to-blue-600"} text-white shadow-lg sm:h-14 sm:w-14`}>
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <h3 className="mt-4 text-[1.05rem] font-black leading-tight text-slate-950 sm:text-xl">{item.title}</h3>
                    <p className="mt-2 text-[12px] leading-5 text-slate-600 sm:text-[15px] sm:leading-7">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-3 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="rounded-[28px] border border-blue-100 bg-[linear-gradient(135deg,#f8fbff_0%,#eef5ff_100%)] p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:rounded-[32px] sm:p-8">
              <div className="inline-flex rounded-full border border-blue-200 bg-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.24em] text-blue-700 sm:text-[11px]">
                {t.reasonsEyebrow}
              </div>
              <h3 className="mt-4 text-[1.8rem] font-black leading-[1.08] text-slate-950 sm:text-4xl">
                {t.reasonsTitle}
              </h3>
              <p className="mt-3 text-[14px] leading-6 text-slate-600 sm:text-base sm:leading-7">{t.reasonsDesc}</p>
            </div>

            <div className="grid gap-3">
              {t.reasons.map((reason) => (
                <div
                  key={reason}
                  className="flex items-start gap-3 rounded-[22px] border border-blue-100 bg-white p-4 shadow-[0_14px_35px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(37,99,235,0.14)] sm:rounded-[24px] sm:p-5"
                >
                  <div className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-800 to-cyan-500 text-white">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <p className="text-[14px] font-semibold leading-6 text-slate-800 sm:text-base sm:leading-7">{reason}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-3 pb-14 pt-6 sm:px-6 lg:px-8 lg:pb-24">
          <div className="mx-auto max-w-7xl">
            <div className="overflow-hidden rounded-[30px] border border-blue-100 bg-[linear-gradient(135deg,#071229_0%,#1745ad_48%,#0ea5e9_100%)] p-5 shadow-[0_30px_80px_rgba(37,99,235,0.26)] sm:rounded-[34px] sm:p-8 lg:p-10">
              <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                <div>
                  <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.24em] text-cyan-100 sm:text-[11px]">
                    {t.contactEyebrow}
                  </div>
                  <h3 className="mt-4 text-[2rem] font-black leading-[1.04] text-white sm:text-5xl">
                    {t.contactTitle}
                  </h3>
                  <p className="mt-4 max-w-2xl text-[14px] leading-6 text-blue-50/90 sm:text-base sm:leading-7">
                    {t.contactDesc}
                  </p>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-md sm:rounded-[28px] sm:p-6">
                  <div className="grid gap-4">
                    <div className="rounded-[20px] border border-white/10 bg-slate-950/20 p-4">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-cyan-100 sm:text-[11px]">
                        {t.contactNumber}
                      </p>
                      <p className="mt-2 text-[2rem] font-black tracking-tight text-white sm:text-4xl">01329613145</p>
                    </div>
                    <div className="rounded-[20px] border border-white/10 bg-slate-950/20 p-4">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-cyan-100 sm:text-[11px]">
                        {t.responseTime}
                      </p>
                      <p className="mt-2 text-[1.1rem] font-black text-white sm:text-2xl">{t.responseValue}</p>
                    </div>
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-extrabold text-blue-800 shadow-[0_18px_40px_rgba(255,255,255,0.15)] transition hover:-translate-y-0.5 sm:text-base"
                    >
                      <MessageCircle className="h-5 w-5" />
                      {t.finalCta}
                      <ArrowRight className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-blue-100 bg-white/70 px-3 py-6 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-sm font-bold text-slate-700">{t.footer}</p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700 sm:text-xs">Food Verse</p>
        </div>
      </footer>
    </div>
  );
}
