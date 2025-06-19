import React from 'react';
import { GameCreationForm } from '@/components/admin/GameCreationForm';
import { strapiApi } from '@/lib/strapiApi';
import { redirect } from 'next/navigation';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { QuestionImporter } from '@/components/admin/QuestionImporter';

export default function CreateGamePage() {
  async function handleSubmit(formData: FormData) {
    'use server';
    
    // Parse the JSON data from the form
    const jsonData = formData.get('data');
    if (!jsonData) {
      throw new Error('No data provided');
    }
    
    const data = JSON.parse(jsonData as string);
    
    // Create the game
    const response = await strapiApi.createGame(data, formData);
    
    // Redirect to the game detail page
    redirect(`/admin/games/${response.data.id}`);
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Game</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <GameCreationForm onSubmit={handleSubmit} />
      </div>
      
      <div className="mt-6">
        <p className="text-gray-600 text-sm">
          After creating the game, you will be redirected to the game detail page 
          where you can manage categories (for nested games) and import questions.
        </p>
      </div>
    </div>
  );
} 