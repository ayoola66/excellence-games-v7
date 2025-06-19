'use client';

import React, { useState } from 'react';
import { validateQuestionFile } from '@/utils/validation';

interface QuestionImporterProps {
  gameId: string;
  gameType: 'linear' | 'nested';
  onImport: (formData: FormData) => Promise<any>;
}

export const QuestionImporter: React.FC<QuestionImporterProps> = ({
  gameId,
  gameType,
  onImport
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      try {
        await validateQuestionFile(selectedFile, gameType);
        setFile(selectedFile);
        setError(null);
        setImportSuccess(false);
      } catch (error: any) {
        setFile(null);
        setError(error.message);
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    setIsImporting(true);
    setError(null);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      await onImport(formData);
      setImportSuccess(true);
      setFile(null);
      // Reset the file input
      const fileInput = document.getElementById('question-file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error: any) {
      setError(error.message || 'Failed to import questions');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Import Questions</h3>
      
      <div className="bg-gray-50 p-4 rounded-md">
        <p className="text-sm text-gray-600 mb-4">
          {gameType === 'linear' ? (
            <>
              <strong>Linear games only accept CSV files.</strong> Upload a CSV file with questions for this game. The file should have the following columns:<br />
              <code>Text,Option1,Option2,Option3,Option4,CorrectOption</code>
            </>
          ) : (
            <>
              <strong>Nested games only accept XLSX files.</strong> Upload an XLSX file with 5 sheets (one per category). Each sheet should have the following columns:<br />
              <code>Text,Option1,Option2,Option3,Option4,CorrectOption</code>
            </>
          )}
        </p>
        
        <div className="flex items-center flex-wrap gap-3">
          <input
            type="file"
            id="question-file"
            accept={gameType === 'linear' ? '.csv' : '.xlsx'}
            onChange={handleFileChange}
            className="hidden"
          />
          <label 
            htmlFor="question-file" 
            className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Select File
          </label>
          
          <button
            type="button"
            onClick={handleImport}
            disabled={!file || isImporting}
            className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
              !file || isImporting 
                ? 'bg-indigo-300 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {isImporting ? 'Importing...' : 'Import Questions'}
          </button>
        </div>
        
        {file && (
          <p className="mt-2 text-sm text-gray-600">
            Selected file: {file.name}
          </p>
        )}
        
        {error && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}
        
        {importSuccess && (
          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
            Questions imported successfully!
          </div>
        )}
      </div>
      
      <div className="text-sm text-gray-500 mt-2">
        <p className="font-medium">File Format Example:</p>
        {gameType === 'linear' ? (
          <pre className="bg-gray-100 p-2 rounded-md mt-1 overflow-x-auto">
            Text,Option1,Option2,Option3,Option4,CorrectOption<br />
            "What is 2+2?","1","2","3","4","Option4"<br />
            "What color is the sky?","Red","Blue","Green","Yellow","Option2"
          </pre>
        ) : (
          <div className="bg-gray-100 p-2 rounded-md mt-1">
            <p>XLSX file with 5 sheets (one per category)</p>
            <p>Each sheet must follow this format:</p>
            <pre className="overflow-x-auto">
              Text | Option1 | Option2 | Option3 | Option4 | CorrectOption<br />
              -----|---------|---------|---------|---------|-------------<br />
              "Q1" | "A1"    | "A2"    | "A3"    | "A4"    | "Option2"
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}; 