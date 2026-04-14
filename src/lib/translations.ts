type TranslationSchema = {
  heroSubtitle: string;
  enterPlatform: string;
  howItWorks: string;

  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;

  portalTitle: string;
  portalSubtitle: string;
  loading: string;
  messagesLeft: (count: number) => string;
  limitReached: string;
  newChat: string;

  share: string;
  pinned: string;
  chats: string;
  loadingChats: string;
  profile: string;
  untitledChat: string;
  pin: string;
  unpin: string;
  rename: string;
  delete: string;
  login: string;
  
  
  footerSolutions: string;
footerPlatform: string;
footerPricing: string;
footerContact: string;
footerLegal: string;
footerDescription: string;
footerDisclaimer: string;


terms: string;
privacy: string;
aiPolicy: string;

aiKnowledge: string;
industrialProcedures: string;
maintenanceIntelligence: string;

backToPlatform: string;

profileTitle: string;
account: string;
subscription: string;
signOut: string;

};
export const translations: Record<"en" | "zu" | "af" | "fr", TranslationSchema> = {
  en: {
    heroSubtitle:
      "Enter the intelligence dimension of: AI-assisted heavy metal engineering.",
    enterPlatform: "Enter Platform →",
    howItWorks: "How It Works",

    step1Title: "1. Upload Data",
    step1Desc:
      "Import engineering documents, inspection reports, or operational data directly into the platform.",
    step2Title: "2. AI Processing",
    step2Desc:
      "Ask Michael analyzes your data using advanced AI models tailored for heavy engineering environments.",
    step3Title: "3. Get Insights",
    step3Desc:
      "Receive actionable insights, predictions, and recommendations to improve operations and safety.",

    /* ✅ PORTAL */
    portalTitle: "Ask Michael",
    portalSubtitle: "Your AI engineering assistant",
    loading: "Loading portal...",
    messagesLeft: (count) => `${count} messages left today`,
    limitReached: "Daily message limit reached",
    newChat: "+ New Chat",

    /* ✅ SIDEBAR */
    share: "Share",
    pinned: "Pinned",
    chats: "Chats",
    loadingChats: "Loading chats...",
    profile: "Profile",
    untitledChat: "Untitled Chat",
    pin: "Pin",
    unpin: "Unpin",
    rename: "Rename",
    delete: "Delete",

    footerSolutions: "Solutions",
    footerPlatform: "Platform",
    footerPricing: "Pricing",
    footerContact: "Contact",
    footerLegal: "Legal",
    footerDescription:
  "Industrial AI intelligence for heavy metal engineering knowledge, procedures and operational decision support.",

footerDisclaimer:
  "AI responses are generated automatically and should be verified before use in operational environments.",

terms: "Terms",
privacy: "Privacy",
aiPolicy: "AI Policy",

aiKnowledge: "AI Knowledge Engineering",
industrialProcedures: "Industrial Procedures",
maintenanceIntelligence: "Maintenance Intelligence",

    backToPlatform: "← Back to Platform",

    profileTitle: "Profile",
    account: "Account",
    subscription: "Subscription",
    signOut: "Sign Out",
    login: "Login",
  },

  zu: {
    heroSubtitle:
      "Ngena emhlabeni wobuhlakani: ubunjiniyela bensimbi obusizwa yi-AI.",
    enterPlatform: "Ngena ku-Platform →",
    howItWorks: "Isebenza Kanjani",

    step1Title: "1. Layisha Idatha",
    step1Desc:
      "Faka amadokhumenti wobunjiniyela noma idatha yokusebenza ohlelweni.",
    step2Title: "2. Ukucubungula kwe-AI",
    step2Desc:
      "I-AI ihlaziya idatha yakho isebenzisa ubuchwepheshe obuphambili.",
    step3Title: "3. Thola Imiphumela",
    step3Desc:
      "Thola izincomo nezibikezelo zokuthuthukisa ukusebenza nokuphepha.",

    /* ✅ PORTAL */
    portalTitle: "Ask Michael",
    portalSubtitle: "Umeluleki wakho wobunjiniyela we-AI",
    loading: "Ilayisha i-portal...",
    messagesLeft: (count: number) => `${count} imiyalezo esele namuhla`,
    limitReached: "Umkhawulo wemiyalezo usuphelile",
    newChat: "+ Ingxoxo Entsha",

    /* ✅ SIDEBAR */
    share: "Yabelana",
    pinned: "Okunamathiselwe",
    chats: "Izingxoxo",
    loadingChats: "Iyalayisha izingxoxo...",
    profile: "Iphrofayela",
    untitledChat: "Ingxoxo Engenagama",
    pin: "Namathisela",
    unpin: "Susa ukunamathisela",
    rename: "Qamba kabusha",
    delete: "Susa",

    footerSolutions: "Izixazululo",
    footerPlatform: "I-Platform",
    footerPricing: "Amanani",
    footerContact: "Xhumana",
    footerLegal: "Okusemthethweni",
    footerDescription:
  "Ubuhlakani be-AI yezimboni kwezobunjiniyela bensimbi, izinqubo kanye nokwesekwa kokuthatha izinqumo.",

footerDisclaimer:
  "Izimpendulo ze-AI zikhiqizwa ngokuzenzakalelayo futhi kufanele ziqinisekiswe ngaphambi kokusetshenziswa.",

terms: "Imigomo",
privacy: "Ubumfihlo",
aiPolicy: "Inqubomgomo ye-AI",

aiKnowledge: "Ubunjiniyela bolwazi lwe-AI",
industrialProcedures: "Izinqubo Zezimboni",
maintenanceIntelligence: "Ubuhlakani Bokulungisa",

    backToPlatform: "← Buyela ku-Platform",

    profileTitle: "Iphrofayela",
    account: "I-akhawunti",
    subscription: "Ukubhalisa",
    signOut: "Phuma",
    login: "Ngena",
  },

  af: {
    heroSubtitle:
      "Betree die intelligensie-dimensie van: KI-ondersteunde swaarmetaal ingenieurswese.",
    enterPlatform: "Gaan na Platform →",
    howItWorks: "Hoe Dit Werk",

    step1Title: "1. Laai Data Op",
    step1Desc:
      "Laai ingenieursdokumente, inspeksieverslae of operasionele data direk in die platform.",
    step2Title: "2. KI Verwerking",
    step2Desc:
      "Ask Michael ontleed jou data met gevorderde KI-modelle vir ingenieursomgewings.",
    step3Title: "3. Kry Insigte",
    step3Desc:
      "Ontvang bruikbare insigte, voorspellings en aanbevelings.",

    /* ✅ PORTAL */
    portalTitle: "Ask Michael",
    portalSubtitle: "Jou KI-ingenieursassistent",
    loading: "Laai portaal...",
    messagesLeft: (count: number) => `${count} boodskappe oor vandag`,
    limitReached: "Daaglikse limiet bereik",
    newChat: "+ Nuwe Gesprek",

    /* ✅ SIDEBAR */
    share: "Deel",
    pinned: "Vasgemaak",
    chats: "Gesprekke",
    loadingChats: "Laai gesprekke...",
    profile: "Profiel",
    untitledChat: "Naamlose Gesprek",
    pin: "Vasmaak",
    unpin: "Losmaak",
    rename: "Hernoem",
    delete: "Verwyder",

    footerSolutions: "Oplossings",
    footerPlatform: "Platform",
    footerPricing: "Pryse",
    footerContact: "Kontak",
    footerLegal: "Regs",
    footerDescription:
  "Industriële KI-intelligensie vir swaarmetaal-ingenieurskennis, prosedures en operasionele besluitneming.",

footerDisclaimer:
  "KI-antwoorde word outomaties gegenereer en moet geverifieer word voor gebruik.",

terms: "Bepalings",
privacy: "Privaatheid",
aiPolicy: "KI-beleid",

aiKnowledge: "KI Kennis Ingenieurswese",
industrialProcedures: "Industriële Prosedures",
maintenanceIntelligence: "Onderhoudsintelligensie",

    backToPlatform: "← Terug na Platform",

    profileTitle: "Profiel",
    account: "Rekening",
    subscription: "Intekening",
    signOut: "Teken uit",
    login: "Ngena",
  },

  fr: {
    heroSubtitle:
      "Entrez dans la dimension de l'intelligence : ingénierie lourde assistée par IA.",
    enterPlatform: "Accéder à la plateforme →",
    howItWorks: "Comment ça marche",

    step1Title: "1. Télécharger les données",
    step1Desc:
      "Importez des documents d'ingénierie ou des données opérationnelles dans la plateforme.",
    step2Title: "2. Analyse IA",
    step2Desc:
      "Ask Michael analyse vos données avec des modèles IA avancés.",
    step3Title: "3. Obtenir des résultats",
    step3Desc:
      "Recevez des recommandations et des prédictions exploitables.",

    /* ✅ PORTAL */
    portalTitle: "Ask Michael",
    portalSubtitle: "Votre assistant d'ingénierie IA",
    loading: "Chargement du portail...",
    messagesLeft: (count: number) => `${count} messages restants aujourd'hui`,
    limitReached: "Limite quotidienne atteinte",
    newChat: "+ Nouvelle discussion",

    /* ✅ SIDEBAR */
    share: "Partager",
    pinned: "Épinglé",
    chats: "Discussions",
    loadingChats: "Chargement des discussions...",
    profile: "Profil",
    untitledChat: "Discussion sans titre",
    pin: "Épingler",
    unpin: "Désépingler",
    rename: "Renommer",
    delete: "Supprimer",

    footerSolutions: "Solutions",
footerPlatform: "Plateforme",
footerPricing: "Tarification",
footerContact: "Contact",
footerLegal: "Légal",
footerDescription:
  "Intelligence industrielle basée sur l'IA pour l'ingénierie lourde, les processus et la prise de décision opérationnelle.",

footerDisclaimer:
  "Les réponses de l'IA sont générées automatiquement et doivent être vérifiées avant utilisation.",

terms: "Conditions",
privacy: "Confidentialité",
aiPolicy: "Politique IA",

aiKnowledge: "Ingénierie des connaissances IA",
industrialProcedures: "Procédures industrielles",
maintenanceIntelligence: "Intelligence de maintenance",

backToPlatform: "← Retour à la plateforme",

profileTitle: "Profil",
account: "Compte",
subscription: "Abonnement",
signOut: "Se déconnecter",
login: "Connexion",
  },

   
};
