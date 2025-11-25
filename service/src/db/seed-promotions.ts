import { PromotionModel } from '../models/promotion.model';
import fs from 'fs';
import path from 'path';

function readPromotionFile(promotionId: string): any {
  const filePath = path.join(__dirname, '../../../web/public/data/promotions', promotionId, 'promotion.json');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContent);
}

function seedPromotions() {
  try {
    console.log('Starting promotions seed...');

    // Read promotion data from web/public/data
    const lionPromotion = readPromotionFile('lion');
    const ufcPromotion = readPromotionFile('ufc');

    // Create Lion Championship promotion
    try {
      const existingLion = PromotionModel.getById('lion');
      if (existingLion) {
        console.log('Lion Championship already exists, updating...');
        PromotionModel.update('lion', lionPromotion);
      } else {
        console.log('Creating Lion Championship...');
        PromotionModel.create(lionPromotion);
      }
      console.log('✅ Lion Championship seeded successfully');
    } catch (error) {
      console.error('Error seeding Lion Championship:', error);
    }

    // Create UFC promotion
    try {
      const existingUfc = PromotionModel.getById('ufc');
      if (existingUfc) {
        console.log('UFC already exists, updating...');
        PromotionModel.update('ufc', ufcPromotion);
      } else {
        console.log('Creating UFC...');
        PromotionModel.create(ufcPromotion);
      }
      console.log('✅ UFC seeded successfully');
    } catch (error) {
      console.error('Error seeding UFC:', error);
    }

    console.log('\n✅ Promotions seed completed successfully');

    // Display created promotions
    const allPromotions = PromotionModel.getAll();
    console.log('\nPromotions in database:');
    allPromotions.forEach(promo => {
      console.log(`  - ${promo.name} (${promo.id})`);
    });
  } catch (error) {
    console.error('❌ Error seeding promotions:', error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedPromotions();
  process.exit(0);
}

export { seedPromotions };
