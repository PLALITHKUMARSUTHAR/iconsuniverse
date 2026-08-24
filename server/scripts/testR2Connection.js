require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { ListObjectsV2Command, PutObjectCommand } = require('@aws-sdk/client-s3');
const r2Client = require('../config/r2');

async function testR2() {
  const bucket = process.env.R2_BUCKET_NAME || 'iconsuniverse-assets';
  console.log(`[R2 Test] Testing connection to bucket: "${bucket}"...`);

  try {
    const listCmd = new ListObjectsV2Command({
      Bucket: bucket,
      MaxKeys: 5,
    });
    const res = await r2Client.send(listCmd);
    console.log(`[R2 Test] SUCCESS! Connected to Cloudflare R2 bucket: "${bucket}"`);
    console.log(`[R2 Test] Current object count in sample: ${res.KeyCount || 0}`);
  } catch (err) {
    console.error(`[R2 Test] FAILED:`, err.message);
    if (err.name === 'NoSuchBucket') {
      console.error(`[R2 Test] The bucket name "${bucket}" was not found in your Cloudflare account. Please check your bucket name in Cloudflare R2 dashboard.`);
    }
  }
}

testR2();
