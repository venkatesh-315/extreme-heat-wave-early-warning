/**
 * Multi-Lingual Indian Regional Language Translations
 * Supports Hindi, Telugu, Tamil, Bengali, Marathi, Kannada, Gujarati, and English
 */

export const INDIAN_LANGUAGES = [
  { code: 'hi-IN', lang: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'te-IN', lang: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta-IN', lang: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'bn-IN', lang: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'mr-IN', lang: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'kn-IN', lang: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'gu-IN', lang: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'en-IN', lang: 'en', name: 'English', nativeName: 'English', flag: '🌐' },
];

export const ACTION_CENTER_TRANSLATIONS = {
  'hi-IN': {
    langName: 'Hindi',
    nativeLabel: 'हिन्दी',
    flag: '🇮🇳',
    code: 'hi-IN',
    voiceTitle: 'स्थानीय भाषा ऑडियो सहायता (Voice Assistant)',
    voiceSubtitle: 'हीटवेव आपातकालीन निर्देश और सलाह अपनी भाषा में सुनें।',
    playAllBtn: 'संपूर्ण आपातकालीन घोषणा सुनें (Play All)',
    pauseBtn: 'रोकें (Pause)',
    resumeBtn: 'पुनः शुरू करें (Resume)',
    stopBtn: 'बंद करें (Stop)',
    listenCardBtn: 'ऑडियो सुनें',
    speakingLabel: 'ऑडियो चल रहा है...',
    selectLangLabel: 'भाषा चुनें (Language):',
    executiveBriefing: (cityName, wbgt, risk) =>
      `राष्ट्रीय आपदा प्रबंधन प्राधिकरण एवं थर्मोगार्ड द्वारा ${cityName} के लिए अत्यधिक गर्मी व लू की चेतावनी। वर्तमान वेट बल्ब ग्लोब तापमान ${wbgt} डिग्री सेल्सियस है एवं अतिरिक्त स्वास्थ्य जोखिम ${risk} प्रतिशत दर्ज किया गया है। सभी नागरिकों से अनुरोध है कि दोपहर 11 बजे से शाम 4:30 बजे तक धूप में बाहर निकलने से बचें, भरपूर पानी व ओआरएस का सेवन करें, तथा श्रमिकों को छायादार स्थान और ठंडे पेयजल की सुविधा प्रदान करें। आपातकालीन सहायता के लिए 108 पर संपर्क करें।`,
    directiveTranslations: {
      'Mandatory Suspension of Peak Outdoor Labour': {
        title: 'चरम घंटों में खुले में भारी श्रम पर अनिवार्य रोक',
        action: 'सुबह 11:00 बजे से शाम 4:30 बजे तक निर्माण, कृषि व ईंट-भट्टों के कार्य पर पूर्ण प्रतिबंध लागू करें। ओआरएस व छायादार विश्राम स्थल अनिवार्य करें।',
      },
      'Activate Heat-Stroke Protocol in All ICUs': {
        title: 'सभी आईसीयू में हीट-स्ट्रोक आपातकालीन प्रोटोकॉल सक्रिय करें',
        action: 'ठंडे आईवी सलाइन, आइस बाथ किट और आपातकालीन दवाओं का भंडारण सुनिश्चित करें। 24 घंटे निर्बाध बिजली आपूर्ति बनाए रखें।',
      },
      'Emergency Water Tanker & Pyaau Deployment': {
        title: 'आपातकालीन जल टैंकर एवं प्याऊ की व्यापक व्यवस्था',
        action: 'झुग्गी बस्तियों, बस अड्डों और भीड़भाड़ वाले चौराहों पर जल टैंकरों के फेरे दोगुने करें। हर 3 घंटे में सार्वजनिक प्याऊ भरें।',
      },
      'Reschedule / Close Educational Institutions': {
        title: 'शैक्षणिक संस्थानों के समय में बदलाव या अवकाश',
        action: 'स्कूलों की कक्षाएं सुबह 10:30 बजे तक ही संचालित करें या ऑनलाइन मोड लागू करें। धूप में खेलकूद व खुली प्रार्थना सभा पर प्रतिबंध लगाएं।',
      },
      'Open Free Municipal Cooling Shelters': {
        title: 'निःशुल्क नगरपालिका शीतलन केंद्र (कूलिंग शेल्टर) खोलें',
        action: 'वातानुकूलित सामुदायिक भवन, रैन बसेरे और पुस्तकालय आम जनता के लिए सुबह 10 बजे से शाम 6 बजे तक खुले रखें।',
      },
      'Mandate Work-Rest Cycles (45 min work / 15 min rest)': {
        title: 'कार्य-विश्राम चक्र अनिवार्य करें (45 मिनट कार्य / 15 मिनट विश्राम)',
        action: 'नियोक्ता श्रमिकों को प्रति घंटा 1 लीटर ठंडा पेयजल और छायादार विश्राम स्थल उपलब्ध कराएं।',
      },
      'Zero Load-Shedding Directive for Health Facilities': {
        title: 'स्वास्थ्य केंद्रों के लिए जीरो लोड-शेडिंग निर्देश',
        action: 'अस्पतालों व शीतलन केंद्रों के लिए बिजली कटौती पर पूर्ण रोक। बैकअप जनरेटर चौबीसों घंटे तैयार रखें।',
      },
      'Normal Heatwave Precautions': {
        title: 'सामान्य लू व गर्मी से बचाव की सावधानियां',
        action: 'पर्याप्त पानी पिएं, ढीले सूती कपड़े पहनें, सिर को ढक कर रखें और दोपहर में सीधी धूप से बचें।',
      }
    }
  },

  'te-IN': {
    langName: 'Telugu',
    nativeLabel: 'తెలుగు',
    flag: '🇮🇳',
    code: 'te-IN',
    voiceTitle: 'స్థానిక భాషా ఆడియో అసిస్టెంట్ (Voice Assistant)',
    voiceSubtitle: 'ఎండ తీవ్రత & వడగాల్పుల హెచ్చరికలను మీ మాతృభాషలో వినండి.',
    playAllBtn: 'పూర్తి అత్యవసర ప్రకటన వినండి (Play All)',
    pauseBtn: 'తాత్కాలికంగా ఆపు (Pause)',
    resumeBtn: 'కొనసాగించు (Resume)',
    stopBtn: 'ఆపు (Stop)',
    listenCardBtn: 'వాయిస్ వినండి',
    speakingLabel: 'ఆడియో నడుస్తోంది...',
    selectLangLabel: 'భాషను ఎంచుకోండి:',
    executiveBriefing: (cityName, wbgt, risk) =>
      `జాతీయ విపత్తు నిర్వహణ ప్రాధికార సంస్థ మరియు థర్మోగార్డ్ ద్వారా ${cityName} కు తీవ్ర వడగాల్పుల హెచ్చరిక. ప్రస్తుత డబ్ల్యూబీజీటీ ఉష్ణోగ్రత ${wbgt} డిగ్రీల సెల్సియస్ మరియు ఆరోగ్య ప్రమాదం ${risk} శాతంగా ఉంది. ఉదయం 11 నుండి సాయంత్రం 4:30 వరకు ప్రజలు ఎండలోకి రావద్దని కోరడమైనది. పుష్కలంగా నీరు, ఓఆర్ఎస్ త్రాగండి. కార్మికులకు నీడ మరియు చల్లని త్రాగునీటి సదుపాయం కల్పించండి. అత్యవసర సహాయం కోసం 108 కు కాల్ చేయండి.`,
    directiveTranslations: {
      'Mandatory Suspension of Peak Outdoor Labour': {
        title: 'ఎండ తీవ్రత సమయంలో బహిరంగ శ్రమపై తప్పనిసరి నిషేధం',
        action: 'ఉదయం 11:00 నుండి సాయంత్రం 4:30 వరకు భవన నిర్మాణం, వ్యవసాయంపై తాత్కాలిక విరామం అమలు చేయండి. విశ్రాంతి షెడ్లు, ఓఆర్ఎస్ అందించాలి.',
      },
      'Activate Heat-Stroke Protocol in All ICUs': {
        title: 'అన్ని ఆసుపత్రుల ఐసీయూలలో వడదెబ్బ ప్రోటోకాల్ ప్రారంభం',
        action: 'చల్లని ఐవీ సెలైన్, ఐస్ బాత్ కిట్లు సిద్ధం చేయండి. ఆసుపత్రులకు 24 గంటల నిరంతర విద్యుత్ సరఫరా ఉండేలా చూడండి.',
      },
      'Emergency Water Tanker & Pyaau Deployment': {
        title: 'అత్యవసర వాటర్ ట్యాంకర్లు & మంచినీటి కేంద్రాల విస్తరణ',
        action: 'బస్తీలు, బస్ స్టేషన్లు, రద్దీ ప్రాంతాలలో నీటి ట్యాంకర్ల సంఖ్య పెంచండి. ప్రతి 3 గంటలకు ఒకసారి తాగునీటి కేంద్రాలను నింపండి.',
      },
      'Reschedule / Close Educational Institutions': {
        title: 'పాఠశాలల సమయాల్లో మార్పు లేదా సెలవులు',
        action: 'పాఠశాలలను ఉదయం 10:30 గంటల వరకే నిర్వహించండి లేదా ఆన్‌లైన్ తరగతులు నిర్వహించండి. ఎండలో ఆటలను నిలిపివేయండి.',
      },
      'Open Free Municipal Cooling Shelters': {
        title: 'ఉచిత కమ్యూనిటీ కూలింగ్ షెల్టర్ల ప్రారంభం',
        action: 'ఏసీ ఉన్న కమ్యూనిటీ భవనాలు, నైట్ షెల్టర్లు ఉదయం 10 నుండి సాయంత్రం 6 వరకు ప్రజల విశ్రాంతి కోసం తెరిచి ఉంచండి.',
      },
      'Mandate Work-Rest Cycles (45 min work / 15 min rest)': {
        title: 'పని-విశ్రాంతి చక్రాలు (45 నిమిషాల పని / 15 నిమిషాల విశ్రాంతి)',
        action: 'కార్మికులకు గంటకు 1 లీటర్ చల్లని మంచినీరు మరియు నీడగల విశ్రాంతి ప్రాంతాలు కల్పించాలి.',
      },
      'Zero Load-Shedding Directive for Health Facilities': {
        title: 'ఆసుపత్రులకు నిరంతర విద్యుత్ సరఫరా ఆదేశాలు',
        action: 'వైద్యశాలలకు ఎటువంటి విద్యుత్ కోతలు లేకుండా చూడండి. డీజిల్ జనరేటర్లను సిద్ధంగా ఉంచండి.',
      },
      'Normal Heatwave Precautions': {
        title: 'సాధారణ వడదెబ్బ జాగ్రత్తలు',
        action: 'ఎల్లప్పుడూ తగినంత నీరు త్రాగండి, తేలికపాటి కాటన్ బట్టలు ధరించండి, మధ్యాహ్న సమయాల్లో ఎండలో తిరగవద్దు.',
      }
    }
  },

  'ta-IN': {
    langName: 'Tamil',
    nativeLabel: 'தமிழ்',
    flag: '🇮🇳',
    code: 'ta-IN',
    voiceTitle: 'உள்ளூர் மொழி ஆடியோ வழிகாட்டி (Voice Assistant)',
    voiceSubtitle: 'வெப்ப அலை எச்சரிக்கைகள் மற்றும் வழிகாட்டுதல்களை உங்கள் மொழியில் கேளுங்கள்.',
    playAllBtn: 'முழு எச்சரிக்கை அறிவிப்பைக் கேளுங்கள் (Play All)',
    pauseBtn: 'இடைநிறுத்து (Pause)',
    resumeBtn: 'தொடரவும் (Resume)',
    stopBtn: 'நிறுத்து (Stop)',
    listenCardBtn: 'ஆடியோ கேளுங்கள்',
    speakingLabel: 'ஆடியோ ஒலிக்கிறது...',
    selectLangLabel: 'மொழியைத் தேர்ந்தெடுக்கவும்:',
    executiveBriefing: (cityName, wbgt, risk) =>
      `தேசிய பேரிடர் மேலாண்மை ஆணையம் மற்றும் தெர்மோகார்டு வழங்கும் ${cityName} பகுதிக்கான தீவிர வெப்ப அலை எச்சரிக்கை. தற்போதைய வெப்ப அழுத்தம் ${wbgt} டிகிரி செல்சியஸ் மற்றும் தீவிர இடர் ${risk} சதவீதம் ஆகும். பொதுமக்கள் காலை 11 மணி முதல் மாலை 4:30 மணி வரை வெயிலில் செல்வதைத் தவிர்க்கவும். அதிக தண்ணீர் குடிக்கவும். அவசர உதவிக்கு 108 ஐ அழைக்கவும்.`,
    directiveTranslations: {
      'Mandatory Suspension of Peak Outdoor Labour': {
        title: 'உச்ச வெயில் நேரத்தில் வெளிப்புற கடின உழைப்புக்கு தடை',
        action: 'காலை 11:00 முதல் மாலை 4:30 வரை வெளிப்புற கட்டுமானப் பணிகளை நிறுத்துங்கள். நிழற்கூடங்கள் மற்றும் எலக்ட்ரோலைட் கரைசல் வழங்கவும்.',
      },
      'Activate Heat-Stroke Protocol in All ICUs': {
        title: 'அனைத்து தீவிர சிகிச்சை பிரிவுகளிலும் வெப்ப பக்கவாத நெறிமுறை தயார்நிலை',
        action: 'குளிர்ந்த சலைன், ஐஸ் கட்டிகள் மற்றும் அவசர மருந்துகளை சேமித்து வைக்கவும். மருத்துவமனைகளுக்கு தொடர் மின்சாரத்தை உறுதி செய்யவும்.',
      },
      'Emergency Water Tanker & Pyaau Deployment': {
        title: 'அவசர குடிநீர் லாரிகள் மற்றும் குடிநீர் பந்தல் அமைத்தல்',
        action: 'குடிசை பகுதிகள் மற்றும் பேருந்து நிலையங்களுக்கு குடிநீர் லாரி விநியோகத்தை இரட்டிப்பாக்குங்கள்.',
      },
      'Reschedule / Close Educational Institutions': {
        title: 'பள்ளி நேர மாற்றம் அல்லது விடுமுறை',
        action: 'பள்ளிகளை காலை 10:30 மணிக்குள் முடிக்கவும் அல்லது இணைய வழியில் நடத்தவும். வெளிப்புற விளையாட்டுகளுக்கு தடை விதிக்கவும்.',
      },
      'Open Free Municipal Cooling Shelters': {
        title: 'இலவச நகராட்சி குளிர்ச்சி மையங்களை திறக்கவும்',
        action: 'பொதுமக்கள் இளைப்பாற ஏசி வசதியுள்ள சமுதாயக் கூடங்கள் காலை 10 முதல் மாலை 6 வரை திறந்திருக்க வேண்டும்.',
      },
      'Mandate Work-Rest Cycles (45 min work / 15 min rest)': {
        title: 'வேலை-ஓய்வு சுழற்சி கட்டாயம் (45 நிமிடம் வேலை / 15 நிமிடம் ஓய்வு)',
        action: 'தொழிலாளர்களுக்கு மணிக்கு 1 லிட்டர் குளிர்ந்த குடிநீர் மற்றும் நிழலான ஓய்வு இடம் வழங்க வேண்டும்.',
      },
      'Zero Load-Shedding Directive for Health Facilities': {
        title: 'மருத்துவமனைகளுக்கு தடையற்ற மின்சார உத்தரவு',
        action: 'மருத்துவமனைகள் மற்றும் அவசர மையங்களுக்கு மின்வெட்டு இருக்கக்கூடாது. ஜெனரேட்டர்களை தயார் நிலையில் வைக்கவும்.',
      },
      'Normal Heatwave Precautions': {
        title: 'பொதுவான வெப்ப அலை பாதுகாப்பு முன்னெச்சரிக்கைகள்',
        action: 'நிறைய தண்ணீர் குடிக்கவும், தளர்வான பருத்தி ஆடைகளை அணியவும், உச்ச வெயிலில் வெளியே செல்வதை தவிர்க்கவும்.',
      }
    }
  },

  'bn-IN': {
    langName: 'Bengali',
    nativeLabel: 'বাংলা',
    flag: '🇮🇳',
    code: 'bn-IN',
    voiceTitle: 'স্থানীয় ভাষার অডিও নির্দেশিকা (Voice Assistant)',
    voiceSubtitle: 'তীব্র তাপপ্রবাহের নির্দেশিকা ও স্বাস্থ্য সতর্কতা আপনার ভাষায় শুনুন।',
    playAllBtn: 'সম্পূর্ণ জরুরি ঘোষণা শুনুন (Play All)',
    pauseBtn: 'স্থগিত (Pause)',
    resumeBtn: 'চালিয়ে যান (Resume)',
    stopBtn: 'বন্ধ করুন (Stop)',
    listenCardBtn: 'অডিও শুনুন',
    speakingLabel: 'অডিও চলছে...',
    selectLangLabel: 'ভাষা নির্বাচন করুন:',
    executiveBriefing: (cityName, wbgt, risk) =>
      `জাতীয় বিপর্যয় মোকাবিলা কর্তৃপক্ষ ও থার্মোগার্ডের পক্ষ থেকে ${cityName} এর জন্য তীব্র তাপপ্রবাহের লাল সতর্কতা। বর্তমান তাপমাত্রা সূচক ${wbgt} ডিগ্রি সেলসিয়াস এবং স্বাস্থ্য ঝুঁকি ${risk} শতাংশ। বেলা ১১টা থেকে বিকেল ৪:৩০টা পর্যন্ত রোদে বের হওয়া এড়িয়ে চলুন। প্রচুর জল ও ওআরএস পান করুন। জরুরি সহায়তার জন্য ১০৮ নম্বরে যোগাযোগ করুন।`,
    directiveTranslations: {
      'Mandatory Suspension of Peak Outdoor Labour': {
        title: 'কড়া রোদে বাইরে কায়িক শ্রম সম্পূর্ণ বন্ধ রাখার নির্দেশ',
        action: 'সকাল ১১:০০ থেকে বিকেল ৪:৩০ পর্যন্ত নির্মাণ কাজ ও ভারী শ্রম বন্ধ রাখুন। ছায়াযুক্ত বিশ্রামাগার ও পানীয় জলের ব্যবস্থা করুন।',
      },
      'Activate Heat-Stroke Protocol in All ICUs': {
        title: 'সমস্ত হাসপাতালে হিট-স্ট্রোকের বিশেষ জরুরি চিকিৎসা চালু করুন',
        action: 'ঠান্ডা স্যালাইন, বরফের ব্যবস্থা এবং প্রয়োজনীয় ওষুধ মজুদ রাখুন। হাসপাতালে নিরবচ্ছিন্ন বিদ্যুৎ সরবরাহ নিশ্চিত করুন।',
      },
      'Emergency Water Tanker & Pyaau Deployment': {
        title: 'জরুরি জলের ট্যাঙ্কার ও বিনামূল্যে জলছত্রের ব্যবস্থা',
        action: 'বস্তি এলাকা ও বাস টার্মিনাসে জলের ট্যাঙ্কারের ট্রিপ দ্বিগুণ করুন। প্রতি ৩ ঘণ্টা অন্তর পানীয় জল ভরুন।',
      },
      'Reschedule / Close Educational Institutions': {
        title: 'বিদ্যালয়ের সময় পরিবর্তন বা ছুটি ঘোষণা',
        action: 'সকাল ১০:৩০টার মধ্যে স্কুলের ক্লাস শেষ করুন অথবা অনলাইন ক্লাস চালু করুন। রোদে খেলাধুলো বন্ধ রাখুন।',
      },
      'Open Free Municipal Cooling Shelters': {
        title: 'বিনামূল্যে পুরসভা কুলিং শেল্টার চালু করা',
        action: 'সাধারণ মানুষের বিশ্রামের জন্য শীতাতপ নিয়ন্ত্রিত কমিউনিটি হল সকাল ১০টা থেকে সন্ধ্যা ৬টা পর্যন্ত খোলা রাখুন।',
      },
      'Mandate Work-Rest Cycles (45 min work / 15 min rest)': {
        title: 'কাজের মাঝে বিশ্রাম বাধ্যতামূলক (৪৫ মিনিট কাজ / ১৫ মিনিট বিশ্রাম)',
        action: 'শ্রমিকদের জন্য ঘণ্টায় ১ লিটার ঠান্ডা জল এবং ছায়াযুক্ত স্থানের ব্যবস্থা করতে হবে।',
      },
      'Zero Load-Shedding Directive for Health Facilities': {
        title: 'হাসপাতালগুলিতে নিরবচ্ছিন্ন বিদ্যুৎ সরবরাহের নির্দেশ',
        action: 'স্বাস্থ্যকেন্দ্রগুলিতে কোনো লোডশেডিং করা যাবে না। ব্যাকআপ জেনারেটর প্রস্তুত রাখুন।',
      },
      'Normal Heatwave Precautions': {
        title: 'সাধারণ তাপপ্রবাহ সতর্কতা',
        action: 'পর্যাপ্ত জল পান করুন, সুতির ঢিলেঢালা পোশাক পরুন এবং দুপুরের রোদে বের হওয়া থেকে বিরত থাকুন।',
      }
    }
  },

  'mr-IN': {
    langName: 'Marathi',
    nativeLabel: 'मराठी',
    flag: '🇮🇳',
    code: 'mr-IN',
    voiceTitle: 'स्थानिक भाषा ऑडिओ सहाय्यक (Voice Assistant)',
    voiceSubtitle: 'उष्णतेची लाट व आरोग्य मार्गदर्शक सूचना आपल्या भाषेत ऐका.',
    playAllBtn: 'संपूर्ण आणीबाणी घोषणा ऐका (Play All)',
    pauseBtn: 'थांबवा (Pause)',
    resumeBtn: 'पुन्हा सुरू करा (Resume)',
    stopBtn: 'बंद करा (Stop)',
    listenCardBtn: 'ऑडिओ ऐका',
    speakingLabel: 'ऑडिओ चालू आहे...',
    selectLangLabel: 'भाषा निवडा:',
    executiveBriefing: (cityName, wbgt, risk) =>
      `राष्ट्रीय आपत्ती व्यवस्थापन प्राधिकरण आणि थर्मोगार्डतर्फे ${cityName} साठी तीव्र उष्णतेच्या लाटेचा इशारा. सध्याचा उष्णता निर्देशांक ${wbgt} अंश सेल्सिअस असून अति-धोका ${risk} टक्के आहे. नागरिकांनी सकाळी ११ ते दुपारी ४:३० दरम्यान उन्हात बाहेर पडणे टाळावे. भरपूर पाणी आणि ओआरएस प्या. मदतीसाठी १०८ वर संपर्क साधा.`,
    directiveTranslations: {
      'Mandatory Suspension of Peak Outdoor Labour': {
        title: 'दुपारच्या कडक उन्हात बाहेरच्या कष्टाच्या कामावर बंदी',
        action: 'सकाळी ११:०० ते दुपारी ४:३० पर्यंत बांधकाम व शेतीची कामे थांबवा. सावली व ओआरएस पाण्याचे वाटप करा.',
      },
      'Activate Heat-Stroke Protocol in All ICUs': {
        title: 'सर्व रुग्णालयांच्या अतिदक्षता विभागात उष्माघात प्रोटोकॉल सक्रिय करा',
        action: 'थंड सलाईन, बर्फ व औषधांचा साठा सज्ज ठेवा. रुग्णालयांना अखंडित वीजपुरवठा सुनिश्चित करा.',
      },
      'Emergency Water Tanker & Pyaau Deployment': {
        title: 'तातडीचे पाण्याचे टँकर आणि पाणपोईची सोय',
        action: 'झोपडपट्टी व गर्दीच्या चौकात पाण्याच्या टँकरच्या फेऱ्या वाढवा. दर ३ तासांनी पिण्याचे पाणी उपलब्ध करा.',
      },
      'Reschedule / Close Educational Institutions': {
        title: 'शाळांच्या वेळेत बदल किंवा सुट्टी',
        action: 'शाळा सकाळी १०:३० पर्यंतच भरवा किंवा ऑनलाइन वर्ग सुरू करा. उन्हात मैदानी खेळ बंद ठेवा.',
      },
      'Open Free Municipal Cooling Shelters': {
        title: 'मोफत महापालिका कुलिंग शेल्टर्स सुरू करा',
        action: 'वातानुकूलित सभागृह आणि निवारा केंद्रे नागरिकांसाठी सकाळी १० ते संध्याकाळी ६ पर्यंत खुली ठेवा.',
      },
      'Mandate Work-Rest Cycles (45 min work / 15 min rest)': {
        title: 'काम व विश्रांती चक्र (४५ मिनिटे काम / १५ मिनिटे विश्रांती)',
        action: 'कामगारांना प्रति तास १ लिटर थंड पिण्याचे पाणी व सावलीची सोय उपलब्ध करून देणे बंधनकारक आहे.',
      },
      'Zero Load-Shedding Directive for Health Facilities': {
        title: 'रुग्णालयांसाठी शून्य भारनियमनाचे आदेश',
        action: 'रुग्णालयांचा वीजपुरवठा खंडित करू नका. आपत्कालीन जनरेटर सज्ज ठेवा.',
      },
      'Normal Heatwave Precautions': {
        title: 'उष्णतेच्या लाटेपासून संरक्षणासाठी सामान्य सूचना',
        action: 'भरपूर पाणी प्या, हलके सुती कपडे वापरा आणि दुपारच्या कडक उन्हात जाणे टाळा.',
      }
    }
  },

  'kn-IN': {
    langName: 'Kannada',
    nativeLabel: 'ಕನ್ನಡ',
    flag: '🇮🇳',
    code: 'kn-IN',
    voiceTitle: 'ಸ್ಥಳೀಯ ಭಾಷಾ ಆಡಿಯೋ ಸಹಾಯಕ (Voice Assistant)',
    voiceSubtitle: 'ತೀವ್ರ ಶಾಖದ ಅಲೆ ಮತ್ತು ಮುನ್ನೆಚ್ಚರಿಕೆಗಳನ್ನು ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಆಲಿಸಿ.',
    playAllBtn: 'ಸಂಪೂರ್ಣ ತುರ್ತು ಘೋಷಣೆ ಆಲಿಸಿ (Play All)',
    pauseBtn: 'ವಿರಾಮ (Pause)',
    resumeBtn: 'ಮುಂದುವರಿಸಿ (Resume)',
    stopBtn: 'ನಿಲ್ಲಿಸಿ (Stop)',
    listenCardBtn: 'ಆಡಿಯೋ ಆಲಿಸಿ',
    speakingLabel: 'ಆಡಿಯೋ ಚಾಲನೆಯಲ್ಲಿದೆ...',
    selectLangLabel: 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ:',
    executiveBriefing: (cityName, wbgt, risk) =>
      `ರಾಷ್ಟ್ರೀಯ ವಿಪತ್ತು ನಿರ್ವಹಣಾ ಪ್ರಾಧಿಕಾರ ಮತ್ತು ಥರ್ಮೋಗಾರ್ಡ್ ವತಿಯಿಂದ ${cityName} ಗಾಗಿ ತೀವ್ರ ಶಾಖದ ಅಲೆಯ ಎಚ್ಚರಿಕೆ. ಪ್ರಸ್ತುತ ತಾಪಮಾನ ${wbgt} ಡಿಗ್ರಿ ಸೆಲ್ಸಿಯಸ್ ಮತ್ತು ಆರೋಗ್ಯದ ಅಪಾಯ ${risk} ಶೇಕಡಾ ಆಗಿದೆ. ಸಾರ್ವಜನಿಕರು ಬೆಳಿಗ್ಗೆ 11 ರಿಂದ ಸಂಜೆ 4:30 ರವರೆಗೆ ಬಿಸಿಲಿನಲ್ಲಿ ಹೊರಗೆ ಹೋಗಬೇಡಿ. ಸಾಕಷ್ಟು ನೀರು ಕುಡಿಯಿರಿ. ತುರ್ತು ಸಹಾಯಕ್ಕಾಗಿ 108 ಗೆ ಕರೆ ಮಾಡಿ.`,
    directiveTranslations: {
      'Mandatory Suspension of Peak Outdoor Labour': {
        title: 'ಗರಿಷ್ಠ ಬಿಸಿಲಿನ ಸಮಯದಲ್ಲಿ ಹೊರಾಂಗಣ ಶ್ರಮದಾಯಕ ಕೆಲಸಕ್ಕೆ ನಿಷೇಧ',
        action: 'ಬೆಳಿಗ್ಗೆ 11:00 ರಿಂದ ಸಂಜೆ 4:30 ರವರೆಗೆ ಕಟ್ಟಡ ನಿರ್ಮಾಣ ಮತ್ತು ಕೃಷಿ ಕೆಲಸಗಳನ್ನು ನಿಲ್ಲಿಸಿ. ನೆರಳು ಮತ್ತು ಕುಡಿಯುವ ನೀರಿನ ವ್ಯವಸ್ಥೆ ಮಾಡಿ.',
      },
      'Activate Heat-Stroke Protocol in All ICUs': {
        title: 'ಎಲ್ಲಾ ಐಸಿಯುಗಳಲ್ಲಿ ಶಾಖಾಘಾತ ತುರ್ತು ಪ್ರೋಟೋಕಾಲ್ ಸಕ್ರಿಯಗೊಳಿಸಿ',
        action: 'ತಂಪಾದ ಐವಿ ಸಲೈನ್ ಮತ್ತು ಐಸ್ ಪ್ಯಾಕ್‌ಗಳನ್ನು ಸಿದ್ಧವಾಗಿಡಿ. ಆಸ್ಪತ್ರೆಗಳಿಗೆ ನಿರಂತರ ವಿದ್ಯುತ್ ಪೂರೈಕೆ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.',
      },
      'Emergency Water Tanker & Pyaau Deployment': {
        title: 'ತುರ್ತು ನೀರಿನ ಟ್ಯಾಂಕರ್ ಮತ್ತು ಕುಡಿಯುವ ನೀರಿನ ಕೇಂದ್ರಗಳ ಸ್ಥಾಪನೆ',
        action: 'ಕೊಳೆಗೇರಿಗಳು ಮತ್ತು ಬಸ್ ನಿಲ್ದಾಣಗಳಿಗೆ ನೀರಿನ ಟ್ಯಾಂಕರ್ ಪೂರೈಕೆಯನ್ನು ದ್ವಿಗುಣಗೊಳಿಸಿ.',
      },
      'Reschedule / Close Educational Institutions': {
        title: 'ಶಾಲಾ ಸಮಯ ಬದಲಾವಣೆ ಅಥವಾ ರಜೆ',
        action: 'ಶಾಲೆಗಳನ್ನು ಬೆಳಿಗ್ಗೆ 10:30 ರೊಳಗೆ ಮುಗಿಸಿ ಅಥವಾ ಆನ್‌ಲೈನ್ ತರಗತಿಗಳನ್ನು ನಡೆಸಿ. ಬಿಸಿಲಿನಲ್ಲಿ ಆಟಗಳನ್ನು ನಿಷೇಧಿಸಿ.',
      },
      'Open Free Municipal Cooling Shelters': {
        title: 'ಉಚಿತ ಪಾಲಿಕೆ ಕೂಲಿಂಗ್ ಕೇಂದ್ರಗಳ ಆರಂಭ',
        action: 'ಹವಾನಿಯಂತ್ರಿತ ಸಮುದಾಯ ಭವನಗಳು ಮತ್ತು ವಿಶ್ರಾಂತಿ ಕೊಠಡಿಗಳನ್ನು ಬೆಳಿಗ್ಗೆ 10 ರಿಂದ ಸಂಜೆ 6 ರವರೆಗೆ ತೆರೆದಿಡಿ.',
      },
      'Mandate Work-Rest Cycles (45 min work / 15 min rest)': {
        title: 'ಕೆಲಸ-ವಿಶ್ರಾಂತಿ ನಿಯಮ (45 ನಿಮಿಷ ಕೆಲಸ / 15 ನಿಮಿಷ ವಿಶ್ರಾಂತಿ)',
        action: 'ಕಾರ್ಮಿಕರಿಗೆ ಗಂಟೆಗೆ 1 ಲೀಟರ್ ತಂಪಾದ ಕುಡಿಯುವ ನೀರು ಮತ್ತು ನೆರಳಿನ ವಿಶ್ರಾಂತಿ ಸ್ಥಳವನ್ನು ಒದಗಿಸಬೇಕು.',
      },
      'Zero Load-Shedding Directive for Health Facilities': {
        title: 'ಆಸ್ಪತ್ರೆಗಳಿಗೆ ನಿರಂತರ ವಿದ್ಯುತ್ ಪೂರೈಕೆ ಆದೇಶ',
        action: 'ಆಸ್ಪತ್ರೆಗಳಿಗೆ ವಿದ್ಯುತ್ ಕಡಿತ ಮಾಡಬಾರದು. ಜನರೇಟರ್‌ಗಳನ್ನು ಸಿದ್ಧವಾಗಿಟ್ಟುಕೊಳ್ಳಿ.',
      },
      'Normal Heatwave Precautions': {
        title: 'ಸಾಮಾನ್ಯ ಶಾಖದ ಅಲೆಯ ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು',
        action: 'ಹೆಚ್ಚು ನೀರು ಕುಡಿಯಿರಿ, ಹತ್ತಿ ಬಟ್ಟೆಗಳನ್ನು ಧರಿಸಿ ಮತ್ತು ಮಧ್ಯಾಹ್ನದ ಬಿಸಿಲಿನಲ್ಲಿ ಓಡಾಡುವುದನ್ನು ತಪ್ಪಿಸಿ.',
      }
    }
  },

  'gu-IN': {
    langName: 'Gujarati',
    nativeLabel: 'ગુજરાતી',
    flag: '🇮🇳',
    code: 'gu-IN',
    voiceTitle: 'સ્થાનિક ભાષા ઓડિયો સહાયક (Voice Assistant)',
    voiceSubtitle: 'હીટવેવ ઈમરજન્સી ચેતવણી અને સલાહ તમારી પોતાની ભાષામાં સાંભળો.',
    playAllBtn: 'સંપૂર્ણ કટોકટી ઘોષણા સાંભળો (Play All)',
    pauseBtn: 'વિરામ (Pause)',
    resumeBtn: 'ફરી શરૂ કરો (Resume)',
    stopBtn: 'બંધ કરો (Stop)',
    listenCardBtn: 'ઓડિયો સાંભળો',
    speakingLabel: 'ઓડિયો ચાલી રહ્યો છે...',
    selectLangLabel: 'ભાષા પસંદ કરો:',
    executiveBriefing: (cityName, wbgt, risk) =>
      `નેશનલ ડિઝાસ્ટર મેનેજમેન્ટ ઓથોરિટી અને થર્મોગાર્ડ દ્વારા ${cityName} માટે તીવ્ર હીટવેવની લાલ ચેતવણી. હાલનું તાપમાન ${wbgt} ડિગ્રી સેલ્સિયસ અને આરોગ્ય જોખમ ${risk} ટકા છે. બપોરે ૧૧ થી સાંજે ૪:૩૦ દરમિયાન તડકામાં બહાર નીકળવાનું ટાળો. પુષ્કળ પાણી અને ઓઆરએસ પીવો. કટોકટીમાં ૧૦૮ પર સંપર્ક કરો.`,
    directiveTranslations: {
      'Mandatory Suspension of Peak Outdoor Labour': {
        title: 'તીવ્ર ગરમીના કલાકોમાં ખુલ્લામાં ભારે મજૂરી પર પ્રતિબંધ',
        action: 'સવારે ૧૧:૦૦ થી સાંજે ૪:૩૦ સુધી બાંધકામ અને ખેતીના કામો બંધ રાખો. છાંયડો અને ઓઆરએસ પીવાનું પાણી પૂરું પાડો.',
      },
      'Activate Heat-Stroke Protocol in All ICUs': {
        title: 'તમામ હોસ્પિટલોમાં હીટ-સ્ટ્રોક પ્રોટોકોલ સક્રિય કરો',
        action: 'કોલ્ડ આઈવી સલાઈન અને આઈસ પેક તૈયાર રાખો. હોસ્પિટલોમાં અવિરત વીજ પુરવઠો સુનિશ્ચિત કરો.',
      },
      'Emergency Water Tanker & Pyaau Deployment': {
        title: 'કટોકટીના પાણીના ટેન્કર અને પરબની વ્યવસ્થા',
        action: 'ઝૂંપડપટ્ટીઓ અને બસ સ્ટેશનો પર પાણીના ટેન્કરના ફેરા બમણા કરો. દર ૩ કલાકે પાણી ભરો.',
      },
      'Reschedule / Close Educational Institutions': {
        title: 'શાળાઓના સમયમાં ફેરફાર અથવા રજા',
        action: 'શાળાઓ સવારે ૧૦:૩૦ સુધી જ ચલાવો અથવા ઓનલાઈન શિક્ષણ આપો. તડકામાં રમતો બંધ રાખો.',
      },
      'Open Free Municipal Cooling Shelters': {
        title: 'મ્યુનિસિપલ કૂલિંગ સેન્ટરો ખુલ્લા મૂકો',
        action: 'એસી વાળા કોમ્યુનિટી હોલ અને નાઇટ શેલ્ટર સવારે ૧૦ થી સાંજે ૬ સુધી જાહેર જનતા માટે ખુલ્લા રાખો.',
      },
      'Mandate Work-Rest Cycles (45 min work / 15 min rest)': {
        title: 'કામ-વિરામ ચક્ર (૪૫ મિનિટ કામ / ૧૫ મિનિટ આરામ)',
        action: 'કામદારોને કલાક દીઠ ૧ લિટર ઠંડુ પીવાનું પાણી અને છાંયડો આપવો ફરજિયાત છે.',
      },
      'Zero Load-Shedding Directive for Health Facilities': {
        title: 'હોસ્પિટલો માટે અવિરત વીજળીના આદેશ',
        action: 'હોસ્પિટલોમાં કોઈ પાવર કટ કરવો નહીં. ડીઝલ જનરેટર સ્ટેન્ડબાય પર રાખો.',
      },
      'Normal Heatwave Precautions': {
        title: 'સામાન્ય હીટવેવ સાવચેતીઓ',
        action: 'પુષ્કળ પાણી પીવો, સુતરાઉ કપડાં પહેરો અને બપોરના તડકામાં બહાર જવાનું ટાળો.',
      }
    }
  },

  'en-IN': {
    langName: 'English',
    nativeLabel: 'English',
    flag: '🌐',
    code: 'en-IN',
    voiceTitle: 'Voice Broadcast & Audio Assistant',
    voiceSubtitle: 'Listen to real-time NDMA heat action directives & public advisories.',
    playAllBtn: 'Play Full Audio Announcement',
    pauseBtn: 'Pause',
    resumeBtn: 'Resume',
    stopBtn: 'Stop Audio',
    listenCardBtn: 'Listen in English',
    speakingLabel: 'Speaking...',
    selectLangLabel: 'Select Language:',
    executiveBriefing: (cityName, wbgt, risk) =>
      `National Disaster Management Authority and ThermoGuard severe heatwave bulletin for ${cityName}. Current Wet Bulb Globe Temperature is ${wbgt} degrees Celsius with an excess mortality risk of ${risk} percent. Citizens are strictly advised to avoid direct sun exposure between 11:00 AM and 4:30 PM, drink adequate water and ORS electrolytes, and ensure outdoor workers are given mandatory shaded rest breaks. For medical emergency, call 108. For cooling center assistance, call 1077.`,
    directiveTranslations: {}
  }
};

/**
 * 8-Language Comprehensive SMS & Broadcast Templates
 */
export const MULTILINGUAL_EXPANDED_SMS = [
  {
    id: 'sms-general',
    category: 'Public Advisory',
    label: 'Public Heat Emergency Advisory',
    recipient: 'General Public (Mobile Broadcast / WEA / Radio)',
    versions: {
      'hi-IN': {
        lang: 'Hindi',
        script: 'हिन्दी',
        text: 'लू चेतावनी (NDMA): आपके क्षेत्र में भीषण गर्मी व लू का रेड अलर्ट। दोपहर 11 से 4:30 बजे तक धूप में निकलने से बचें। लगातार पानी व ओआरएस (ORS) पिएं। आपातकाल में 108 या 1077 पर कॉल करें। — जिला आपदा प्रबंधन प्राधिकरण'
      },
      'te-IN': {
        lang: 'Telugu',
        script: 'తెలుగు',
        text: 'వడగాల్పుల తీవ్ర హెచ్చరిక (NDMA): మీ ప్రాంతంలో తీవ్రమైన ఎండల రెడ్ అలర్ట్. ఉదయం 11 నుండి సాయంత్రం 4:30 వరకు బయటకు రావద్దు. పుష్కలంగా నీరు, ఓఆర్ఎస్ త్రాగండి. అత్యవసరంలో 108 లేదా 1077 కు కాల్ చేయండి. — జిల్లా విపత్తు నిర్వహణ'
      },
      'ta-IN': {
        lang: 'Tamil',
        script: 'தமிழ்',
        text: 'வெப்ப அலை எச்சரிக்கை (NDMA): உங்கள் பகுதியில் தீவிர வெப்ப அலை ரெட் அலர்ட். காலை 11 முதல் மாலை 4:30 வரை வெளியில் செல்ல வேண்டாம். அதிக நீர் மற்றும் ORS குடிக்கவும். அவசர உதவிக்கு 108 அல்லது 1077 ஐ அழைக்கவும். — மாவட்ட பேரிடர் ஆணையம்'
      },
      'bn-IN': {
        lang: 'Bengali',
        script: 'বাংলা',
        text: 'তীব্র তাপপ্রবাহ সতর্কতা (NDMA): আপনার এলাকায় তীব্র তাপপ্রবাহের রেড অ্যালার্ট। বেলা ১১টা থেকে বিকেল ৪:৩০টা পর্যন্ত রোদে বের হবেন না। প্রচুর জল ও ORS পান করুন। জরুরি প্রয়োজনে ১০৮ বা ১০৭৭ নম্বরে কল করুন। — জেলা বিপর্যয় মোকাবিলা সেল'
      },
      'mr-IN': {
        lang: 'Marathi',
        script: 'मराठी',
        text: 'उष्णतेची लाट इशारा (NDMA): आपल्या भागात तीव्र उष्णतेची लाट (रेड अलर्ट). सकाळी ११ ते ४:३० दरम्यान उन्हात जाणे टाळा. भरपूर पाणी व ओआरएस प्या. मदतीसाठी १०८ किंवा १०७७ वर संपर्क साधा. — जिल्हा आपत्ती व्यवस्थापन प्राधिकरण'
      },
      'kn-IN': {
        lang: 'Kannada',
        script: 'ಕನ್ನಡ',
        text: 'ಶಾಖದ ಅಲೆ ಎಚ್ಚರಿಕೆ (NDMA): ನಿಮ್ಮ ಜಿಲ್ಲೆಯಲ್ಲಿ ತೀವ್ರ ಬಿಸಿಲಿನ ರೆಡ್ ಅಲರ್ಟ್. ಬೆಳಿಗ್ಗೆ 11 ರಿಂದ ಸಂಜೆ 4:30 ರವರೆಗೆ ಹೊರಗೆ ಹೋಗಬೇಡಿ. ಹೆಚ್ಚು ನೀರು ಮತ್ತು ORS ಕುಡಿಯಿರಿ. ಸಹಾಯಕ್ಕಾಗಿ 108 ಅಥವಾ 1077 ಗೆ ಕರೆ ಮಾಡಿ. — ಜಿಲ್ಲಾ ವಿಪತ್ತು ನಿರ್ವಹಣಾ ಪ್ರಾಧಿಕಾರ'
      },
      'gu-IN': {
        lang: 'Gujarati',
        script: 'ગુજરાતી',
        text: 'હીટવેવ ચેતવણી (NDMA): તમારા વિસ્તારમાં કાળઝાળ ગરમીનું રેડ એલર્ટ. સવારે ૧૧ થી સાંજે ૪:૩૦ સુધી તડકામાં બહાર ન નીકળો. પુષ્કળ પાણી અને ORS પીવો. કટોકટીમાં ૧૦૮ અથવા ૧૦૭૭ ડાયલ કરો. — જિલ્લા આપત્તિ વ્યવસ્થાપન'
      },
      'en-IN': {
        lang: 'English',
        script: 'English',
        text: 'NDMA HEAT ALERT: Extreme heatwave warning in your district. Avoid outdoor activities between 11 AM–4:30 PM. Drink plenty of water and ORS. Call 108 for medical emergency, 1077 for shelter locations. — District Disaster Management Authority'
      }
    }
  },
  {
    id: 'sms-workers',
    category: 'Labour Directive',
    label: 'Outdoor Worker Safety Directive',
    recipient: 'Contractors, Construction Sites, Brick Kilns & Labour Union',
    versions: {
      'hi-IN': {
        lang: 'Hindi',
        script: 'हिन्दी',
        text: 'श्रमिक सुरक्षा निर्देश: भीषण गर्मी के कारण सुबह 11 से शाम 4:30 बजे तक खुले में भारी निर्माण कार्य पूर्णतः बंद रखें। श्रमिकों को छाया व ठंडे ओआरएस पेयजल का अनिवार्य प्रबंध कराएं। हेल्पलाइन: 104 — श्रम सुरक्षा सेल'
      },
      'te-IN': {
        lang: 'Telugu',
        script: 'తెలుగు',
        text: 'కార్మికుల భద్రతా ఆదేశం: తీవ్ర ఎండల దృష్ట్యా ఉదయం 11 నుండి సాయంత్రం 4:30 వరకు బహిరంగ నిర్మాణ పనులను నిలిపివేయండి. కార్మికులకు చల్లని తాగునీరు మరియు విశ్రాంతి షెడ్లు కల్పించండి. హెల్ప్‌లైన్: 104 — కార్మిక సంక్షేమ శాఖ'
      },
      'ta-IN': {
        lang: 'Tamil',
        script: 'தமிழ்',
        text: 'தொழிலாளர் பாதுகாப்பு உத்தரவு: கடுமையான வெயில் காரணமாக காலை 11 முதல் மாலை 4:30 வரை திறந்தவெளி கட்டுமானப் பணிகளை நிறுத்துங்கள். தொழிலாளர்களுக்கு குளிர்ந்த நீர், நிழல் வசதி செய்து தரவும். உதவிக்கு: 104 — தொழிலாளர் நலத்துறை'
      },
      'bn-IN': {
        lang: 'Bengali',
        script: 'বাংলা',
        text: 'শ্রমিক সুরক্ষা নির্দেশিকা: তীব্র গরমের কারণে সকাল ১১টা থেকে বিকেল ৪:৩০টা পর্যন্ত নির্মাণকাজ বন্ধ রাখুন। শ্রমিকদের ছায়া এবং ঠান্ডা ওআরএস জলের ব্যবস্থা নিশ্চিত করুন। হেল্পলাইন: ১০৪ — শ্রম সুরক্ষা সেল'
      },
      'mr-IN': {
        lang: 'Marathi',
        script: 'मराठी',
        text: 'कामगार सुरक्षा निर्देश: तीव्र उष्णतेमुळे सकाळी ११ ते दुपारी ४:३० दरम्यान उघड्यावर बांधकाम कामे बंद ठेवा. कामगारांसाठी सावली व थंड पाण्याची सोय करा. हेल्पलाइन: १०४ — कामगार सुरक्षा विभाग'
      },
      'kn-IN': {
        lang: 'Kannada',
        script: 'ಕನ್ನಡ',
        text: 'ಕಾರ್ಮಿಕರ ಸುರಕ್ಷತಾ ಆದೇಶ: ತೀವ್ರ ಬಿಸಿಲಿನ ಕಾರಣ ಬೆಳಿಗ್ಗೆ 11 ರಿಂದ ಸಂಜೆ 4:30 ರವರೆಗೆ ಹೊರಾಂಗಣ ನಿರ್ಮಾಣ ಕಾರ್ಯಗಳನ್ನು ನಿಲ್ಲಿಸಿ. ಕಾರ್ಮಿಕರಿಗೆ ತಂಪಾದ ನೀರು ಮತ್ತು ನೆರಳಿನ ವ್ಯವಸ್ಥೆ ಮಾಡಿ. ಸಹಾಯವಾಣಿ: 104 — ಕಾರ್ಮಿಕ ಇಲಾಖೆ'
      },
      'gu-IN': {
        lang: 'Gujarati',
        script: 'ગુજરાતી',
        text: 'શ્રમિક સુરક્ષા નિર્દેશ: ભારે ગરમીના કારણે સવારે ૧૧ થી સાંજે ૪:૩૦ સુધી ખુલ્લામાં બાંધકામના કામો બંધ રાખો. શ્રમિકો માટે છાંયડો અને ઠંડા પાણીની વ્યવસ્થા કરો. હેલ્પલાઇન: ૧૦૪ — શ્રમ કલ્યાણ બોર્ડ'
      },
      'en-IN': {
        lang: 'English',
        script: 'English',
        text: 'HEAT SAFETY DIRECTIVE: All strenuous outdoor and rooftop construction work paused 11 AM - 4:30 PM. Mandatory cool water and shade breaks every 30 mins. For helpline call 104. — Occupational Safety Board'
      }
    }
  },
  {
    id: 'sms-hospital',
    category: 'Healthcare Notice',
    label: 'Hospital ICU Heat-Stroke Protocol',
    recipient: 'All PHCs, CHCs, Private & Government Hospitals, EMS 108',
    versions: {
      'hi-IN': {
        lang: 'Hindi',
        script: 'हिन्दी',
        text: 'स्वास्थ्य अलर्ट: तत्काल प्रभाव से हीट-स्ट्रोक प्रोटोकॉल लागू करें। कोल्ड आईवी सलाइन, आइस पैक और विशेष कूलिंग बेड आरक्षित रखें। 24 घंटे निर्बाध बिजली बनाए रखें। — मुख्य चिकित्सा अधिकारी (CMO)'
      },
      'te-IN': {
        lang: 'Telugu',
        script: 'తెలుగు',
        text: 'ఆరోగ్య హెచ్చరిక: వెంటనే వడదెబ్బ అత్యవసర ప్రోటోకాల్ ప్రారంభించండి. ప్రత్యేక కూలింగ్ బెడ్లు, ఐస్ ప్యాక్‌లు, ఐవీ ద్రవాలు సిద్ధంగా ఉంచండి. నిరంతర విద్యುత్ నిర్ధారించండి. — చీఫ్ మెడికల్ ఆఫీసర్'
      },
      'ta-IN': {
        lang: 'Tamil',
        script: 'தமிழ்',
        text: 'மருத்துவ எச்சரிக்கை: உடனடியாக வெப்ப பக்கவாத சிகிச்சை நெறிமுறையை அமல்படுத்துங்கள். பிரத்யேக படுக்கைகள், குளிர்ந்த சலைன் இருப்பு வையுங்கள். தடையில்லா மின்சாரத்தை உறுதி செய்க. — தலைமை மருத்துவ அலுவலர்'
      },
      'bn-IN': {
        lang: 'Bengali',
        script: 'বাংলা',
        text: 'স্বাস্থ্য সতর্কতা: অবিলম্বে হিট-স্ট্রোক প্রোটোকল কার্যকর করুন। সংরক্ষিত কুলিং বেড, ঠান্ডা স্যালাইন ও বরফ প্রস্তুত রাখুন। বিদ্যুৎ ব্যাকআপ চালু রাখুন। — মুখ্য স্বাস্থ্য আধিকারিক'
      },
      'mr-IN': {
        lang: 'Marathi',
        script: 'मराठी',
        text: 'आरोग्य सतर्कता: तातडीने उष्माघात उपचार प्रोटोकॉल सक्रिय करा. थंड सलाईन, बर्फ व स्वतंत्र बेड राखीव ठेवा. अखंडित वीजपुरवठा ठेवा. — मुख्य वैद्यकीय अधिकारी'
      },
      'kn-IN': {
        lang: 'Kannada',
        script: 'ಕನ್ನಡ',
        text: 'ಆರೋಗ್ಯ ಎಚ್ಚರಿಕೆ: ತಕ್ಷಣವೇ ಶಾಖಾಘಾತ ತುರ್ತು ಪ್ರೋಟೋಕಾಲ್ ಸಕ್ರಿಯಗೊಳಿಸಿ. ಪ್ರತ್ಯೇಕ ಬೆಡ್‌ಗಳು, ತಂಪಾದ ಸಲೈನ್ ಮತ್ತು ಐಸ್ ಪ್ಯಾಕ್‌ಗಳನ್ನು ಸಿದ್ಧವಾಗಿಡಿ. — ಜಿಲ್ಲಾ ಮುಖ್ಯ ವೈದ್ಯಾಧಿಕಾರಿ'
      },
      'gu-IN': {
        lang: 'Gujarati',
        script: 'ગુજરાતી',
        text: 'આરોગ્ય ચેતવણી: તાત્કાલિક અસરથી હીટ-સ્ટ્રોક પ્રોટોકોલ લાગુ કરો. ખાસ કૂલિંગ બેડ, કોલ્ડ આઈવી સલાઈન અને આઈસ પેક અનામત રાખો. — મુખ્ય જિલ્લા તબીબી અધિકારી'
      },
      'en-IN': {
        lang: 'English',
        script: 'English',
        text: 'HEALTH ALERT: Activate Heat-Stroke protocol immediately. Reserve dedicated cooling beds, stock cold IV fluids, ORS, and ice packs. Maintain 24x7 power backup. — Chief Medical Officer'
      }
    }
  }
];
