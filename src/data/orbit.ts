/**
 * Orbit — the Autumn 1405 season plan (1 Mehr → Yalda), the theme's working
 * example. Bilingual data in one file so ids stay paired across locales.
 *
 * Privacy: personal and financial items from the original private dashboard
 * (instalments, loans, bank, insurance, client names, health) are left out
 * on purpose. Client work appears as neutral labels.
 */

export type L10n = { fa: string; en: string };

export type Stream = 'brand' | 'content' | 'client' | 'll' | 'learn' | 'admin' | 'publish';

export type PhaseKey = 'foundation' | 'build' | 'launch' | 'review';

/** ISO dates (local, noon-anchored when parsed). */
export const SEASON = {
  start: '2026-09-23', // 1 Mehr 1405
  week1: '2026-09-26', // Saturday — weeks run Saturday → Friday
  yalda: '2026-12-21', // 30 Azar 1405
  reviewStart: '2026-12-19',
  weeks: 12,
  /** The working day lasts until this hour: 02:00 still counts as "today". */
  dayRolloverHour: 5,
} as const;

export const STREAMS: Record<Stream, L10n> = {
  brand: { fa: 'هویت و سایت', en: 'Identity & site' },
  content: { fa: 'محتوا', en: 'Content' },
  client: { fa: 'سفارش‌ها', en: 'Client work' },
  ll: { fa: 'لاگینگ‌لایف', en: 'LoggingLife' },
  learn: { fa: 'یادگیری و کاوش', en: 'Learning & exploring' },
  admin: { fa: 'سازمان‌دهی', en: 'Organising' },
  publish: { fa: 'انتشار', en: 'Publishing' },
};

export const PHASES: {
  key: PhaseKey;
  weeks: number[];
  name: L10n;
  note: L10n;
}[] = [
  {
    key: 'foundation',
    weeks: [0, 1, 2, 3, 4],
    name: { fa: 'پی‌ریزی', en: 'Foundation' },
    note: {
      fa: 'هویت، پروفایل‌ها، لوگو و سیستم شخصی. پایان: هویت بصری نهایی.',
      en: 'Identity, profiles, logo and the personal system. Ends with the final visual identity.',
    },
  },
  {
    key: 'build',
    weeks: [5, 6, 7, 8],
    name: { fa: 'ساختن', en: 'Build' },
    note: {
      fa: 'کدنویسی سایت، نمونه‌کارها و کیس‌استادی‌ها. پایان: سایت زنده.',
      en: 'Coding the site, portfolio and case studies. Ends with the site live.',
    },
  },
  {
    key: 'launch',
    weeks: [9, 10, 11, 12],
    name: { fa: 'پرتاب', en: 'Launch' },
    note: {
      fa: 'دستیار شخصی، صیقل سایت و کیس‌استادی اپ. پایان: چهار خروجی.',
      en: 'Personal assistant, site polish and the app case study. Ends with four outputs.',
    },
  },
  {
    key: 'review',
    weeks: [13],
    name: { fa: 'مرور فصل', en: 'Season review' },
    note: {
      fa: 'شب یلدا: مرور فصل و طراحی زمستان.',
      en: 'Yalda night: review the season, design the winter.',
    },
  },
];

/** Weekly column topics, cycling every four weeks. */
const CYCLE: L10n[] = [
  { fa: 'اثر هنری و شعر', en: 'Artwork and poetry' },
  { fa: 'شکافتن یک طراحی', en: 'Dissecting a design' },
  { fa: 'هنر و علم', en: 'Art and science' },
  { fa: 'ساختن سیستم با هوش مصنوعی', en: 'Building systems with AI' },
];

export interface OrbitItem {
  id: string;
  week: number;
  stream: Stream;
  t: L10n;
  /** A dated milestone (ISO date). */
  due?: string;
  /** A milestone without a date (e.g. "output 1 of 4"). */
  tag?: L10n;
}

const pub = (n: number): OrbitItem => ({
  id: `pub-${n}`,
  week: n,
  stream: 'content',
  t: {
    fa: `انتشار ${new Intl.NumberFormat('fa-IR').format(n)} — ${CYCLE[(n - 1) % 4]!.fa}`,
    en: `Publication ${n} — ${CYCLE[(n - 1) % 4]!.en}`,
  },
});

const outreach = (w: number): OrbitItem => ({
  id: `w${w}-out`,
  week: w,
  stream: 'client',
  t: { fa: 'پنج پیشنهاد به مشتری تازه', en: 'Five proposals to new clients' },
});

const output = (n: number): L10n => ({
  fa: `خروجی ${new Intl.NumberFormat('fa-IR').format(n)} از ۴`,
  en: `Output ${n} of 4`,
});

export const ITEMS: OrbitItem[] = [
  { id: 'w0-cal', week: 0, stream: 'admin', t: { fa: 'ثبت بلوک‌های کار در تقویم', en: 'Put the work blocks in the calendar' } },
  { id: 'w0-arch', week: 0, stream: 'admin', t: { fa: 'بایگانی یادآورهای کهنه', en: 'Archive stale reminders' } },
  { id: 'w1-li', week: 1, stream: 'brand', t: { fa: 'پروفایل کامل لینکدین', en: 'Complete LinkedIn profile' }, due: '2026-10-02' },
  { id: 'w1-prof', week: 1, stream: 'brand', t: { fa: 'ساخت پروفایل اینستاگرام، یوتیوب و پینترست', en: 'Set up Instagram, YouTube and Pinterest profiles' } },
  { id: 'w1-inv', week: 1, stream: 'brand', t: { fa: 'فهرست نمونه‌کارهای موجود', en: 'Inventory of existing work' } },
  pub(1),
  { id: 'w1-c1', week: 1, stream: 'client', t: { fa: 'شروع پروژهٔ برندینگ مشتری', en: 'Start the client branding project' } },
  { id: 'w1-ll', week: 1, stream: 'll', t: { fa: 'بستن پرسش‌های باز سیستم', en: 'Close the open questions in the system' } },
  { id: 'w2-c1', week: 2, stream: 'client', t: { fa: 'تحویل پروژهٔ برندینگ مشتری', en: 'Deliver the client branding project' }, due: '2026-10-09' },
  { id: 'w2-pos', week: 2, stream: 'brand', t: { fa: 'جملهٔ جایگاه دوزبانه', en: 'Bilingual positioning statement' } },
  { id: 'w2-logo', week: 2, stream: 'brand', t: { fa: 'طرح اولیهٔ لوگو', en: 'First logo sketches' } },
  pub(2),
  { id: 'w2-ll', week: 2, stream: 'll', t: { fa: 'اسمارت‌لیست‌ها و هم‌ساعت‌کردن چرخهٔ روزانه', en: 'Smart lists and a synced daily cycle' } },
  { id: 'w3-c2', week: 3, stream: 'client', t: { fa: 'پیشنهاد طراحی به مشتری دوم', en: 'Design proposal for the second client' } },
  { id: 'w3-logo', week: 3, stream: 'brand', t: { fa: 'لوگوی نهایی', en: 'Final logo' } },
  pub(3),
  { id: 'w3-ll', week: 3, stream: 'll', t: { fa: 'تگ‌گذاری نوت‌های قدیمی', en: 'Tag the old notes' } },
  { id: 'w3-trade', week: 3, stream: 'learn', t: { fa: 'سند استراتژی و قوانین ریسک ترید', en: 'Trading strategy and risk rules document' } },
  { id: 'w4-id', week: 4, stream: 'brand', t: { fa: 'هویت بصری نهایی', en: 'Final visual identity' }, due: '2026-10-23' },
  { id: 'w4-fig', week: 4, stream: 'brand', t: { fa: 'طراحی سایت در فیگما', en: 'Site design in Figma' } },
  { id: 'w4-pack', week: 4, stream: 'client', t: { fa: 'سه بستهٔ خدمات با قیمت', en: 'Three priced service packages' } },
  { id: 'w4-ll', week: 4, stream: 'll', t: { fa: 'سیستم لاگینگ‌لایف کامل', en: 'LoggingLife system complete' }, tag: output(1) },
  { id: 'w4-yt', week: 4, stream: 'content', t: { fa: 'ویدیوی بلند ۱ — روند ساخت یک تابلو', en: 'Long video 1 — making a painting' } },
  pub(4),
  { id: 'w4-cert', week: 4, stream: 'learn', t: { fa: 'گواهی ۱ آکادمی آنتروپیک', en: 'Anthropic Academy certificate 1' } },
  { id: 'w4-rev', week: 4, stream: 'admin', t: { fa: 'مرور فاز یک', en: 'Phase one review' } },
  { id: 'w5-code', week: 5, stream: 'brand', t: { fa: 'شروع کدنویسی سایت', en: 'Start coding the site' } },
  outreach(5),
  pub(5),
  { id: 'w5-ll', week: 5, stream: 'll', t: { fa: 'پیش‌نویس مقالهٔ معرفی لاگینگ‌لایف', en: 'Draft the LoggingLife introduction article' } },
  { id: 'w6-c2', week: 6, stream: 'client', t: { fa: 'تحویل پروژهٔ مشتری دوم', en: 'Deliver the second client project' }, due: '2026-11-06' },
  { id: 'w6-port', week: 6, stream: 'brand', t: { fa: 'بخش نمونه‌کارهای سایت', en: 'Portfolio section of the site' } },
  outreach(6),
  pub(6),
  { id: 'w6-ll', week: 6, stream: 'll', t: { fa: 'طراحی صفحهٔ معرفی لاگینگ‌لایف', en: 'Design the LoggingLife landing page' } },
  { id: 'w7-site', week: 7, stream: 'brand', t: { fa: 'صفحه‌های کیس‌استادی', en: 'Case study pages' } },
  { id: 'w7-ll', week: 7, stream: 'll', t: { fa: 'صفحه و مقالهٔ معرفی لاگینگ‌لایف', en: 'LoggingLife page and article' }, tag: output(2) },
  outreach(7),
  pub(7),
  { id: 'w8-live', week: 8, stream: 'brand', t: { fa: 'سایت زنده با سه کیس‌استادی', en: 'Site live with three case studies' }, due: '2026-11-20' },
  { id: 'w8-yt', week: 8, stream: 'content', t: { fa: 'ویدیوی بلند ۲ — داستان ساخت سایت', en: 'Long video 2 — the story of the site' } },
  outreach(8),
  pub(8),
  { id: 'w8-cert', week: 8, stream: 'learn', t: { fa: 'گواهی ۲ آکادمی آنتروپیک', en: 'Anthropic Academy certificate 2' } },
  { id: 'w8-rev', week: 8, stream: 'admin', t: { fa: 'مرور فاز دو', en: 'Phase two review' } },
  { id: 'w9-agent', week: 9, stream: 'll', t: { fa: 'طراحی دستیار شخصی', en: 'Design the personal assistant' } },
  { id: 'w9-pol', week: 9, stream: 'brand', t: { fa: 'صیقل سایت', en: 'Polish the site' } },
  outreach(9),
  pub(9),
  { id: 'w10-agent', week: 10, stream: 'll', t: { fa: 'دستیار شخصی نسخهٔ یک', en: 'Personal assistant v1' }, tag: output(3) },
  { id: 'w10-pol', week: 10, stream: 'brand', t: { fa: 'بهبود سایت از روی بازخورد', en: 'Improve the site from feedback' } },
  outreach(10),
  pub(10),
  { id: 'w11-app', week: 11, stream: 'll', t: { fa: 'نمونهٔ تعاملی اپ در فیگما', en: 'Interactive app prototype in Figma' } },
  { id: 'w11-pol', week: 11, stream: 'brand', t: { fa: 'افزودن کیس‌استادی تازه به سایت', en: 'Add a new case study to the site' } },
  outreach(11),
  pub(11),
  { id: 'w12-case', week: 12, stream: 'll', t: { fa: 'کیس‌استادی اپ', en: 'App case study' }, tag: output(4) },
  { id: 'w12-yt', week: 12, stream: 'content', t: { fa: 'ویدیوی بلند ۳ — جمع‌بندی فصل', en: 'Long video 3 — the season in review' } },
  pub(12),
  { id: 'w12-cert', week: 12, stream: 'learn', t: { fa: 'گواهی ۳ آکادمی آنتروپیک', en: 'Anthropic Academy certificate 3' } },
  { id: 'y-rev', week: 13, stream: 'admin', t: { fa: 'مرور فصل در شب یلدا', en: 'Season review on Yalda night' }, due: '2026-12-21' },
  { id: 'y-next', week: 13, stream: 'admin', t: { fa: 'طراحی فصل زمستان', en: 'Design the winter season' } },
];

/**
 * Two deep-work blocks per night, by day of week (0 = Sunday … 6 = Saturday).
 * Friday floats. From week 9 the Tuesday first block moves to LoggingLife.
 */
export const BLOCKS: Record<number, [Stream, L10n?][]> = {
  6: [['brand'], ['ll']],
  0: [['content', { fa: 'ساختن ستون هفته', en: 'Build the weekly column' }], ['client']],
  1: [['client'], ['brand']],
  2: [['brand'], ['content', { fa: 'پرداخت ستون هفته', en: 'Polish the weekly column' }]],
  3: [['client'], ['ll']],
  4: [['publish', { fa: 'انتشار ۲۱:۳۰ و برش برای چهار پلتفرم', en: 'Publish at 21:30, cut for four platforms' }], ['learn']],
};

export const DAY_RHYTHM: { time: string; t: L10n; deep?: boolean }[] = [
  { time: '12:00', t: { fa: 'بیداری، نیم ساعت بدون گوشی', en: 'Wake up, half an hour without the phone' } },
  { time: '13:30', t: { fa: 'جهت‌گیری: یادآورها، تقویم، سه کار اصلی', en: 'Orientation: reminders, calendar, three main tasks' } },
  { time: '15:00–18:00', t: { fa: 'بلوک سبک: مشتری، پیشنهادها، تعامل، خانواده', en: 'Light block: clients, proposals, engagement, family' } },
  { time: '21:30', t: { fa: 'اتصال: باز کردن نوت پروژهٔ امشب', en: 'Connect: open tonight’s project note' } },
  { time: '22:00–00:30', t: { fa: 'بلوک عمیق یک', en: 'Deep block one' }, deep: true },
  { time: '00:30–01:00', t: { fa: 'استراحت بدون صفحهٔ نمایش', en: 'Screen-free break' } },
  { time: '01:00–03:00', t: { fa: 'بلوک عمیق دو', en: 'Deep block two' }, deep: true },
  { time: '03:00', t: { fa: 'بازتاب شبانه و سه کار فردا', en: 'Nightly reflection and tomorrow’s three tasks' } },
  { time: '05:00', t: { fa: 'خواب', en: 'Sleep' } },
];

export const RULES: L10n[] = [
  { fa: 'سقف دو پروژهٔ فعال: برند و لاگینگ‌لایف.', en: 'Two active projects at most: the brand and LoggingLife.' },
  { fa: 'یکی تو، یکی بیرون: کار جدید فقط جای کار دیگری را می‌گیرد.', en: 'One in, one out: new work only replaces other work.' },
  { fa: 'تمام‌شده یعنی منتشر یا تحویل‌شده.', en: 'Finished means published or delivered.' },
  { fa: 'تاریخ ثابت، دامنه متغیر.', en: 'Fixed date, flexible scope.' },
  { fa: 'کاوش فقط در بلوک پنجشنبه؛ بقیه فقط ساختن.', en: 'Exploration only in the Thursday block; the rest is making.' },
  { fa: 'روز بد: یک بلوک چهل‌وپنج‌دقیقه‌ای و بازتاب شبانه.', en: 'Bad day: one 45-minute block and the nightly reflection.' },
  { fa: 'هیچ جریانی دو روز پشت سر هم صفر نمی‌ماند.', en: 'No stream stays at zero two days in a row.' },
  { fa: 'تازگی درون تکرار: فرم را عوض کن، نه پروژه را.', en: 'Novelty inside repetition: change the form, not the project.' },
  { fa: 'پاداش بعد از تحویل، نه بعد از شروع.', en: 'Reward after delivery, not after starting.' },
  { fa: 'زیر شصت درصد بلوک در هفته، برنامه سبک می‌شود؛ تو سرزنش نمی‌شوی.', en: 'Under 60% of blocks in a week, the plan gets lighter — you are not blamed.' },
];

export const TARGETS = {
  blocksWeekly: 0.8,
  blocksWarn: 0.6,
  audience: { fa: 'هدف یلدا: ۱٬۰۰۰ تا ۲٬۰۰۰ مخاطب در چهار پلتفرم', en: 'Yalda target: 1,000–2,000 followers across four platforms' },
};
