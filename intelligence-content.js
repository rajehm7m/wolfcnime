// Atmospheric role introductions. Edit the copy here as server lore develops.
window.MT_DOSSIERS = [
  {name:'IAA', code:'F-0', image:'abdulsamad.webp', tone:'#ff973f',
    title:'المعلومة تسبق كل خطوة.', unit:'الاستخبارات', classification:'RESTRICTED / 01',
    intro:'في مدينة تتقاطع فيها الأسرار، لا تكفي رؤية ما يحدث. الفارق هو أن تفهم ما لم يُقل بعد.',
    brief:['اقرأ ما بين السطور.','اتبع الأثر، ولا تترك أثرك.','تذكّر كل شيء.'],
    words:['المعلومة','المراقبة','السرّ'], quote:'TRUST NO ONE. REMEMBER EVERYTHING.'},
  {name:'MARINES', code:'P-1', image:'mhna.webp', tone:'#e8b66b',
    title:'الحضور الذي يغيّر الموازين.', unit:'المارينز', classification:'RESTRICTED / 02',
    intro:'حين تصبح المدينة على حافة القرار، يتقدّم من يعرف معنى الانضباط. لكل خطوة وزن، ولكل قرار أثر.',
    brief:['ثبات تحت الضغط.','القرار قبل الحركة.','القوة مسؤولية.'],
    words:['الانضباط','القيادة','القوة'], quote:'POWER ISN’T GIVEN. IT’S TAKEN.'},
  {name:'S.W.A.T', code:'P-2', image:'vladi.webp', tone:'#80c4d1',
    title:'كل ثانية تصنع الفارق.', unit:'القوات الخاصة', classification:'RESTRICTED / 03',
    intro:'تركيز لا يتشتّت، وعين تقرأ التفاصيل. في اللحظة الحاسمة، تتحوّل الدقّة إلى الخطوة التي تغيّر المشهد.',
    brief:['راقب المشهد كاملًا.','تحرّك بدقّة.','احمِ المدينة.'],
    words:['الدقّة','الاستجابة','الحماية'], quote:'THE CITY WATCHES. THE CITY REMEMBERS.'},
  {name:'ANONYMOUS', code:'X-?', image:'Snake.webp', tone:'#b9c687',
    title:'خلف الإشارة… حكاية أخرى.', unit:'هوية غير معلنة', classification:'IDENTITY / UNKNOWN',
    intro:'اسم لا يكشف صاحبه، وأثر يترك أسئلة أكثر من الإجابات. هنا يبدأ الغموض من القرار الذي لم يتوقّعه أحد.',
    brief:['راقب الإشارة.','فكّ الرمز.','اكتب احتمالك القادم.'],
    words:['الهوية','الإشارة','الاحتمال'], quote:'ONE DECISION CAN CHANGE EVERYTHING.'}
];

// Awaiting the owner's confirmed locations. x/y are percentages of the supplied
// map image, measured from its top-left corner. No invented headquarters.
// Example shape: {id, name, label, x, y, description, image?}.
window.MT_MAP_LOCATIONS = [];
