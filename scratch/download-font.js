const fs = require('fs');
const path = require('path');
const https = require('https');

const fontUrl = 'https://github.com/google/fonts/raw/main/ofl/greatvibes/GreatVibes-Regular.ttf';

function downloadFile(url, dest) {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const file = fs.createWriteStream(dest);
  https.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(() => console.log('Downloaded ' + dest));
    });
  }).on('error', function(err) {
    fs.unlink(dest, () => {});
    console.error('Error downloading ' + dest, err);
  });
}

// Download for main domain and support domain
downloadFile(fontUrl, path.join(__dirname, '../src/lib/assets/GreatVibes.ttf'));
downloadFile(fontUrl, path.join(__dirname, '../supportdomain/src/lib/assets/GreatVibes.ttf'));
