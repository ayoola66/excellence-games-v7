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
    throw new Error('Linear games require CSV file format');
  }
  
  if (gameType.toLowerCase() === 'nested' && !file.name.toLowerCase().endsWith('.xlsx')) {
    throw new Error('Nested games require XLSX file format');
  }

  // Additional validation could be added here for file contents

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
  const requiredColumns = ['question', 'option1', 'option2', 'option3', 'option4', 'correctAnswer'];
  const firstRow = data[0];
  
  return requiredColumns.every(column => 
    Object.prototype.hasOwnProperty.call(firstRow, column) && 
    firstRow[column] !== undefined && 
    firstRow[column] !== null
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