import { NextResponse } from 'next/server';
import { PdfReader } from 'pdfreader';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    
    // Create a promise to handle the asynchronous PDF reading
    const extractText = () => {
      return new Promise((resolve, reject) => {
        const rows = {};
        let lastPage = 0;
        
        new PdfReader().parseBuffer(Buffer.from(buffer), (err, item) => {
          if (err) {
            reject(err);
          } else if (!item) {
            // End of file, compile text from all pages
            const text = Object.keys(rows).sort().map(pageNum => {
              return Object.keys(rows[pageNum]).sort().map(y => rows[pageNum][y]).join('\n');
            }).join('\n');
            resolve(text);
          } else if (item.text) {
            // Accumulate text items into rows object
            const y = item.y || 0;
            const page = item.page || 0;
            
            if (page > lastPage) {
              lastPage = page;
            }
            
            rows[page] = rows[page] || {};
            rows[page][y] = rows[page][y] || [];
            
            if (Array.isArray(rows[page][y])) {
              rows[page][y].push(item.text);
            } else {
              rows[page][y] = [rows[page][y], item.text];
            }
            
            rows[page][y] = rows[page][y].join(' ');
          }
        });
      });
    };

    const text = await extractText();
    return NextResponse.json({ text });
    
  } catch (error) {
    console.error('PDF processing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
