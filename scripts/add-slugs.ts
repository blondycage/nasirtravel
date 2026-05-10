/**
 * One-time script to add slugs to existing tours
 * Run with: node --require dotenv/config -r tsx/cjs scripts/add-slugs.ts
 * Or: tsx scripts/add-slugs.ts (if .env is set up)
 */

// Load environment variables at the very top
import { config } from 'dotenv';
import { join } from 'path';
config({ path: join(process.cwd(), '.env') });

// Now import other modules
import connectDB from '../lib/mongodb';
import Tour from '../lib/models/Tour';
import { slugify, generateUniqueSlug } from '../lib/utils/slugify';

async function addSlugsToTours() {
  try {
    console.log('🔄 Connecting to database...');
    console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);

    await connectDB();
    console.log('✓ Connected to database');

    const tours = await Tour.find({});
    console.log(`Found ${tours.length} tours`);

    const existingSlugs: string[] = [];
    let updated = 0;
    let skipped = 0;

    for (const tour of tours) {
      if (tour.slug) {
        console.log(`⊘ Skipping "${tour.title}" - already has slug: ${tour.slug}`);
        existingSlugs.push(tour.slug);
        skipped++;
        continue;
      }

      const baseSlug = slugify(tour.title);
      const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);

      tour.slug = uniqueSlug;
      existingSlugs.push(uniqueSlug);

      await tour.save();
      console.log(`✓ Updated "${tour.title}" → ${uniqueSlug}`);
      updated++;
    }

    console.log('\n=== Summary ===');
    console.log(`✓ Updated: ${updated} tours`);
    console.log(`⊘ Skipped: ${skipped} tours (already had slugs)`);
    console.log(`✓ Total: ${tours.length} tours`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addSlugsToTours();
