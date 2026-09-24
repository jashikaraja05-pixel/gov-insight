import { CivicIssue, PolicyScenario, FutureTrend, ImpactBeforeAfter } from '../types';

const STORAGE_KEY = 'govinsight_civic_issues_real_v4';

// Helper to remove any lingering old mock databases
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('govinsight_civic_issues');
    localStorage.removeItem('govinsight_civic_issues_v2');
  } catch {
    // ignore
  }
}

export const INITIAL_SEEDED_ISSUES: CivicIssue[] = [
  {
    id: 'GI-2026-000123',
    title: 'Hospital Access Road Disruption & Flooding',
    description: 'The primary 4-lane arterial access road leading to the District Government Hospital and trauma center has deep structural potholes (20cm) and active water logging. Emergency ambulances and blood bank supply vans are experiencing critical delays of 18-25 minutes.',
    originalLanguage: 'English',
    detectedLanguageCode: 'en',
    transcription: 'The main access road leading to the District Government Hospital has deep potholes and accumulated storm water. Emergency ambulances cannot pass safely.',
    aiSummary: 'Critical roadbed degradation and water submersion blocking emergency ambulance transit to the District Hospital.',
    aiVoiceResponseText: 'Your report has been received. Hospital access corridor obstruction logged with high priority and routed to the Highways Department.',
    category: 'Transportation & Healthcare Access',
    subcategory: 'Emergency Hospital Corridor',
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    resolutionPhotoUrl: 'https://images.unsplash.com/photo-1578961952402-f6f8e763137e?auto=format&fit=crop&w=800&q=80',
    photoAnalysis: {
      detectedObject: 'Severe Asphalt Cavity & Drainage Submersion',
      confidence: 94,
      severity: 'CRITICAL',
      details: 'Deep transverse surface fissure (>18cm) causing vehicular hazard and blocking safe ambulance passage.',
    },
    location: {
      lat: 13.0827,
      lng: 80.2707,
      address: 'Hospital Road, Central Medical Corridor, Chennai',
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      district: 'Chennai Central',
      isExactGps: true,
    },
    criticality: 'CRITICAL',
    criticalityReasons: [
      'Healthcare & Emergency hospital corridor transit directly obstructed',
      'Average emergency transit delay +22 minutes for trauma patients',
      'Photographic AI confirmation: 94% confidence asphalt degradation',
      'Merged 27 similar citizen reports across a 500m radius',
    ],
    priorityScore: 94,
    scoreBreakdown: {
      citizenDemand: 25,
      infrastructureGap: 24,
      populationImpact: 20,
      urgency: 15,
      vulnerability: 10,
    },
    isUnderRepresentedArea: false,
    duplicateCount: 27,
    hotspotName: 'Hospital Arterial Access Hotspot',
    recommendedDepartment: 'Highways & Municipal Roads Authority',
    assignedDepartment: 'Highways & Municipal Roads Authority',
    assignedOfficer: 'Er. R. Sundaram (Executive Engineer)',
    status: 'Action In Progress',
    evidenceTypes: ['voice', 'photo', 'gps'],
    timeline: [
      {
        status: 'Submitted',
        timestamp: '2026-09-21 08:30',
        actor: 'Citizen Voice via Mobile',
        note: 'Filed in Tamil with GPS & uploaded damage evidence.',
      },
      {
        status: 'AI Analyzed',
        timestamp: '2026-09-21 08:31',
        actor: 'GovInsight AI Engine',
        note: 'Classified CRITICAL (Score 94/100). Clustered with 26 other citizen reports into single Hotspot.',
      },
      {
        status: 'Sent to Authority',
        timestamp: '2026-09-21 08:35',
        actor: 'Automated Civic Router',
        note: 'Dispatched to Highways & Municipal Roads Authority.',
      },
      {
        status: 'Assigned',
        timestamp: '2026-09-21 10:15',
        actor: 'District Highway Division',
        note: 'Assigned to Er. R. Sundaram with Rapid Road Patch Unit #4.',
      },
      {
        status: 'Action In Progress',
        timestamp: '2026-09-22 09:00',
        actor: 'Highways Field Crew',
        note: 'Heavy asphalt milling and storm drainage clearing underway on site.',
      },
    ],
    affectedPopulationEstimate: 65000,
    createdAt: '2026-09-21T08:30:00Z',
    updatedAt: '2026-09-22T09:00:00Z',
  },
  {
    id: 'GI-2026-000098',
    title: 'Clean Water Pipeline Rupture & Contamination Threat',
    description: 'Underground potable water delivery main has ruptured at Sector 9 junction. Clean water is gushing into open storm drains while over 800 households have lost municipal water supply since morning.',
    originalLanguage: 'Portuguese',
    detectedLanguageCode: 'pt',
    transcription: 'A adutora de água potável no setor 9 rompeu e a água limpa está vazando para o esgoto.',
    aiSummary: 'Major pressurized potable water pipeline rupture causing localized supply outage to 800+ homes.',
    aiVoiceResponseText: 'Relato registrado. A Companhia de Saneamento já foi mobilizada para reparo emergencial.',
    category: 'Water & Sanitation Authority',
    subcategory: 'Potable Water Distribution',
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=800&q=80',
    resolutionPhotoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    photoAnalysis: {
      detectedObject: 'High-Pressure Water Main Fracture',
      confidence: 91,
      severity: 'CRITICAL',
      details: 'Potable water line fracture leaking ~1,200 L/min, risk of sinkhole collapse.',
    },
    location: {
      lat: -23.5505,
      lng: -46.6333,
      address: 'Rua das Flores, Zona Leste, São Paulo',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brazil',
      district: 'Zona Leste',
      isExactGps: true,
    },
    criticality: 'CRITICAL',
    criticalityReasons: [
      'Loss of safe potable drinking water for 800+ low-income families',
      'Structural ground destabilization adjacent to residential roadway',
      'High volume wastage (>1,200 L/hr)',
    ],
    priorityScore: 91,
    scoreBreakdown: {
      citizenDemand: 24,
      infrastructureGap: 23,
      populationImpact: 19,
      urgency: 15,
      vulnerability: 10,
    },
    isUnderRepresentedArea: true,
    underRepresentedReason: 'Under-represented peripheral district: historically low complaint reporting rate despite severe infrastructure deficit.',
    duplicateCount: 14,
    hotspotName: 'Zona Leste Potable Water Pipeline Cluster',
    recommendedDepartment: 'Companhia de Saneamento Básico (SABESP)',
    assignedDepartment: 'Companhia de Saneamento Básico (SABESP)',
    assignedOfficer: 'Eng. Marcelo Santos',
    status: 'Resolved',
    evidenceTypes: ['voice', 'photo', 'gps'],
    timeline: [
      {
        status: 'Submitted',
        timestamp: '2026-09-18 07:15',
        actor: 'Citizen Audio',
        note: 'Submitted with photo and GPS location.',
      },
      {
        status: 'AI Analyzed',
        timestamp: '2026-09-18 07:16',
        actor: 'GovInsight AI Engine',
        note: 'Under-Represented Community Flag activated (Demographic vulnerability high).',
      },
      {
        status: 'Assigned',
        timestamp: '2026-09-18 08:00',
        actor: 'SABESP Emergency Desk',
        note: 'Emergency pipe isolation crew dispatched.',
      },
      {
        status: 'Action In Progress',
        timestamp: '2026-09-18 10:30',
        actor: 'SABESP Field Crew',
        note: 'Excavation completed, replacement sleeve valve installed.',
      },
      {
        status: 'Resolved',
        timestamp: '2026-09-19 14:00',
        actor: 'SABESP Supervisor',
        note: 'Pressure restored, leak sealed, water quality test verified 100% compliant.',
      },
    ],
    citizenFeedback: {
      resolved: true,
      rating: 5,
      comment: 'Water supply returned fully by afternoon. Thank you for acting so quickly!',
      timestamp: '2026-09-19 16:30',
    },
    affectedPopulationEstimate: 32000,
    createdAt: '2026-09-18T07:15:00Z',
    updatedAt: '2026-09-19T14:00:00Z',
  },
  {
    id: 'GI-2026-000075',
    title: 'School Pedestrian Overpass Structural Damage',
    description: 'The pedestrian footbridge used daily by over 1,400 elementary school children to cross the heavy 6-lane express bypass has developed a visible concrete shear crack on the northern abutment.',
    originalLanguage: 'English',
    detectedLanguageCode: 'en',
    transcription: 'The pedestrian footbridge used by children to reach the school has deep structural cracks.',
    aiSummary: 'Structural damage and safety risk on primary school pedestrian overpass crossing high-speed corridor.',
    aiVoiceResponseText: 'Case GI-2026-000075 created. Inspection team from Public Works Department assigned immediately for safety audit.',
    category: 'Public Education Infrastructure',
    subcategory: 'School Safety & Pedestrian Access',
    photoUrl: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=800&q=80',
    location: {
      lat: -26.2041,
      lng: 28.0473,
      address: 'Soweto North Expressway Crossing, Johannesburg',
      city: 'Johannesburg',
      state: 'Gauteng',
      country: 'South Africa',
      district: 'Region D',
      isExactGps: true,
    },
    criticality: 'CRITICAL',
    criticalityReasons: [
      'Direct safety hazard to school children and pedestrian commuters',
      'Overpass spans a high-speed motorway with heavy commercial trucking',
      'Severe concrete spalling confirmed by visual inspection',
    ],
    priorityScore: 96,
    scoreBreakdown: {
      citizenDemand: 25,
      infrastructureGap: 25,
      populationImpact: 20,
      urgency: 14,
      vulnerability: 12,
    },
    isUnderRepresentedArea: true,
    underRepresentedReason: 'High demographic vulnerability index with limited alternative safe pedestrian crossing within 3.5 km.',
    duplicateCount: 19,
    hotspotName: 'Soweto School Crossing Safety Hotspot',
    recommendedDepartment: 'Johannesburg Roads Agency (JRA)',
    assignedDepartment: 'Johannesburg Roads Agency (JRA)',
    assignedOfficer: 'Thabo Mokoena (Structural Inspector)',
    status: 'Under Review',
    evidenceTypes: ['voice', 'photo', 'gps'],
    timeline: [
      {
        status: 'Submitted',
        timestamp: '2026-09-22 11:10',
        actor: 'Parent-Teacher Representative',
        note: 'Submitted via voice report with high-res photo.',
      },
      {
        status: 'AI Analyzed',
        timestamp: '2026-09-22 11:11',
        actor: 'GovInsight AI Engine',
        note: 'Classified CRITICAL (Score 96/100). High vulnerability multiplier applied.',
      },
      {
        status: 'Sent to Authority',
        timestamp: '2026-09-22 11:15',
        actor: 'Automated Civic Router',
        note: 'Immediate notification dispatched to JRA Structural Safety Division.',
      },
      {
        status: 'Under Review',
        timestamp: '2026-09-22 13:00',
        actor: 'JRA Inspection Team',
        note: 'On-site structural evaluation and temporary pedestrian barrier arrangement initiated.',
      },
    ],
    affectedPopulationEstimate: 18500,
    createdAt: '2026-09-22T11:10:00Z',
    updatedAt: '2026-09-22T13:00:00Z',
  },
  {
    id: 'GI-2026-000054',
    title: 'Unlit 800m Street Transit Corridor & Broken Luminaire Pole',
    description: 'An 800-meter transit corridor leading to the metro transit hub has been completely unlit for 3 weeks after an electrical storm knocked down luminaire poles. Female commuters and night-shift workers report significant safety anxiety.',
    originalLanguage: 'Hindi',
    detectedLanguageCode: 'hi',
    transcription: 'मेट्रो स्टेशन जाने वाली सड़क पर 800 मीटर तक स्ट्रीट लाइटें पूरी तरह बंद हैं। रात में चलना असुरक्षित है।',
    aiSummary: 'Prolonged public lighting failure along major commuter pathway creating public safety hazard.',
    aiVoiceResponseText: 'आपकी शिकायत दर्ज हो गई है। विद्युत एवं सार्वजनिक प्रकाश विभाग को मरम्मत के लिए भेज दिया गया है।',
    category: 'Energy & Public Lighting',
    subcategory: 'Transit Safety & Street Lighting',
    photoUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    location: {
      lat: 19.0760,
      lng: 72.8777,
      address: 'Station Road, Kurla West, Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      district: 'Mumbai Suburban',
      isExactGps: true,
    },
    criticality: 'HIGH',
    criticalityReasons: [
      'High pedestrian volume (12,000+ daily transit commuters)',
      'Public safety & vulnerability risks during nighttime hours',
      'Exposed electrical wiring detected at base of fallen pole',
    ],
    priorityScore: 82,
    scoreBreakdown: {
      citizenDemand: 22,
      infrastructureGap: 21,
      populationImpact: 17,
      urgency: 12,
      vulnerability: 10,
    },
    isUnderRepresentedArea: false,
    duplicateCount: 31,
    hotspotName: 'Kurla Transit Luminaire Hotspot',
    recommendedDepartment: 'Municipal Corporation & Public Lighting Directorate',
    assignedDepartment: 'Municipal Corporation & Public Lighting Directorate',
    assignedOfficer: 'P. V. Kulkarni',
    status: 'Assigned',
    evidenceTypes: ['text', 'photo', 'gps'],
    timeline: [
      {
        status: 'Submitted',
        timestamp: '2026-09-20 19:40',
        actor: 'Citizen Mobile App',
        note: 'Submitted in Hindi with photo.',
      },
      {
        status: 'AI Analyzed',
        timestamp: '2026-09-20 19:41',
        actor: 'GovInsight AI Engine',
        note: 'Aggregated with 30 previous complaints on this corridor.',
      },
      {
        status: 'Assigned',
        timestamp: '2026-09-21 11:00',
        actor: 'MCGM Electrical Wing',
        note: 'Contractor assigned for cable pull and 22 LED luminaire replacements.',
      },
    ],
    affectedPopulationEstimate: 24000,
    createdAt: '2026-09-20T19:40:00Z',
    updatedAt: '2026-09-21T11:00:00Z',
  },
  {
    id: 'GI-2026-000032',
    title: 'Illegal Solid Waste Dumping Near Community Health Post',
    description: 'An open vacant municipal plot adjacent to the primary health center has turned into an illegal garbage dumping ground with medical waste and rotting municipal refuse. Strong odor and stray animals prevent pregnant women from visiting the clinic.',
    originalLanguage: 'English',
    detectedLanguageCode: 'en',
    transcription: 'Large illegal trash dumping site adjacent to the local health clinic causing health hazard.',
    aiSummary: 'Open municipal refuse accumulation adjacent to healthcare center causing public health hazards.',
    category: 'Municipal Solid Waste & Environment',
    subcategory: 'Sanitation & Health Hazard Mitigation',
    photoUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    resolutionPhotoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    location: {
      lat: -1.2921,
      lng: 36.8219,
      address: 'Kibera Clinic Access Road, Nairobi',
      city: 'Nairobi',
      state: 'Nairobi County',
      country: 'Kenya',
      district: 'Langata Sub-County',
      isExactGps: true,
    },
    criticality: 'HIGH',
    criticalityReasons: [
      'Proximity to frontline healthcare facility (<30m)',
      'Vector-borne disease transmission hazard to infants and patients',
      'Unanimous community concern with 22 signed digital petitions',
    ],
    priorityScore: 86,
    scoreBreakdown: {
      citizenDemand: 23,
      infrastructureGap: 22,
      populationImpact: 18,
      urgency: 13,
      vulnerability: 10,
    },
    isUnderRepresentedArea: true,
    underRepresentedReason: 'Informal settlement perimeter: AI detected persistent under-reporting compared to measured environmental severity.',
    duplicateCount: 22,
    hotspotName: 'Kibera Health Post Sanitation Hotspot',
    recommendedDepartment: 'Nairobi City County Public Works & Waste Management',
    assignedDepartment: 'Nairobi City County Public Works & Waste Management',
    assignedOfficer: 'Faith Wanjiku',
    status: 'Resolved',
    evidenceTypes: ['voice', 'photo', 'gps'],
    timeline: [
      {
        status: 'Submitted',
        timestamp: '2026-09-15 09:20',
        actor: 'Community Health Worker',
        note: 'Reported with voice in Swahili & English.',
      },
      {
        status: 'AI Analyzed',
        timestamp: '2026-09-15 09:21',
        actor: 'GovInsight AI Engine',
        note: 'Priority Score 86/100. High vulnerability flag.',
      },
      {
        status: 'Assigned',
        timestamp: '2026-09-15 14:00',
        actor: 'Nairobi County Environment Desk',
        note: 'Compact loaders and 3 waste disposal trucks dispatched.',
      },
      {
        status: 'Resolved',
        timestamp: '2026-09-16 17:30',
        actor: 'Public Health Officer',
        note: 'Site cleared completely, bio-sanitized, and perimeter fence installed with warning signage.',
      },
    ],
    citizenFeedback: {
      resolved: true,
      rating: 5,
      comment: 'Clinic is clean and accessible again! Amazing quick response.',
      timestamp: '2026-09-17 08:45',
    },
    affectedPopulationEstimate: 19800,
    createdAt: '2026-09-15T09:20:00Z',
    updatedAt: '2026-09-16T17:30:00Z',
  },
];

export const POLICY_SCENARIOS: PolicyScenario[] = [
  {
    id: 'scenario-a',
    title: 'Scenario A: Road & Transit Connectivity Priority',
    focus: 'Aggressive arterial road rehabilitation, pothole elimination, and emergency corridor widening.',
    budgetAllocated: '$12,000,000 / ₹100 Crore',
    beneficiaries: 340000,
    gapReductionPercent: 68,
    accessibilityImprovement: 74,
    priorityRegionsAddressed: 14,
    estimatedImpactScore: 78,
    aiRationale: 'Strong immediate economic benefit and commute reduction, but addresses fewer vulnerable healthcare and school safety bottlenecks.',
    recommended: false,
  },
  {
    id: 'scenario-b',
    title: 'Scenario B: Healthcare & Potable Water Defense',
    focus: 'Repairing critical drinking water supply lines, sanitizing clinics, and emergency hospital access routes.',
    budgetAllocated: '$12,000,000 / ₹100 Crore',
    beneficiaries: 290000,
    gapReductionPercent: 72,
    accessibilityImprovement: 81,
    priorityRegionsAddressed: 12,
    estimatedImpactScore: 82,
    aiRationale: 'Extremely high vulnerability reduction for children, elderly, and maternal health, but limited citywide traffic congestion relief.',
    recommended: false,
  },
  {
    id: 'scenario-c',
    title: 'Scenario C: AI-Optimized Mixed Civic Development (Recommended)',
    focus: 'Targeted triage addressing top 20% critical healthcare corridors, under-represented community water mains, and school overpasses.',
    budgetAllocated: '$12,000,000 / ₹100 Crore',
    beneficiaries: 520000,
    gapReductionPercent: 86,
    accessibilityImprovement: 89,
    priorityRegionsAddressed: 23,
    estimatedImpactScore: 94,
    aiRationale: 'Optimal composite ROI: highest population coverage (+520K citizens), maximal gap reduction (86%), and delivers 100% resolution to all Critical-tier civic emergencies.',
    recommended: true,
  },
];

export const FUTURE_TRENDS: FutureTrend[] = [
  {
    category: 'Road & Highway Infrastructure',
    currentCount: 142,
    previousCount: 88,
    growthRatePercent: 61.4,
    risk30Days: 'Sub-base erosion across 4 key bridges if upcoming monsoon rains hit prior to resurfacing.',
    risk6Months: 'Potential 2.4x spike in emergency response delays and vehicle damage claims.',
    risk1Year: 'Structural failure risk on unreinforced culverts requiring complete rebuild at 4x current cost.',
    urgencyLevel: 'CRITICAL',
    forecastSummary: 'Sharp upward trend (+61.4%). Immediate preventive action saves an estimated 74% in downstream capital replacement costs.',
  },
  {
    category: 'Potable Water Distribution',
    currentCount: 76,
    previousCount: 52,
    growthRatePercent: 46.2,
    risk30Days: 'Localized water supply outages extending into adjacent wards.',
    risk6Months: 'Elevated waterborne contamination risk in peri-urban distribution zones.',
    risk1Year: 'Groundwater infiltration into aging low-pressure mains.',
    urgencyLevel: 'HIGH',
    forecastSummary: 'Moderate-high growth rate (+46.2%). Pressure-management sensors recommended at main trunk lines.',
  },
  {
    category: 'Public Safety & Street Lighting',
    currentCount: 65,
    previousCount: 58,
    growthRatePercent: 12.1,
    risk30Days: 'Isolated nighttime pedestrian accidents.',
    risk6Months: 'Commuter diversion to congested parallel well-lit roads.',
    risk1Year: 'Accelerated oxidation of exposed wiring.',
    urgencyLevel: 'MEDIUM',
    forecastSummary: 'Stable trend (+12.1%). Smart solar LED conversion proposed under municipal green energy fund.',
  },
];

export const IMPACT_METRICS: ImpactBeforeAfter[] = [
  {
    metricName: 'Average Emergency Response Delay',
    category: 'Healthcare Access',
    beforeValue: '28.4 mins',
    afterValue: '8.2 mins',
    improvementPercentage: 71,
    description: 'Post-resurfacing of the District Medical Corridor, ambulance response times dropped by 20.2 minutes.',
  },
  {
    metricName: 'Citizen Complaints per Month',
    category: 'Civic Satisfaction',
    beforeValue: '124 reports/mo',
    afterValue: '6 reports/mo',
    improvementPercentage: 95,
    description: 'Proactive hotspot clustering and targeted repairs reduced recurring complaints by 95%.',
  },
  {
    metricName: 'Baseline Infrastructure Gap',
    category: 'Asset Quality',
    beforeValue: '78% deficit',
    afterValue: '12% deficit',
    improvementPercentage: 84,
    description: 'Independent engineering audits confirm dramatic elevation in roadway and water main reliability.',
  },
  {
    metricName: 'Safe School Commute Index',
    category: 'Child Safety',
    beforeValue: '34 / 100',
    afterValue: '96 / 100',
    improvementPercentage: 182,
    description: 'Pedestrian overpass repair and protected crossings secured transit for 1,400+ students daily.',
  },
];

export function getStoredIssues(): CivicIssue[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Filter out any mock seeded items if they somehow exist
      return parsed.filter(
        (item: CivicIssue) =>
          !item.id.includes('000123') &&
          !item.id.includes('000032') &&
          !item.id.includes('000031') &&
          !item.id.includes('000030') &&
          !item.id.includes('000029')
      );
    }
    return [];
  } catch {
    return [];
  }
}

export function clearStoredIssues(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('govinsight_issues_updated'));
  }
}

export function saveIssue(issue: CivicIssue): void {
  const issues = getStoredIssues();
  const index = issues.findIndex((i) => i.id === issue.id);
  if (index >= 0) {
    issues[index] = issue;
  } else {
    issues.unshift(issue);
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
    window.dispatchEvent(new Event('govinsight_issues_updated'));
  } catch (e) {
    console.error('Failed to save issue to localStorage', e);
  }
}

export function updateIssueStatus(
  id: string,
  newStatus: CivicIssue['status'],
  actor: string,
  note: string,
  resolutionPhotoUrl?: string
): CivicIssue | undefined {
  const issues = getStoredIssues();
  const issue = issues.find((i) => i.id === id);
  if (!issue) return undefined;

  issue.status = newStatus;
  issue.updatedAt = new Date().toISOString();
  if (resolutionPhotoUrl) {
    issue.resolutionPhotoUrl = resolutionPhotoUrl;
  }
  issue.timeline.push({
    status: newStatus,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    actor,
    note,
  });

  saveIssue(issue);
  return issue;
}

export function submitCitizenFeedback(
  id: string,
  resolved: boolean,
  rating: number,
  comment?: string
): CivicIssue | undefined {
  const issues = getStoredIssues();
  const issue = issues.find((i) => i.id === id);
  if (!issue) return undefined;

  issue.citizenFeedback = {
    resolved,
    rating,
    comment,
    timestamp: new Date().toISOString(),
  };

  saveIssue(issue);
  return issue;
}
