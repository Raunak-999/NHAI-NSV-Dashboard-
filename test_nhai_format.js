import XLSX from 'xlsx';

// Create a test Excel file matching the NHAI format from the logs
const data = [
  // Header row 1 (matching the debug log structure)
  ['NH Number', 'Start Chainage ', 'End Chainage ', 'Length', 'Structure Details', 
   'Lane L1', '', 'Lane L2', '', '', 'Lane L3', '', '', '', 'Lane L4', '', '', '', 
   'Lane R1', '', '', '', 'Lane R2', '', '', '', 'Lane R3', '', '', '', 'Lane R4', '', '', '', '',
   'Remark', 'Limitation of BI as per MoRT&H Circular (in mm/km)',
   'L1 Lane Roughness BI (in mm/km)', 'L2 Lane Roughness BI (in mm/km)', 'L3 Lane Roughness BI (in mm/km)', 'L4 Lane Roughness BI (in mm/km)',
   'R1 Lane Roughness BI (in mm/km)', 'R2 Lane Roughness BI (in mm/km)', 'R3 Lane Roughness BI (in mm/km)', 'R4 Lane Roughness BI (in mm/km)',
   'Limitation of Rut Depth as per Concession Agreement (in mm)',
   'L1 Rut Depth (in mm)', 'L2 Rut Depth (in mm)', 'L3 Rut Depth (in mm)', 'L4 Rut Depth (in mm)',
   'R1 Rut Depth (in mm)', 'R2 Rut Depth (in mm)', 'R3 Rut Depth (in mm)', 'R4 Rut Depth (in mm)',
   'Limitation of Cracking as per Concession Agreement (in % area)',
   'L1 Crack Area (in % area)', 'L2 Crack Area (in % area)', 'L3 Crack Area (in % area)', 'L4 Crack Area (in % area)',
   'R1 Crack Area (in % area)', 'R2 Crack Area (in % area)', 'R3 Crack Area (in % area)', 'R4 Crack Area (in % area)',
   'Limitation of Ravelling as per Concession Agreement (in % area)',
   'L1 Area (% area)', 'L2 Area (% area)', 'L3 Area (% area)', 'L4 Area (% area)',
   'R1 Area (% area)', 'R2 Area (% area)', 'R3 Area (% area)', 'R4 Area (% area)'],

  // Header row 2 (sub-headers like Start/End for lanes)
  ['', '', '', '', '', 'Start', 'End', 'Start', '', 'End', 'Start', '', 'End', '', 'Start', '', 'End', '', 
   'Start', '', 'End', '', 'Start', '', 'End', '', 'Start', '', 'End', '', 'Start', '', 'End', '', '',
   '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],

  // Sample data row 1
  ['NH148N', 247310, 247400, 90, '',
   26.36114, 76.25048, 26.36034, 76.25034, 26.36111, 76.25052, 26.36031, 76.25038, 26.36114, 76.25056, 26.36034, 76.25042, 26.36115, 76.25061, 26.36035, 76.25047, 26.36011, 76.25005, 26.36091, 76.25019, 26.35999, 76.24998, 26.36079, 76.25013, 26.35978, 76.24992, 26.36058, 76.25006, 26.36007, 76.24993,
   '', 2400, 1727, 1853, 1758, 3001, 1285, 2736, 1877, 2579, 5, 2.9, 3.8, 3.1, 4.8, 4.1, 3.2, 3.3, 3.2, 5, 0.048, 0.004, 0.006, 0.004, 0, 0, 0, 0, 1, 0, 0.011, 0.008, 0, 0.013, 0, 0, 0],

  // Sample data row 2
  ['NH148N', 247400, 247500, 100, '',
   26.36034, 76.25034, 26.35945, 76.25018, 26.36031, 76.25038, 26.35942, 76.25022, 26.36034, 76.25042, 26.35945, 76.25026, 26.36035, 76.25047, 26.35946, 76.25031, 26.35922, 76.24989, 26.36011, 76.25005, 26.3591, 76.24982, 26.35999, 76.24998, 26.35889, 76.24975, 26.35978, 76.24992, 26.35918, 76.24976, 26.36007, 76.24993,
   '', 2400, 1316, 1270, 1377, 1462, 1578, 2918, 1766, 3591, 5, 3.3, 4.6, 3.3, 4.1, 3.7, 3, 3.2, 3.6, 5, 0.008, 0.003, 0, 0, 0.001, 0, 0, 0, 1, 0, 0, 0.003, 0.113, 0.013, 0, 0, 0]
];

// Create workbook and worksheet
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.aoa_to_sheet(data);

// Add worksheet to workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'NSV Data');

// Write to file
XLSX.writeFile(workbook, 'test_nhai_format.xlsx');

console.log('Created test_nhai_format.xlsx with proper NHAI structure');
console.log('Total columns:', data[0].length);
console.log('Data rows:', data.length - 2); // excluding headers