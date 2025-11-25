# Update Data Command

This command guides you through updating the MMA tournament data based on a fight card image or JSON file.

## Task Overview

When the user provides a fight card image or JSON file, extract all fight information and update the appropriate data files in `web/public/data/promotions/{tournament}/` directory.

## Input Methods

You can update data from two sources:

### A. Fight Card Image
Provide a fight card poster/image and Claude will extract the fight information from it.

### B. JSON File
Provide a JSON file with structured fight data in the following format:
```json
{
  "event": {
    "id": "lc27",
    "logo": "LC27",
    "title": "Lion Championship 2025",
    "date": "19:30 | 11.10.2025",
    "location": "Nhà Thi Đấu Tây Hồ | 101 Đường Xuân La, Tây Hồ, Hà Nội",
    "status": "upcoming"
  },
  "fights": [
    {
      "category": "MMA PRO",
      "round": "Trận 9",
      "fighter1": {
        "name": "Fighter Name",
        "weight": "77kg",
        "gender": "Nam",
        "flag": "🇻🇳",
        "winner": false
      },
      "fighter2": {
        "name": "Fighter Name",
        "weight": "77kg",
        "gender": "Nam",
        "flag": "🇻🇳",
        "winner": false
      }
    }
  ]
}
```

## Step-by-Step Process

### 1. Analyze the Input Source

**For Fight Card Image:**
Extract the following information:
- **Event details**: Event number (e.g., LC27, UFC 310), date, time, location
- **Fight categories**: MMA PRO, MMA STRIKING, etc.
- **All fights** with:
  - Round number (e.g., Trận 1, Trận 2, etc.)
  - Fighter names (both fighters)
  - Weight class (e.g., 56kg, 60kg, 77kg)
  - Gender (Nam/Nữ)
  - Country flags
  - Winner indication (if event is completed)

**For JSON File:**
Parse the JSON structure and extract the same information as above.

### 2. Determine Tournament

Identify which tournament the event belongs to:
- **UFC**: Look for UFC branding
- **Lion Championship**: Look for Lion Championship branding and logos

Set the data path accordingly: `web/public/data/ufc/` or `web/public/data/lion/`

### 3. Update events.json

**File**: `web/public/data/{tournament}/events.json`

Add a new event object at the **beginning** of the events array with:

```json
{
  "id": "lc27",  // Event identifier (lowercase)
  "logo": "LC27",  // Display logo text (uppercase)
  "title": "Lion Championship 2025",
  "date": "19:30 | 11.10.2025",  // Time | DD.MM.YYYY format
  "location": "Nhà Thi Đấu Tây Hồ | 101 Đường Xuân La, Tây Hồ, Hà Nội",
  "status": "upcoming",  // or "completed" if results are available
  "fights": [
    {
      "category": "MMA PRO",  // or "MMA STRIKING"
      "matches": [
        {
          "round": "Trận 9",
          "fighter1": {
            "name": "Fighter Name",
            "stats": "Trận 9 | 77kg - Nam",  // Include round, weight, gender
            "flag": "🇻🇳",
            "winner": false  // true if this fighter won, false otherwise
          },
          "fighter2": {
            "name": "Fighter Name",
            "stats": "77kg - Nam",  // No round number for fighter2
            "flag": "🇻🇳",
            "winner": false
          }
        }
      ]
    }
  ]
}
```

**Important notes**:
- Set `status` to `"upcoming"` if no results are available yet
- Set all `winner` fields to `false` for upcoming events
- Group fights by category (MMA PRO, MMA STRIKING)
- Order fights logically within categories

### 4. Update athletes.json

**File**: `web/public/data/{tournament}/athletes.json`

For each fighter in the event:

#### A. Check if fighter already exists
Search the athletes array for an exact name match.

#### B. For NEW fighters:
Add a new athlete object to the end of the athletes array:

```json
{
  "id": 21,  // Next sequential ID
  "name": "Fighter Name",
  "record": "0-0-0",  // Start with 0-0-0 for new fighters
  "nickname": "",
  "division": "flyweight",  // Map weight class to division
  "country": "Vietnam",
  "flag": "🇻🇳",
  "gender": "male"  // or "female" based on fighter's gender (Nam/Nữ)
}
```

**Weight class to division mapping**:
- 56kg → `"flyweight"`
- 60kg → `"featherweight"`
- 66kg → `"welterweight"`
- 77kg → `"middleweight"`
- 84kg → `"light-heavyweight"`
- 93kg+ → `"heavyweight"`

**Gender mapping**:
- Nam → `"male"`
- Nữ → `"female"`

#### C. For EXISTING fighters with results:
If the event status is `"completed"`, update the fighter's record:
- If fighter won: Increment the first number (wins)
- If fighter lost: Increment the second number (losses)
- If draw: Increment the third number (draws)

Example: `"10-4-0"` becomes `"11-4-0"` if the fighter won

### 5. Data Validation

Before completing, verify:
- [ ] All fighters from the fight card are in athletes.json
- [ ] Event ID is unique and follows naming convention
- [ ] Date format is correct: "HH:MM | DD.MM.YYYY"
- [ ] Weight classes are properly mapped to divisions
- [ ] Country flags match the fighter's country
- [ ] JSON syntax is valid (no trailing commas, proper quotes)
- [ ] Fighter records are updated if event is completed

### 6. Run Web Server

After completing all data updates, start the development server to verify the changes:

```bash
cd web && PORT=3000 yarn dev
```

This will:
- Start the Next.js development server on port 3000
- Allow you to preview the updated event and fighter data
- Verify that all changes are displaying correctly in the UI

Access the application at: **http://localhost:3000**

### 7. Create Task List

Always use the TodoWrite tool to track:
1. Extract fight information from fight card image
2. Create new event entry in events.json
3. Add new fighters to athletes.json
4. Update existing fighter records (if event is completed)
5. Run web server on port 3000

## Common Issues and Solutions

### Issue: Fighter name variations
- Some fighters may have slightly different name spellings
- Always check for exact matches first
- If unsure, ask the user to clarify

### Issue: Multiple weight classes for same fighter
- A fighter can compete at different weight classes in different events
- Use the weight class from the current event to determine division
- The fighter's division in athletes.json should reflect their most recent/primary weight class

### Issue: Incomplete fight card information
- If weight class is not visible, ask the user
- If country flag is not clear, use 🇻🇳 (Vietnam) as default for Vietnamese names
- If round number is unclear, number sequentially within each category

## Example Workflow

**User provides fight card image or JSON file:**

1. **Create todo list** using TodoWrite:
   - Extract fight information from fight card/JSON
   - Create new event entry in events.json
   - Add new fighters to athletes.json
   - Update existing fighter records (if applicable)

2. **Analyze input source** and extract:
   - Event: LC27
   - Date: 19:30 | 11.10.2025
   - Location: Nhà Thi Đấu Tây Hồ
   - 9 total fights across MMA PRO and MMA STRIKING categories
   - 18 fighters total with gender information

3. **Update events.json**:
   - Add LC27 event at beginning of events array
   - Set status to "upcoming" or "completed"
   - Add all fights with proper categorization
   - Include gender in stats (e.g., "56kg - Nam" or "56kg - Nữ")

4. **Update athletes.json**:
   - Check existing fighters
   - Add new fighters with sequential IDs
   - Set all records to "0-0-0" for new fighters
   - Map weight classes: 56kg→flyweight, 60kg→featherweight, 77kg→middleweight
   - Map gender: Nam→male, Nữ→female
   - Update records for existing fighters if event is completed

5. **Mark todos as completed** progressively as work is done

## Quick Reference

**Tournament data paths**:
- Lion Championship: `web/public/data/lion/`
- UFC: `web/public/data/ufc/`

**Required files to update**:
- `events.json` - Add new event
- `athletes.json` - Add new fighters or update records

**Event status values**:
- `"upcoming"` - Event hasn't happened yet
- `"completed"` - Event is finished with results

**Fighter record format**: `"wins-losses-draws"`
- Example: `"10-4-0"` means 10 wins, 4 losses, 0 draws