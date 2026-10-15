import type { Language } from '../store/useLanguageStore';

export interface LandingCopy {
  nav: { services: string; how: string; why: string; login: string; becomePro: string };
  hero: {
    badge: string;
    title: string;
    sub: string;
    service: string;
    pick: string;
    city: string;
    cityPh: string;
    cta: string;
    points: string[];
  };
  servicesTitle: string;
  servicesSub: string;
  services: { key: string; label: string }[];
  howTitle: string;
  steps: { title: string; text: string }[];
  whyTitle: string;
  why: { title: string; text: string }[];
  pro: { title: string; text: string; cta: string };
  footer: { tagline: string; clients: string; pros: string; signUp: string; login: string; rights: string };
}

export const landingCopy: Record<Language, LandingCopy> = {
  fr: {
    nav: {
      services: 'Services',
      how: 'Comment ça marche',
      why: 'Pourquoi El 7al',
      login: 'Se connecter',
      becomePro: 'Devenir artisan',
    },
    hero: {
      badge: "Dépannage d'urgence 24/7 en Tunisie",
      title: 'Un artisan de confiance, chez vous en quelques minutes',
      sub: 'Décrivez votre problème : les artisans vérifiés autour de vous reçoivent la demande et le plus proche accepte.',
      service: 'Service',
      pick: 'Choisir un service',
      city: 'Où ?',
      cityPh: 'Ville ou quartier',
      cta: 'Trouver un artisan',
      points: ['Artisans vérifiés', 'Suivi en direct', 'Avis clients réels'],
    },
    servicesTitle: 'Tous les services dont vous avez besoin',
    servicesSub: 'Choisissez un métier pour lancer votre demande.',
    services: [
      { key: 'plomb', label: 'Plomberie' },
      { key: 'elec', label: 'Électricité' },
      { key: 'clim', label: 'Climatisation' },
      { key: 'serr', label: 'Serrurerie' },
      { key: 'meca', label: 'Mécanique auto' },
      { key: 'pein', label: 'Peinture' },
      { key: 'menu', label: 'Menuiserie' },
      { key: 'autre', label: 'Autres services' },
    ],
    howTitle: 'Comment ça marche',
    steps: [
      { title: 'Décrivez le problème', text: 'Choisissez le service, indiquez où vous êtes et ce qui ne va pas.' },
      {
        title: 'Un artisan accepte',
        text: 'Les artisans proches reçoivent votre demande. Le premier disponible accepte.',
      },
      { title: 'Suivez et confirmez', text: "Suivez son arrivée en direct, puis confirmez la fin de l'intervention." },
    ],
    whyTitle: 'Pourquoi choisir El 7al',
    why: [
      {
        title: 'Artisans vérifiés',
        text: "Chaque artisan fournit ses pièces d'identité et son profil est validé avant de recevoir des demandes.",
      },
      {
        title: "Le plus proche d'abord",
        text: 'Les demandes sont envoyées aux artisans en ligne à proximité, pas à toute la ville.',
      },
      {
        title: 'Avis après chaque mission',
        text: "Notez l'artisan à la fin : les avis aident les prochains clients à bien choisir.",
      },
    ],
    pro: {
      title: 'Vous êtes artisan ?',
      text: 'Recevez des demandes près de vous et développez votre activité. Commission fixe de 30 TND par mission terminée.',
      cta: 'Rejoindre El 7al',
    },
    footer: {
      tagline: 'Dépannage express en Tunisie',
      clients: 'Clients',
      pros: 'Artisans',
      signUp: 'Créer un compte',
      login: 'Se connecter',
      rights: 'Tous droits réservés.',
    },
  },
  en: {
    nav: { services: 'Services', how: 'How it works', why: 'Why El 7al', login: 'Log in', becomePro: 'Become a pro' },
    hero: {
      badge: '24/7 emergency repairs in Tunisia',
      title: 'A trusted tradesperson at your door in minutes',
      sub: 'Describe the problem: verified pros around you get the request and the closest one accepts.',
      service: 'Service',
      pick: 'Choose a service',
      city: 'Where?',
      cityPh: 'City or area',
      cta: 'Find a pro',
      points: ['Verified pros', 'Live tracking', 'Real customer reviews'],
    },
    servicesTitle: 'Every service you need',
    servicesSub: 'Pick a trade to start your request.',
    services: [
      { key: 'plomb', label: 'Plumbing' },
      { key: 'elec', label: 'Electrical' },
      { key: 'clim', label: 'Air conditioning' },
      { key: 'serr', label: 'Locksmith' },
      { key: 'meca', label: 'Car mechanic' },
      { key: 'pein', label: 'Painting' },
      { key: 'menu', label: 'Carpentry' },
      { key: 'autre', label: 'Other services' },
    ],
    howTitle: 'How it works',
    steps: [
      { title: 'Describe the problem', text: 'Choose the service, say where you are and what is wrong.' },
      { title: 'A pro accepts', text: 'Nearby pros receive your request. The first one available accepts.' },
      { title: 'Track and confirm', text: 'Follow their arrival live, then confirm when the job is done.' },
    ],
    whyTitle: 'Why choose El 7al',
    why: [
      {
        title: 'Verified pros',
        text: 'Every pro provides identity documents and is approved before receiving requests.',
      },
      { title: 'Closest first', text: 'Requests go to online pros nearby, not to the whole city.' },
      {
        title: 'Reviews after every job',
        text: 'Rate the pro at the end: reviews help the next customer choose well.',
      },
    ],
    pro: {
      title: 'Are you a tradesperson?',
      text: 'Get requests near you and grow your business. Flat 30 TND commission per completed job.',
      cta: 'Join El 7al',
    },
    footer: {
      tagline: 'Express repairs in Tunisia',
      clients: 'Customers',
      pros: 'Pros',
      signUp: 'Create an account',
      login: 'Log in',
      rights: 'All rights reserved.',
    },
  },
  ar: {
    nav: { services: 'الخدمات', how: 'كيف يعمل', why: 'لماذا El 7al', login: 'تسجيل الدخول', becomePro: 'انضم كحرفي' },
    hero: {
      badge: 'إصلاحات طارئة على مدار الساعة في تونس',
      title: 'حرفي موثوق عند بابك في دقائق',
      sub: 'صف المشكلة: يصل الطلب إلى الحرفيين الموثّقين حولك ويقبله الأقرب.',
      service: 'الخدمة',
      pick: 'اختر خدمة',
      city: 'أين؟',
      cityPh: 'المدينة أو الحي',
      cta: 'ابحث عن حرفي',
      points: ['حرفيون موثّقون', 'تتبّع مباشر', 'تقييمات حقيقية'],
    },
    servicesTitle: 'كل الخدمات التي تحتاجها',
    servicesSub: 'اختر مهنة لبدء طلبك.',
    services: [
      { key: 'plomb', label: 'السباكة' },
      { key: 'elec', label: 'الكهرباء' },
      { key: 'clim', label: 'التكييف' },
      { key: 'serr', label: 'الأقفال' },
      { key: 'meca', label: 'ميكانيك السيارات' },
      { key: 'pein', label: 'الدهان' },
      { key: 'menu', label: 'النجارة' },
      { key: 'autre', label: 'خدمات أخرى' },
    ],
    howTitle: 'كيف يعمل',
    steps: [
      { title: 'صف المشكلة', text: 'اختر الخدمة وحدّد مكانك وما العطل.' },
      { title: 'حرفي يقبل الطلب', text: 'يصل طلبك إلى الحرفيين القريبين وأول متاح يقبله.' },
      { title: 'تابع وأكّد', text: 'تابع وصوله مباشرة ثم أكّد انتهاء العمل.' },
    ],
    whyTitle: 'لماذا تختار El 7al',
    why: [
      { title: 'حرفيون موثّقون', text: 'يقدّم كل حرفي وثائق هويته ويُعتمد ملفه قبل أن يستقبل الطلبات.' },
      { title: 'الأقرب أولاً', text: 'تُرسل الطلبات إلى الحرفيين المتصلين القريبين وليس إلى المدينة كلها.' },
      { title: 'تقييم بعد كل مهمة', text: 'قيّم الحرفي في النهاية: التقييمات تساعد العملاء القادمين.' },
    ],
    pro: {
      title: 'هل أنت حرفي؟',
      text: 'استقبل الطلبات القريبة منك ونمِّ نشاطك. عمولة ثابتة 30 دينارًا لكل مهمة منتهية.',
      cta: 'انضم إلى El 7al',
    },
    footer: {
      tagline: 'إصلاحات سريعة في تونس',
      clients: 'العملاء',
      pros: 'الحرفيون',
      signUp: 'إنشاء حساب',
      login: 'تسجيل الدخول',
      rights: 'جميع الحقوق محفوظة.',
    },
  },
};
