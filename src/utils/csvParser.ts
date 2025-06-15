
interface ParsedBOMRow {
  material: string;
  quantity: number;
  unit: string;
  supplier: string;
  cost: number;
}

interface BOMParseResult {
  success: boolean;
  materials?: Array<{
    material_id: string;
    material_name: string;
    quantity: number;
    unit: string;
    cost_per_unit: number;
    carbon_footprint: number;
  }>;
  error?: string;
}

export const parseCSVFile = (file: File): Promise<ParsedBOMRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        // Skip header row if it exists
        const dataLines = lines.slice(1);
        
        const parsedData: ParsedBOMRow[] = dataLines.map((line, index) => {
          const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
          
          if (columns.length < 5) {
            throw new Error(`Row ${index + 2} has insufficient columns`);
          }
          
          return {
            material: columns[0] || `Material ${index + 1}`,
            quantity: parseFloat(columns[1]) || 1,
            unit: columns[2] || 'pieces',
            supplier: columns[3] || 'Unknown Supplier',
            cost: parseFloat(columns[4]) || 0
          };
        });
        
        resolve(parsedData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

export const parseCSVToBOM = async (file: File): Promise<BOMParseResult> => {
  try {
    const reader = new FileReader();
    
    return new Promise((resolve) => {
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            resolve({ success: false, error: 'CSV file must have at least a header and one data row' });
            return;
          }
          
          // Skip header row
          const dataLines = lines.slice(1);
          
          const materials = dataLines.map((line, index) => {
            const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
            
            if (columns.length < 3) {
              throw new Error(`Row ${index + 2} has insufficient columns`);
            }
            
            return {
              material_id: `temp-${Date.now()}-${index}`, // Temporary ID, will be resolved against actual materials
              material_name: columns[0] || `Material ${index + 1}`,
              quantity: parseFloat(columns[1]) || 1,
              unit: columns[2] || 'pieces',
              cost_per_unit: parseFloat(columns[3]) || 0,
              carbon_footprint: parseFloat(columns[4]) || 0
            };
          });
          
          resolve({ success: true, materials });
        } catch (error) {
          resolve({ success: false, error: error instanceof Error ? error.message : 'Failed to parse CSV' });
        }
      };
      
      reader.onerror = () => resolve({ success: false, error: 'Failed to read file' });
      reader.readAsText(file);
    });
  } catch (error) {
    return { success: false, error: 'Failed to process file' };
  }
};

export const parseExcelFile = async (file: File): Promise<ParsedBOMRow[]> => {
  // For now, we'll treat Excel files as CSV
  // In a real implementation, you'd use a library like xlsx
  console.log('Excel parsing not fully implemented, treating as CSV');
  return parseCSVFile(file);
};
