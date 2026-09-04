/**
 * frontend/src/data/rivers.js
 * Major river and hydrological drainage networks in East Khasi Hills, Meghalaya.
 */

export const RIVERS_DATA = [
  {
    id: 'RIVER-01',
    name: 'Umngot River (Dawki Lifeline)',
    type: 'Major Transboundary River',
    flow_status: 'High Runoff / Gorge Flow',
    coordinates: [
      [91.9520, 25.4420],
      [91.9680, 25.3850],
      [91.9840, 25.3120],
      [92.0010, 25.2450],
      [92.0220, 25.1850]
    ]
  },
  {
    id: 'RIVER-02',
    name: 'Wah Umkhrah River',
    type: 'Plateau Drainage Basin',
    flow_status: 'Flash Surge Hazard',
    coordinates: [
      [91.8650, 25.5520],
      [91.8820, 25.5780],
      [91.8950, 25.6120],
      [91.9120, 25.6480],
      [91.9280, 25.6720]
    ]
  },
  {
    id: 'RIVER-03',
    name: 'Wah Risa / Umshyrpi River',
    type: 'Urban Infiltration Drainage',
    flow_status: 'Moderate Runoff',
    coordinates: [
      [91.8510, 25.5410],
      [91.8690, 25.5600],
      [91.8860, 25.5820]
    ]
  },
  {
    id: 'RIVER-04',
    name: 'Wah Kaba & Sohra Gorge Streams',
    type: 'Steep Escarpment Cascades',
    flow_status: 'Severe Hydrological Velocity',
    coordinates: [
      [91.7480, 25.3410],
      [91.7320, 25.3020],
      [91.7210, 25.2710],
      [91.7050, 25.2350]
    ]
  },
  {
    id: 'RIVER-05',
    name: 'Mawsynram Valley Catchment Stream',
    type: 'High-Precipitation Headwaters',
    flow_status: 'Extreme Monsoon Runoff',
    coordinates: [
      [91.6120, 25.3450],
      [91.5950, 25.3050],
      [91.5790, 25.2650],
      [91.5620, 25.2200]
    ]
  }
];
