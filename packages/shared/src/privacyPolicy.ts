/**
 * The privacy policy, in the three languages of the app. One source: the web page and the mobile screen both
 * render it, so the two can never say different things. Change the text here, nowhere else.
 */

export interface PolicySection {
  heading: string;
  paragraphs: string[];
}

export interface PrivacyPolicy {
  title: string;
  updated: string;
  intro: string;
  sections: PolicySection[];
}

export type PolicyLanguage = 'fr' | 'ar' | 'en';

export const PRIVACY_POLICY: Record<PolicyLanguage, PrivacyPolicy> = {
  fr: {
    title: 'Politique de confidentialité',
    updated: 'Dernière mise à jour : octobre 2026',
    intro:
      "El 7al met en relation des clients et des artisans proches d'eux en Tunisie. Cette page explique quelles données nous utilisons, pourquoi, qui peut les voir et comment les effacer.",
    sections: [
      {
        heading: 'Les données que nous collectons',
        paragraphs: [
          'Votre compte : nom, numéro de téléphone, adresse e-mail et mot de passe (conservé sous forme chiffrée, nous ne pouvons pas le lire).',
          "Votre position : pour un client, au moment où il envoie une demande ; pour un artisan, pendant qu'il est en ligne et pendant une intervention. Nous ne suivons pas votre position en dehors de ces moments.",
          'Votre adresse et votre photo de profil, si vous les renseignez.',
          "Pour les artisans : la photo de la pièce d'identité (CIN ou passeport), le numéro de CIN et, selon le cas, le numéro de permis, afin de vérifier votre identité avant de vous permettre de recevoir des demandes.",
          "Vos échanges : les messages de la discussion d'une intervention, et les évaluations laissées après une intervention.",
          'Un identifiant de votre téléphone pour vous envoyer des notifications, et des journaux techniques (erreurs, connexions) pour garder le service fiable et sûr.',
        ],
      },
      {
        heading: 'Pourquoi nous les utilisons',
        paragraphs: [
          "Pour fournir le service : trouver des artisans proches, afficher leur arrivée, permettre la discussion et clôturer l'intervention.",
          "Pour vérifier les artisans : un administrateur d'El 7al examine les pièces d'identité avant d'activer un compte artisan.",
          "Pour vous prévenir : notifications sur l'avancement d'une demande, les messages et la décision sur votre compte.",
          'Pour la sécurité : empêcher les abus, les fraudes et les accès non autorisés.',
          "Nous ne vendons pas vos données et nous n'affichons pas de publicité.",
        ],
      },
      {
        heading: 'Qui peut voir quoi',
        paragraphs: [
          "Un artisan voit le prénom du client, l'adresse et la description de la demande qu'on lui propose. Une fois la demande acceptée, il voit aussi le numéro de téléphone du client.",
          "Un client voit le nom, la photo, la note et, une fois la demande acceptée, le numéro de téléphone de l'artisan qui l'a acceptée.",
          "Les administrateurs d'El 7al voient les comptes, les interventions et, pour les artisans, les pièces d'identité. Ces documents ne sont jamais publics.",
          'Le paiement se fait en espèces entre vous : nous ne collectons aucune donnée bancaire.',
        ],
      },
      {
        heading: 'Combien de temps nous les gardons',
        paragraphs: [
          'Vos données sont gardées tant que votre compte existe.',
          "Si vous supprimez votre compte, votre nom, téléphone, e-mail, photo, adresse, position, pièces d'identité et le texte de vos messages sont effacés. Il reste uniquement des informations qui ne vous identifient plus : le fait qu'une intervention a eu lieu, les notes et les commissions, car elles font partie de l'historique d'autres personnes et de nos comptes.",
          'Les journaux techniques sont conservés pour une durée limitée.',
        ],
      },
      {
        heading: 'Vos droits',
        paragraphs: [
          'Vous pouvez consulter et corriger vos informations dans votre profil, et changer votre adresse e-mail avec un code envoyé à la nouvelle adresse.',
          "Vous pouvez supprimer votre compte vous-même : Profil, puis « Supprimer mon compte ». La suppression est refusée tant qu'une demande ou une intervention est en cours, ou qu'un artisan doit encore des commissions.",
          'Pour toute autre demande (accès à vos données, question, réclamation), écrivez-nous depuis la page Contact.',
        ],
      },
      {
        heading: 'Sécurité',
        paragraphs: [
          "Les échanges sont chiffrés (HTTPS). Les mots de passe sont chiffrés. L'accès aux pièces d'identité est réservé aux administrateurs, avec des liens temporaires.",
          "Aucun système n'est parfait : choisissez un mot de passe solide et ne le partagez pas.",
        ],
      },
      {
        heading: 'Âge minimum et changements',
        paragraphs: [
          "El 7al s'adresse aux personnes majeures.",
          'Si cette politique change, la nouvelle version est publiée ici avec sa date de mise à jour.',
        ],
      },
    ],
  },
  en: {
    title: 'Privacy policy',
    updated: 'Last updated: October 2026',
    intro:
      'El 7al connects customers with artisans near them in Tunisia. This page explains what data we use, why, who can see it, and how to erase it.',
    sections: [
      {
        heading: 'The data we collect',
        paragraphs: [
          'Your account: name, phone number, e-mail address and password (stored encrypted; we cannot read it).',
          'Your location: for a customer, when they send a request; for an artisan, while they are online and during a job. We do not track your location outside those moments.',
          'Your address and profile photo, if you provide them.',
          'For artisans: a photo of the identity document (ID card or passport), the ID number and, where relevant, the licence number, so we can verify your identity before you can receive requests.',
          'Your exchanges: the messages of a job conversation, and the ratings left after a job.',
          'An identifier of your phone to send you notifications, and technical logs (errors, sign-ins) to keep the service reliable and safe.',
        ],
      },
      {
        heading: 'Why we use it',
        paragraphs: [
          'To provide the service: find nearby artisans, show their arrival, allow the conversation and close the job.',
          'To verify artisans: an El 7al administrator reviews identity documents before an artisan account is activated.',
          'To keep you informed: notifications about the progress of a request, messages and the decision on your account.',
          'For security: preventing abuse, fraud and unauthorised access.',
          'We do not sell your data and we show no advertising.',
        ],
      },
      {
        heading: 'Who can see what',
        paragraphs: [
          "An artisan sees the customer's first name, the address and the description of the request offered to them. Once the request is accepted, they also see the customer's phone number.",
          'A customer sees the name, photo, rating and, once the request is accepted, the phone number of the artisan who accepted it.',
          'El 7al administrators see accounts, jobs and, for artisans, identity documents. These documents are never public.',
          'Payment is made in cash between you: we collect no banking data.',
        ],
      },
      {
        heading: 'How long we keep it',
        paragraphs: [
          'Your data is kept as long as your account exists.',
          'If you delete your account, your name, phone, e-mail, photo, address, location, identity documents and the text of your messages are erased. Only information that no longer identifies you remains: the fact that a job took place, ratings and commissions, because they are part of other people’s history and of our accounts.',
          'Technical logs are kept for a limited time.',
        ],
      },
      {
        heading: 'Your rights',
        paragraphs: [
          'You can view and correct your information in your profile, and change your e-mail address with a code sent to the new address.',
          'You can delete your account yourself: Profile, then “Delete my account”. Deletion is refused while a request or job is open, or while an artisan still owes commissions.',
          'For any other request (access to your data, a question, a complaint), write to us from the Contact page.',
        ],
      },
      {
        heading: 'Security',
        paragraphs: [
          'Exchanges are encrypted (HTTPS). Passwords are encrypted. Access to identity documents is limited to administrators, through temporary links.',
          'No system is perfect: choose a strong password and do not share it.',
        ],
      },
      {
        heading: 'Minimum age and changes',
        paragraphs: [
          'El 7al is intended for adults.',
          'If this policy changes, the new version is published here with its update date.',
        ],
      },
    ],
  },
  ar: {
    title: 'سياسة الخصوصية',
    updated: 'آخر تحديث: أكتوبر 2026',
    intro:
      'تربط El 7al الحرفيين بالزبائن القريبين منهم في تونس. توضح هذه الصفحة البيانات التي نستخدمها، ولماذا، ومن يمكنه الاطلاع عليها، وكيف يمكنك حذفها.',
    sections: [
      {
        heading: 'البيانات التي نجمعها',
        paragraphs: [
          'حسابك: الاسم ورقم الهاتف والبريد الإلكتروني وكلمة المرور (تُحفظ مشفّرة ولا يمكننا قراءتها).',
          'موقعك: بالنسبة للزبون عند إرسال طلب، وبالنسبة للحرفي أثناء اتصاله بالإنترنت وأثناء التدخل. لا نتتبع موقعك خارج هذه اللحظات.',
          'عنوانك وصورة ملفك الشخصي إن قدّمتهما.',
          'بالنسبة للحرفيين: صورة وثيقة الهوية (بطاقة التعريف أو جواز السفر) ورقم بطاقة التعريف وعند الاقتضاء رقم الرخصة، للتحقق من هويتك قبل أن تتمكن من استقبال الطلبات.',
          'مراسلاتك: رسائل محادثة التدخل والتقييمات التي تُترك بعد التدخل.',
          'معرّف هاتفك لإرسال الإشعارات إليك، وسجلات تقنية (أخطاء، عمليات دخول) للحفاظ على موثوقية الخدمة وأمانها.',
        ],
      },
      {
        heading: 'لماذا نستخدمها',
        paragraphs: [
          'لتقديم الخدمة: إيجاد حرفيين قريبين وعرض وصولهم والسماح بالمحادثة وإغلاق التدخل.',
          'للتحقق من الحرفيين: يراجع مسؤول في El 7al وثائق الهوية قبل تفعيل حساب الحرفي.',
          'لإبقائك على اطلاع: إشعارات حول تقدّم الطلب والرسائل والقرار المتعلق بحسابك.',
          'للأمان: منع الإساءة والاحتيال والدخول غير المصرّح به.',
          'لا نبيع بياناتك ولا نعرض إعلانات.',
        ],
      },
      {
        heading: 'من يرى ماذا',
        paragraphs: [
          'يرى الحرفي الاسم الأول للزبون وعنوان الطلب ووصفه المعروض عليه. وبعد قبول الطلب يرى أيضًا رقم هاتف الزبون.',
          'يرى الزبون اسم الحرفي وصورته وتقييمه، وبعد قبول الطلب رقم هاتفه.',
          'يرى مسؤولو El 7al الحسابات والتدخلات، وبالنسبة للحرفيين وثائق الهوية. هذه الوثائق ليست عامة أبدًا.',
          'الدفع نقدًا بينكما: لا نجمع أي بيانات مصرفية.',
        ],
      },
      {
        heading: 'مدة الاحتفاظ بها',
        paragraphs: [
          'تُحفظ بياناتك ما دام حسابك قائمًا.',
          'إذا حذفت حسابك، تُمحى أسماؤك ورقم هاتفك وبريدك وصورتك وعنوانك وموقعك ووثائق هويتك ونص رسائلك. تبقى فقط معلومات لا تحدّد هويتك: وقوع التدخل والتقييمات والعمولات، لأنها جزء من سجل أشخاص آخرين ومن حساباتنا.',
          'تُحفظ السجلات التقنية لمدة محدودة.',
        ],
      },
      {
        heading: 'حقوقك',
        paragraphs: [
          'يمكنك الاطلاع على معلوماتك وتصحيحها من ملفك الشخصي، وتغيير بريدك الإلكتروني برمز يُرسل إلى العنوان الجديد.',
          'يمكنك حذف حسابك بنفسك: الملف الشخصي ثم «حذف حسابي». يُرفض الحذف ما دام هناك طلب أو تدخل جارٍ، أو ما دام الحرفي مدينًا بعمولات.',
          'لأي طلب آخر (الاطلاع على بياناتك، سؤال، شكوى) راسلنا من صفحة اتصل بنا.',
        ],
      },
      {
        heading: 'الأمان',
        paragraphs: [
          'التبادلات مشفّرة (HTTPS) وكلمات المرور مشفّرة. الوصول إلى وثائق الهوية مقتصر على المسؤولين عبر روابط مؤقتة.',
          'لا يوجد نظام مثالي: اختر كلمة مرور قوية ولا تشاركها.',
        ],
      },
      {
        heading: 'الحد الأدنى للسن والتغييرات',
        paragraphs: ['El 7al موجّهة للبالغين.', 'إذا تغيّرت هذه السياسة، تُنشر النسخة الجديدة هنا مع تاريخ تحديثها.'],
      },
    ],
  },
};
