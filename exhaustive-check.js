require('dotenv').config();
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_KEY });
const dbId = process.env.NOTION_DATABASE_ID;

async function exhaustiveCheck() {
    console.log(`Exhaustive check for Database: ${dbId}`);
    try {
        const rawId = process.env.NOTION_DATABASE_ID;
        // Format to 8-4-4-4-12
        const dbId = rawId.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
        console.log('Retrieving database with ID:', dbId);
        const response = await notion.databases.retrieve({ database_id: dbId });

        console.log('--- Database Metadata ---');
        console.log('Object:', response.object);
        console.log('ID:', response.id);
        console.log('Has Properties:', !!response.properties);

        if (response.properties) {
            console.log('Properties count:', Object.keys(response.properties).length);
            for (const [key, value] of Object.entries(response.properties)) {
                console.log(`- Property: "${key}" (Type: ${value.type})`);
            }
        } else {
            console.log('❌ CRITICAL: properties object is MISSING in response.');
            console.log('Full JSON Response:', JSON.stringify(response, null, 2));
        }

    } catch (error) {
        console.error('API Error:', error.body || error.message);
    }
}

exhaustiveCheck();
