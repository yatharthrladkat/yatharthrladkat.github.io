export interface DistrictGeoFeature {
  id: string;
  name: string;
  marathiName: string; // Retained for type compatibility (contains Hindi district name)
  hindiName?: string;
  division: string;
  center: [number, number]; // [lat, lng]
  polygon: [number, number][]; // [[lat, lng], ...]
  // Baseline telemetry
  spi3M: number;
  vci: number;
  soilMoistureDev: number;
  precipDeficit: number;
  cropLossRiskPct: number;
  vedasCategory: 'Severe' | 'Moderate' | 'Mild' | 'Normal';
  talukasCount: number;
  monitoredAcreageHa: string;
  groundwaterDepthM: number;
  activeTankers: number;
}

export interface TalukaHotspot {
  id: string;
  name: string;
  districtId: string;
  districtName: string;
  coordinates: [number, number]; // [lat, lng]
  severity: 'Critical' | 'Severe' | 'Moderate';
  vci: number;
  spi3M: number;
  rainfallDeviationPct: number;
  soilMoistureDeviationPct: number;
  groundwaterDeficitM: number;
  keyCrop: string;
  cropStage: string;
  lossRiskPct: number;
  tankersAssigned: number;
}

export interface WeatherStation {
  id: string;
  name: string;
  district: string;
  coordinates: [number, number];
  stationType: 'IMD AWS' | 'State Agro-Met' | 'ISRO Telemetry';
  temperatureC: number;
  relativeHumidityPct: number;
  windSpeedKmh: number;
  rainfall24hMm: number;
  lastReading: string;
}

// Bounding polygons [lat, lng] for Madhya Pradesh districts
export const MADHYA_PRADESH_DISTRICTS_GEO: DistrictGeoFeature[] = [
  {
    id: 'tikamgarh',
    name: 'Tikamgarh',
    marathiName: 'टीकमगढ़',
    hindiName: 'टीकमगढ़',
    division: 'Sagar Division (Bundelkhand)',
    center: [24.7450, 78.8350],
    polygon: [
      [25.15, 78.60],
      [25.20, 79.05],
      [24.95, 79.25],
      [24.60, 79.15],
      [24.40, 78.90],
      [24.45, 78.55],
      [24.80, 78.45],
      [25.15, 78.60]
    ],
    spi3M: -2.24,
    vci: 19.4,
    soilMoistureDev: -54.8,
    precipDeficit: -64.2,
    cropLossRiskPct: 78,
    vedasCategory: 'Severe',
    talukasCount: 6,
    monitoredAcreageHa: '4.8 Lakh Ha',
    groundwaterDepthM: 16.4,
    activeTankers: 38
  },
  {
    id: 'chhatarpur',
    name: 'Chhatarpur',
    marathiName: 'छतरपुर',
    hindiName: 'छतरपुर',
    division: 'Sagar Division (Bundelkhand)',
    center: [24.9150, 79.5850],
    polygon: [
      [25.35, 79.40],
      [25.30, 80.05],
      [24.95, 80.20],
      [24.60, 79.85],
      [24.55, 79.35],
      [24.85, 79.15],
      [25.35, 79.40]
    ],
    spi3M: -2.12,
    vci: 22.1,
    soilMoistureDev: -50.4,
    precipDeficit: -59.5,
    cropLossRiskPct: 72,
    vedasCategory: 'Severe',
    talukasCount: 11,
    monitoredAcreageHa: '6.4 Lakh Ha',
    groundwaterDepthM: 15.8,
    activeTankers: 32
  },
  {
    id: 'barwani',
    name: 'Barwani',
    marathiName: 'बड़वानी',
    hindiName: 'बड़वानी',
    division: 'Indore Division (Nimar)',
    center: [22.0350, 74.9050],
    polygon: [
      [22.30, 74.65],
      [22.35, 75.15],
      [22.10, 75.30],
      [21.80, 75.25],
      [21.65, 74.85],
      [21.75, 74.60],
      [22.05, 74.55],
      [22.30, 74.65]
    ],
    spi3M: -2.05,
    vci: 24.8,
    soilMoistureDev: -47.2,
    precipDeficit: -56.8,
    cropLossRiskPct: 69,
    vedasCategory: 'Severe',
    talukasCount: 7,
    monitoredAcreageHa: '5.2 Lakh Ha',
    groundwaterDepthM: 17.2,
    activeTankers: 29
  },
  {
    id: 'sheopur',
    name: 'Sheopur',
    marathiName: 'श्योपुर',
    hindiName: 'श्योपुर',
    division: 'Chambal Division',
    center: [25.6650, 76.6950],
    polygon: [
      [26.15, 76.50],
      [26.20, 77.05],
      [25.80, 77.20],
      [25.40, 77.05],
      [25.35, 76.55],
      [25.75, 76.35],
      [26.15, 76.50]
    ],
    spi3M: -1.98,
    vci: 26.5,
    soilMoistureDev: -45.1,
    precipDeficit: -53.4,
    cropLossRiskPct: 65,
    vedasCategory: 'Severe',
    talukasCount: 3,
    monitoredAcreageHa: '3.9 Lakh Ha',
    groundwaterDepthM: 18.5,
    activeTankers: 24
  },
  {
    id: 'shivpuri',
    name: 'Shivpuri',
    marathiName: 'शिवपुरी',
    hindiName: 'शिवपुरी',
    division: 'Gwalior Division',
    center: [25.4350, 77.6550],
    polygon: [
      [25.85, 77.40],
      [25.90, 78.10],
      [25.60, 78.35],
      [25.15, 78.20],
      [25.00, 77.60],
      [25.30, 77.25],
      [25.85, 77.40]
    ],
    spi3M: -1.88,
    vci: 28.9,
    soilMoistureDev: -42.8,
    precipDeficit: -49.6,
    cropLossRiskPct: 61,
    vedasCategory: 'Severe',
    talukasCount: 8,
    monitoredAcreageHa: '6.1 Lakh Ha',
    groundwaterDepthM: 14.9,
    activeTankers: 22
  },
  {
    id: 'khargone',
    name: 'Khargone (West Nimar)',
    marathiName: 'खरगोन',
    hindiName: 'खरगोन (पश्चिम निमाड़)',
    division: 'Indore Division (Nimar)',
    center: [21.8250, 75.6150],
    polygon: [
      [22.25, 75.35],
      [22.30, 75.95],
      [22.05, 76.20],
      [21.65, 76.05],
      [21.45, 75.60],
      [21.60, 75.25],
      [22.25, 75.35]
    ],
    spi3M: -1.82,
    vci: 31.2,
    soilMoistureDev: -41.4,
    precipDeficit: -48.2,
    cropLossRiskPct: 58,
    vedasCategory: 'Severe',
    talukasCount: 9,
    monitoredAcreageHa: '6.9 Lakh Ha',
    groundwaterDepthM: 16.1,
    activeTankers: 25
  },
  {
    id: 'dewas',
    name: 'Dewas',
    marathiName: 'देवास',
    hindiName: 'देवास',
    division: 'Ujjain Division (Malwa)',
    center: [22.9650, 76.0550],
    polygon: [
      [23.25, 75.85],
      [23.30, 76.45],
      [23.00, 76.70],
      [22.60, 76.60],
      [22.45, 76.10],
      [22.70, 75.80],
      [23.25, 75.85]
    ],
    spi3M: -1.74,
    vci: 33.8,
    soilMoistureDev: -38.6,
    precipDeficit: -44.5,
    cropLossRiskPct: 53,
    vedasCategory: 'Moderate',
    talukasCount: 6,
    monitoredAcreageHa: '5.8 Lakh Ha',
    groundwaterDepthM: 15.2,
    activeTankers: 18
  },
  {
    id: 'dhar',
    name: 'Dhar',
    marathiName: 'धार',
    hindiName: 'धार',
    division: 'Indore Division (Malwa)',
    center: [22.5950, 75.3050],
    polygon: [
      [23.00, 75.05],
      [23.05, 75.60],
      [22.75, 75.75],
      [22.30, 75.60],
      [22.15, 75.10],
      [22.45, 74.85],
      [23.00, 75.05]
    ],
    spi3M: -1.68,
    vci: 35.4,
    soilMoistureDev: -36.2,
    precipDeficit: -42.8,
    cropLossRiskPct: 49,
    vedasCategory: 'Moderate',
    talukasCount: 8,
    monitoredAcreageHa: '6.6 Lakh Ha',
    groundwaterDepthM: 14.5,
    activeTankers: 16
  },
  {
    id: 'panna',
    name: 'Panna',
    marathiName: 'पन्ना',
    hindiName: 'पन्ना',
    division: 'Sagar Division (Bundelkhand)',
    center: [24.7250, 80.1950],
    polygon: [
      [25.10, 80.00],
      [25.05, 80.55],
      [24.70, 80.65],
      [24.35, 80.40],
      [24.30, 79.95],
      [24.70, 79.80],
      [25.10, 80.00]
    ],
    spi3M: -1.72,
    vci: 34.2,
    soilMoistureDev: -39.1,
    precipDeficit: -45.1,
    cropLossRiskPct: 54,
    vedasCategory: 'Moderate',
    talukasCount: 5,
    monitoredAcreageHa: '4.2 Lakh Ha',
    groundwaterDepthM: 13.9,
    activeTankers: 15
  },
  {
    id: 'damoh',
    name: 'Damoh',
    marathiName: 'दमोह',
    hindiName: 'दमोह',
    division: 'Sagar Division (Bundelkhand)',
    center: [23.8350, 79.4450],
    polygon: [
      [24.25, 79.20],
      [24.30, 79.80],
      [23.95, 79.95],
      [23.55, 79.75],
      [23.45, 79.25],
      [23.85, 79.05],
      [24.25, 79.20]
    ],
    spi3M: -1.65,
    vci: 37.1,
    soilMoistureDev: -34.7,
    precipDeficit: -41.2,
    cropLossRiskPct: 48,
    vedasCategory: 'Moderate',
    talukasCount: 7,
    monitoredAcreageHa: '5.1 Lakh Ha',
    groundwaterDepthM: 12.8,
    activeTankers: 14
  },
  {
    id: 'ujjain',
    name: 'Ujjain',
    marathiName: 'उज्जैन',
    hindiName: 'उज्जैन',
    division: 'Ujjain Division (Malwa)',
    center: [23.1750, 75.7850],
    polygon: [
      [23.55, 75.50],
      [23.60, 76.10],
      [23.25, 76.25],
      [22.85, 76.05],
      [22.80, 75.55],
      [23.15, 75.35],
      [23.55, 75.50]
    ],
    spi3M: -1.58,
    vci: 39.8,
    soilMoistureDev: -31.4,
    precipDeficit: -38.6,
    cropLossRiskPct: 44,
    vedasCategory: 'Moderate',
    talukasCount: 7,
    monitoredAcreageHa: '5.9 Lakh Ha',
    groundwaterDepthM: 13.5,
    activeTankers: 12
  },
  {
    id: 'khandwa',
    name: 'Khandwa (East Nimar)',
    marathiName: 'खंडवा',
    hindiName: 'खंडवा (पूर्व निमाड़)',
    division: 'Indore Division (Nimar)',
    center: [21.8350, 76.3550],
    polygon: [
      [22.30, 76.10],
      [22.35, 76.75],
      [22.00, 76.90],
      [21.55, 76.75],
      [21.45, 76.20],
      [21.85, 75.95],
      [22.30, 76.10]
    ],
    spi3M: -1.61,
    vci: 38.4,
    soilMoistureDev: -33.2,
    precipDeficit: -39.8,
    cropLossRiskPct: 46,
    vedasCategory: 'Moderate',
    talukasCount: 5,
    monitoredAcreageHa: '5.4 Lakh Ha',
    groundwaterDepthM: 14.1,
    activeTankers: 15
  },
  {
    id: 'sagar',
    name: 'Sagar',
    marathiName: 'सागर',
    hindiName: 'सागर',
    division: 'Sagar Division (Bundelkhand)',
    center: [23.8350, 78.7150],
    polygon: [
      [24.30, 78.45],
      [24.35, 79.15],
      [23.95, 79.25],
      [23.50, 79.05],
      [23.40, 78.45],
      [23.85, 78.20],
      [24.30, 78.45]
    ],
    spi3M: -1.52,
    vci: 42.1,
    soilMoistureDev: -29.5,
    precipDeficit: -35.4,
    cropLossRiskPct: 41,
    vedasCategory: 'Mild',
    talukasCount: 11,
    monitoredAcreageHa: '7.8 Lakh Ha',
    groundwaterDepthM: 12.4,
    activeTankers: 10
  },
  {
    id: 'morena',
    name: 'Morena',
    marathiName: 'मुरैना',
    hindiName: 'मुरैना',
    division: 'Chambal Division',
    center: [26.4950, 77.9950],
    polygon: [
      [26.90, 77.75],
      [26.95, 78.35],
      [26.55, 78.50],
      [26.20, 78.30],
      [26.15, 77.70],
      [26.50, 77.50],
      [26.90, 77.75]
    ],
    spi3M: -1.45,
    vci: 44.5,
    soilMoistureDev: -27.8,
    precipDeficit: -33.6,
    cropLossRiskPct: 38,
    vedasCategory: 'Mild',
    talukasCount: 6,
    monitoredAcreageHa: '4.6 Lakh Ha',
    groundwaterDepthM: 15.4,
    activeTankers: 8
  },
  {
    id: 'bhind',
    name: 'Bhind',
    marathiName: 'भिंड',
    hindiName: 'भिंड',
    division: 'Chambal Division',
    center: [26.5650, 78.7850],
    polygon: [
      [26.95, 78.55],
      [26.98, 79.15],
      [26.60, 79.25],
      [26.25, 79.05],
      [26.20, 78.50],
      [26.55, 78.35],
      [26.95, 78.55]
    ],
    spi3M: -1.42,
    vci: 45.2,
    soilMoistureDev: -26.9,
    precipDeficit: -32.8,
    cropLossRiskPct: 36,
    vedasCategory: 'Mild',
    talukasCount: 8,
    monitoredAcreageHa: '4.1 Lakh Ha',
    groundwaterDepthM: 16.2,
    activeTankers: 7
  },
  {
    id: 'ratlam',
    name: 'Ratlam',
    marathiName: 'रतलाम',
    hindiName: 'रतलाम',
    division: 'Ujjain Division (Malwa)',
    center: [23.3350, 75.0350],
    polygon: [
      [23.75, 74.80],
      [23.80, 75.35],
      [23.45, 75.50],
      [23.05, 75.30],
      [23.00, 74.75],
      [23.35, 74.60],
      [23.75, 74.80]
    ],
    spi3M: -1.49,
    vci: 43.4,
    soilMoistureDev: -28.6,
    precipDeficit: -34.5,
    cropLossRiskPct: 39,
    vedasCategory: 'Mild',
    talukasCount: 6,
    monitoredAcreageHa: '4.5 Lakh Ha',
    groundwaterDepthM: 13.1,
    activeTankers: 9
  },
  {
    id: 'mandsaur',
    name: 'Mandsaur',
    marathiName: 'मंदसौर',
    hindiName: 'मंदसौर',
    division: 'Ujjain Division (Malwa)',
    center: [24.0750, 75.0750],
    polygon: [
      [24.50, 74.80],
      [24.55, 75.45],
      [24.20, 75.60],
      [23.80, 75.40],
      [23.75, 74.80],
      [24.15, 74.60],
      [24.50, 74.80]
    ],
    spi3M: -1.39,
    vci: 46.8,
    soilMoistureDev: -25.2,
    precipDeficit: -30.4,
    cropLossRiskPct: 34,
    vedasCategory: 'Normal',
    talukasCount: 5,
    monitoredAcreageHa: '4.9 Lakh Ha',
    groundwaterDepthM: 12.6,
    activeTankers: 6
  },
  {
    id: 'vidisha',
    name: 'Vidisha',
    marathiName: 'विदिशा',
    hindiName: 'विदिशा',
    division: 'Bhopal Division',
    center: [23.5250, 77.8150],
    polygon: [
      [23.95, 77.55],
      [24.00, 78.20],
      [23.65, 78.35],
      [23.25, 78.10],
      [23.15, 77.55],
      [23.55, 77.35],
      [23.95, 77.55]
    ],
    spi3M: -1.34,
    vci: 48.9,
    soilMoistureDev: -23.1,
    precipDeficit: -28.2,
    cropLossRiskPct: 31,
    vedasCategory: 'Normal',
    talukasCount: 7,
    monitoredAcreageHa: '6.8 Lakh Ha',
    groundwaterDepthM: 11.2,
    activeTankers: 5
  },
  {
    id: 'sehore',
    name: 'Sehore',
    marathiName: 'सीहोर',
    hindiName: 'सीहोर',
    division: 'Bhopal Division',
    center: [23.2050, 77.0850],
    polygon: [
      [23.60, 76.80],
      [23.65, 77.40],
      [23.30, 77.55],
      [22.90, 77.35],
      [22.80, 76.75],
      [23.20, 76.60],
      [23.60, 76.80]
    ],
    spi3M: -1.31,
    vci: 50.4,
    soilMoistureDev: -21.8,
    precipDeficit: -26.5,
    cropLossRiskPct: 29,
    vedasCategory: 'Normal',
    talukasCount: 5,
    monitoredAcreageHa: '5.7 Lakh Ha',
    groundwaterDepthM: 10.8,
    activeTankers: 4
  },
  {
    id: 'hoshangabad',
    name: 'Narmadapuram',
    marathiName: 'नर्मदापुरम',
    hindiName: 'नर्मदापुरम (होशंगाबाद)',
    division: 'Narmadapuram Division',
    center: [22.7550, 77.7250],
    polygon: [
      [23.10, 77.40],
      [23.15, 78.15],
      [22.80, 78.35],
      [22.40, 78.10],
      [22.35, 77.40],
      [22.70, 77.20],
      [23.10, 77.40]
    ],
    spi3M: -1.18,
    vci: 54.2,
    soilMoistureDev: -17.5,
    precipDeficit: -21.4,
    cropLossRiskPct: 24,
    vedasCategory: 'Normal',
    talukasCount: 7,
    monitoredAcreageHa: '6.2 Lakh Ha',
    groundwaterDepthM: 9.4,
    activeTankers: 3
  }
];

// Alias for backward compatibility
export const MAHARASHTRA_DISTRICTS_GEO = MADHYA_PRADESH_DISTRICTS_GEO;

// High-stress Tehsils across Madhya Pradesh
export const TALUKA_HOTSPOTS: TalukaHotspot[] = [
  {
    id: 'baldeogarh',
    name: 'Baldeogarh',
    districtId: 'tikamgarh',
    districtName: 'Tikamgarh',
    coordinates: [24.8333, 78.9667],
    severity: 'Critical',
    vci: 17.8,
    spi3M: -2.31,
    rainfallDeviationPct: -68.4,
    soilMoistureDeviationPct: -58.2,
    groundwaterDeficitM: 5.1,
    keyCrop: 'Soybean & Sesame',
    cropStage: 'Severe pod abortion / vegetative wilting',
    lossRiskPct: 84,
    tankersAssigned: 12
  },
  {
    id: 'jatara',
    name: 'Jatara',
    districtId: 'tikamgarh',
    districtName: 'Tikamgarh',
    coordinates: [25.0167, 79.0500],
    severity: 'Critical',
    vci: 19.2,
    spi3M: -2.25,
    rainfallDeviationPct: -65.1,
    soilMoistureDeviationPct: -55.0,
    groundwaterDeficitM: 4.8,
    keyCrop: 'Soybean',
    cropStage: 'Pod development failure',
    lossRiskPct: 79,
    tankersAssigned: 10
  },
  {
    id: 'nowgong',
    name: 'Nowgong',
    districtId: 'chhatarpur',
    districtName: 'Chhatarpur',
    coordinates: [25.0667, 79.4500],
    severity: 'Critical',
    vci: 20.4,
    spi3M: -2.20,
    rainfallDeviationPct: -62.8,
    soilMoistureDeviationPct: -52.6,
    groundwaterDeficitM: 4.6,
    keyCrop: 'Soybean & Mustard',
    cropStage: 'Vegetative stunt / moisture exhaustion',
    lossRiskPct: 76,
    tankersAssigned: 11
  },
  {
    id: 'bijawar',
    name: 'Bijawar',
    districtId: 'chhatarpur',
    districtName: 'Chhatarpur',
    coordinates: [24.6333, 79.5000],
    severity: 'Critical',
    vci: 21.8,
    spi3M: -2.14,
    rainfallDeviationPct: -60.2,
    soilMoistureDeviationPct: -49.8,
    groundwaterDeficitM: 4.2,
    keyCrop: 'Gram (Chana) & Wheat',
    cropStage: 'Pre-sowing dry seedbed crisis',
    lossRiskPct: 73,
    tankersAssigned: 9
  },
  {
    id: 'sendhwa',
    name: 'Sendhwa',
    districtId: 'barwani',
    districtName: 'Barwani',
    coordinates: [21.6833, 75.0833],
    severity: 'Critical',
    vci: 22.5,
    spi3M: -2.12,
    rainfallDeviationPct: -59.4,
    soilMoistureDeviationPct: -48.9,
    groundwaterDeficitM: 4.4,
    keyCrop: 'Bt Cotton & Maize',
    cropStage: 'Square dropping & boll drying',
    lossRiskPct: 75,
    tankersAssigned: 11
  },
  {
    id: 'pansemal',
    name: 'Pansemal',
    districtId: 'barwani',
    districtName: 'Barwani',
    coordinates: [21.6500, 74.7000],
    severity: 'Critical',
    vci: 23.9,
    spi3M: -2.06,
    rainfallDeviationPct: -57.5,
    soilMoistureDeviationPct: -46.7,
    groundwaterDeficitM: 4.1,
    keyCrop: 'Cotton & Jowar',
    cropStage: 'Terminal water stress',
    lossRiskPct: 71,
    tankersAssigned: 8
  },
  {
    id: 'karahal',
    name: 'Karahal',
    districtId: 'sheopur',
    districtName: 'Sheopur',
    coordinates: [25.5000, 77.0500],
    severity: 'Severe',
    vci: 25.1,
    spi3M: -2.02,
    rainfallDeviationPct: -55.8,
    soilMoistureDeviationPct: -46.1,
    groundwaterDeficitM: 4.0,
    keyCrop: 'Mustard & Bajra',
    cropStage: 'Soil crusting / Sowing failure',
    lossRiskPct: 68,
    tankersAssigned: 9
  },
  {
    id: 'kolaras',
    name: 'Kolaras',
    districtId: 'shivpuri',
    districtName: 'Shivpuri',
    coordinates: [25.2333, 77.6000],
    severity: 'Severe',
    vci: 27.2,
    spi3M: -1.92,
    rainfallDeviationPct: -51.6,
    soilMoistureDeviationPct: -43.9,
    groundwaterDeficitM: 3.7,
    keyCrop: 'Soybean & Groundnut',
    cropStage: 'Pod filling water deficit',
    lossRiskPct: 63,
    tankersAssigned: 8
  },
  {
    id: 'kasrawad',
    name: 'Kasrawad',
    districtId: 'khargone',
    districtName: 'Khargone',
    coordinates: [22.1333, 75.6000],
    severity: 'Severe',
    vci: 29.5,
    spi3M: -1.86,
    rainfallDeviationPct: -49.2,
    soilMoistureDeviationPct: -42.1,
    groundwaterDeficitM: 3.5,
    keyCrop: 'Chilli & Cotton',
    cropStage: 'Flowering abortion / Leaf curl',
    lossRiskPct: 60,
    tankersAssigned: 9
  },
  {
    id: 'sonkatch',
    name: 'Sonkatch',
    districtId: 'dewas',
    districtName: 'Dewas',
    coordinates: [22.9833, 76.3667],
    severity: 'Moderate',
    vci: 32.8,
    spi3M: -1.76,
    rainfallDeviationPct: -45.4,
    soilMoistureDeviationPct: -39.0,
    groundwaterDeficitM: 3.2,
    keyCrop: 'Soybean & Durum Wheat',
    cropStage: 'Grain maturation deficit',
    lossRiskPct: 54,
    tankersAssigned: 7
  }
];

// Official IMD Automated Weather Stations across Madhya Pradesh
export const AWS_WEATHER_STATIONS: WeatherStation[] = [
  {
    id: 'AWS-MP-01',
    name: 'IMD Bhopal Regional Met Centre',
    district: 'Bhopal',
    coordinates: [23.2800, 77.3500],
    stationType: 'IMD AWS',
    temperatureC: 34.2,
    relativeHumidityPct: 28,
    windSpeedKmh: 14,
    rainfall24hMm: 0.0,
    lastReading: '24 Oct 2026, 09:00 IST'
  },
  {
    id: 'AWS-MP-02',
    name: 'IMD Tikamgarh Observatory',
    district: 'Tikamgarh',
    coordinates: [24.7500, 78.8400],
    stationType: 'IMD AWS',
    temperatureC: 36.8,
    relativeHumidityPct: 18,
    windSpeedKmh: 18,
    rainfall24hMm: 0.0,
    lastReading: '24 Oct 2026, 09:00 IST'
  },
  {
    id: 'AWS-MP-03',
    name: 'IMD Khajuraho Aero Station',
    district: 'Chhatarpur',
    coordinates: [24.8500, 79.9200],
    stationType: 'IMD AWS',
    temperatureC: 36.2,
    relativeHumidityPct: 20,
    windSpeedKmh: 16,
    rainfall24hMm: 0.0,
    lastReading: '24 Oct 2026, 09:00 IST'
  },
  {
    id: 'AWS-MP-04',
    name: 'IMD Gwalior Aero Met',
    district: 'Gwalior',
    coordinates: [26.2900, 78.2500],
    stationType: 'IMD AWS',
    temperatureC: 35.6,
    relativeHumidityPct: 22,
    windSpeedKmh: 15,
    rainfall24hMm: 0.0,
    lastReading: '24 Oct 2026, 09:00 IST'
  },
  {
    id: 'AWS-MP-05',
    name: 'IMD Indore Agro-Met Centre',
    district: 'Indore',
    coordinates: [22.7200, 75.8000],
    stationType: 'State Agro-Met',
    temperatureC: 33.5,
    relativeHumidityPct: 31,
    windSpeedKmh: 12,
    rainfall24hMm: 0.0,
    lastReading: '24 Oct 2026, 09:00 IST'
  },
  {
    id: 'AWS-MP-06',
    name: 'IMD Khargone AWS Station',
    district: 'Khargone',
    coordinates: [21.8200, 75.6200],
    stationType: 'IMD AWS',
    temperatureC: 37.4,
    relativeHumidityPct: 19,
    windSpeedKmh: 17,
    rainfall24hMm: 0.0,
    lastReading: '24 Oct 2026, 09:00 IST'
  },
  {
    id: 'AWS-MP-07',
    name: 'IMD Jabalpur Met Station',
    district: 'Jabalpur',
    coordinates: [23.1800, 79.9500],
    stationType: 'IMD AWS',
    temperatureC: 32.8,
    relativeHumidityPct: 34,
    windSpeedKmh: 11,
    rainfall24hMm: 0.0,
    lastReading: '24 Oct 2026, 09:00 IST'
  },
  {
    id: 'AWS-MP-08',
    name: 'IMD Ujjain Agro Station',
    district: 'Ujjain',
    coordinates: [23.1800, 75.7700],
    stationType: 'State Agro-Met',
    temperatureC: 34.0,
    relativeHumidityPct: 29,
    windSpeedKmh: 13,
    rainfall24hMm: 0.0,
    lastReading: '24 Oct 2026, 09:00 IST'
  }
];

export type DroughtMapMetric =
  | 'vedasComposite'
  | 'vci'
  | 'spi3M'
  | 'soilMoistureDev'
  | 'cropLossRiskPct'
  | 'precipDeficit';

export interface MetricConfig {
  id: DroughtMapMetric;
  label: string;
  shortLabel: string;
  unit: string;
  description: string;
  legendTitle: string;
  legendSteps: { label: string; color: string; desc: string }[];
}

export const DROUGHT_METRICS_CONFIG: Record<DroughtMapMetric, MetricConfig> = {
  vedasComposite: {
    id: 'vedasComposite',
    label: 'ISRO SAC VEDAS Krishi-DSS Composite Drought Severity',
    shortLabel: 'VEDAS Level',
    unit: 'Category',
    description: 'ISRO SAC Krishi-DSS multi-sensor composite: combines SPI-3M, VCI, Soil Moisture, and PASG.',
    legendTitle: 'ISRO VEDAS Drought Level',
    legendSteps: [
      { label: 'Severe', color: '#991B1B', desc: 'Critical agricultural drought' },
      { label: 'Moderate', color: '#D97706', desc: 'Significant stress / dry spells' },
      { label: 'Mild', color: '#EAB308', desc: 'Precipitation / moisture deficit' },
      { label: 'Normal', color: '#16A34A', desc: 'Within seasonal baseline' }
    ]
  },
  vci: {
    id: 'vci',
    label: 'Vegetation Condition Index (VCI)',
    shortLabel: 'VCI Anomaly',
    unit: '%',
    description: 'Measures photosynthetic vigor relative to historical maximum/minimum NDVI (INSAT-3DR / Sentinel-2).',
    legendTitle: 'Vegetation Condition Index (%)',
    legendSteps: [
      { label: '<25% (Critical)', color: '#7F1D1D', desc: 'Severe canopy desiccation' },
      { label: '25–35% (Severe)', color: '#C62828', desc: 'Substantial vegetative stress' },
      { label: '35–45% (Moderate)', color: '#F59E0B', desc: 'Moderate plant stress' },
      { label: '>45% (Normal/Mild)', color: '#2E7D32', desc: 'Healthy vegetative canopy' }
    ]
  },
  spi3M: {
    id: 'spi3M',
    label: '3-Month Standardized Precipitation Index (SPI-3M)',
    shortLabel: 'SPI-3M Index',
    unit: 'std dev',
    description: 'Quantifies cumulative 90-day precipitation surplus/deficit on a standardized normal distribution.',
    legendTitle: 'Standardized Precipitation Index (SPI)',
    legendSteps: [
      { label: '< -2.00 (Extreme)', color: '#581C87', desc: 'Extremely dry (1-in-50 yr)' },
      { label: '-1.50 to -2.00 (Severe)', color: '#DC2626', desc: 'Severely dry' },
      { label: '-1.00 to -1.50 (Moderate)', color: '#F97316', desc: 'Moderately dry' },
      { label: '> -1.00 (Near Normal)', color: '#10B981', desc: 'Normal rainfall range' }
    ]
  },
  soilMoistureDev: {
    id: 'soilMoistureDev',
    label: 'Root-Zone Soil Moisture Deviation',
    shortLabel: 'Soil Moisture Dev',
    unit: '%',
    description: 'Deviation of root-zone (0–40 cm) moisture saturation against 10-year agricultural baseline.',
    legendTitle: 'Soil Moisture Deviation (%)',
    legendSteps: [
      { label: '< -50% (Critical)', color: '#991B1B', desc: 'Permanent wilting point risk' },
      { label: '-35% to -50% (Severe)', color: '#EA580C', desc: 'High root depletion' },
      { label: '-20% to -35% (Moderate)', color: '#CA8A04', desc: 'Capillary water deficit' },
      { label: '> -20% (Mild/Normal)', color: '#16A34A', desc: 'Adequate soil retention' }
    ]
  },
  cropLossRiskPct: {
    id: 'cropLossRiskPct',
    label: 'Agrarian Crop Loss Risk Index',
    shortLabel: 'Crop Loss Risk',
    unit: '%',
    description: 'Econometric yield shortfall model synthesized from phenology stage, soil moisture, and dry spell days.',
    legendTitle: 'Projected Crop Loss (%)',
    legendSteps: [
      { label: '>70% Loss (Critical)', color: '#991B1B', desc: 'Emergency relief mandatory' },
      { label: '55–70% Loss (Severe)', color: '#DC2626', desc: 'Extensive yield reduction' },
      { label: '40–55% Loss (Moderate)', color: '#F59E0B', desc: 'Partial yield loss' },
      { label: '<40% Loss (Low/Mild)', color: '#2E7D32', desc: 'Manageable loss' }
    ]
  },
  precipDeficit: {
    id: 'precipDeficit',
    label: 'Rainfall Deficit vs IMD Normal',
    shortLabel: 'Precip Deficit',
    unit: '%',
    description: 'Percentage departure from long-period average (LPA) monsoon rainfall recorded by IMD rain gauges.',
    legendTitle: 'Rainfall Departure (% LPA)',
    legendSteps: [
      { label: '< -55% (Scanty)', color: '#991B1B', desc: 'Critical rainfall shortfall' },
      { label: '-40% to -55% (Deficient)', color: '#EA580C', desc: 'Severe monsoon hiatus' },
      { label: '-25% to -40% (Sub-normal)', color: '#EAB308', desc: 'Below average precipitation' },
      { label: '> -25% (Normal)', color: '#16A34A', desc: 'Acceptable rainfall' }
    ]
  }
};

export function getDistrictColor(district: DistrictGeoFeature, metric: DroughtMapMetric): string {
  switch (metric) {
    case 'vedasComposite':
      if (district.vedasCategory === 'Severe') return '#991B1B';
      if (district.vedasCategory === 'Moderate') return '#D97706';
      if (district.vedasCategory === 'Mild') return '#EAB308';
      return '#16A34A';

    case 'vci':
      if (district.vci < 25) return '#7F1D1D';
      if (district.vci < 35) return '#C62828';
      if (district.vci < 45) return '#F59E0B';
      return '#2E7D32';

    case 'spi3M':
      if (district.spi3M < -2.0) return '#581C87';
      if (district.spi3M < -1.5) return '#DC2626';
      if (district.spi3M < -1.0) return '#F97316';
      return '#10B981';

    case 'soilMoistureDev':
      if (district.soilMoistureDev < -50) return '#991B1B';
      if (district.soilMoistureDev < -35) return '#EA580C';
      if (district.soilMoistureDev < -20) return '#CA8A04';
      return '#16A34A';

    case 'cropLossRiskPct':
      if (district.cropLossRiskPct >= 70) return '#991B1B';
      if (district.cropLossRiskPct >= 55) return '#DC2626';
      if (district.cropLossRiskPct >= 40) return '#F59E0B';
      return '#2E7D32';

    case 'precipDeficit':
      if (district.precipDeficit < -55) return '#991B1B';
      if (district.precipDeficit < -40) return '#EA580C';
      if (district.precipDeficit < -25) return '#EAB308';
      return '#16A34A';

    default:
      return '#C62828';
  }
}

export function formatMetricValue(district: DistrictGeoFeature, metric: DroughtMapMetric): string {
  switch (metric) {
    case 'vedasComposite':
      return district.vedasCategory;
    case 'vci':
      return district.vci.toFixed(1) + '%';
    case 'spi3M':
      return district.spi3M.toFixed(2);
    case 'soilMoistureDev':
      return (district.soilMoistureDev > 0 ? '+' : '') + district.soilMoistureDev.toFixed(1) + '%';
    case 'cropLossRiskPct':
      return district.cropLossRiskPct + '%';
    case 'precipDeficit':
      return district.precipDeficit.toFixed(1) + '%';
  }
}

