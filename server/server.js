require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Client } = require('@notionhq/client');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Initialize Clients
const notion = new Client({ auth: process.env.NOTION_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);

// Helper: Clean Notion ID
function getCleanNotionId(id) {
    if (!id) return null;
    const match = id.match(/([a-f0-9]{32})$/i);
    return match ? match[1] : id;
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Submit Enrollment Endpoint
app.post('/api/enroll', async (req, res) => {
    try {
        const { fullName, email, phone, interest, resumeLink } = req.body;
        const databaseId = getCleanNotionId(process.env.NOTION_DATABASE_ID);

        // Basic Validation
        if (!fullName || !email || !interest) {
            return res.status(400).json({ success: false, message: 'Missing required fields.' });
        }
        if (!databaseId) {
            console.error('Database ID is missing or invalid.');
            return res.status(500).json({ success: false, message: 'Server configuration error: Notion Database ID missing.' });
        }

        console.log(`Received enrollment for: ${email}`);
        console.log(`Using Database ID: ${databaseId}`);

        // 1. Add to Notion
        try {
            console.log('Attempting to create Notion page...');
            const notionResponse = await notion.pages.create({
                parent: { database_id: databaseId },
                properties: {
                    'Name': {
                        title: [
                            { text: { content: fullName } }
                        ]
                    },
                    'Email': {
                        email: email
                    },
                    'Phone': {
                        phone_number: phone
                    },
                    'Interest': {
                        select: {
                            name: interest
                        }
                    },
                    'Resume': {
                        url: resumeLink || null
                    }
                }
            });
            console.log('Notion page created successfully:', notionResponse.id);
        } catch (notionError) {
            console.error('Notion API Error:', notionError.body || notionError);
            throw new Error(`Notion Error: ${notionError.message}`);
        }

        // 2. Send Admin Email
        if (process.env.ADMIN_EMAIL) {
            try {
                console.log('Sending Admin Email...');
                await resend.emails.send({
                    from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
                    to: process.env.ADMIN_EMAIL,
                    subject: `New Internship Application: ${fullName}`,
                    html: `
                        <h1>New Enrollment for ApheZis Tech</h1>
                        <p><strong>Name:</strong> ${fullName}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Interest:</strong> ${interest}</p>
                        <p><strong>Resume:</strong> <a href="${resumeLink}">${resumeLink}</a></p>
                        <p>Check Notion for full details.</p>
                    `
                });
                console.log('Admin email sent.');
            } catch (emailError) {
                console.error('Resend Admin Email Error:', emailError);
                // Don't fail the whole request if email fails, but log it.
            }
        }

        // 3. Send Candidate Email
        try {
            console.log('Sending Candidate Email...');
            await resend.emails.send({
                from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
                to: email,
                subject: 'Application Received - ApheZis Tech Internship',
                html: `
                    <div style="font-family: sans-serif; color: #333;">
                        <h1>Welcome to the Future, ${fullName.split(' ')[0]}!</h1>
                        <p>We have successfully received your application for the <strong>ApheZis Tech Internship Program</strong>.</p>
                        <p>Our team is currently reviewing your profile. Here's what we have:</p>
                        <ul>
                            <li><strong>Track:</strong> ${interest}</li>
                            <li><strong>Portfolio/Resume:</strong> <a href="${resumeLink}">Link</a></li>
                        </ul>
                        <p>We will be in touch shortly.</p>
                        <br>
                        <p>Best,</p>
                        <p><strong>The ApheZis Tech Team</strong></p>
                        <p style="font-size: 12px; color: #888;">24P7+C3V, Kigali (ADEPR Nyakabanda)</p>
                    </div>
                `
            });
            console.log('Candidate email sent.');
        } catch (emailError) {
            console.error('Resend Candidate Email Error:', emailError);
            // Don't fail? Or maybe warn?
        }

        res.json({ success: true, message: 'Application submitted successfully!' });

    } catch (error) {
        console.error('Error processing enrollment:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
