import type { Language } from '../store/useLanguageStore';
import { useLanguageStore } from '../store/useLanguageStore';

export interface FaqItem {
  group: 'client' | 'pro' | 'account';
  q: string;
  a: string;
}

interface SiteCopy {
  nav: {
    home: string;
    how: string;
    faq: string;
    contact: string;
    login: string;
    becomePro: string;
    menu: string;
    mySpace: string;
  };
  footer: { tagline: string; product: string; artisans: string; help: string; rights: string; signUp: string };
  demo: {
    label: string;
    tabs: string[];
    describe: string;
    trade: string;
    tradeValue: string;
    description: string;
    descriptionValue: string;
    address: string;
    addressValue: string;
    ask: string;
    searching: string;
    searchingNote: string;
    accepted: string;
    onTheWay: string;
    call: string;
    tracking: string;
    finished: string;
    howWas: string;
    yourReview: string;
    reviewValue: string;
    sendReview: string;
    sample: string;
  };
  how: {
    crumb: string;
    title: string;
    lead: string;
    stages: { title: string; text: string }[];
    proLabel: string;
    proTitle: string;
    proSteps: { title: string; text: string }[];
  };
  faq: {
    crumb: string;
    title: string;
    lead: string;
    search: string;
    searchPh: string;
    tabs: { key: FaqItem['group']; label: string }[];
    none: string;
    notFound: string;
    notFoundText: string;
    toContact: string;
    items: FaqItem[];
  };
  contact: {
    crumb: string;
    title: string;
    lead: string;
    name: string;
    namePh: string;
    nameErr: string;
    reach: string;
    reachPh: string;
    reachErr: string;
    subject: string;
    subjects: string[];
    message: string;
    messagePh: string;
    messageErr: string;
    send: string;
    openingMail: string;
    emailLabel: string;
    coverage: string;
    coverageValue: string;
    urgentTitle: string;
    urgentText: string;
    urgentCta: string;
  };
  cta: { title: string; text: string; ask: string };
  home: {
    whyLabel: string;
    whyTitle: string;
    whyText: string;
    seeHow: string;
    proLabel: string;
    proTitle: string;
    proText: string;
    tradesLabel: string;
    tradesTitle: string;
    faqLabel: string;
    faqTitle: string;
    allAnswers: string;
  };
}

const fr: SiteCopy = {
  nav: {
    home: 'Accueil',
    how: 'Comment ça marche',
    faq: 'FAQ',
    contact: 'Contact',
    login: 'Se connecter',
    becomePro: 'Devenir artisan',
    menu: 'Menu',
    mySpace: 'Mon espace',
  },
  footer: {
    tagline: 'Dépannage d’urgence à domicile, partout en Tunisie.',
    product: 'Produit',
    artisans: 'Artisans',
    help: 'Aide',
    rights: 'Plateforme d’intervention d’urgence en temps réel.',
    signUp: 'Créer un compte',
  },
  demo: {
    label: 'Aperçu de l’application en 5 étapes',
    tabs: ['Décrire', 'Recherche', 'Accepté', 'Suivi', 'Avis'],
    describe: 'Quel est le problème ?',
    trade: 'Métier',
    tradeValue: 'Plomberie',
    description: 'Description',
    descriptionValue: 'Fuite d’eau sous l’évier',
    address: 'Adresse',
    addressValue: 'Votre position · GPS',
    ask: 'Demander l’intervention',
    searching: 'Recherche d’un artisan proche…',
    searchingNote: 'Les artisans proches reçoivent votre demande',
    accepted: 'Un artisan a accepté',
    onTheWay: 'En route vers vous',
    call: 'Appeler',
    tracking: 'Suivez-le en direct',
    finished: 'Travaux terminés',
    howWas: 'Comment s’est passée l’intervention ?',
    yourReview: 'Votre avis',
    reviewValue: 'Rapide et propre, merci !',
    sendReview: 'Envoyer l’avis',
    sample: 'Illustration : textes d’exemple.',
  },
  how: {
    crumb: 'Comment ça marche',
    title: 'De la panne à la solution, en 4 étapes.',
    lead: 'Le même parcours, côté client et côté artisan. Regardez-le se dérouler.',
    stages: [
      {
        title: 'Vous décrivez la panne',
        text: 'Choisissez le métier et indiquez où vous êtes : votre demande part aux artisans en ligne autour de vous.',
      },
      {
        title: 'Un artisan accepte',
        text: 'Le premier artisan disponible accepte : vous voyez son profil et vous suivez sa position.',
      },
      {
        title: 'Il arrive sur place',
        text: 'Vous suivez l’artisan sur la carte avec son heure d’arrivée, puis il réalise l’intervention.',
      },
      {
        title: 'Vous validez la fin des travaux',
        text: 'L’artisan déclare la fin, vous validez et vous laissez un avis.',
      },
    ],
    proLabel: 'Côté artisan',
    proTitle: 'Recevoir, accepter, intervenir.',
    proSteps: [
      {
        title: 'Passer en ligne',
        text: 'Vous activez votre disponibilité. Les demandes proches de vous arrivent en direct.',
      },
      { title: 'Accepter à temps', text: 'Vous voyez la distance et l’adresse, puis vous acceptez ou refusez.' },
      {
        title: 'Faire avancer l’étape',
        text: 'Vous indiquez : en route, sur place, travaux terminés. Le client suit en direct.',
      },
      {
        title: 'Validation du client',
        text: 'Le client confirme la fin des travaux. La mission passe dans votre historique.',
      },
    ],
  },
  faq: {
    crumb: 'FAQ',
    title: 'Vos questions, nos réponses.',
    lead: 'Tout ce qu’il faut savoir pour demander une intervention ou rejoindre El 7al.',
    search: 'Rechercher une question',
    searchPh: 'ex. commission, annulation…',
    tabs: [
      { key: 'client', label: 'Clients' },
      { key: 'pro', label: 'Artisans' },
      { key: 'account', label: 'Compte' },
    ],
    none: 'Aucune question ne correspond. Écrivez-nous depuis la page Contact.',
    notFound: 'Vous n’avez pas trouvé ?',
    notFoundText: 'Écrivez-nous, nous répondons dès que possible.',
    toContact: 'Aller à Contact',
    items: [
      {
        group: 'client',
        q: 'Comment demander une intervention ?',
        a: 'Choisissez le métier, décrivez le problème, confirmez votre adresse (ou utilisez le GPS) puis lancez la demande. Les artisans proches la reçoivent aussitôt.',
      },
      {
        group: 'client',
        q: 'Combien de temps avant l’arrivée de l’artisan ?',
        a: 'L’objectif est de 15 à 30 minutes. Dès qu’un artisan accepte, vous le suivez en direct sur la carte.',
      },
      {
        group: 'client',
        q: 'Les artisans sont-ils vérifiés ?',
        a: 'Chaque artisan fournit une pièce d’identité (CIN ou passeport) à l’inscription, et son profil est validé avant de recevoir des demandes.',
      },
      {
        group: 'client',
        q: 'Puis-je annuler une demande ?',
        a: 'Oui, tant que l’intervention n’est pas terminée : l’artisan est prévenu et la recherche s’arrête.',
      },
      {
        group: 'pro',
        q: 'Comment devenir artisan sur El 7al ?',
        a: 'Créez un compte artisan en 4 étapes : identité, zone et téléphone, domaines d’expertise, vérification d’identité.',
      },
      {
        group: 'pro',
        q: 'Quelle commission prélevez-vous ?',
        a: 'Une commission fixe de 30 TND par mission terminée, prélevée automatiquement à la clôture. Pas de pourcentage sur vos prix.',
      },
      {
        group: 'pro',
        q: 'Comment je reçois les demandes ?',
        a: 'Passez en ligne : les demandes proches de votre position arrivent en direct. Vous avez quelques secondes pour accepter ou refuser.',
      },
      {
        group: 'account',
        q: 'Dans quelles langues est disponible El 7al ?',
        a: 'Français, arabe (avec affichage de droite à gauche) et anglais.',
      },
      {
        group: 'account',
        q: 'J’ai oublié mon mot de passe.',
        a: 'Utilisez le lien « Mot de passe oublié ? » sur la page de connexion : un code est envoyé à votre e-mail.',
      },
    ],
  },
  contact: {
    crumb: 'Contact',
    title: 'Écrivez-nous.',
    lead: 'Une question, un problème avec une intervention, une idée de partenariat ? Nous vous lisons.',
    name: 'Nom et prénom',
    namePh: 'Votre nom',
    nameErr: 'Indiquez votre nom.',
    reach: 'E-mail ou téléphone',
    reachPh: 'adresse@exemple.tn',
    reachErr: 'Indiquez un moyen de vous joindre.',
    subject: 'Sujet',
    subjects: ['Question générale', 'Problème avec une intervention', 'Devenir artisan', 'Partenariat', 'Autre'],
    message: 'Message',
    messagePh: 'Dites-nous comment nous pouvons aider…',
    messageErr: 'Écrivez votre message.',
    send: 'Envoyer le message',
    openingMail: 'Votre application e-mail s’ouvre avec le message prêt à envoyer.',
    emailLabel: 'E-mail',
    coverage: 'Zone couverte',
    coverageValue: 'Tunisie',
    urgentTitle: 'Une urgence maintenant ?',
    urgentText: 'Ne passez pas par ce formulaire : lancez directement une demande.',
    urgentCta: 'Demander un artisan',
  },
  cta: {
    title: 'Une urgence à la maison ?',
    text: 'Décrivez le problème, un artisan vérifié proche de vous répond en direct.',
    ask: 'Demander un artisan',
  },
  home: {
    whyLabel: 'Pourquoi El 7al',
    whyTitle: 'Un artisan fiable, sans appeler dix numéros.',
    whyText: 'Vous décrivez la panne une seule fois. El 7al s’occupe de trouver, de rassurer et de suivre.',
    seeHow: 'Voir comment ça marche',
    proLabel: 'Pour les artisans',
    proTitle: 'Des demandes près de chez vous. Une commission fixe.',
    proText:
      'Vous recevez les demandes en direct et gardez le contrôle. Commission fixe de 30 TND par mission terminée.',
    tradesLabel: 'Métiers',
    tradesTitle: 'De la fuite d’eau à la serrure bloquée',
    faqLabel: 'FAQ',
    faqTitle: 'Les questions qu’on nous pose le plus',
    allAnswers: 'Toutes les réponses',
  },
};

const en: SiteCopy = {
  nav: {
    home: 'Home',
    how: 'How it works',
    faq: 'FAQ',
    contact: 'Contact',
    login: 'Log in',
    becomePro: 'Become a pro',
    menu: 'Menu',
    mySpace: 'My space',
  },
  footer: {
    tagline: 'Emergency home repairs, everywhere in Tunisia.',
    product: 'Product',
    artisans: 'Pros',
    help: 'Help',
    rights: 'Real-time emergency repair platform.',
    signUp: 'Create an account',
  },
  demo: {
    label: 'The app in 5 steps',
    tabs: ['Describe', 'Search', 'Accepted', 'Tracking', 'Review'],
    describe: 'What is the problem?',
    trade: 'Trade',
    tradeValue: 'Plumbing',
    description: 'Description',
    descriptionValue: 'Water leak under the sink',
    address: 'Address',
    addressValue: 'Your position · GPS',
    ask: 'Request the job',
    searching: 'Looking for a nearby pro…',
    searchingNote: 'Nearby pros receive your request',
    accepted: 'A pro accepted',
    onTheWay: 'On the way to you',
    call: 'Call',
    tracking: 'Follow them live',
    finished: 'Work done',
    howWas: 'How did the job go?',
    yourReview: 'Your review',
    reviewValue: 'Fast and clean, thanks!',
    sendReview: 'Send review',
    sample: 'Illustration: sample text.',
  },
  how: {
    crumb: 'How it works',
    title: 'From breakdown to fix, in 4 steps.',
    lead: 'The same path for customer and pro. Watch it unfold.',
    stages: [
      {
        title: 'You describe the problem',
        text: 'Pick the trade and say where you are: your request goes to the pros online around you.',
      },
      {
        title: 'A pro accepts',
        text: 'The first available pro accepts: you see their profile and follow their position.',
      },
      {
        title: 'They arrive on site',
        text: 'You follow the pro on the map with their arrival time, then they carry out the job.',
      },
      { title: 'You confirm the job is done', text: 'The pro declares the work done, you confirm and leave a review.' },
    ],
    proLabel: 'For pros',
    proTitle: 'Receive, accept, work.',
    proSteps: [
      { title: 'Go online', text: 'You switch on your availability. Requests near you arrive live.' },
      { title: 'Accept in time', text: 'You see the distance and the address, then accept or decline.' },
      { title: 'Move the job forward', text: 'You mark: on the way, on site, work done. The customer follows live.' },
      { title: 'Customer confirms', text: 'The customer confirms the work is done. The job moves to your history.' },
    ],
  },
  faq: {
    crumb: 'FAQ',
    title: 'Your questions, our answers.',
    lead: 'Everything you need to request a job or join El 7al.',
    search: 'Search a question',
    searchPh: 'e.g. commission, cancel…',
    tabs: [
      { key: 'client', label: 'Customers' },
      { key: 'pro', label: 'Pros' },
      { key: 'account', label: 'Account' },
    ],
    none: 'No question matches. Write to us from the Contact page.',
    notFound: 'Did not find it?',
    notFoundText: 'Write to us, we answer as soon as we can.',
    toContact: 'Go to Contact',
    items: [
      {
        group: 'client',
        q: 'How do I request a job?',
        a: 'Pick the trade, describe the problem, confirm your address (or use GPS) and send the request. Nearby pros receive it right away.',
      },
      {
        group: 'client',
        q: 'How long until the pro arrives?',
        a: 'The goal is 15 to 30 minutes. As soon as a pro accepts, you follow them live on the map.',
      },
      {
        group: 'client',
        q: 'Are the pros verified?',
        a: 'Every pro provides an ID document (national ID or passport) when signing up, and the profile is approved before receiving requests.',
      },
      {
        group: 'client',
        q: 'Can I cancel a request?',
        a: 'Yes, as long as the job is not finished: the pro is notified and the search stops.',
      },
      {
        group: 'pro',
        q: 'How do I become a pro on El 7al?',
        a: 'Create a pro account in 4 steps: identity, area and phone, areas of expertise, identity check.',
      },
      {
        group: 'pro',
        q: 'What commission do you take?',
        a: 'A flat 30 TND per completed job, taken automatically when it closes. No percentage on your prices.',
      },
      {
        group: 'pro',
        q: 'How do I receive requests?',
        a: 'Go online: requests near your position arrive live. You have a few seconds to accept or decline.',
      },
      {
        group: 'account',
        q: 'Which languages does El 7al support?',
        a: 'French, Arabic (right-to-left display) and English.',
      },
      {
        group: 'account',
        q: 'I forgot my password.',
        a: 'Use the “Forgot your password?” link on the login page: a code is sent to your email.',
      },
    ],
  },
  contact: {
    crumb: 'Contact',
    title: 'Write to us.',
    lead: 'A question, a problem with a job, a partnership idea? We read you.',
    name: 'Full name',
    namePh: 'Your name',
    nameErr: 'Enter your name.',
    reach: 'Email or phone',
    reachPh: 'name@example.com',
    reachErr: 'Tell us how to reach you.',
    subject: 'Subject',
    subjects: ['General question', 'Problem with a job', 'Become a pro', 'Partnership', 'Other'],
    message: 'Message',
    messagePh: 'Tell us how we can help…',
    messageErr: 'Write your message.',
    send: 'Send the message',
    openingMail: 'Your email app opens with the message ready to send.',
    emailLabel: 'Email',
    coverage: 'Area covered',
    coverageValue: 'Tunisia',
    urgentTitle: 'An emergency right now?',
    urgentText: 'Do not use this form: start a request directly.',
    urgentCta: 'Request a pro',
  },
  cta: {
    title: 'An emergency at home?',
    text: 'Describe the problem, a verified pro near you answers live.',
    ask: 'Request a pro',
  },
  home: {
    whyLabel: 'Why El 7al',
    whyTitle: 'A reliable pro, without calling ten numbers.',
    whyText: 'You describe the problem once. El 7al finds, reassures and tracks.',
    seeHow: 'See how it works',
    proLabel: 'For pros',
    proTitle: 'Requests near you. A flat commission.',
    proText: 'You receive requests live and stay in control. Flat 30 TND commission per completed job.',
    tradesLabel: 'Trades',
    tradesTitle: 'From a water leak to a locked door',
    faqLabel: 'FAQ',
    faqTitle: 'The questions we get most',
    allAnswers: 'All answers',
  },
};

const ar: SiteCopy = {
  nav: {
    home: 'الرئيسية',
    how: 'كيف يعمل',
    faq: 'أسئلة شائعة',
    contact: 'اتصل بنا',
    login: 'تسجيل الدخول',
    becomePro: 'انضم كحرفي',
    menu: 'القائمة',
    mySpace: 'فضائي',
  },
  footer: {
    tagline: 'نجدة منزلية عاجلة في كل أنحاء تونس.',
    product: 'المنتج',
    artisans: 'الحرفيون',
    help: 'مساعدة',
    rights: 'منصة تدخّل طارئ في الوقت الحقيقي.',
    signUp: 'إنشاء حساب',
  },
  demo: {
    label: 'التطبيق في 5 مراحل',
    tabs: ['وصف', 'بحث', 'قبول', 'تتبع', 'تقييم'],
    describe: 'ما المشكل؟',
    trade: 'المهنة',
    tradeValue: 'سباكة',
    description: 'الوصف',
    descriptionValue: 'تسرب مياه تحت المغسلة',
    address: 'العنوان',
    addressValue: 'موقعك · GPS',
    ask: 'اطلب التدخّل',
    searching: 'نبحث عن حرفي قريب…',
    searchingNote: 'الحرفيون القريبون استلموا طلبك',
    accepted: 'حرفي قبل الطلب',
    onTheWay: 'في الطريق إليك',
    call: 'اتصال',
    tracking: 'تابعه مباشرة',
    finished: 'انتهت الأشغال',
    howWas: 'كيف كانت التجربة؟',
    yourReview: 'رأيك',
    reviewValue: 'سريع ونظيف، شكراً!',
    sendReview: 'أرسل التقييم',
    sample: 'رسم توضيحي: نصوص للمثال.',
  },
  how: {
    crumb: 'كيف يعمل',
    title: 'من العطل إلى الحل في 4 مراحل.',
    lead: 'المسار نفسه عند الزبون وعند الحرفي. شاهده وهو يحدث.',
    stages: [
      { title: 'تصف العطل', text: 'اختر المهنة وحدد مكانك: يصل طلبك إلى الحرفيين المتصلين حولك.' },
      { title: 'حرفي يقبل الطلب', text: 'يقبل أول حرفي متاح: ترى ملفه وتتابع موقعه.' },
      { title: 'يصل إلى المكان', text: 'تتابع الحرفي على الخريطة مع وقت وصوله، ثم ينجز التدخّل.' },
      { title: 'تؤكد انتهاء الأشغال', text: 'يعلن الحرفي نهاية الأشغال، فتؤكد وتترك تقييماً.' },
    ],
    proLabel: 'من جهة الحرفي',
    proTitle: 'استقبل، اقبل، تدخّل.',
    proSteps: [
      { title: 'تفعيل الاتصال', text: 'تفعّل جاهزيتك فتصلك الطلبات القريبة منك مباشرة.' },
      { title: 'اقبل في الوقت', text: 'ترى المسافة والعنوان ثم تقبل أو ترفض.' },
      { title: 'قدّم المراحل', text: 'تحدد: في الطريق، في المكان، انتهت الأشغال، والزبون يتابع مباشرة.' },
      { title: 'تأكيد الزبون', text: 'يؤكد الزبون نهاية الأشغال وتنتقل المهمة إلى سجلك.' },
    ],
  },
  faq: {
    crumb: 'أسئلة شائعة',
    title: 'أسئلتكم وإجاباتنا.',
    lead: 'كل ما تحتاج معرفته لطلب تدخّل أو للانضمام إلى El 7al.',
    search: 'ابحث عن سؤال',
    searchPh: 'مثال: عمولة، إلغاء…',
    tabs: [
      { key: 'client', label: 'الزبائن' },
      { key: 'pro', label: 'الحرفيون' },
      { key: 'account', label: 'الحساب' },
    ],
    none: 'لا توجد أسئلة مطابقة. راسلنا من صفحة اتصل بنا.',
    notFound: 'لم تجد جوابك؟',
    notFoundText: 'راسلنا وسنردّ في أقرب وقت.',
    toContact: 'اذهب إلى اتصل بنا',
    items: [
      {
        group: 'client',
        q: 'كيف أطلب تدخّلاً؟',
        a: 'اختر المهنة وصف المشكل وأكّد عنوانك (أو استعمل GPS) ثم أرسل الطلب. يصل فوراً إلى الحرفيين القريبين.',
      },
      {
        group: 'client',
        q: 'كم يستغرق وصول الحرفي؟',
        a: 'الهدف هو 15 إلى 30 دقيقة. بمجرد أن يقبل حرفي الطلب تتابعه مباشرة على الخريطة.',
      },
      {
        group: 'client',
        q: 'هل الحرفيون موثّقون؟',
        a: 'يقدّم كل حرفي وثيقة هوية (بطاقة تعريف أو جواز سفر) عند التسجيل ويُعتمد ملفه قبل أن يستقبل الطلبات.',
      },
      { group: 'client', q: 'هل يمكنني إلغاء طلب؟', a: 'نعم ما دام التدخّل لم ينتهِ: يُعلَم الحرفي ويتوقف البحث.' },
      {
        group: 'pro',
        q: 'كيف أصبح حرفياً في El 7al؟',
        a: 'أنشئ حساب حرفي في 4 مراحل: الهوية، المنطقة والهاتف، مجالات الخبرة، التحقق من الهوية.',
      },
      {
        group: 'pro',
        q: 'ما العمولة التي تقتطعونها؟',
        a: 'عمولة ثابتة قدرها 30 د.ت عن كل مهمة منتهية، تُخصم تلقائياً عند الإغلاق. لا نسبة مئوية على أسعارك.',
      },
      {
        group: 'pro',
        q: 'كيف أستقبل الطلبات؟',
        a: 'فعّل وضع «متصل» فتصلك مباشرة الطلبات القريبة من موقعك. لديك بضع ثوانٍ للقبول أو الرفض.',
      },
      {
        group: 'account',
        q: 'بأي لغات يتوفر El 7al؟',
        a: 'الفرنسية والعربية (مع عرض من اليمين إلى اليسار) والإنجليزية.',
      },
      {
        group: 'account',
        q: 'نسيت كلمة المرور.',
        a: 'استعمل رابط «نسيت كلمة المرور؟» في صفحة الدخول: يُرسل رمز إلى بريدك الإلكتروني.',
      },
    ],
  },
  contact: {
    crumb: 'اتصل بنا',
    title: 'راسلنا.',
    lead: 'سؤال أو مشكل مع تدخّل أو فكرة شراكة؟ نقرأ رسالتك.',
    name: 'الاسم واللقب',
    namePh: 'اسمك',
    nameErr: 'أدخل اسمك.',
    reach: 'البريد أو الهاتف',
    reachPh: 'nom@exemple.tn',
    reachErr: 'أدخل وسيلة للتواصل معك.',
    subject: 'الموضوع',
    subjects: ['سؤال عام', 'مشكل مع تدخّل', 'أن أصبح حرفياً', 'شراكة', 'آخر'],
    message: 'الرسالة',
    messagePh: 'أخبرنا كيف نساعدك…',
    messageErr: 'اكتب رسالتك.',
    send: 'أرسل الرسالة',
    openingMail: 'يفتح تطبيق البريد برسالة جاهزة للإرسال.',
    emailLabel: 'البريد الإلكتروني',
    coverage: 'المنطقة المغطاة',
    coverageValue: 'تونس',
    urgentTitle: 'طارئ الآن؟',
    urgentText: 'لا تستعمل هذا النموذج: أطلق طلباً مباشرة.',
    urgentCta: 'اطلب حرفياً',
  },
  cta: { title: 'عندك طارئ في البيت؟', text: 'صف المشكل وسيردّ عليك حرفي موثّق قريب منك مباشرة.', ask: 'اطلب حرفياً' },
  home: {
    whyLabel: 'لماذا El 7al',
    whyTitle: 'حرفي موثوق دون الاتصال بعشرة أرقام.',
    whyText: 'تصف العطل مرة واحدة، و El 7al يتكفل بالبحث والطمأنة والمتابعة.',
    seeHow: 'شاهد كيف يعمل',
    proLabel: 'للحرفيين',
    proTitle: 'طلبات قريبة منك. وعمولة ثابتة.',
    proText: 'تصلك الطلبات مباشرة وتبقى أنت المتحكم. عمولة ثابتة 30 د.ت لكل مهمة منتهية.',
    tradesLabel: 'المهن',
    tradesTitle: 'من تسرب المياه إلى القفل العالق',
    faqLabel: 'أسئلة شائعة',
    faqTitle: 'أكثر الأسئلة تكراراً',
    allAnswers: 'كل الإجابات',
  },
};

const siteCopy: Record<Language, SiteCopy> = { fr, en, ar };

export function useSiteCopy(): SiteCopy {
  const language = useLanguageStore((s) => s.language);
  return siteCopy[language] ?? siteCopy.fr;
}
