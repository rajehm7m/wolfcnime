/* Edit each memory here. Blocks support paragraphs, headings, images and videos.
   Examples:
   { type: 'text', text: 'اكتب تفاصيل الحدث هنا' },
   { type: 'heading', text: 'عنوان داخل الذكرى' },
   { type: 'image', src: 'assets/images/my-photo.webp', alt: 'وصف الصورة', caption: 'تعليق الصورة' },
   { type: 'video', src: 'assets/images/my-video.mp4', poster: 'assets/images/my-photo.webp', caption: 'عنوان المقطع' }
   Add blocks to the matching event below; the window renders them in that order.
*/
window.MT_MEMORIES = [
  { id: 'mtz-end', title: 'MTZ END', label: '001 / THE END OF AN ERA', cover: 'assets/images/memory-mtz-end.webp', blocks: [] },
  { id: 'killer-abdulsamad', title: 'الحرب بين كيلر وعبد الصمد', label: '002 / THE BATTLE OF ROXWOOD', cover: 'assets/images/memory-killer-abdulsamad.webp', blocks: [
  {
    "type": "text",
    "text": "عملية عسكرية معقدة يقودها عبد الصمد ضد كيلر تشاندلر لاستعادة ثلاثة رهائن من ضباط القوات (عبد الله الشمري، جاكس سلي، وفهد المطيري). يمكن تلخيص مجريات هذه الحرب في النقاط التالية:"
  },
  {
    "type": "heading",
    "text": "1. التخطيط والمواجهة"
  },
  {
    "type": "text",
    "text": "بدأت بتعطيل أنظمة الدفاع الجوي التابعة للعدو، تلاها سلسلة من المفاوضات المتوترة بين عبد الصمد وكيلر الذي طالب بمبالغ مالية كبيرة (10 مليون) والسيطرة على جزيرة مقابل الإفراج عن الرهائن. تميزت هذه المرحلة بمحاولات كيلر المستمرة للتلاعب والمراوغة."
  },
  {
    "type": "heading",
    "text": "2. العمليات العسكرية المكثفة"
  },
  {
    "type": "text",
    "text": "تصاعدت حدة الحرب بانطلاق هجوم شامل شمل دبابات ومروحيات (الهايدرا والاباتشي) في موقع الجسر. تم تدمير أسطول كيلر الميداني واستنزاف عتاده بالكامل، مع التركيز على تدمير الدبابات والوحدات الجوية للعدو لمنع أي محاولة هروب."
  },
  {
    "type": "heading",
    "text": "3. مرحلة التفاوض الحاسمة والتبادل"
  },
  {
    "type": "text",
    "text": "بعد قرار التصويت بتبادل الرهائن في نفس اليوم، توجهت القوات إلى مطار ساندي. تمت عملية التبادل تحت مراقبة أمنية دقيقة وتهديد مباشر من عبد الصمد باستهداف كيلر في حال حدوث أي غدر. نجحت المهمة في استعادة الرهائن الثلاثة."
  },
  {
    "type": "heading",
    "text": "4. ما بعد الحرب والتحقيقات"
  },
  {
    "type": "text",
    "text": "كشفت التحقيقات عن ثغرات أمنية وتصرفات فردية من بعض الضباط (جاكس وفهد) أدت إلى اختطافهم، مما دفع القادة لاتخاذ إجراءات صارمة شملت إيقافهم عن العمل وإحالتهم للتحقيق. انتهت الحرب بانتصار تكتيكي، لكن بوعود من عبد الصمد بمواصلة البحث عن كيلر الغدار."
  }
] },
  { id: 'final-war', title: 'الحرب الأخيرة', label: '003 / THE FINAL WAR', cover: 'assets/images/memory-final-war.webp', blocks: [] },
  { id: 'formula-founding-day', title: 'الفورميلا — يوم التأسيس', label: '004 / FOUNDING DAY', cover: 'assets/images/memory-formula-founding-day.webp', blocks: [] }
];
