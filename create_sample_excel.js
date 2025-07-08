import XLSX from 'xlsx';

// Sample NSV data
const sampleData = [
  {
    NH_Number: 'NH-48',
    Chainage_Start: 25.000,
    Chainage_End: 25.500,
    Lane: 'L1',
    Latitude: 28.9041,
    Longitude: 77.3025,
    Roughness_BI: 2800,
    Rut_Depth: 6.2,
    Crack_Area: 8.5,
    Ravelling: 2.8
  },
  {
    NH_Number: 'NH-48',
    Chainage_Start: 25.000,
    Chainage_End: 25.500,
    Lane: 'L2',
    Latitude: 28.9042,
    Longitude: 77.3026,
    Roughness_BI: 2900,
    Rut_Depth: 6.8,
    Crack_Area: 9.2,
    Ravelling: 3.1
  },
  {
    NH_Number: 'NH-48',
    Chainage_Start: 25.000,
    Chainage_End: 25.500,
    Lane: 'R1',
    Latitude: 28.9043,
    Longitude: 77.3027,
    Roughness_BI: 2750,
    Rut_Depth: 5.9,
    Crack_Area: 7.8,
    Ravelling: 2.5
  },
  {
    NH_Number: 'NH-48',
    Chainage_Start: 25.000,
    Chainage_End: 25.500,
    Lane: 'R2',
    Latitude: 28.9044,
    Longitude: 77.3028,
    Roughness_BI: 2850,
    Rut_Depth: 6.5,
    Crack_Area: 8.8,
    Ravelling: 2.9
  },
  {
    NH_Number: 'NH-19',
    Chainage_Start: 50.000,
    Chainage_End: 50.500,
    Lane: 'L1',
    Latitude: 28.5041,
    Longitude: 77.4025,
    Roughness_BI: 1800,
    Rut_Depth: 2.1,
    Crack_Area: 1.5,
    Ravelling: 0.5
  },
  {
    NH_Number: 'NH-19',
    Chainage_Start: 50.000,
    Chainage_End: 50.500,
    Lane: 'L2',
    Latitude: 28.5042,
    Longitude: 77.4026,
    Roughness_BI: 1900,
    Rut_Depth: 2.3,
    Crack_Area: 1.8,
    Ravelling: 0.6
  },
  {
    NH_Number: 'NH-19',
    Chainage_Start: 50.000,
    Chainage_End: 50.500,
    Lane: 'R1',
    Latitude: 28.5043,
    Longitude: 77.4027,
    Roughness_BI: 1750,
    Rut_Depth: 1.9,
    Crack_Area: 1.2,
    Ravelling: 0.4
  },
  {
    NH_Number: 'NH-19',
    Chainage_Start: 50.000,
    Chainage_End: 50.500,
    Lane: 'R2',
    Latitude: 28.5044,
    Longitude: 77.4028,
    Roughness_BI: 1850,
    Rut_Depth: 2.2,
    Crack_Area: 1.6,
    Ravelling: 0.5
  }
];

// Create workbook and worksheet
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet(sampleData);

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'NSV Data');

// Write the Excel file
XLSX.writeFile(workbook, 'sample_nsv_data.xlsx');

console.log('Sample Excel file created: sample_nsv_data.xlsx');