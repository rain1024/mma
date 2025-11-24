import fs from 'fs';
import path from 'path';

const API_BASE_URL = 'http://localhost:4000/api';

function readPromotionFile(promotionId: string): any {
  const filePath = path.join(__dirname, '../../web/public/data/promotions', promotionId, 'promotion.json');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContent);
}

async function createPromotion(promotionData: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/promotions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(promotionData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create promotion: ${JSON.stringify(error)}`);
    }

    const result = await response.json();
    return result.promotion;
  } catch (error) {
    throw error;
  }
}

async function main() {
  try {
    console.log('Creating promotions via REST API...\n');

    // Read promotion data from files
    const lionPromotion = readPromotionFile('lion');
    const ufcPromotion = readPromotionFile('ufc');

    // Create Lion Championship
    console.log('Creating Lion Championship...');
    const lion = await createPromotion(lionPromotion);
    console.log(`✅ Lion Championship created: ${lion.name} (${lion.id}) - ${lion.events.length} events`);

    // Create UFC
    console.log('\nCreating UFC...');
    const ufc = await createPromotion(ufcPromotion);
    console.log(`✅ UFC created: ${ufc.name} (${ufc.id}) - ${ufc.events.length} events`);

    console.log('\n✅ All promotions created successfully!');
  } catch (error) {
    console.error('❌ Error creating promotions:', error);
    process.exit(1);
  }
}

main();
