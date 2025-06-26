# Game Type Implementation Summary

## Overview
This implementation adds support for two distinct game types:
1. **Linear Games** - Uses CSV file format for questions import
2. **Nested Games** - Uses XLSX file format with exactly 5 sheets (one per category)

## Key Components

### Backend Changes
1. **Game Schema Update**
   - Updated the game schema to include a `type` field with values `linear` or `nested`
   - Modified the existing schema to support the new game types

2. **API Controllers**
   - Added `createCategories` method to handle batch creation of categories for nested games
   - Added `createQuestions` method to handle batch import of questions for both game types

3. **API Routes**
   - Added `/games/:id/categories/batch` route for batch creating categories
   - Added `/games/:id/questions/batch` route for batch importing questions

### Frontend Changes
1. **Validation Utilities**
   - Created `validateQuestionFile` to validate file formats based on game type
   - Added `validateQuestionSheet` to validate XLSX sheet structure
   - Added `validateNestedGameSheets` to validate that XLSX files have exactly 5 sheets

2. **Game Creation Form**
   - Enhanced form to select between Linear and Nested game types
   - Added file format validation based on selected game type
   - Added clear instructions for required file formats

3. **Category Management**
   - Created `CategoryManager` component for managing nested game categories
   - Implemented UI for adding, editing, and removing categories
   - Added validation to ensure exactly 5 categories for nested games

4. **Question Import**
   - Created `QuestionImporter` component for importing questions
   - Added support for CSV import for Linear games
   - Added support for XLSX import for Nested games with category mapping

5. **API Integration**
   - Added methods to `strapiApi` for creating categories and importing questions
   - Created API endpoints for game category and question management
   - Implemented proper error handling and validation

## File Format Specifications

### Linear Games (CSV)
```csv
question,option1,option2,option3,option4,option5,correctAnswer
"What is 2+2?","1","2","3","4","5","4"
"What color is the sky?","Red","Blue","Green","Yellow","Purple","Blue"
```

### Nested Games (XLSX)
- Must contain exactly 5 sheets (one per category)
- Each sheet must follow this format:

```
Sheet 1-5:
| question | option1 | option2 | option3 | option4 | option5 | correctAnswer |
|----------|---------|---------|---------|---------|---------|---------------|
```

## User Experience
1. **Game Creation**
   - User selects game type (Linear or Nested)
   - User provides game details and thumbnail
   - User is redirected to game detail page after creation

2. **Category Management (Nested Games)**
   - User can manage the 5 required categories for nested games
   - UI provides clear feedback about category requirements

3. **Question Import**
   - User uploads questions file in the appropriate format
   - System validates the file format based on game type
   - System processes the file and imports questions
   - UI provides feedback about import success or errors

## Testing
1. **Game Creation**
   - Test Linear game creation with CSV file
   - Test Nested game creation with XLSX file
   - Verify thumbnail upload
   - Check validation messages for incorrect file formats

2. **Category Management**
   - Test category creation for nested games
   - Verify 5-category requirement
   - Test category editing and deletion

3. **Question Import**
   - Test CSV upload for Linear games
   - Test XLSX upload for Nested games
   - Verify sheet processing and category assignment
   - Test error handling for invalid files 