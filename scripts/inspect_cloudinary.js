const { Buffer } = require('buffer');

const cloudinaryUrl = 'cloudinary://173898426733489:lFLheCqwvTm2GG_tlbkvZNe2cxs@deu7yqrlj';

const parseCloudinaryUrl = (url) => {
  try {
    const parsed = new URL(url);
    return {
      cloudName: parsed.hostname,
      apiKey: parsed.username,
      apiSecret: parsed.password,
    };
  } catch (error) {
    return null;
  }
};

async function run() {
  const parsed = parseCloudinaryUrl(cloudinaryUrl);
  if (!parsed) {
    console.error('Invalid URL');
    return;
  }
  const { cloudName, apiKey, apiSecret } = parsed;
  // Let's fetch both raw and image resource types
  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
  
  for (let resourceType of ['raw', 'image']) {
    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/resources/${resourceType}?max_results=100`;
    try {
      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });
      const data = await res.json();
      console.log(`=== Resource Type: ${resourceType} ===`);
      if (data.resources) {
        console.log(`Found ${data.resources.length} resources`);
        for (let r of data.resources) {
          console.log(` - Public ID: ${r.public_id}, Format: ${r.format || 'none'}, URL: ${r.secure_url}`);
        }
      } else {
        console.log(data);
      }
    } catch (e) {
      console.error(e);
    }
  }
}

run();
