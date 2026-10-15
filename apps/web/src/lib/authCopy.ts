import type { Language } from '../store/useLanguageStore';

export interface AuthCopy {
  back: string;
  title: string;
  sub: string;
  email: string;
  emailPh: string;
  passwordPh: string;
  password: string;
  show: string;
  hide: string;
  forgot: string;
  submit: string;
  noAccount: string;
  create: string;
  sideTitle: string;
  sideText: string;
  scene: string;
  captions: string[];
  fillAll: string;
  failed: string;
}

export const authCopy: Record<Language, AuthCopy> = {
  fr: {
    back: "Retour à l'accueil",
    title: 'Connexion',
    sub: 'Accédez à votre espace client, artisan ou administrateur.',
    email: 'Adresse e-mail',
    emailPh: 'nom@exemple.tn',
    passwordPh: 'Votre mot de passe',
    password: 'Mot de passe',
    show: 'Afficher le mot de passe',
    hide: 'Masquer le mot de passe',
    forgot: 'Mot de passe oublié ?',
    submit: 'Se connecter',
    noAccount: 'Pas encore de compte ?',
    create: 'Créer un compte',
    sideTitle: 'Vos interventions, en direct.',
    sideText: "Suivez l'artisan sur la carte, échangez avec lui et validez la fin des travaux depuis votre espace.",
    scene: 'Scène : un client en panne de voiture, un mécanicien arrive, ouvre le capot et répare.',
    captions: [
      'Vous décrivez la panne',
      'Un artisan accepte',
      'Il arrive sur place',
      'Vous validez la fin des travaux',
    ],
    fillAll: 'Renseignez votre e-mail et votre mot de passe.',
    failed: 'Connexion échouée. Vérifiez vos identifiants.',
  },
  en: {
    back: 'Back to home',
    title: 'Log in',
    sub: 'Access your customer, pro or admin space.',
    email: 'Email address',
    emailPh: 'name@example.com',
    passwordPh: 'Your password',
    password: 'Password',
    show: 'Show password',
    hide: 'Hide password',
    forgot: 'Forgot your password?',
    submit: 'Log in',
    noAccount: 'No account yet?',
    create: 'Create an account',
    sideTitle: 'Your jobs, live.',
    sideText: 'Follow the pro on the map, chat with them and confirm the end of the work from your space.',
    scene: 'Scene: a customer with a broken-down car, a mechanic arrives, opens the hood and fixes it.',
    captions: ['You describe the problem', 'A pro accepts', 'They arrive on site', 'You confirm the job is done'],
    fillAll: 'Enter your email and your password.',
    failed: 'Login failed. Check your credentials.',
  },
  ar: {
    back: 'العودة إلى الرئيسية',
    title: 'تسجيل الدخول',
    sub: 'ادخل إلى فضائك كحريف أو حرفي أو مسؤول.',
    email: 'البريد الإلكتروني',
    emailPh: 'nom@exemple.tn',
    passwordPh: 'أدخل كلمة المرور',
    password: 'كلمة المرور',
    show: 'إظهار كلمة المرور',
    hide: 'إخفاء كلمة المرور',
    forgot: 'نسيت كلمة المرور؟',
    submit: 'تسجيل الدخول',
    noAccount: 'ليس لديك حساب؟',
    create: 'إنشاء حساب',
    sideTitle: 'تدخّلاتك، مباشرة.',
    sideText: 'تابع الحرفي على الخريطة، تواصل معه وأكّد انتهاء الأشغال من فضائك.',
    scene: 'مشهد: زبون تعطلت سيارته، ميكانيكي يصل ويفتح غطاء المحرك ويصلح العطل.',
    captions: ['تصف العطل', 'حرفي يقبل الطلب', 'يصل إلى المكان', 'تؤكد انتهاء الأشغال'],
    fillAll: 'أدخل بريدك الإلكتروني وكلمة المرور.',
    failed: 'فشل تسجيل الدخول. تحقق من بياناتك.',
  },
};
