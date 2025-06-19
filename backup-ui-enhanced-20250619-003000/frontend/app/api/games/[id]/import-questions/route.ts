import { NextRequest, NextResponse } from 'next/server';
import { validateQuestionFile, validateQuestionSheet, validateNestedGameSheets } from '@/utils/validation';
import { strapiApi } from '@/lib/strapiApi';
import * as XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id;
    
    // Get the game to determine its type
    const gameResponse = await strapiApi.getGame(gameId);
    if (!gameResponse?.data) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    const game = gameResponse.data;
    const gameType = game.attributes?.type || 'linear';
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    // Validate file format
    try {
      await validateQuestionFile(file, gameType);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    // Process file based on game type
    if (gameType.toLowerCase() === 'linear') {
      return await processLinearGame(gameId, file);
    } else if (gameType.toLowerCase() === 'nested') {
      return await processNestedGame(gameId, file, game);
    } else {
      return NextResponse.json(
        { error: `Unsupported game type: ${gameType}` }, 
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error importing questions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to import questions' }, 
      { status: 500 }
    );
  }
}

/**
 * Process CSV file for linear games
 */
async function processLinearGame(gameId: string, file: File) {
  // Convert file to buffer
  const buffer = await file.arrayBuffer();
  const fileContent = Buffer.from(buffer);
  
  try {
    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    if (!records || !records.length) {
      return NextResponse.json(
        { error: 'No valid questions found in CSV file' }, 
        { status: 400 }
      );
    }
    
    // Map to question format
    const questions = records.map((row: any) => ({
      question: row.question,
      option1: row.option1,
      option2: row.option2,
      option3: row.option3,
      option4: row.option4,
      option5: row.option5 || null,
      correctAnswer: row.correctAnswer,
      game: gameId,
      isActive: true
    }));
    
    // Create questions in Strapi
    const result = await strapiApi.importQuestions(gameId, questions);
    
    return NextResponse.json({
      success: true,
      questionsImported: questions.length,
      result
    });
  } catch (error: any) {
    console.error('Error processing CSV:', error);
    return NextResponse.json(
      { error: 'Failed to process CSV file: ' + error.message }, 
      { status: 500 }
    );
  }
}

/**
 * Process XLSX file for nested games
 */
async function processNestedGame(gameId: string, file: File, game: any) {
  // Convert file to buffer
  const buffer = await file.arrayBuffer();
  
  try {
    // Read XLSX file
    const workbook = XLSX.read(buffer, { type: 'array' });
    
    // Validate sheet count
    if (!validateNestedGameSheets(workbook.SheetNames)) {
      return NextResponse.json(
        { error: 'Nested games require exactly 5 sheets, one for each category' }, 
        { status: 400 }
      );
    }
    
    // Get game categories
    const categories = game.attributes?.categories?.data || [];
    if (categories.length < 5) {
      return NextResponse.json(
        { error: 'Game does not have enough categories (5 required)' }, 
        { status: 400 }
      );
    }
    
    const allQuestions: any[] = [];
    
    // Process each sheet
    for (let i = 0; i < 5; i++) {
      const sheetName = workbook.SheetNames[i];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      // Validate sheet format
      if (!validateQuestionSheet(data)) {
        return NextResponse.json(
          { error: `Invalid format in sheet "${sheetName}" (sheet ${i + 1})` }, 
          { status: 400 }
        );
      }
      
      // Map to question format with category
      const categoryId = categories[i].id;
      const sheetQuestions = data.map((row: any) => ({
        question: row.question,
        option1: row.option1,
        option2: row.option2,
        option3: row.option3,
        option4: row.option4,
        option5: row.option5 || null,
        correctAnswer: row.correctAnswer,
        game: gameId,
        category: categoryId,
        isActive: true
      }));
      
      allQuestions.push(...sheetQuestions);
    }
    
    // Create questions in Strapi
    const result = await strapiApi.importQuestions(gameId, allQuestions);
    
    return NextResponse.json({
      success: true,
      questionsImported: allQuestions.length,
      questionsPerCategory: allQuestions.length / 5,
      result
    });
  } catch (error: any) {
    console.error('Error processing XLSX:', error);
    return NextResponse.json(
      { error: 'Failed to process XLSX file: ' + error.message }, 
      { status: 500 }
    );
  }
} 