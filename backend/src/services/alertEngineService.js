/**
 * Alert Engine & Multi-Lingual Public Advisory Service
 */

const MULTILINGUAL_SMS_TEMPLATES = [
  {
    id: 'sms-general-en',
    lang: 'English',
    label: 'Public Heat Emergency Advisory',
    recipient: 'General Public (Mobile Broadcast / WEA)',
    content: 'NDMA HEAT ALERT: Extreme heatwave warning in your district. Avoid outdoor activities between 11 AM–4:30 PM. Drink plenty of water and ORS. Call 108 for medical emergency, 1077 for shelter locations. — District Disaster Management Authority',
  },
  {
    id: 'sms-general-hi',
    lang: 'Hindi',
    label: 'सार्वजनिक लू चेतावनी (Hindi)',
    recipient: 'आम नागरिक / एसएमएस अलर्ट',
    content: 'लू चेतावनी (NDMA): आपके क्षेत्र में भीषण गर्मी व लू का रेड अलर्ट। दोपहर 11 से 4:30 बजे तक धूप में निकलने से बचें। लगातार पानी व ओआरएस (ORS) पिएं। आपातकाल में 108 या 1077 पर कॉल करें। — जिला आपदा प्रबंधन प्राधिकरण',
  },
  {
    id: 'sms-workers-en',
    lang: 'English',
    label: 'Outdoor Worker Safety Directive',
    recipient: 'Contractors, Construction Sites, Brick Kilns',
    content: 'HEAT SAFETY DIRECTIVE: All strenuous outdoor and rooftop construction work paused 11 AM - 4 PM. Mandatory cool water and shade breaks every 30 mins. For helpline call 104.',
  },
  {
    id: 'sms-workers-hi',
    lang: 'Hindi',
    label: 'श्रमिक सुरक्षा निर्देश (Hindi)',
    recipient: 'ठेकेदार, निर्माण श्रमिक, फैक्ट्री',
    content: 'कार्यस्थल निर्देश: भीषण गर्मी के कारण सुबह 11 से शाम 4 बजे तक खुले में भारी निर्माण कार्य से बचें। श्रमिकों हेतु छांव व ठंडे पेयजल का अनिवार्य प्रबंध करें। — हीटवेव सुरक्षा सेल',
  },
  {
    id: 'sms-hospital-en',
    lang: 'English',
    label: 'Hospital Preparedness Notice',
    recipient: 'All PHCs, CHCs, Private & Public Hospitals',
    content: 'HEALTH ALERT: Activate Heat-Stroke protocol immediately. Reserve dedicated cooling beds, stock IV fluids, ORS, and ice packs. Maintain heat monitoring logs.',
  },
];

function evaluateAlertForLocation(location, currentTemp, wbgt) {
  const isHills = location.lat > 30.5;
  const threshold = isHills ? 30 : (location.heatActionThresholds?.plainsMaxTemp || 40);

  if (wbgt >= 33 || currentTemp >= threshold + 5.5) {
    return {
      level: 'RED',
      severity: 'Extreme',
      title: `RED ALERT — Severe Heatwave Warning for ${location.name}`,
      message: `Extreme heat conditions reaching ${currentTemp}°C with dangerous WBGT ${wbgt}°C. Severe threat of heat stroke for general population.`,
      category: 'Extreme Heatwave',
    };
  }
  if (wbgt >= 30 || currentTemp >= threshold + 3.5) {
    return {
      level: 'ORANGE',
      severity: 'Severe',
      title: `ORANGE ALERT — Heatwave Warning for ${location.name}`,
      message: `Severe heat stress conditions reaching ${currentTemp}°C. High health vulnerability for children, elderly, and outdoor labourers.`,
      category: 'Heatwave Warning',
    };
  }
  if (wbgt >= 27 || currentTemp >= threshold) {
    return {
      level: 'YELLOW',
      severity: 'Moderate',
      title: `YELLOW WATCH — Heat Alert for ${location.name}`,
      message: `Elevated thermal stress. Temperatures peaking near ${currentTemp}°C. Preventive hydration strongly advised.`,
      category: 'Heat Watch',
    };
  }
  return {
    level: 'GREEN',
    severity: 'Normal',
    title: `GREEN — Normal Weather for ${location.name}`,
    message: `Normal seasonal conditions. Temperature at ${currentTemp}°C is within acceptable range.`,
    category: 'Normal Conditions',
  };
}

module.exports = {
  MULTILINGUAL_SMS_TEMPLATES,
  evaluateAlertForLocation,
};
