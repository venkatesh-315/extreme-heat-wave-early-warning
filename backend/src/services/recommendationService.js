/**
 * NDMA Heat Action Plan (HAP) Recommendation Service
 */

function generateRecommendations(wbgt, mortalityRisk, population = 1500000, temp = 43) {
  const recs = [];
  const w = Number(wbgt) || 30;
  const t = Number(temp) || 42;
  const r = Number(mortalityRisk) || 40;
  const pop = Number(population) || 1500000;

  if (w >= 32 || t >= 44) {
    recs.push({
      priority: 'CRITICAL',
      category: 'Labour & Industry',
      title: 'Mandatory Suspension of Peak Outdoor Labour',
      action: 'Enforce strict halt on construction, agriculture and brick-kiln work between 11:00 AM and 4:30 PM. Mandate shaded rest sheds with electrolyte solution.',
      authority: 'District Magistrate & Labour Commissioner',
    });
    recs.push({
      priority: 'CRITICAL',
      category: 'Public Health & Hospitals',
      title: 'Activate Heat-Stroke Protocol in All ICUs',
      action: 'Pre-position cold IV normal saline, ice-bath submersion bags, and dantrolene. Ensure 24x7 power backup for mortuaries and critical wards.',
      authority: 'Chief Medical Officer (CMO)',
    });
    recs.push({
      priority: 'CRITICAL',
      category: 'Water & Civic Municipalities',
      title: 'Emergency Water Tanker & Pyaau Deployment',
      action: 'Double tanker supply trips to slums, urban heat islands, bus terminuses, and homeless clusters. Refill all public drinking water stations every 3 hours.',
      authority: 'Municipal Corporation / Jal Board',
    });
    recs.push({
      priority: 'CRITICAL',
      category: 'Schools & Vulnerable Groups',
      title: 'Reschedule / Close Educational Institutions',
      action: 'Mandate early morning school timings (close by 10:30 AM) or switch to virtual mode. Ban outdoor sports and open morning assemblies.',
      authority: 'Director of School Education',
    });
  } else if (w >= 28 || t >= 40) {
    recs.push({
      priority: 'HIGH',
      category: 'Public Health',
      title: 'Open Free Municipal Cooling Shelters',
      action: 'Open air-conditioned/cooled public halls, community libraries, and night shelters (Rain Basera) for public respite from 10 AM to 6 PM.',
      authority: 'Municipal Emergency Response',
    });
    recs.push({
      priority: 'HIGH',
      category: 'Workers Advisory',
      title: 'Mandate Work-Rest Cycles (45 min work / 15 min rest)',
      action: 'Employers must provide 1 liter cool drinking water per worker per hour and shaded rest zones.',
      authority: 'Occupational Health Board',
    });
    recs.push({
      priority: 'HIGH',
      category: 'Power Grid',
      title: 'Zero Load-Shedding Directive for Health Facilities',
      action: 'State Electricity Board priority hotline active. Backup diesel generators on standby for all district hospitals and cooling centres.',
      authority: 'Disaster Coordination Cell',
    });
  }

  if (r >= 60) {
    const estExcess = Math.round(pop * r * 0.000025);
    recs.push({
      priority: 'CRITICAL',
      category: 'Civil Defence & NDRF',
      title: `Catastrophic Heat Threat · Approx ${estExcess.toLocaleString()} Excess Vulnerable Exposure`,
      action: 'Deploy Civil Defence volunteers and Red Cross mobile medical vans in high-density informal colonies for active heat-stress screening.',
      authority: 'State Disaster Response Force (SDRF)',
    });
  }

  if (recs.length === 0) {
    recs.push({
      priority: 'LOW',
      category: 'General Public Advisory',
      title: 'Normal Heatwave Precautions',
      action: 'Stay hydrated, carry water bottles, avoid direct sunlight during peak hours (12 PM - 3 PM), wear loose cotton clothing.',
      authority: 'NDMA Public Health Advisory',
    });
  }

  return recs;
}

module.exports = {
  generateRecommendations,
};
