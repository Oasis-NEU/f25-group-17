import courses from './courseMeetingTimes.json' with { type: 'json' };
import { supabase } from '../../supabase/lib/supabase.ts';

async function insertClasses() {
  const rows = [];

  // Collect every record (no filtering)
  for(const course of courses) {
    for(const meeting of course.meetingTimes) {
      // Pad hour and minute with leading zeros
      const hour = String(meeting.beginTime.hour).padStart(2, '0');
      const minute = String(meeting.beginTime.minute).padStart(2, '0');
      const endHour = String(meeting.endTime.hour).padStart(2, '0');
      const endMinute = String(meeting.endTime.minute).padStart(2, '0');
      
      const start = `${hour}:${minute}:00`;
      const end = `${endHour}:${endMinute}:00`;

      rows.push({
        crn: course.CRN,
        courseName: course.courseName,
        beginTime: start,
        endTime: end,
        building: meeting.building,
        roomNumber: meeting.room,
        monday: meeting.monday || false,
        tuesday: meeting.tuesday || false,
        wednesday: meeting.wednesday || false,
        thursday: meeting.thursday || false,
        friday: meeting.friday || false,
      });
    }
  }

  console.log(`📊 Total rows to insert: ${rows.length}`);
  console.log(`📋 Sample row:`, rows[0]);

  // ⚡ Insert everything in batches to avoid payload limits
  const chunkSize = 500; // Reduced from 1000 to avoid payload limits
  let successCount = 0;
  let errorCount = 0;

  for(let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    console.log(`⏳ Inserting batch ${Math.ceil((i + 1) / chunkSize)} of ${Math.ceil(rows.length / chunkSize)} (rows ${i + 1}-${Math.min(i + chunkSize, rows.length)})...`);
    
    const { data, error } = await supabase.from('ClassTime_Data').insert(chunk);
    
    if(error) {
      console.error(`❌ Error inserting rows ${i + 1}-${i + chunk.length}:`, error.message);
      console.error(`Error details:`, error);
      errorCount++;
    } else {
      console.log(`✅ Successfully inserted rows ${i + 1}-${Math.min(i + chunkSize, rows.length)}`);
      successCount++;
    }
    
    // Add delay between batches to avoid rate limiting
    if(i + chunkSize < rows.length) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    }
  }

  console.log('');
  console.log('═════════════════════════════════');
  console.log(`🎯 Insert Complete!`);
  console.log(`✅ Successful batches: ${successCount}`);
  console.log(`❌ Failed batches: ${errorCount}`);
  console.log(`📊 Total rows attempted: ${rows.length}`);
  console.log('═════════════════════════════════');
}

async function clearDuplicates() {
  console.log('🧹 Checking for duplicates...');
  
  // First, get all records
  const { data: allRecords, error: fetchError } = await supabase
    .from('ClassTime_Data')
    .select('*');
  
  if(fetchError) {
    console.error('❌ Error fetching records:', fetchError.message);
    return;
  }
  
  console.log(`📊 Total records in database: ${allRecords.length}`);
  
  // Find duplicates (same building, room, time, day)
  const seen = new Map();
  const duplicateIds = [];
  
  for(const record of allRecords) {
    const key = `${record.building}|${record.roomNumber}|${record.beginTime}|${record.endTime}|${record.monday}|${record.tuesday}|${record.wednesday}|${record.thursday}|${record.friday}`;
    
    if(seen.has(key)) {
      duplicateIds.push(record.id);
    } else {
      seen.set(key, record.id);
    }
  }
  
  if(duplicateIds.length > 0) {
    console.log(`🔄 Found ${duplicateIds.length} duplicates, removing...`);
    
    // Delete duplicates in batches
    const batchSize = 500;
    for(let i = 0; i < duplicateIds.length; i += batchSize) {
      const batch = duplicateIds.slice(i, i + batchSize);
      const { error: deleteError } = await supabase
        .from('ClassTime_Data')
        .delete()
        .in('id', batch);
      
      if(deleteError) {
        console.error(`❌ Error deleting duplicates:`, deleteError.message);
      } else {
        console.log(`✅ Deleted ${batch.length} duplicate records`);
      }
    }
  } else {
    console.log('✅ No duplicates found');
  }
}

insertClasses()
  .then(() => {
    console.log('✅ Data insertion complete!');
    console.log('🧹 Now cleaning duplicates...');
    return clearDuplicates();
  })
  .then(() => console.log('✅ All done!'))
  .catch((err) => console.error('❌ Unexpected error:', err));