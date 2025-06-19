/**
 * File format validation utilities
 */

/**
 * Validates the question file format based on game type
 * @param file The file to validate
 * @param gameType The type of game (linear or nested)
 * @returns True if valid, throws error otherwise
 */
export const validateQuestionFile = async (file: File, gameType: string): Promise<boolean> => {
  // Validate file type
  if (gameType.toLowerCase() === 'linear' && !file.name.toLowerCase().endsWith('.csv')) {
    throw new Error('Linear games ONLY accept CSV file format');
  }
  
  if (gameType.toLowerCase() === 'nested' && !file.name.toLowerCase().endsWith('.xlsx')) {
    throw new Error('Nested games ONLY accept XLSX file format');
  }

  // Check file size (optional)
  const maxSizeMB = 10;
  if (file.size > maxSizeMB * 1024 * 1024) {
    throw new Error(`File is too large. Maximum size is ${maxSizeMB}MB.`);
  }

  return true;
};

/**
 * Validates the structure of a question sheet in XLSX file
 * @param data The sheet data as JSON
 * @returns True if valid, false otherwise
 */
export const validateQuestionSheet = (data: any[]): boolean => {
  if (!Array.isArray(data) || data.length === 0) {
    return false;
  }

  // Check if the first row has all required columns
  const requiredColumns = ['Text', 'Option1', 'Option2', 'Option3', 'Option4', 'CorrectOption'];
  const firstRow = data[0];
  
  return requiredColumns.every(column => 
    Object.prototype.hasOwnProperty.call(firstRow, column) || 
    // Also check for lowercase versions as fallback
    Object.prototype.hasOwnProperty.call(firstRow, column.toLowerCase())
  );
};

/**
 * Validates that an XLSX file has exactly 5 sheets for nested games
 * @param sheetNames Array of sheet names from the XLSX file
 * @returns True if valid, false otherwise
 */
export const validateNestedGameSheets = (sheetNames: string[]): boolean => {
  return sheetNames.length === 5;
}; 