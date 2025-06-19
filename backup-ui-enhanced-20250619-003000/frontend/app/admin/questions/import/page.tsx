'use client'

import { useState, useEffect } from 'react';
import { strapiApi } from '@/lib/strapiApi';
import compatToast from '@/lib/notificationManager';
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { Game } from '@/types';

export default function BulkImportQuestions() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [selectedGameType, setSelectedGameType] = useState<'straight' | 'nested'>('straight');
  const [uploadResults, setUploadResults] = useState<{
    total: number;
    successful: number;
    failed: number;
    errors: string[];
  } | null>(null);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    setIsLoading(true);
    try {
      const response = await strapiApi.getAdminGames();
      setGames(response.data || []);
    } catch (error) {
      console.error('Error fetching games:', error);
      compatToast.error('Failed to load games');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const gameId = e.target.value;
    setSelectedGame(gameId);
    
    // Find the selected game and set its type
    const game = games.find(g => g.id === gameId);
    if (game) {
      setSelectedGameType(game.type as 'straight' | 'nested');
      // Clear any selected file when changing games
      setFile(null);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    
    // Check if the file type matches the game type
    if (selectedFile) {
      if (selectedGameType === 'straight' && selectedFile.type === 'text/csv') {
        setFile(selectedFile);
        setUploadResults(null);
      } else if (selectedGameType === 'nested' && 
                (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                 selectedFile.type === 'application/vnd.ms-excel')) {
        setFile(selectedFile);
        setUploadResults(null);
      } else {
        compatToast.error(`Please select a ${selectedGameType === 'straight' ? 'CSV' : 'XLSX'} file for ${selectedGameType} game type`);
        setFile(null);
      }
    }
  };

  const handleImport = async () => {
    if (!selectedGame) {
      compatToast.error('Please select a game first');
      return;
    }
    
    if (!file) {
      compatToast.error(`Please select a ${selectedGameType === 'straight' ? 'CSV' : 'XLSX'} file to import`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('gameId', selectedGame);
      formData.append('gameType', selectedGameType);

      // Upload file
      const response = await strapiApi.post('/api/questions/import', formData);

      // Handle response
      setUploadResults({
        total: response.data.total || 0,
        successful: response.data.successful || 0,
        failed: response.data.failed || 0,
        errors: response.data.errors || [],
      });

      if (response.data.successful > 0) {
        compatToast.success(`Successfully imported ${response.data.successful} questions`);
      } else {
        compatToast.error('No questions were imported');
      }
    } catch (error) {
      console.error('Error importing questions:', error);
      compatToast.error('Failed to import questions. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Download the appropriate template based on game type
    const templateUrl = selectedGameType === 'straight' 
      ? '/templates/questions-template.csv'
      : '/templates/nested-questions-template.xlsx';
    
    window.open(templateUrl, '_blank');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Bulk Import Questions</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Instructions</h2>
          <p className="text-gray-600 mb-4">
            First select a game, then upload a {selectedGameType === 'straight' ? 'CSV' : 'XLSX'} file containing questions to import in bulk.
          </p>
          <button 
            onClick={handleDownloadTemplate}
            className="flex items-center text-blue-600 hover:text-blue-800"
            disabled={!selectedGame}
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Download {selectedGameType === 'straight' ? 'CSV' : 'XLSX'} Template
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Game
          </label>
          <select
            value={selectedGame}
            onChange={handleGameChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled={isLoading || isUploading}
          >
            <option value="">-- Select a game --</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name} ({game.type})
              </option>
            ))}
          </select>
          {isLoading && (
            <p className="mt-2 text-sm text-gray-500">Loading games...</p>
          )}
        </div>

        {selectedGame && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select {selectedGameType === 'straight' ? 'CSV' : 'XLSX'} File
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept={selectedGameType === 'straight' ? '.csv' : '.xlsx,.xls'}
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={isUploading || !selectedGame}
              />
              <button
                onClick={handleImport}
                disabled={!file || isUploading || !selectedGame}
                className={`flex items-center px-4 py-2 rounded font-medium ${
                  !file || isUploading || !selectedGame
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                    Import Questions
                  </>
                )}
              </button>
            </div>
            {file && (
              <p className="mt-2 text-sm text-gray-500">
                Selected file: {file.name} ({Math.round(file.size / 1024)} KB)
              </p>
            )}
          </div>
        )}

        {isUploading && (
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-gray-600 text-center">
              {uploadProgress}% Uploaded
            </p>
          </div>
        )}

        {uploadResults && (
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Import Results</h3>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{uploadResults.total}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-sm text-green-600">Successful</p>
                <p className="text-2xl font-bold text-green-700">{uploadResults.successful}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-sm text-red-600">Failed</p>
                <p className="text-2xl font-bold text-red-700">{uploadResults.failed}</p>
              </div>
            </div>

            {uploadResults.errors.length > 0 && (
              <div>
                <h4 className="text-md font-medium mb-2">Errors</h4>
                <div className="bg-red-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                  <ul className="list-disc list-inside space-y-1">
                    {uploadResults.errors.map((error, index) => (
                      <li key={index} className="text-sm text-red-600">{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 