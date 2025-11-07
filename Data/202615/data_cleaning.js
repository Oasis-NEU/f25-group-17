import courses from './courseMeetingTimes.json' with { type: 'json' };
import { supabase } from '../../supabase/lib/supabase.ts';

async function insertClasses() {
  const rows = [];

  // Collect every record (no filtering)
  for (const course of courses) {
    for (const meeting of course.meetingTimes) {
      const start = `${meeting.beginTime.hour}:${meeting.beginTime.minute}:00`;
      const end = `${meeting.endTime.hour}:${meeting.endTime.minute}:00`;

      rows.push({
        crn: course.CRN,
        courseName: course.courseName,
        beginTime: start,
        endTime: end,
        building: meeting.building,
        roomNumber: meeting.room,
        monday: meeting.monday,
        tuesday: meeting.tuesday,
        wednesday: meeting.wednesday,
        thursday: meeting.thursday,
        friday: meeting.friday
      });
    }
  }

  console.log(`Preparing to insert ${rows.length} total rows...`);

  // ⚡ Insert everything in batches to avoid payload limits
  const chunkSize = 1000;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from('ClassTime_Data').insert(chunk);
    if (error) {
      console.error(`❌ Error inserting rows ${i + 1}-${i + chunk.length}:`, error.message);
    } else {
      console.log(`✅ Inserted rows ${i + 1}-${i + chunk.length}`);
    }
  }

  console.log('🎯 All data pushed to DB — clean duplicates later.');
}

insertClasses()
  .then(() => console.log('✅ Done!'))
  .catch((err) => console.error('Unexpected error:', err));