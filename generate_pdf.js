import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const PORT = 8081;
const BASE_URL = `http://localhost:${PORT}`;

const pagesConfig = [
  {
    path: '/',
    name: 'الصفحة الرئيسية',
    annotations: [
      { selector: 'a[href="/kids"] button', text: 'اضغط هنا للذهاب إلى ركن الأطفال واللعب', direction: 'bottom' },
      { selector: 'a[href="/login"] button', text: 'انضم إلينا وأنشئ حسابك مجاناً', direction: 'top' },
      { selector: 'h1', text: 'هنا تجد رسالة المنصة وأهدافها', direction: 'top' },
    ]
  },
  {
    path: '/parent-dashboard',
    name: 'لوحة تحكم الأهل',
    annotations: [
      { selector: 'button:has(svg.lucide-plus)', text: 'أضف بيانات طفلك لمتابعة تقدمه بدقة', direction: 'left' },
      { selector: '.bg-gradient-warm', text: 'تظهر هنا ملفات أطفالك مع ملاحظات حول كل طفل', direction: 'top' },
      { selector: '.bg-card:has(svg.lucide-lightbulb)', text: 'نصائح يومية متجددة لمساعدتك', direction: 'bottom' },
    ]
  },
  {
    path: '/specialists',
    name: 'فريق المتخصصين',
    annotations: [
      { selector: 'button:contains("نطق وتخاطب")', text: 'يمكنك فلترة المتخصصين حسب التخصص المطلوب', direction: 'bottom' },
      { selector: 'button:has(svg.lucide-calendar)', text: 'احجز استشارة مع الخبير الذي تختاره', direction: 'top' },
      { selector: 'button:has(svg.lucide-message-circle)', text: 'اضغط هنا لبدء محادثة مباشرة مع المتخصص', direction: 'left' },
    ]
  },
  {
    path: '/community',
    name: 'مجتمع الدعم',
    annotations: [
      { selector: 'button:has(svg.lucide-sparkles)', text: 'شارك تجربتك وقصتك لإلهام الآخرين', direction: 'bottom' },
      { selector: 'button:has(svg.lucide-heart)', text: 'تفاعل مع قصص الأهالي وأظهر دعمك', direction: 'top' },
    ]
  },
  {
    path: '/kids',
    name: 'ركن الأطفال',
    annotations: [
      { selector: 'button.btn-bounce', text: 'شغّل اللعبة التعليمية الآن ليتفاعل معها طفلك', direction: 'bottom' },
    ]
  },
  {
    path: '/library',
    name: 'مكتبة الإعاقات',
    annotations: [
      { selector: 'button[role="tab"]', text: 'تصفح المقالات حسب نوع الإعاقة (توحد، فرط حركة...)', direction: 'bottom' },
      { selector: 'a:has(svg.lucide-arrow-left)', text: 'اقرأ المقال الشامل لتعرف المزيد', direction: 'top' },
    ]
  },
  {
    path: '/messages',
    name: 'الرسائل',
    annotations: [
      { selector: '.md\\:col-span-1', text: 'قائمة محادثاتك السابقة مع المتخصصين', direction: 'right' },
      { selector: 'input[placeholder="اكتب رسالتك..."]', text: 'اكتب استفسارك هنا واضغط على زر الإرسال', direction: 'top' },
    ]
  }
];

async function run() {
  console.log('Starting Puppeteer...');
  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: { width: 1440, height: 900 }
  });
  const page = await browser.newPage();

  // Set auth local storage to bypass login
  await page.goto(BASE_URL);
  await page.evaluate(() => {
    localStorage.setItem('fake_admin', 'true');
    // Also mock user profile for parent dashboard
    localStorage.setItem('supabase.auth.token', JSON.stringify({
      currentSession: {
        user: { id: 'demo-admin', email: 'admin@admin.com' }
      }
    }));
  });

  const screenshots = [];

  let index = 0;
  for (const pConfig of pagesConfig) {
    console.log(`Navigating to ${pConfig.name}...`);
    await page.goto(BASE_URL + pConfig.path, { waitUntil: 'networkidle0' });

    // Inject styles for annotations
    await page.addStyleTag({
      content: `
        .annotation-overlay {
          position: absolute;
          z-index: 999999;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
        }
        .annotation-text {
          background: #4f46e5; /* Primary color */
          color: white;
          padding: 8px 16px;
          border-radius: 12px;
          font-family: 'Tajawal', sans-serif, system-ui;
          font-weight: bold;
          font-size: 16px;
          text-align: center;
          white-space: nowrap;
          border: 2px solid white;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .annotation-arrow {
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
        }
        .arrow-up { border-bottom: 15px solid #4f46e5; margin-bottom: -2px; }
        .arrow-down { border-top: 15px solid #4f46e5; margin-top: -2px; }
        .arrow-left { border-top: 10px solid transparent; border-bottom: 10px solid transparent; border-right: 15px solid #4f46e5; margin-right: -2px; }
        .arrow-right { border-top: 10px solid transparent; border-bottom: 10px solid transparent; border-left: 15px solid #4f46e5; margin-left: -2px; }
      `
    });

    // Custom helper to find element containing text if selector is text-based
    await page.evaluate((annotations) => {
      // Helper to find element by text
      function getElementByXPath(xpath) {
        return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      }

      annotations.forEach((ann) => {
        let el;
        if (ann.selector.includes(':contains')) {
          const textMatch = ann.selector.match(/:contains\("([^"]+)"\)/);
          const text = textMatch ? textMatch[1] : '';
          const tag = ann.selector.split(':')[0] || '*';
          el = getElementByXPath(`//${tag}[contains(text(), "${text}")]`);
        } else {
          el = document.querySelector(ann.selector);
        }

        if (!el) {
          console.warn('Element not found for annotation:', ann.text);
          return;
        }

        const rect = el.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;

        const overlay = document.createElement('div');
        overlay.className = 'annotation-overlay';
        
        const textBox = document.createElement('div');
        textBox.className = 'annotation-text';
        textBox.textContent = ann.text;
        
        const arrow = document.createElement('div');
        arrow.className = 'annotation-arrow';

        if (ann.direction === 'bottom') {
          arrow.classList.add('arrow-down');
          overlay.appendChild(textBox);
          overlay.appendChild(arrow);
          document.body.appendChild(overlay);
          
          const oRect = overlay.getBoundingClientRect();
          overlay.style.left = `${scrollX + rect.left + rect.width/2 - oRect.width/2}px`;
          overlay.style.top = `${scrollY + rect.top - oRect.height - 10}px`;
        } 
        else if (ann.direction === 'top') {
          arrow.classList.add('arrow-up');
          overlay.appendChild(arrow);
          overlay.appendChild(textBox);
          document.body.appendChild(overlay);
          
          const oRect = overlay.getBoundingClientRect();
          overlay.style.left = `${scrollX + rect.left + rect.width/2 - oRect.width/2}px`;
          overlay.style.top = `${scrollY + rect.bottom + 10}px`;
        }
        else if (ann.direction === 'left') {
          overlay.style.flexDirection = 'row';
          arrow.classList.add('arrow-left');
          overlay.appendChild(arrow);
          overlay.appendChild(textBox);
          document.body.appendChild(overlay);
          
          const oRect = overlay.getBoundingClientRect();
          overlay.style.left = `${scrollX + rect.right + 10}px`;
          overlay.style.top = `${scrollY + rect.top + rect.height/2 - oRect.height/2}px`;
        }
        else if (ann.direction === 'right') {
          overlay.style.flexDirection = 'row';
          arrow.classList.add('arrow-right');
          overlay.appendChild(textBox);
          overlay.appendChild(arrow);
          document.body.appendChild(overlay);
          
          const oRect = overlay.getBoundingClientRect();
          overlay.style.left = `${scrollX + rect.left - oRect.width - 10}px`;
          overlay.style.top = `${scrollY + rect.top + rect.height/2 - oRect.height/2}px`;
        }
      });
    }, pConfig.annotations);

    // Give it a moment to render
    await new Promise(r => setTimeout(r, 1000));

    const shotPath = `shot_${index}.jpeg`;
    await page.screenshot({ path: shotPath, fullPage: true, type: 'jpeg', quality: 80 });
    screenshots.push({ path: shotPath, name: pConfig.name });
    index++;
  }

  // Now compile them into a beautiful HTML and print PDF
  console.log('Compiling PDF...');
  
  let htmlContent = `
  <!DOCTYPE html>
  <html dir="rtl">
  <head>
    <meta charset="UTF-8">
    <title>دليل المستخدم - منصة خطوة</title>
    <style>
      body { margin: 0; padding: 0; background: #f8fafc; font-family: 'Arial', sans-serif; }
      .page { 
        width: 210mm; 
        min-height: 297mm; 
        margin: 0 auto;
        padding: 20mm;
        box-sizing: border-box;
        page-break-after: always;
        text-align: center;
      }
      .cover {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
      }
      h1 { color: #4f46e5; font-size: 48px; margin-bottom: 10px; }
      p.subtitle { color: #64748b; font-size: 24px; }
      .section-title {
        color: #1e293b;
        font-size: 32px;
        margin-bottom: 20px;
        border-bottom: 4px solid #4f46e5;
        display: inline-block;
        padding-bottom: 10px;
      }
      .screenshot {
        max-width: 100%;
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        border: 1px solid #e2e8f0;
      }
    </style>
  </head>
  <body>
    <div class="page cover">
      <h1>دليل المستخدم الشامل</h1>
      <p class="subtitle">منصة خطوة لدعم الأطفال ذوي الاحتياجات الخاصة</p>
    </div>
  `;

  screenshots.forEach((shot) => {
    // Convert image to base64 so it can be embedded directly
    const imgData = fs.readFileSync(shot.path).toString('base64');
    htmlContent += `
    <div class="page">
      <h2 class="section-title">${shot.name}</h2>
      <img class="screenshot" src="data:image/jpeg;base64,${imgData}" />
    </div>
    `;
  });

  htmlContent += `</body></html>`;

  await page.setContent(htmlContent, { waitUntil: 'load', timeout: 60000 });
  await page.pdf({
    path: 'C:/Users/Classic/.gemini/antigravity/brain/caf28e2f-535b-47e6-b2f5-098881d719a9/Kindr_Steps_User_Guide.pdf',
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });

  console.log('PDF Generated Successfully!');
  
  // Cleanup
  screenshots.forEach(s => {
    try { fs.unlinkSync(s.path) } catch(e){}
  });

  await browser.close();
}

run().catch(console.error);
