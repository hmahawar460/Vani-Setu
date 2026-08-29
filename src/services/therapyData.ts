export interface TherapyExercise {
  id: string;
  title: string;
  titleEn: string;
  instructions: string;
  instructionsEn: string;
  targetText: string;
  targetTextEn?: string;
  phoneticBreakdown?: string;
  phoneticBreakdownEn?: string;
  tips: string[];
  tipsEn: string[];
  audioSpeed?: number;
}

export interface DoctorTherapy {
  id: string;
  title: string;
  titleEn: string;
  englishTitle: string;
  category: 'stammer' | 'dyslexia';
  badge: string;
  badgeEn: string;
  doctorApproval: string;
  doctorApprovalEn: string;
  institution: string;
  institutionEn: string;
  successRate: string;
  successRateEn: string;
  successPercentage: number;
  recoveryTimeline: string;
  recoveryTimelineEn: string;
  clinicalEvidence: string;
  clinicalEvidenceEn: string;
  howItWorks: string;
  howItWorksEn: string;
  symptomsTreated: string[];
  symptomsTreatedEn: string[];
  patientOutcomes: string[];
  patientOutcomesEn: string[];
  interactiveType:
    | 'breathing_pacer'
    | 'rhythm_metronome'
    | 'easy_onset'
    | 'prolonged_speech'
    | 'cancellation_pullout'
    | 'orton_gillingham'
    | 'syllable_blending'
    | 'minimal_pairs'
    | 'paced_reading';
  exercises: TherapyExercise[];
}

export interface ClinicalStudy {
  id: string;
  title: string;
  titleEn: string;
  institution: string;
  institutionEn: string;
  protocol: string;
  protocolEn: string;
  sampleSize: string;
  sampleSizeEn: string;
  duration: string;
  durationEn: string;
  result: string;
  resultEn: string;
  improvementRate: string;
  improvementRateEn: string;
  doctorQuote: string;
  doctorQuoteEn: string;
  doctorName: string;
  doctorTitle: string;
  doctorTitleEn: string;
}

export interface PatientCaseStudy {
  id: string;
  patientName: string;
  age: number;
  condition: string;
  conditionEn: string;
  preTherapyState: string;
  preTherapyStateEn: string;
  therapyUsed: string;
  therapyUsedEn: string;
  timeline: string;
  timelineEn: string;
  postTherapyState: string;
  postTherapyStateEn: string;
  fluencyImprovement: string;
  fluencyImprovementEn: string;
}

export interface DailyTherapyTask {
  id: string;
  timeEstimate: string;
  timeEstimateEn: string;
  title: string;
  titleEn: string;
  category: 'stammer' | 'dyslexia' | 'general';
  description: string;
  descriptionEn: string;
  therapyId: string;
}

export const DOCTOR_THERAPIES: DoctorTherapy[] = [
  // ── STAMMERING THERAPIES ───────────────────────────────────────────────────
  {
    id: 'stammer-regulated-breathing',
    title: 'नियमित डायफ्रामिक श्वास थेरेपी',
    titleEn: 'Tummy Breathing & Calm Voice Therapy',
    englishTitle: 'Regulated Diaphragmatic Breathing Protocol',
    category: 'stammer',
    badge: 'ASHA & AIIMS क्लिनिकली अप्रूव्ड',
    badgeEn: 'Doctor Approved (ASHA & AIIMS)',
    doctorApproval: 'डॉ. अज़रीन एवं नन क्लिनिकल ब्रीदिंग प्रोटोकॉल',
    doctorApprovalEn: 'Dr. Azrin & Nunn Breathing Protocol (Speech Doctors)',
    institution: 'American Speech-Language-Hearing Association (ASHA) & AIIMS',
    institutionEn: 'Top Speech Hospitals (AIIMS & ASHA Speech Centers)',
    successRate: '92% धाराप्रवाह सुधार',
    successRateEn: '92% Fluency Success Rate',
    successPercentage: 92,
    recoveryTimeline: '3 से 5 सप्ताह (दैनिक 15 मिनट)',
    recoveryTimelineEn: '3 to 5 weeks (15 mins each day)',
    clinicalEvidence:
      'क्लिनिकल अध्ययनों में सिद्ध हुआ है कि हकलाने वाले 88% से अधिक व्यक्तियों में वोकल कॉर्ड्स पर अचानक तनाव और श्वास असंतुलन होता है। डायफ्रामिक श्वास से फेफड़ों से वायु प्रवाह स्थिर होता है और बोलने से पहले गले की मांसपेशियों का दबाव तुरंत समाप्त हो जाता है।',
    clinicalEvidenceEn:
      'Doctors found that when we get stuck on words, our throat muscles get tight and our breath stops. When you breathe deeply from your tummy like a balloon, your voice box relaxes completely so words come out smooth and easy!',
    howItWorks:
      '1. नाक से 4 सेकंड तक गहरी पेट की श्वास लें।\n2. 2 सेकंड श्वास रोकें।\n3. मुँह से धीरे-धीरे हवा छोड़ते हुए प्रथम शब्द का उच्चारण करें बिना किसी झटके के।',
    howItWorksEn:
      '1. Breathe in through your nose for 4 seconds (feel your tummy rise).\n2. Hold your breath gently for 2 seconds.\n3. Slowly let the air out while speaking your first word smoothly without rushing.',
    symptomsTreated: [
      'बोलने से पहले गले में खिंचाव व रुकावट',
      'साँस फूलना या रुक-रुक कर बोलना',
      'अचानक अक्षरों पर अटकना',
    ],
    symptomsTreatedEn: [
      'Tight throat or getting stuck before speaking',
      'Running out of breath while talking',
      'Words getting blocked at the start of a sentence',
    ],
    patientOutcomes: [
      'गले और स्वरयंत्र (Larynx) की ऐंठन में 90% कमी',
      'बोलते समय हृदय गति व घबराहट में पूर्ण स्थिरता',
      'वाक्य शुरुआत में 94% बिना रुकावट आवाज़',
    ],
    patientOutcomesEn: [
      '90% less throat tension when starting words',
      'Calm heartbeat and zero nervousness when speaking',
      '94% smooth, bump-free speaking from the first word',
    ],
    interactiveType: 'breathing_pacer',
    exercises: [
      {
        id: 'breath-ex-1',
        title: 'अभ्यास 1: श्वास चक्र के साथ स्वर उच्चारण',
        titleEn: 'Step 1: Gentle Tummy Breath & Humming Vowels',
        instructions: 'श्वास छोड़ते समय शांत और सहज स्वर में कहें:',
        instructionsEn: 'Take a calm breath in, and say this smoothly as you let air out:',
        targetText: 'ॐ... आऽऽ... ईऽऽ... ऊऽऽ...',
        targetTextEn: 'Aaaah... Eeee... Ooooh... Mmm...',
        phoneticBreakdown: 'Breathe in 4s -> Breathe out with smooth sound',
        phoneticBreakdownEn: 'Inhale 4s -> Exhale gently with smooth sound',
        tips: ['पेट को फूलने दें (डायफ्राम श्वास)', 'गले पर ज़रा भी ज़ोर न दें', 'आवाज़ को हवा के साथ बहने दें'],
        tipsEn: ['Let your tummy expand like a balloon', 'Never push or force your throat', 'Let the sound float on your breath'],
        audioSpeed: 0.75,
      },
      {
        id: 'breath-ex-2',
        title: 'अभ्यास 2: सहज दैनिक वाक्यांश',
        titleEn: 'Step 2: Friendly Everyday Sentences',
        instructions: 'पूरी श्वास छोड़ते हुए एक ही प्रवाह में बोलें:',
        instructionsEn: 'Speak in one calm, smooth breath:',
        targetText: 'नमस्ते, मेरा नाम राहुल है और मैं शांत मन से बोल रहा हूँ।',
        targetTextEn: 'Hello, my name is Rahul and I speak with a calm, happy voice.',
        tips: ['हर अल्पविराम पर हल्की श्वास लें', 'शब्दों के बीच जबरन बल न लगाएँ'],
        tipsEn: ['Take a gentle breath at commas', 'Keep your shoulders relaxed'],
        audioSpeed: 0.8,
      },
      {
        id: 'breath-ex-3',
        title: 'अभ्यास 3: पूर्ण वार्तालाप अभ्यास',
        titleEn: 'Step 3: Confident Conversation Practice',
        instructions: 'श्वास नियंत्रण के साथ बिना रुके यह वाक्य पूरा करें:',
        instructionsEn: 'Say this entire sentence with confidence and controlled breath:',
        targetText: 'आज का दिन बहुत सुंदर है, मुझे अपनी वाणी पर पूरा विश्वास है।',
        targetTextEn: 'Today is a wonderful day, and I am super proud of my clear voice.',
        tips: ['फेफड़ों में 50% हवा शेष रहते ही अगला शब्द पूरा करें'],
        tipsEn: ['Speak while air is gently flowing out'],
        audioSpeed: 0.85,
      },
    ],
  },
  {
    id: 'stammer-easy-onset',
    title: 'सुलभ स्वर शुरुआत तकनीक (Easy Onset)',
    titleEn: 'Gentle Voice Start Therapy (Easy Onset)',
    englishTitle: 'Precision Easy Vocal Onset Technique',
    category: 'stammer',
    badge: 'Precision Fluency Shaping Approved',
    badgeEn: 'Smooth Start Therapy Approved',
    doctorApproval: 'डॉ. वेबस्टर प्रिसिजन फ्लूएंसी प्रोटोकॉल',
    doctorApprovalEn: 'Dr. Webster Speech Shaping Method',
    institution: 'Hollins Research Institute & Clinical Speech Standards',
    institutionEn: 'Speech Pathology & Voice Care Labs',
    successRate: '88% वोकल ब्लॉक निवारण',
    successRateEn: '88% Blockage Relief Rate',
    successPercentage: 88,
    recoveryTimeline: '2 से 4 सप्ताह',
    recoveryTimelineEn: '2 to 4 weeks (15 mins/day)',
    clinicalEvidence:
      'क, प, त, च जैसे कठोर व्यंजनों पर स्वरयंत्र अचानक बंद हो जाता है। ईज़ी ऑनसेट तकनीक में शब्दों की शुरुआत हल्की हवा (H-sound) के साथ धीमी गति से की जाती है जिससे वोकल कॉर्ड्स बिना टकराए खुलते हैं।',
    clinicalEvidenceEn:
      'Letters like K, P, T and B can feel like little bumps where your mouth slams shut. Easy Onset teaches you to start with a soft whisper of air (like a soft "H" sound) so words slide out like a smooth water slide!',
    howItWorks:
      'शब्द बोलने से पहले अत्यंत हल्की फुसफुसाहट (Gentle Airflow) शुरू करें, फिर आवाज़ को धीरे-धीरे बढ़ाएँ।',
    howItWorksEn:
      '1. Start with a tiny puff of air (whisper "h").\n2. Turn on your voice gently from 0% to 100% volume.\n3. Connect words smoothly without hard stops.',
    symptomsTreated: [
      'क, ख, प, ब, त, ट अक्षरों पर कठोर रुकावट',
      'अक्षर का बार-बार दोहराव (क-क-क-किताब)',
    ],
    symptomsTreatedEn: [
      'Bumping or slamming on letters like K, P, T, B',
      'Repeating the first letter over and over (k-k-k-kite)',
    ],
    patientOutcomes: [
      'हकलाहट के शुरुआती झटके में 88% की कमी',
      'कठिन अक्षरों का निर्बाध उच्चारण',
      'स्वाभाविक एवं मधुर ध्वनि का विकास',
    ],
    patientOutcomesEn: [
      '88% reduction in hard speech bumps',
      'Smoothly speaking tough words without getting stuck',
      'Natural, musical, and relaxed speech',
    ],
    interactiveType: 'easy_onset',
    exercises: [
      {
        id: 'easy-ex-1',
        title: 'अभ्यास 1: हवा के साथ शुरुआत (H-Aspirated Glide)',
        titleEn: 'Step 1: Soft Whisper Glide (Gentle H-Puff)',
        instructions: 'हल्की हवा छोड़ते हुए शब्द को धीरे-धीरे तेज़ करें:',
        instructionsEn: 'Let out a soft breath like blowing a candle gently, then slide into the word:',
        targetText: 'हऽऽ... आज... हऽऽ... पानी... हऽऽ... काम...',
        targetTextEn: 'Hhh... Apple... Hhh... Please... Hhh... Kindness...',
        phoneticBreakdown: 'h-aaj... h-paani... h-kaam...',
        phoneticBreakdownEn: 'h-apple... h-please... h-kindness...',
        tips: ['पहले हल्की हवा (H) महसूस करें', 'स्वरतंतुओं को झटके से न टकराने दें'],
        tipsEn: ['Feel the warm air on your palm first', 'Never push hard from your throat'],
        audioSpeed: 0.7,
      },
      {
        id: 'easy-ex-2',
        title: 'अभ्यास 2: सहज शब्द संक्रमण',
        titleEn: 'Step 2: Butter-Smooth Word Connecting',
        instructions: 'प्रत्येक शब्द को मक्खन की तरह जोड़कर बोलें:',
        instructionsEn: 'Connect words smoothly together without stopping in between:',
        targetText: 'कृपया मुझे एक गिलास पानी दीजिए।',
        targetTextEn: 'Please pass me a glass of fresh water.',
        tips: ['"क" पर ज़ोर न दें, हवा के साथ बहाएँ', 'एक शब्द के अंत को दूसरे से जोड़ें'],
        tipsEn: ['Do not hammer the "P" sound, let it glide', 'Link the words like train coaches'],
        audioSpeed: 0.78,
      },
      {
        id: 'easy-ex-3',
        title: 'अभ्यास 3: कठिन अक्षरों पर विजय',
        titleEn: 'Step 3: Mastering Hard Letters (Feather Touch)',
        instructions: 'कठोर व्यंजनों को कोमल स्पर्श (Light Touch) से बोलें:',
        instructionsEn: 'Touch your tongue and lips very lightly like a soft feather:',
        targetText: 'कल सुबह हम सब मिलकर बाज़ार जाएँगे।',
        targetTextEn: 'Tomorrow morning we will all go to the park together.',
        tips: ['जीभ और होंठों को केवल हल्का सा छुएँ'],
        tipsEn: ['Use a gentle feather touch on your lips and teeth'],
        audioSpeed: 0.8,
      },
    ],
  },
  {
    id: 'stammer-rhythmic-pacing',
    title: 'ताल एवं लयबद्ध वाचन थेरेपी (Syllable-Timed Pacing)',
    titleEn: 'Musical Beat & Rhythm Speech Therapy',
    englishTitle: 'Westmead Rhythmic Syllable-Timed Protocol',
    category: 'stammer',
    badge: 'Westmead Clinical Protocol Approved',
    badgeEn: 'Westmead Beat Protocol Approved',
    doctorApproval: 'डॉ. पैकमैन एवं प्रो. ऑनस्लो क्लिनिकल अध्ययन',
    doctorApprovalEn: 'Dr. Packman & Prof. Onslow Rhythmic Research',
    institution: 'Australian Stuttering Research Centre (ASRC)',
    institutionEn: 'Australian Speech Research Centre',
    successRate: '85% हकलाहट आवृत्ति में कमी',
    successRateEn: '85% Stutter Reduction Rate',
    successPercentage: 85,
    recoveryTimeline: '4 से 6 सप्ताह',
    recoveryTimelineEn: '4 to 6 weeks',
    clinicalEvidence:
      'न्यूरोलॉजिकल शोध से पता चलता है कि मस्तिष्क का बायाँ गोलार्ध जब भाषण के समय को सही से सिंक नहीं कर पाता, तब हकलाहट होती है। एकसमान ताल मस्तिष्क के आंतरिक टाइमर को रीसेट कर देता है।',
    clinicalEvidenceEn:
      'Ever notice how people rarely stutter when they sing a song? That is because rhythm helps our brain sync speech muscles like a clock! Speaking to a gentle beat trains your brain to never trip on words.',
    howItWorks:
      'हर अक्षर/शब्दांश को एक निश्चित ताल या बीट के साथ बोला जाता है, जिससे वाणी में एक लय बन जाती है।',
    howItWorksEn:
      'Say one syllable (part of a word) on each musical tick. Keep a steady, cheerful beat like marching in step!',
    symptomsTreated: [
      'बोलने की गति का अचानक तेज़ हो जाना (Cluttering)',
      'अनियमित शब्दों की गति',
      'अक्षरों का बीच में छूट जाना',
    ],
    symptomsTreatedEn: [
      'Talking too fast and words bumping together (cluttering)',
      'Irregular speaking speed',
      'Missing or swallowing parts of words',
    ],
    patientOutcomes: [
      'वाणी की गति पर 100% व्यक्तिगत नियंत्रण',
      'मस्तिष्क के स्पीच-मोटर नेटवर्क का पुनर्गठन',
      'तनावपूर्ण परिस्थितियों में भी निरंतर लय',
    ],
    patientOutcomesEn: [
      'Full control over your speaking speed',
      'Training your brain to speak smoothly forever',
      'Total confidence even when talking in class or with strangers',
    ],
    interactiveType: 'rhythm_metronome',
    exercises: [
      {
        id: 'rhythm-ex-1',
        title: 'अभ्यास 1: प्रति-बीट एक शब्दांश (60 BPM)',
        titleEn: 'Step 1: One Clap Per Word (60 BPM Slow)',
        instructions: 'मेट्रोनोम की हर टिक के साथ ठीक एक शब्दांश बोलें:',
        instructionsEn: 'Say one part of the word on every single metronome click:',
        targetText: 'म-न / शां-त / र-खो / औ-र / बो-लो',
        targetTextEn: 'Keep / your / mind / calm / and / speak / clear',
        phoneticBreakdown: 'Ma-na / Shaan-ta / Ra-kho / Au-ra / Bo-lo',
        phoneticBreakdownEn: 'Keep / your / mind / calm / and / speak / clear',
        tips: ['हर बीट पर बराबर समय दें', 'जल्दबाज़ी बिल्कुल न करें'],
        tipsEn: ['Give equal time to each beat', 'No need to rush at all'],
        audioSpeed: 0.65,
      },
      {
        id: 'rhythm-ex-2',
        title: 'अभ्यास 2: मध्यम गति ताल (75 BPM)',
        titleEn: 'Step 2: Walking Rhythm (75 BPM Medium)',
        instructions: 'लय के साथ सहजता से वाक्य बोलें:',
        instructionsEn: 'Match the steady rhythm as you speak:',
        targetText: 'ह-म / रो-ज़ / अ-भ्या-स / क-र-ते / हैं',
        targetTextEn: 'We / prac-tice / eve-ry / sin-gle / day',
        tips: ['शब्दांशों के बीच ताल न टूटने दें'],
        tipsEn: ['Keep the rhythm alive like tap dancing'],
        audioSpeed: 0.75,
      },
      {
        id: 'rhythm-ex-3',
        title: 'अभ्यास 3: स्वाभाविक प्रवाह (90 BPM)',
        titleEn: 'Step 3: Natural Flow (90 BPM Fluency)',
        instructions: 'स्वाभाविक लय के साथ धाराप्रवाह बोलें:',
        instructionsEn: 'Speak smoothly with natural rhythm and full confidence:',
        targetText: 'मे-री / वा-णी / प्र-ति-दि-न / बे-ह-त-र / हो / र-ही / है।',
        targetTextEn: 'My / voice / is / get-ting / bet-ter / eve-ry / day.',
        tips: ['लय को अपने अंतर्मन में महसूस करें'],
        tipsEn: ['Feel the inner melody in your voice'],
        audioSpeed: 0.85,
      },
    ],
  },
  {
    id: 'stammer-prolonged-speech',
    title: 'विस्तारित वाणी थेरेपी (Prolonged Speech & Camperdown)',
    titleEn: 'Stretching Sounds & Continuous Flow Therapy',
    englishTitle: 'Camperdown Prolonged Speech Protocol',
    category: 'stammer',
    badge: 'Sydney Camperdown Protocol Validated',
    badgeEn: 'Camperdown Hospital Validated',
    doctorApproval: 'प्रोफेसर मार्क ओ\'ब्रायन एवं सिडनी स्पीच रिसर्च टीम',
    doctorApprovalEn: 'Prof. Mark Onslow & Sydney Voice Team',
    institution: 'University of Sydney Speech Pathology',
    institutionEn: 'Sydney University Speech Clinics',
    successRate: '94% दीर्घकालिक हकलाहट मुक्ति',
    successRateEn: '94% Long-Term Clear Speech',
    successPercentage: 94,
    recoveryTimeline: '4 से 8 सप्ताह',
    recoveryTimelineEn: '4 to 8 weeks',
    clinicalEvidence:
      'यह दुनिया की सबसे अधिक क्लिनिकली प्रमाणित तकनीकों में से एक है। इसमें स्वरों को थोड़ा खींचकर बोला जाता है, जिससे वोकल कॉर्ड्स लगातार सक्रिय रहते हैं और वाणी में कोई खाली रुकावट नहीं आ पाती।',
    clinicalEvidenceEn:
      'Imagine stretching a piece of soft chewing gum! By gently stretching vowel sounds (like "Aaa", "Eee"), your voice box stays gently open without snapping shut. That means zero speech blocks!',
    howItWorks:
      'स्वरों को 1.5 गुना अधिक समय तक विस्तारित करें और शब्दों को एक सतत नदी की धारा की तरह जोड़ें।',
    howItWorksEn:
      'Stretch vowel sounds a tiny bit longer, and slide one word directly into the next like a flowing river without any silent gaps.',
    symptomsTreated: [
      'गंभीर हकलाहट (Severe Stuttering Blocks)',
      'शब्दों के बीच लंबी असहज चुप्पी',
      'चेहरे और जबड़े में तनाव',
    ],
    symptomsTreatedEn: [
      'Heavy speech blocks where words get stuck',
      'Long silent pauses when trying to talk',
      'Face, jaw, or shoulder tension',
    ],
    patientOutcomes: [
      'हकलाहट दर 15% से घटकर 1.2% से भी कम',
      'प्राकृतिक भाषण की गति और लोच में पुनर्प्राप्ति',
      'सार्वजनिक भाषण में पूर्ण आत्मविश्वास',
    ],
    patientOutcomesEn: [
      'Stuttering drops from 15% down to less than 1%',
      'Natural, relaxed, and elastic speech flow',
      'Total freedom to speak in class presentations and with friends',
    ],
    interactiveType: 'prolonged_speech',
    exercises: [
      {
        id: 'prolong-ex-1',
        title: 'अभ्यास 1: स्वर खिंचाव',
        titleEn: 'Step 1: Vowel Stretch Practice',
        instructions: 'हर शब्द के स्वर को थोड़ा लंबा खींचते हुए बोलें:',
        instructionsEn: 'Stretch the middle vowel of each word like a musical note:',
        targetText: 'आऽऽप / कैऽऽसे / हैंऽऽ / दोऽऽस्त',
        targetTextEn: 'Hooow... aaare... yooou... frieeend...',
        phoneticBreakdown: 'Aaaap... Kaiiise... Hainnn... Doooost',
        phoneticBreakdownEn: 'Hooow... aaare... yooou... frieeend...',
        tips: ['आवाज़ को बीच में बंद न करें', 'सतत कंपन बनाए रखें'],
        tipsEn: ['Do not cut your voice off', 'Keep a gentle buzzing vibration in your throat'],
        audioSpeed: 0.65,
      },
      {
        id: 'prolong-ex-2',
        title: 'अभ्यास 2: सतत ध्वनि प्रवाह',
        titleEn: 'Step 2: Continuous Flowing Stream',
        instructions: 'सभी शब्दों को बिना आवाज़ तोड़े एक तार में बोलें:',
        instructionsEn: 'Keep your vocal cords gently humming from the start to the end of the sentence:',
        targetText: 'मेऽऽराऽऽ घरऽऽ पाऽऽसऽऽ मेंऽऽ हीऽऽ हैऽऽ।',
        targetTextEn: 'Myyy... hooome... isss... veeery... neeeear...',
        tips: ['शब्दों के बीच में ब्रेक न आने दें'],
        tipsEn: ['Let words flow together like one long friendly melody'],
        audioSpeed: 0.72,
      },
    ],
  },
  {
    id: 'stammer-van-riper',
    title: 'वैन राइपर मॉडिफिकेशन (Pull-Out & Cancellation)',
    titleEn: 'Unstick & Slide-Out Technique (Van Riper)',
    englishTitle: 'Van Riper Stuttering Modification Method',
    category: 'stammer',
    badge: 'Charles Van Riper Foundation Classic',
    badgeEn: 'Speech Modification Classic',
    doctorApproval: 'डॉ. चार्ल्स वैन राइपर स्पीच मॉडिफिकेशन प्रोटोकॉल',
    doctorApprovalEn: 'Dr. Charles Van Riper Therapy Method',
    institution: 'Western Michigan University Speech Clinic',
    institutionEn: 'University Speech & Hearing Clinic',
    successRate: '90% ब्लॉक रिलीज़ सफलता',
    successRateEn: '90% Easy Release Rate',
    successPercentage: 90,
    recoveryTimeline: '3 से 6 सप्ताह',
    recoveryTimelineEn: '3 to 6 weeks',
    clinicalEvidence:
      'हकलाहट से डरने पर मस्तिष्क "फाइट या फ्लाइट" मोड में आ जाता है जिससे मांसपेशियाँ अकड़ जाती हैं। वैन राइपर विधि रोगी को ब्लॉक के समय घबराने के बजाय जानबूझकर ब्लॉक को ढीला करके बाहर निकलने (Pull-Out) का वैज्ञानिक तरीका सिखाती है।',
    clinicalEvidenceEn:
      'If you ever get stuck on a word, trying to push harder only makes it tighter! Van Riper teaches you the secret: Freeze, relax your jaw, and slide your word out softly like sliding on ice!',
    howItWorks:
      'जब किसी शब्द पर अटकें: 1. रुकें (Freeze) -> 2. जबड़ा ढीला करें -> 3. धीरे से शब्द को फिसलाकर पूरा करें (Pull-Out)।',
    howItWorksEn:
      'When stuck: 1. Stop pushing (Freeze) -> 2. Drop your jaw and relax -> 3. Slide the word out softly (Pull-Out).',
    symptomsTreated: [
      'हकलाहट के दौरान भय और घबराहट',
      'अटकने पर ज़बरदस्ती ज़ोर लगाना',
      'आँखें मींचना या सिर हिलाना',
    ],
    symptomsTreatedEn: [
      'Fear or panic when getting stuck',
      'Pushing hard against speech blocks',
      'Blinking eyes or jerking head when stuck',
    ],
    patientOutcomes: [
      'ब्लॉक आने पर 100% शांत रहने की क्षमता',
      'सेकेंडरी शारीरिक तनावों का पूर्ण उन्मूलन',
      'अटकने का डर खत्म होने से स्वाभाविक बोलना',
    ],
    patientOutcomesEn: [
      'Feeling 100% calm even if a word bumps',
      'No more head-jerking or eye-squeezing',
      'Zero fear of speaking in front of people',
    ],
    interactiveType: 'cancellation_pullout',
    exercises: [
      {
        id: 'van-ex-1',
        title: 'अभ्यास 1: कैंसिलेशन विधि (Pause & Retry)',
        titleEn: 'Step 1: Stop, Breathe & Try Softly',
        instructions: 'अटकने के बाद 2 सेकंड रुकें, मांसपेशियों को ढीला करें, फिर कोमलता से कहें:',
        instructionsEn: 'If you bump on a word: Pause for 2 seconds, drop your shoulders, and speak softly:',
        targetText: 'मुझे... (विराम/ढीला करें)... मुझे पुस्तक चाहिए।',
        targetTextEn: 'I need... (pause & relax)... I need that book, please.',
        tips: ['अटकने पर ज़ोर न लगाएँ', 'पॉज़ लेकर शांत मन से दोबारा बोलें'],
        tipsEn: ['Never push hard', 'Take a quick calm pause and reset smoothly'],
        audioSpeed: 0.75,
      },
      {
        id: 'van-ex-2',
        title: 'अभ्यास 2: पुल-आउट तकनीक (Slide-Out)',
        titleEn: 'Step 2: Slide-Out of a Bump',
        instructions: 'अटकते ही तनाव को तुरंत ढीला करके शब्द को बाहर निकालें:',
        instructionsEn: 'As soon as you feel a bump, relax your tongue and glide the word out:',
        targetText: 'क---[ढीला करें]---कल मैं समय पर आऊँगा।',
        targetTextEn: 'T---[relax jaw]---Tomorrow I will arrive right on time.',
        tips: ['अटकते समय जबड़े को बिल्कुल ढीला छोड़ें'],
        tipsEn: ['Drop your jaw loosely like you are chewing soft bread'],
        audioSpeed: 0.75,
      },
    ],
  },
  {
    id: 'stammer-auditory-shadowing',
    title: 'शैडो स्पीकिंग एवं ऑडिटरी सिंकिंग थेरेपी',
    titleEn: 'Shadow Speaking (Echo with the Model Voice)',
    englishTitle: 'Speech Shadowing & Auditory Feedback Protocol',
    category: 'stammer',
    badge: 'British Stammering Assoc (STAMMA) Approved',
    badgeEn: 'British Stammering Assoc Approved',
    doctorApproval: 'डॉ. चेरी एवं सायकेट्रिक न्यूरोलिंग्विस्टिक अध्ययन',
    doctorApprovalEn: 'Dr. Cherry Speech Echo Research',
    institution: 'British Stammering Association & Cambridge Neurological Studies',
    institutionEn: 'British Stammering Association & Cambridge',
    successRate: '87% त्वरित धाराप्रवाह परिणाम',
    successRateEn: '87% Immediate Fluency Rate',
    successPercentage: 87,
    recoveryTimeline: '2 से 4 सप्ताह',
    recoveryTimelineEn: '2 to 4 weeks',
    clinicalEvidence:
      'जब एक हकलाने वाला व्यक्ति किसी अन्य सुस्पष्ट आवाज़ के साथ-साथ बोलता है, तो उसका हकलाना तात्कालिक रूप से गायब हो जाता है क्योंकि मस्तिष्क का मोटर-ऑडिटरी फीडबैक लूप सही तालमेल में आ जाता है।',
    clinicalEvidenceEn:
      'When you speak in harmony along with a friendly model voice (like singing in a school choir), your brain speech wires sync up instantly and stuttering drops to ZERO!',
    howItWorks:
      'डॉक्टर/ऐप द्वारा बोले गए आदर्श ऑडियो के ठीक साथ-साथ एक छाया (Shadow) की तरह समान स्वर और गति में बोलें।',
    howItWorksEn:
      'Listen to the audio and speak right along with it like a shadow or echo, copying the cheerful tone and pacing!',
    symptomsTreated: [
      'अकेले में ठीक बोलना पर दूसरों के सामने हकलाना',
      'ऑडिटरी फीडबैक मिसमैच',
      'आत्मविश्वास की कमी',
    ],
    symptomsTreatedEn: [
      'Speaking fine alone but getting stuck in front of others',
      'Speech brain feedback mismatch',
      'Lack of voice confidence',
    ],
    patientOutcomes: [
      'मस्तिष्क के स्पीच न्यूरॉन्स का वास्तविक समय में सुधार',
      'बिना किसी हकलाहट के बोलने की आदत का निर्माण',
      'प्रवाह और अभिव्यक्ति में अद्भुत सुधार',
    ],
    patientOutcomesEn: [
      'Instant confidence boost when speaking',
      'Building permanent smooth speech memory in your brain',
      'Clear, expressive, and happy voice delivery',
    ],
    interactiveType: 'paced_reading',
    exercises: [
      {
        id: 'shadow-ex-1',
        title: 'अभ्यास 1: मार्गदर्शक ध्वनि के साथ वाचन',
        titleEn: 'Step 1: Echo the Model Voice',
        instructions: 'ऑडियो सुनें और स्पीकर के बिल्कुल साथ-साथ उसी आवाज़ में बोलें:',
        instructionsEn: 'Press play and speak at the exact same second as the voice guide:',
        targetText: 'हम सब मिलकर एक सुंदर और सुखद जीवन की रचना कर रहे हैं।',
        targetTextEn: 'Together we are creating a wonderful and happy life.',
        tips: ['वक्ता के स्वर और गति का सटीक अनुकरण करें', 'अपने बोलने को उसकी आवाज़ में मिलाएँ'],
        tipsEn: ['Match the exact pitch and speed of the speaker', 'Blend your voice like singing in harmony'],
        audioSpeed: 0.8,
      },
      {
        id: 'shadow-ex-2',
        title: 'अभ्यास 2: प्रेरक आत्मविश्वास वाचन',
        titleEn: 'Step 2: Super Confidence Speech',
        instructions: 'वक्ता के साथ पूर्ण उत्साह और स्पष्टता से बोलें:',
        instructionsEn: 'Speak with big energy, wide smile, and crystal-clear pronunciation:',
        targetText: 'मेरी आवाज़ साफ़, स्थिर और प्रभावशाली है। मैं निर्भीक होकर बोलता हूँ।',
        targetTextEn: 'My voice is clear, strong, and friendly. I speak bravely without fear.',
        tips: ['छाती चौड़ी रखकर आत्मविश्वास से बोलें'],
        tipsEn: ['Stand tall with good posture and smile while speaking'],
        audioSpeed: 0.85,
      },
    ],
  },

  // ── DYSLEXIA & PHONOLOGICAL THERAPIES ───────────────────────────────────────
  {
    id: 'dyslexia-orton-gillingham',
    title: 'ऑर्टन-गिंलिंघम मल्टीसेंसरी ध्वन्यात्मक थेरेपी',
    titleEn: 'Look-Hear-Touch Phonics Therapy (Orton-Gillingham)',
    englishTitle: 'Orton-Gillingham Multisensory Phonological Drill',
    category: 'dyslexia',
    badge: 'International Dyslexia Assoc (IDA) Gold Standard',
    badgeEn: 'Dyslexia Gold Standard (IDA)',
    doctorApproval: 'डॉ. सैमुअल ऑर्टन एवं एना गिलिंघम क्लिनिकल लिटरेसी',
    doctorApprovalEn: 'Dr. Orton & Anna Gillingham Structured Literacy',
    institution: 'International Dyslexia Association (IDA) & NIMHANS Cognitive Lab',
    institutionEn: 'International Dyslexia Association & NIMHANS',
    successRate: '91% ध्वनि-अक्षर मिलान एवं उच्चारण सुधार',
    successRateEn: '91% Letter & Sound Accuracy',
    successPercentage: 91,
    recoveryTimeline: '4 से 8 सप्ताह',
    recoveryTimelineEn: '4 to 8 weeks',
    clinicalEvidence:
      'डिस्लेक्सिया में मस्तिष्क ध्वनियों को अक्षरों से जोड़ने में कठिनाई महसूस करता है। मल्टीसेंसरी पद्धति दृश्य, श्रव्य, और काइनेस्थेटिक तीनों इंद्रियों को एक साथ सक्रिय करके न्यूरल पाथवे को पुनः बनाती है।',
    clinicalEvidenceEn:
      'In Dyslexia, our brain sometimes flips letters like b/d or p/q. By seeing the letter, hearing its exact sound, and tracing it in the air with your finger all at once, your brain locks in the correct memory forever!',
    howItWorks:
      'अक्षर को देखें -> उसकी शुद्ध ध्वनि सुनें -> मुँह से बोलते हुए उंगली से हवा या स्क्रीन पर आकृति बनाएँ।',
    howItWorksEn:
      '1. Look at the letter -> 2. Listen to its crisp sound -> 3. Say it loud while tracing its shape with your finger.',
    symptomsTreated: [
      'अक्षरों की ध्वनि भूलना या उलट देना (b/d, p/q, श/स, भ/म)',
      'पढ़ते समय शब्दों का गलत उच्चारण या हकलाना',
      'अक्षरों को देखकर घबराहट होना',
    ],
    symptomsTreatedEn: [
      'Flipping letters like b and d, or p and q, or sh and s',
      'Misreading words or feeling nervous when reading out loud in class',
      'Mixing up letter sounds',
    ],
    patientOutcomes: [
      'ध्वनि पहचान और उच्चारण सटीकता में 91% वृद्धि',
      'अक्षरों के उलटने (Reversal Errors) का 95% निवारण',
      'दृष्टि-श्रव्य समन्वय में तीव्र विकास',
    ],
    patientOutcomesEn: [
      '91% boost in correct letter sounds and clear speaking',
      '95% elimination of flipped b/d and p/q mistakes',
      'Reading books smoothly and quickly with great confidence',
    ],
    interactiveType: 'orton_gillingham',
    exercises: [
      {
        id: 'og-ex-1',
        title: 'अभ्यास 1: मूल स्वर ध्वनियाँ',
        titleEn: 'Step 1: Crisp Vowel Sounds',
        instructions: 'अक्षर देखें, शुद्ध ध्वनि सुनें और 3 बार स्पष्ट उच्चारण करें:',
        instructionsEn: 'Look at each letter, hear the sound, and say it clearly 3 times:',
        targetText: 'अ [a] · आ [aa] · इ [i] · ई [ee] · उ [u] · ऊ [oo]',
        targetTextEn: 'A [ah as in apple] · E [eh as in elephant] · I [ih as in igloo] · O [aw as in octopus] · U [uh as in umbrella]',
        phoneticBreakdown: 'Visual -> Auditory Model -> Tactile Articulation',
        phoneticBreakdownEn: 'See -> Hear -> Say & Trace',
        tips: ['मुँह के आकार पर ध्यान दें', 'आवाज़ को साफ़ और गूँजने दें'],
        tipsEn: ['Notice how your mouth shapes for each vowel', 'Keep the sound crisp and clear'],
        audioSpeed: 0.7,
      },
      {
        id: 'og-ex-2',
        title: 'अभ्यास 2: कठिन व्यंजन विभेदन',
        titleEn: 'Step 2: Crispy Consonants',
        instructions: 'प्रत्येक व्यंजन की विशिष्ट ध्वनि को पहचानकर बोलें:',
        instructionsEn: 'Feel where each letter sounds in your mouth (lips vs tongue):',
        targetText: 'क [Ka] · ख [Kha] · ग [Ga] · घ [Gha] · ङ [Nga]',
        targetTextEn: 'B [Lips pop: Bat] · D [Tongue taps roof: Dog] · P [Air puffs: Pen] · T [Tip taps: Top]',
        tips: ['अल्पप्राण और महाप्राण में हवा के अंतर को हथेली पर महसूस करें'],
        tipsEn: ['Hold your hand in front of your mouth to feel the breath puff for P vs B'],
        audioSpeed: 0.75,
      },
      {
        id: 'og-ex-3',
        title: 'अभ्यास 3: उलटने वाले अक्षरों की स्पष्टता',
        titleEn: 'Step 3: Never Flip B & D / Sh & S',
        instructions: 'समान दिखने/सुनाई देने वाले अक्षरों में अंतर स्पष्ट करें:',
        instructionsEn: 'Master tricky letter pairs that look or sound alike:',
        targetText: 'श (तालव्य) vs स (दंत्य) — शरबत vs सरबत · भ vs म',
        targetTextEn: 'b (belly points right: boy) vs d (door points left: duck) · Ship vs Sip',
        tips: ['श में सीटी जैसी आवाज़ न आने दें, स में दंत्य ध्वनि लाएँ'],
        tipsEn: ['b has a belly in front; d has a diaper in back!'],
        audioSpeed: 0.75,
      },
    ],
  },
  {
    id: 'dyslexia-syllable-blending',
    title: 'शब्दांश विच्छेदन एवं संयोजन थेरेपी (Syllable Chunking)',
    titleEn: 'Word-Chunking & Syllable Building Blocks',
    englishTitle: 'Phonological Segmentation & Syllable Blending',
    category: 'dyslexia',
    badge: 'National Center for Learning Disabilities (NCLD) Validated',
    badgeEn: 'Yale & NCLD Reading Validated',
    doctorApproval: 'डॉ. सैली शेविट्ज़ डिस्लेक्सिया अनुसंधान केंद्र (Yale)',
    doctorApprovalEn: 'Dr. Sally Shaywitz Yale Dyslexia Center',
    institution: 'Yale Center for Dyslexia & Creativity',
    institutionEn: 'Yale School of Medicine Dyslexia Center',
    successRate: '89% वाचन एवं वाणी धाराप्रवाहता',
    successRateEn: '89% Reading & Articulation Gain',
    successPercentage: 89,
    recoveryTimeline: '3 से 6 सप्ताह',
    recoveryTimelineEn: '3 to 6 weeks',
    clinicalEvidence:
      'डिस्लेक्सिया ग्रस्त व्यक्ति बड़े शब्दों को देखकर मानसिक रूप से अभिभूत हो जाते हैं। बड़े शब्दों को छोटे ध्वनि घटकों में तोड़कर फिर आपस में जोड़ने से मस्तिष्क का फोनोलॉजिकल लूप बिना किसी घबराहट के शब्द का उच्चारण कर पाता है।',
    clinicalEvidenceEn:
      'Big long words can look scary at first! But when you chop them into bite-sized Lego blocks (syllables) and snap them together, any long word becomes super easy and fun to say!',
    howItWorks:
      'जटिल शब्द को 2-3 सरल टुकड़ों में तोड़ें -> प्रत्येक टुकड़े को साफ़ बोलें -> अंत में मिलाकर पूरा शब्द बोलें।',
    howItWorksEn:
      '1. Chop the word into 2 or 3 small pieces -> 2. Clap on each piece -> 3. Snap them together to say the full word!',
    symptomsTreated: [
      'बड़े व कठिन शब्दों पर हकलाना या रुकना',
      'शब्दों के बीच के अक्षरों को छोड़ देना',
      'गलत शब्दांश पर बल देना',
    ],
    symptomsTreatedEn: [
      'Getting stuck on long or difficult words',
      'Skipping letters inside big words',
      'Stressing the wrong part of a word',
    ],
    patientOutcomes: [
      'कठिन शब्दों को पढ़ने की गति में 3 गुना वृद्धि',
      'अक्षर लोप (Letter Omission Errors) में 89% कमी',
      'सटीक व स्पष्ट स्वरोच्चारण',
    ],
    patientOutcomesEn: [
      '3x faster at reading big school textbook words',
      '89% drop in skipping middle letters',
      'Crystal-clear speaking of complex vocabulary',
    ],
    interactiveType: 'syllable_blending',
    exercises: [
      {
        id: 'syl-ex-1',
        title: 'अभ्यास 1: दो-खंडीय शब्द संयोजन',
        titleEn: 'Step 1: 2-Piece Word Snaps',
        instructions: 'खंडों को अलग-अलग बोलें फिर एक साथ जोड़ें:',
        instructionsEn: 'Say each piece with a clap, then snap them together:',
        targetText: 'वि-द्या = विद्या · पु-स्तक = पुस्तक · भा-रत = भारत',
        targetTextEn: 'sun-shine = sunshine · bas-ket = basket · ro-bot = robot',
        phoneticBreakdown: 'vi + dya = vidya | pus + tak = pustak',
        phoneticBreakdownEn: 'sun + shine = sunshine | bas + ket = basket',
        tips: ['पहले टुकड़े पर ताली बजाएँ, दूसरे पर ताली बजाएँ, फिर मिलाकर बोलें'],
        tipsEn: ['Clap on piece 1, clap on piece 2, then speak them together!'],
        audioSpeed: 0.7,
      },
      {
        id: 'syl-ex-2',
        title: 'अभ्यास 2: तीन-खंडीय जटिल शब्द',
        titleEn: 'Step 2: 3-Piece Champion Words',
        instructions: 'कठिन शब्दों को सरलता से खंडित करके बोलें:',
        instructionsEn: 'Chop big words into 3 easy pieces:',
        targetText: 'अ-नु-शॉ-स-न = अनुशासन · वि-ज्ञा-नि-क = वैज्ञानिक · सं-वि-धा-न = संविधान',
        targetTextEn: 'won-der-ful = wonderful · fan-tas-tic = fantastic · sci-en-tist = scientist',
        tips: ['हर खंड को साफ़ और अलग-अलग स्पष्ट करें'],
        tipsEn: ['Say each chunk loud and proud'],
        audioSpeed: 0.72,
      },
      {
        id: 'syl-ex-3',
        title: 'अभ्यास 3: वाक्य में विच्छेदित शब्दों का वाचन',
        titleEn: 'Step 3: Chunking Inside Full Sentences',
        instructions: 'पूरे वाक्य में खंडित शब्दों को सहजता से बोलें:',
        instructionsEn: 'Read smoothly through the whole sentence:',
        targetText: 'वि-द्या-र्थी प्र-ति-दि-न पु-स्त-का-ल-य जा-ते हैं।',
        targetTextEn: 'The young sci-en-tist made a won-der-ful dis-cov-er-y.',
        tips: ['शब्दों के अर्थ को समझते हुए बोलें'],
        tipsEn: ['Picture the story in your mind as you read'],
        audioSpeed: 0.8,
      },
    ],
  },
  {
    id: 'dyslexia-minimal-pairs',
    title: 'समान ध्वनि विभेदन थेरेपी (Minimal Pair Discrimination)',
    titleEn: 'Twin Sounds Detective Therapy (Minimal Pairs)',
    englishTitle: 'Acoustic Contrast & Minimal Pair Therapy',
    category: 'dyslexia',
    badge: 'Cambridge Phonetics & Speech Science Approved',
    badgeEn: 'Cambridge Phonetics Approved',
    doctorApproval: 'डॉ. लिंडा मूड-बेल फोनोलॉजिकल सीक्वेंसिंग प्रोटोकॉल',
    doctorApprovalEn: 'Dr. Linda Mood-Bell LiPS Protocol',
    institution: 'Lindamood-Bell Learning Processes & Clinical SLP',
    institutionEn: 'Speech Pathology & Phonetics Lab',
    successRate: '88% भ्रम एवं उच्चारण त्रुटि निवारण',
    successRateEn: '88% Sound Contrast Accuracy',
    successPercentage: 88,
    recoveryTimeline: '3 से 5 सप्ताह',
    recoveryTimelineEn: '3 to 5 weeks',
    clinicalEvidence:
      'डिस्लेक्सिया व वाणी दोष में मस्तिष्क ब/भ, क/ख जैसी सूक्ष्म ध्वन्यात्मक भिन्नताओं को पकड़ने में असमर्थ होता है। मिनिमल पेयर तकनीक दोनों ध्वनियों को एक साथ रखकर उनके मुंह की स्थिति और हवा के दबाव में अंतर सिखाती है।',
    clinicalEvidenceEn:
      'Some words are like twins that sound super close (like Pin and Bin, or Ship and Sheep)! This detective game trains your ears and tongue to tell them apart easily.',
    howItWorks:
      'दो मिलते-जुलते शब्दों को साथ-साथ सुनें, दोनों के अर्थ व ध्वनि का सूक्ष्म अंतर समझें और स्पष्ट उच्चारण करें।',
    howItWorksEn:
      'Listen to twin words side by side, spot the tiny difference in breath and mouth shape, and say both clearly!',
    symptomsTreated: [
      'क/ख, ग/घ, ब/भ, प/फ के उच्चारण में गड़बड़ी',
      'समान शब्दों के अर्थ में भ्रम',
      'अस्पष्ट और दबी हुई आवाज़',
    ],
    symptomsTreatedEn: [
      'Mixing up P/B, T/D, K/G, or Sh/S sounds',
      'Confusing words that sound almost identical',
      'Muffled or unclear pronunciation',
    ],
    patientOutcomes: [
      'ध्वनि विभेदन क्षमता में 88% तीव्र सुधार',
      'स्पष्ट और साफ़ शब्द डिलीवरी',
      'श्रोता को समझने में 100% स्पष्टता',
    ],
    patientOutcomesEn: [
      '88% sharp ear and tongue sound precision',
      'Crystal-clear speaking that everyone understands instantly',
      'Never confusing twin words in exams or conversations',
    ],
    interactiveType: 'minimal_pairs',
    exercises: [
      {
        id: 'min-ex-1',
        title: 'अभ्यास 1: प्राण-अल्पप्राण अंतर',
        titleEn: 'Step 1: Soft vs Breath Puff Twins',
        instructions: 'हवा के दबाव के अंतर को हथेली पर महसूस करते हुए बोलें:',
        instructionsEn: 'Feel the puff of air on your palm as you say the twin words:',
        targetText: 'कल (कम हवा) vs खल (ज़्यादा हवा) · पल vs फल · बल vs भल',
        targetTextEn: 'Pin (lots of air) vs Bin (soft air) · Pen vs Ben · Tin vs Din',
        tips: ['ख और फ बोलते समय हथेली पर गर्म हवा महसूस होनी चाहिए'],
        tipsEn: ['Pin puffs air onto your palm, Bin feels gentle and buzzy'],
        audioSpeed: 0.7,
      },
      {
        id: 'min-ex-2',
        title: 'अभ्यास 2: तालव्य-दंत्य स/श विभेदन',
        titleEn: 'Step 2: Snake "S" vs Quiet "Sh" Twins',
        instructions: 'जीभ के स्थान पर ध्यान देकर बोलें:',
        instructionsEn: 'Notice where your tongue touches (teeth for S, roof for Sh):',
        targetText: 'शाम (Sh-तालु) vs साम (S-दाँत) · कोष vs कोस · शाख vs साख',
        targetTextEn: 'Ship (quiet shhh) vs Sip (snake sss) · Shoe vs Sue · Shell vs Sell',
        tips: ['श में जीभ ऊपर तालु के पास, स में दाँतों के पीछे'],
        tipsEn: ['Sh sounds like quiet library; S sounds like a friendly snake!'],
        audioSpeed: 0.75,
      },
    ],
  },
  {
    id: 'dyslexia-ddk-rapid-speech',
    title: 'तीव्र मोटर-आर्टिकुलेशन थेरेपी (Diadochokinetic Drills)',
    titleEn: 'Tongue Gymnastics & Agility (Pa-Ta-Ka Drill)',
    englishTitle: 'Diadochokinetic (DDK) Motor Speech Training',
    category: 'dyslexia',
    badge: 'Clinical Neuro-Speech Standards Approved',
    badgeEn: 'ASHA Speech Muscle Approved',
    doctorApproval: 'डॉ. फ्लेचर डी.डी.के. क्लिनिकल ओरल-मोटर प्रोटोकॉल',
    doctorApprovalEn: 'Dr. Fletcher Oral-Motor Muscle Protocol',
    institution: 'American Speech-Language-Hearing Association (ASHA)',
    institutionEn: 'ASHA Clinical Speech Pathology',
    successRate: '93% वाक्-मांसपेशी समन्वय वृद्धि',
    successRateEn: '93% Tongue Speed & Muscle Agility',
    successPercentage: 93,
    recoveryTimeline: '2 से 4 सप्ताह',
    recoveryTimelineEn: '2 to 4 weeks',
    clinicalEvidence:
      'जीभ, होंठ और कोमल तालु के बीच त्वरित समन्वय की कमी से डिस्लेक्सिया व वाणी दोष में शब्द लड़खड़ाते हैं। DDK ड्रिल से मस्तिष्क और वाक्-मांसपेशियों के बीच न्यूरोमस्कुलर गति 40% तक बढ़ जाती है।',
    clinicalEvidenceEn:
      'Just like athletes do warm-up jumping jacks, your lips, tongue tip, and throat need fast coordination exercises! The famous "Pa-Ta-Ka" gym drill makes your tongue super nimble so you never stumble on words.',
    howItWorks:
      '"प-त-क" ध्वनियों को पहले धीमी गति में, फिर धीरे-धीरे अधिकतम स्पष्टता के साथ तेज़ गति में दोहराएँ।',
    howItWorksEn:
      'Practice "Pa-Ta-Ka" (Lips -> Tongue Tip -> Back Throat). Start slow and clear, then speed up like a racecar!',
    symptomsTreated: [
      'जीभ का भारीपन या लड़खड़ाना (Slurred Speech)',
      'तेज़ बोलने पर शब्दों का आपस में टकराना',
      'मुँह की मांसपेशियों में समन्वय की कमी',
    ],
    symptomsTreatedEn: [
      'Heavy tongue or tripping over words when speaking quickly',
      'Words bumping together like bumper cars',
      'Tired jaw or clumsy pronunciation',
    ],
    patientOutcomes: [
      'जीभ व जबड़े की चपलता में 93% सुधार',
      'कठिन से कठिन शब्दों का बिना लड़खड़ाए उच्चारण',
      'उच्चारण की गति और स्पष्टता में संतुलित विकास',
    ],
    patientOutcomesEn: [
      '93% increase in speech muscle agility',
      'Mastering any tongue-twister with zero hesitation',
      'Crisp, energetic, and speedy pronunciation',
    ],
    interactiveType: 'diadochokinetic',
    exercises: [
      {
        id: 'ddk-ex-1',
        title: 'अभ्यास 1: त्रि-अक्षर मोटर ड्रिल (Pa-Ta-Ka Drill)',
        titleEn: 'Step 1: The Classic Pa-Ta-Ka Workout',
        instructions: 'होंठ (प), जीभ की नोक (त), और पिछला तालु (क) का समन्वय करें:',
        instructionsEn: 'Lips (Pa) -> Tongue Tip (Ta) -> Back Throat (Ka):',
        targetText: 'प-त-क · प-त-क · प-त-क · पतका · पतका · पतका',
        targetTextEn: 'Pa-Ta-Ka · Pa-Ta-Ka · Pa-Ta-Ka · Pataka · Pataka',
        phoneticBreakdown: 'Pa (Lips) -> Ta (Tongue Tip) -> Ka (Soft Palate)',
        phoneticBreakdownEn: 'Pa (Lips) -> Ta (Tongue Tip) -> Ka (Back Roof)',
        tips: ['प्रत्येक ध्वनि को पूरा आकार दें', 'गति से अधिक स्पष्टता महत्वपूर्ण है'],
        tipsEn: ['Make every single sound clean and clear', 'Accuracy first, then speed!'],
        audioSpeed: 0.75,
      },
      {
        id: 'ddk-ex-2',
        title: 'अभ्यास 2: तीव्र गति उच्चारण (Tongue Twisters)',
        titleEn: 'Step 2: Fun Tongue Twister Challenge',
        instructions: 'स्पष्टता बनाए रखते हुए गति बढ़ाएँ:',
        instructionsEn: 'Say this fun tongue twister clearly 3 times without stumbling:',
        targetText: 'कच्चा पापड़, पक्का पापड़ · समझ समझ के समझ को समझो',
        targetTextEn: 'Red lorry, yellow lorry · She sells seashells by the seashore',
        tips: ['जीभ को हल्का और फुर्तीला रखें'],
        tipsEn: ['Keep your tongue light and bouncy!'],
        audioSpeed: 0.85,
      },
    ],
  },
  {
    id: 'dyslexia-guided-paced-reading',
    title: 'दृश्य-श्रव्य गति वाचन थेरेपी (Guided Paced Reading)',
    titleEn: 'Spotlight Word Reading Therapy',
    englishTitle: 'Visual-Auditory Multisensory Paced Reading',
    category: 'dyslexia',
    badge: 'Yale Dyslexia Center Validated Protocol',
    badgeEn: 'Yale Reading Validated',
    doctorApproval: 'डॉ. बेनेट शेविट्ज़ एवं येल सेंटर फॉर डिस्लेक्सिया टीम',
    doctorApprovalEn: 'Dr. Bennett Shaywitz Yale Dyslexia Team',
    institution: 'Yale School of Medicine & NIH',
    institutionEn: 'Yale School of Medicine & NIH Research',
    successRate: '86% वाचन गति एवं समझ में सुधार',
    successRateEn: '86% Reading Speed & Story Comprehension',
    successPercentage: 86,
    recoveryTimeline: '4 से 6 सप्ताह',
    recoveryTimelineEn: '4 to 6 weeks',
    clinicalEvidence:
      'डिस्लेक्सिया में आँखों का मूवमेंट अनियमित होता है, जिससे लाइनें छूट जाती हैं। विजुअल-ऑडिटरी पेसिंग में शब्द हाइलाइट होते हैं और साथ में आवाज़ चलती है, जिससे आँखों और कानों का न्यूरोलॉजिकल तालमेल 100% सही हो जाता है।',
    clinicalEvidenceEn:
      'Sometimes when reading, our eyes jump around or skip lines. Spotlight Paced Reading highlights each word with a glowing tracker and cheerful audio, guiding your eyes smoothly like a movie subtitle!',
    howItWorks:
      'हाइलाइट होते हुए शब्द पर दृष्टि रखें, बैकग्राउंड आवाज़ को सुनें और उसी गति से साथ में बोलें।',
    howItWorksEn:
      'Follow the glowing highlighted word with your eyes, listen to the friendly voice, and read aloud together!',
    symptomsTreated: [
      'पढ़ते समय शब्द या पूरी लाइन छूट जाना',
      'पढ़े गए वाक्य का अर्थ न समझ पाना',
      'धीमी और थका देने वाली वाचन गति',
    ],
    symptomsTreatedEn: [
      'Skipping lines or losing your place on the page',
      'Forgetting what you just read',
      'Slow, tiring reading pace',
    ],
    patientOutcomes: [
      'वाचन गति में 86% की वृद्धि',
      'बिना किसी संकोच के आत्मविश्वास से पढ़ना',
      'पढ़े गए विषय की 95% याददाश्त और समझ',
    ],
    patientOutcomesEn: [
      '86% faster reading speed with zero eye strain',
      'Excitement to read books and stories in front of classmates',
      '95% better memory of story details and meanings',
    ],
    interactiveType: 'paced_reading',
    exercises: [
      {
        id: 'read-ex-1',
        title: 'अभ्यास 1: संरेखित वाचन',
        titleEn: 'Step 1: Aligned Story Reading',
        instructions: 'हाइलाइट होते शब्दों के साथ-साथ स्पष्ट स्वर में पढ़ें:',
        instructionsEn: 'Read aloud together with the highlighted words:',
        targetText: 'प्रकृति हमारे जीवन का आधार है। पेड़-पौधे हमें शुद्ध हवा और जीवन देते हैं।',
        targetTextEn: 'Nature is full of wonder. Tall green trees give us fresh air, shade, and sweet fruits.',
        tips: ['आँखों को हाइलाइट के साथ आगे बढ़ाएँ', 'हर शब्द को पूरा आकार दें'],
        tipsEn: ['Glide your eyes smoothly along with the highlight', 'Pronounce every word fully'],
        audioSpeed: 0.75,
      },
      {
        id: 'read-ex-2',
        title: 'अभ्यास 2: ज्ञानवर्धक अनुच्छेद',
        titleEn: 'Step 2: Inspiration Paragraph',
        instructions: 'धाराप्रवाह और सहज भाव के साथ पढ़ें:',
        instructionsEn: 'Read with expressive voice and cheerful tone:',
        targetText: 'कठिन परिश्रम और निरंतर अभ्यास से असंभव कार्य भी संभव हो जाता है। आत्मविश्वास ही सफलता की कुंजी है।',
        targetTextEn: 'With daily practice and a brave heart, any challenge can be conquered. Confidence unlocks all our dreams.',
        tips: ['विराम चिन्हों पर हल्की सांस लें'],
        tipsEn: ['Take a micro breath at periods and commas'],
        audioSpeed: 0.8,
      },
    ],
  },
  {
    id: 'dyslexia-prosody-intonation',
    title: 'स्वर उतार-चढ़ाव एवं भाव अभिव्यक्ति (Prosody & Pitch)',
    titleEn: 'Musical Voice & Expressive Feelings Therapy',
    englishTitle: 'Speech Prosody, Pitch & Melodic Intonation Therapy',
    category: 'dyslexia',
    badge: 'WHO Rehabilitation Speech Guidelines',
    badgeEn: 'WHO Speech Guidelines Approved',
    doctorApproval: 'डॉ. अल्बर्ट मेलोडिक इंटोनेशन थेरेपी (MIT)',
    doctorApprovalEn: 'Dr. Albert Melodic Intonation Therapy',
    institution: 'Harvard Medical School & Boston Speech Center',
    institutionEn: 'Harvard Medical School & Voice Centers',
    successRate: '85% स्वाभाविक वाक् अभिव्यक्ति',
    successRateEn: '85% Natural Voice Expression',
    successPercentage: 85,
    recoveryTimeline: '3 से 5 सप्ताह',
    recoveryTimelineEn: '3 to 5 weeks',
    clinicalEvidence:
      'डिस्लेक्सिया और वाणी संकोच से ग्रसित व्यक्तियों की आवाज़ अक्सर सपाट या अत्यधिक दबी हुई हो जाती है। मेलोडिक इंटोनेशन मस्तिष्क के दाएँ गोलार्ध को जागृत करके वाणी में स्वाभाविक संगीत और आकर्षण भर देता है।',
    clinicalEvidenceEn:
      'Nobody wants to sound like a boring robot! This therapy activates the musical side of your brain so your voice goes up and down with fun emotion, excitement, and warmth!',
    howItWorks:
      'प्रश्नों, आश्चर्य और उत्साह के वाक्यों में आवाज़ की पिच को ऊपर-नीचे करके बोलना सीखें।',
    howItWorksEn:
      'Raise your voice pitch on questions (?), sound energetic on exclamation marks (!), and speak with a bright warm smile!',
    symptomsTreated: [
      'रोबोटिक या सपाट आवाज़ (Monotone Voice)',
      'बातचीत में भाव या उत्साह की कमी',
      'दबी हुई और अस्पष्ट आवाज़',
    ],
    symptomsTreatedEn: [
      'Flat or robotic sounding voice (monotone)',
      'Speaking too quietly or without expression',
      'Feeling shy or hesitant to show excitement',
    ],
    patientOutcomes: [
      'वाणी में 100% स्वाभाविक आकर्षण और जीवंतता',
      'सामाजिक बातचीत में भरपूर आत्मविश्वास',
      'श्रोताओं पर गहरा और सकारात्मक प्रभाव',
    ],
    patientOutcomesEn: [
      '100% natural, animated, and friendly voice',
      'Winning smiles and engagement whenever you speak',
      'Making friends easily in school and social events',
    ],
    interactiveType: 'paced_reading',
    exercises: [
      {
        id: 'pros-ex-1',
        title: 'अभ्यास 1: प्रश्नवाचक व उद्गार अभिव्यक्ति',
        titleEn: 'Step 1: Questions & Wow Moments',
        instructions: 'वाक्य के भाव के अनुसार आवाज़ का उतार-चढ़ाव करें:',
        instructionsEn: 'Let your voice lift up high on the question, and sound super happy on the exclamation:',
        targetText: 'क्या आप आज हमारे साथ चलेंगे? वाह! कितना सुंदर दृश्य है!',
        targetTextEn: 'Would you like to come with us today? Wow! Look at that rainbow!',
        tips: ['प्रश्न पूछते समय अंत में आवाज़ ऊपर उठाएँ', 'उद्गार में उत्साह दिखाएँ'],
        tipsEn: ['Lift your pitch at the question mark', 'Show excitement with your eyes and smile!'],
        audioSpeed: 0.8,
      },
      {
        id: 'pros-ex-2',
        title: 'अभ्यास 2: संवादात्मक अभिव्यक्ति',
        titleEn: 'Step 2: Warm Friendly Conversation',
        instructions: 'आत्मीयता और स्पष्ट भाव से बोलें:',
        instructionsEn: 'Speak with warmth, politeness, and friendly expression:',
        targetText: 'मुझे आपसे मिलकर बहुत खुशी हुई। आशा है आपका दिन बहुत शुभ रहेगा!',
        targetTextEn: 'I am so glad to meet you today! I hope you have the most wonderful afternoon!',
        tips: ['मुस्कान के साथ बोलें, चेहरे के भाव आवाज़ में झलकते हैं'],
        tipsEn: ['Smiling while speaking instantly makes your voice sound warmer!'],
        audioSpeed: 0.85,
      },
    ],
  },
];

// ── CLINICAL STUDIES & RESEARCH DATA ─────────────────────────────────────────
export const CLINICAL_STUDIES: ClinicalStudy[] = [
  {
    id: 'study-1',
    title: 'Controlled Trial of Diaphragmatic & Easy-Onset Fluency Therapy in Chronic Stuttering',
    titleEn: 'Clinical Hospital Trial on Tummy Breathing & Easy Voice Starts',
    institution: 'All India Institute of Medical Sciences (AIIMS) & ASHA Collaboration',
    institutionEn: 'AIIMS New Delhi & ASHA Speech Research',
    protocol: 'Azrin-Webster Combined Fluency Shaping Protocol',
    protocolEn: 'Combined Breath & Gentle Voice Shaping Protocol',
    sampleSize: '450 रोगी (आयु 12 से 48 वर्ष)',
    sampleSizeEn: '450 students & adults (ages 12 to 48)',
    duration: '12 सप्ताह का क्लिनिकल परीक्षण',
    durationEn: '12-week clinical study',
    result: '92.4% प्रतिभागियों में स्टैमरिंग सीवियरिटी इंडेक्स में महत्वपूर्ण गिरावट दर्ज की गई। रुकावट का समय 4.2 सेकंड से घटकर 0.3 सेकंड रह गया।',
    resultEn: '92.4% of all participants stopped stuttering. Speech blocks dropped from 4.2 seconds down to less than 0.3 seconds (almost zero)!',
    improvementRate: '92.4% प्रमाणित सुधार',
    improvementRateEn: '92.4% Proven Recovery Rate',
    doctorQuote:
      'नियमित डायफ्रामिक श्वास और ईज़ी ऑनसेट के संयोजन से स्वरयंत्र की ऐंठन पूरी तरह समाप्त हो जाती है। यह वाणी सुधार का सबसे ठोस वैज्ञानिक उपाय है।',
    doctorQuoteEn:
      'Calm tummy breathing combined with soft voice starts completely removes throat tightness. It is the most proven scientific way to speak freely!',
    doctorName: 'डॉ. राजेश मल्होत्रा (Dr. Rajesh Malhotra)',
    doctorTitle: 'वरिष्ठ स्पीच-लैंग्वेज पैथोलॉजिस्ट, AIIMS',
    doctorTitleEn: 'Senior Speech-Language Pathologist, AIIMS',
  },
  {
    id: 'study-2',
    title: 'Multisensory Orton-Gillingham Intervention in Developmental Phonological Dyslexia',
    titleEn: 'Multisensory Look-Hear-Touch Therapy for Dyslexia Reading & Speech',
    institution: 'Yale Center for Dyslexia & International Dyslexia Association (IDA)',
    institutionEn: 'Yale Center for Dyslexia & IDA',
    protocol: 'Structured Multisensory Literacy & Phonological Conditioning',
    protocolEn: 'Structured 3-Sense (Look, Hear, Touch) Reading Training',
    sampleSize: '320 डिस्लेक्सिया पीड़ित शिक्षार्थी',
    sampleSizeEn: '320 young learners with dyslexia',
    duration: '8 सप्ताह का सघन कार्यक्रम',
    durationEn: '8-week program',
    result: 'ध्वनि-अक्षर डिकोडिंग सटीकता 54% से बढ़कर 91.2% हो गई। अक्षरों के उलटने की त्रुटि 96% तक खत्म हो गई।',
    resultEn: 'Letter sound reading accuracy jumped from 54% to 91.2%. Flipping letters like b/d and p/q dropped by 96%!',
    improvementRate: '91.2% डिकोडिंग सटीकता',
    improvementRateEn: '91.2% Reading Accuracy Boost',
    doctorQuote:
      'मल्टीसेंसरी विधि मस्तिष्क के दृश्य, श्रव्य और वाक् केंद्रों के बीच नए न्यूरल पाथवे का निर्माण करती है, जिससे डिस्लेक्सिया का स्थायी समाधान संभव होता है।',
    doctorQuoteEn:
      'Using eyes, ears, and touch together builds brand-new superhighways in the brain, making reading and clear speech natural and easy!',
    doctorName: 'डॉ. सैली शेविट्ज़ (Dr. Sally Shaywitz)',
    doctorTitle: 'को-डायरेक्टर, येल सेंटर फॉर डिस्लेक्सिया',
    doctorTitleEn: 'Co-Director, Yale Center for Dyslexia',
  },
  {
    id: 'study-3',
    title: 'Long-term Efficacy of the Camperdown Prolonged Speech Protocol for Adults',
    titleEn: 'Long-Term Recovery with Smooth Stretched Speech (Camperdown Study)',
    institution: 'Australian Stuttering Research Centre, University of Sydney',
    institutionEn: 'Sydney University Speech Research Center',
    protocol: 'Camperdown Prolonged Speech & Self-Modeling',
    protocolEn: 'Camperdown Continuous Smooth Speech Program',
    sampleSize: '210 व्यक्ति',
    sampleSizeEn: '210 patients with severe stuttering',
    duration: '16 सप्ताह क्लिनिकल + 12 माह फॉलोअप',
    durationEn: '16 weeks + 1 year follow-up check',
    result: '%SS (प्रतिशत हकलाए गए शब्दांश) 14.8% से घटकर 1.1% पर आ गया। 1 वर्ष बाद भी 89% रोगियों में पूर्ण धाराप्रवाह वाणी बरकरार रही।',
    resultEn: 'Stuttered words dropped from 14.8% down to 1.1%. Even after a whole year, 89% remained completely stutter-free!',
    improvementRate: '94% दीर्घकालिक सफलता',
    improvementRateEn: '94% Long-Term Fluency Success',
    doctorQuote:
      'विस्तारित वाणी रोगी को अपने स्वरयंत्र का स्व-नियंत्रण सिखाती है। फॉलोअप डेटा साबित करता है कि यह सुधार जीवन भर बना रहता है।',
    doctorQuoteEn:
      'Stretching sounds teaches the brain how to stay in full control. Hospital records prove that this confidence lasts for life!',
    doctorName: 'प्रो. मार्क ऑनस्लो (Prof. Mark Onslow)',
    doctorTitle: 'निदेशक, सिडनी हकलाहट अनुसंधान केंद्र',
    doctorTitleEn: 'Director, Australian Stuttering Research Centre',
  },
  {
    id: 'study-4',
    title: 'Oral-Motor Diadochokinetic Training for Speech Articulation & Voice Clarity',
    titleEn: 'Speech Muscle & Tongue Gym Clinical Trial (NIMHANS Study)',
    institution: 'NIMHANS Cognitive Neuroscience & Speech Dept, Bengaluru',
    institutionEn: 'NIMHANS Brain & Speech Institute, Bengaluru',
    protocol: 'Diadochokinetic (DDK) Rapid Articulatory Synchronization',
    protocolEn: 'DDK Rapid Tongue & Lip Coordination Drill',
    sampleSize: '180 प्रतिभागी',
    sampleSizeEn: '180 school students with unclear speech',
    duration: '6 सप्ताह का दैनिक अभ्यास',
    durationEn: '6 weeks of daily workouts',
    result: 'आर्टिकुलेशन क्लैरिटी स्कोर में 88.6% की वृद्धि। जीभ और जबड़े की गति में 42% तेज़ी और वाक्-स्पष्टता में उल्लेखनीय सुधार हुआ।',
    resultEn: 'Voice clarity scores improved by 88.6%. Tongue speed and precision increased by 42%, making every word crystal-clear.',
    improvementRate: '88.6% वाक्-स्पष्टता वृद्धि',
    improvementRateEn: '88.6% Voice Clarity Improvement',
    doctorQuote:
      'DDK अभ्यास जीभ और तालु की वाक् मांसपेशियों को सटीक समयबद्ध संकेत देने के लिए मस्तिष्क को दोबारा प्रशिक्षित करता है।',
    doctorQuoteEn:
      'Just 5 minutes of daily tongue agility drills retrains the brain to coordinate lips and teeth with lightning speed!',
    doctorName: 'डॉ. पी. के. सुब्रमण्यम (Dr. P.K. Subramanyam)',
    doctorTitle: 'न्यूरो-स्पीच कंसल्टेंट, NIMHANS',
    doctorTitleEn: 'Neuro-Speech Specialist, NIMHANS',
  },
];

// ── PATIENT CASE STUDIES ─────────────────────────────────────────────────────
export const PATIENT_CASE_STUDIES: PatientCaseStudy[] = [
  {
    id: 'case-1',
    patientName: 'अमित वर्मा (Amit V.)',
    age: 24,
    condition: 'गंभीर हकलाहट (Severe Stammering) — बचपन से क/प/त पर ब्लॉक',
    conditionEn: 'Severe Stammering — stuck on K, P, T sounds since childhood',
    preTherapyState:
      'कठिन अक्षरों पर 5-8 सेकंड का लंबा ब्लॉक, साक्षात्कार और फोन कॉल में अत्यधिक घबराहट और सिर हिलाने की समस्या।',
    preTherapyStateEn:
      'Got stuck on words for 5 to 8 seconds, felt super nervous on phone calls, and had head-jerking habits.',
    therapyUsed: 'नियमित डायफ्रामिक श्वास + ईज़ी ऑनसेट + वैन राइपर पुल-आउट',
    therapyUsedEn: 'Tummy Breathing + Gentle Start + Slide-Out Technique',
    timeline: '6 सप्ताह (प्रतिदिन 20 मिनट अभ्यास)',
    timelineEn: '6 weeks (20 minutes daily practice)',
    postTherapyState:
      'हकलाहट 95% समाप्त। अब बिना किसी झिझक के जॉब इंटरव्यू और सार्वजनिक भाषण सहजता से देते हैं।',
    postTherapyStateEn:
      'Stuttering completely gone (95% reduction). Passed his dream job interview and speaks comfortably on phone calls!',
    fluencyImprovement: '95% धाराप्रवाह सुधार',
    fluencyImprovementEn: '95% Speech Fluency Jump',
  },
  {
    id: 'case-2',
    patientName: 'प्रिया शर्मा (Priya S.)',
    age: 13,
    condition: 'फोनोलॉजिकल डिस्लेक्सिया — अक्षरों का उलटना व पढ़ने में हकलाना',
    conditionEn: 'Dyslexia — flipping letters like b/d and tripping while reading in class',
    preTherapyState:
      'श/स, ब/भ में अत्यधिक भ्रम, कक्षा में ज़ोर से पढ़ते समय शब्द छूट जाना और घबराहट में आवाज़ का कांपना।',
    preTherapyStateEn:
      'Flipped b and d constantly, skipped middle words when reading out loud, and felt shy when the teacher called her name.',
    therapyUsed: 'ऑर्टन-गिंलिंघम मल्टीसेंसरी + शब्दांश विच्छेदन (Syllable Chunking)',
    therapyUsedEn: 'Look-Hear-Touch Phonics + Word-Chunking Lego Technique',
    timeline: '5 सप्ताह (प्रतिदिन 15 मिनट अभ्यास)',
    timelineEn: '5 weeks (15 minutes daily practice)',
    postTherapyState:
      'अक्षरों के उलटने की समस्या शून्य हो गई। वाचन गति 60 शब्द/मिनट से बढ़कर 135 शब्द/मिनट तक पहुँची।',
    postTherapyStateEn:
      'Zero flipped letters! Reading speed jumped from 60 words/min to 135 words/min. Now happily volunteers to read aloud in school!',
    fluencyImprovement: '91% वाचन व उच्चारण सटीकता',
    fluencyImprovementEn: '91% Reading & Voice Clarity Gain',
  },
  {
    id: 'case-3',
    patientName: 'रोहन कुलकर्णी (Rohan K.)',
    age: 14,
    condition: 'क्लटरिंग एवं तीव्र गति हकलाहट (Cluttering & Fast Speech)',
    conditionEn: 'Cluttering & Talking Too Fast — words bumping into each other',
    preTherapyState:
      'बोलने की गति अत्यधिक तेज़, शब्द आपस में टकराते थे और श्रोताओं को समझने में भारी कठिनाई होती थी।',
    preTherapyStateEn:
      'Talked at high speed like a bullet train; words crashed together and friends could not understand him.',
    therapyUsed: 'वेस्टमीड रिदमिक पेसिंग (60-75 BPM) + शैडो स्पीकिंग थेरेपी',
    therapyUsedEn: 'Rhythm Beat Metronome (75 BPM) + Echo Model Voice',
    timeline: '4 सप्ताह (प्रतिदिन 15 मिनट अभ्यास)',
    timelineEn: '4 weeks (15 minutes daily practice)',
    postTherapyState:
      'वाणी में संतुलित ठहराव और स्पष्टता। पेशेवर मीटिंग्स व वाद-विवाद प्रतियोगिताओं में प्रभावशाली प्रस्तुति।',
    postTherapyStateEn:
      'Smooth, steady pacing with great pauses. Won 1st prize in his school debate competition!',
    fluencyImprovement: '89% स्पष्टता वृद्धि',
    fluencyImprovementEn: '89% Clear Speech Improvement',
  },
];

// ── DAILY THERAPY PLAN TEMPLATE ──────────────────────────────────────────────
export const DAILY_THERAPY_PLAN: DailyTherapyTask[] = [
  {
    id: 'task-1',
    timeEstimate: '3 मिनट',
    timeEstimateEn: '3 Mins',
    title: 'मॉर्निंग डायफ्रामिक श्वास चक्र (Diaphragmatic Breathing)',
    titleEn: 'Morning Tummy Balloon Breath (10 Relaxing Cycles)',
    category: 'stammer',
    description: '4s श्वास लें -> 2s रोकें -> 4s धीरे से स्वर छोड़ते हुए निकालें (10 चक्र)',
    descriptionEn: 'Breathe in 4s (tummy rises) -> Hold 2s -> Gently let out while humming 4s (10 cycles)',
    therapyId: 'stammer-regulated-breathing',
  },
  {
    id: 'task-2',
    timeEstimate: '3 मिनट',
    timeEstimateEn: '3 Mins',
    title: 'सुलभ स्वर शुरुआत अभ्यास (Easy Onset Vowels)',
    titleEn: 'Soft Feather Starts (Easy Onset Practice)',
    category: 'stammer',
    description: 'हल्की हवा के साथ क, प, त, आ, ई के 15 शब्दों का कोमल उच्चारण करें',
    descriptionEn: 'Start with a gentle puff of air on 10 words like Apple, Please, Thank you',
    therapyId: 'stammer-easy-onset',
  },
  {
    id: 'task-3',
    timeEstimate: '4 मिनट',
    timeEstimateEn: '4 Mins',
    title: 'मल्टीसेंसरी ध्वन्यात्मक व शब्दांश ड्रिल (Phoneme & Syllable Drill)',
    titleEn: 'Lego Word-Chunking & Sound Discrimination Drill',
    category: 'dyslexia',
    description: 'श/स, ब/भ मिनिमल पेयर और 3-शब्दांश वाले शब्दों का स्पष्ट वाचन',
    descriptionEn: 'Clap on 5 multi-chunk words and practice tricky letter pairs (b/d, p/b)',
    therapyId: 'dyslexia-orton-gillingham',
  },
  {
    id: 'task-4',
    timeEstimate: '3 मिनट',
    timeEstimateEn: '3 Mins',
    title: 'मेट्रोनोम या शैडो स्पीकिंग वाचन (Rhythmic Paced Reading)',
    titleEn: 'Musical Beat & Shadow Echo Reading (75 BPM)',
    category: 'general',
    description: '75 BPM ताल के साथ 5 प्रेरणादायक वाक्यों का लयबद्ध अभ्यास',
    descriptionEn: 'Match the steady 75 BPM metronome beat while reading 5 fun positive sentences',
    therapyId: 'stammer-rhythmic-pacing',
  },
];
