import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import fs from 'fs';

// 1. List your static routes
const links = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/login', changefreq: 'monthly', priority: 0.3 },
  { url: '/register', changefreq: 'monthly', priority: 0.3 },
  { url: '/categories', changefreq: 'weekly', priority: 0.8 },
];

// 2. Fetch your dynamic data from your API
async function generate() {
  try {
    // Replace with your actual backend URL
    // 1. Fetch from your backend (use localhost if testing locally)
    const response = await fetch("https://zingfashion.com/products/all-products/");
    const data = await response.json(); 

    // 2. Access the products array from the response object
    // Based on your snippet: { products: [...] }
    const products = data.products || [];

    products.forEach(product => {
      // 3. Extract the _id field specifically
      if (product._id) {
        links.push({ 
          url: `/productdetailspage/${product._id}`, 
          changefreq: 'weekly', 
          priority: 0.7 
        });
      }
    });

    // 3. Create the XML stream
    const stream = new SitemapStream({ hostname: 'https://zingfashion.com/' });
    const xml = await streamToPromise(Readable.from(links).pipe(stream)).then((data) =>
      data.toString()
    );

    // 4. Write to the public folder
    fs.writeFileSync('./public/sitemap.xml', xml);
    console.log('✅ Sitemap generated successfully!');
  } catch (e) {
    console.error(e);
  }
}

generate();