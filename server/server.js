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
        const {
            fullName, email, phone, school, level,
            startDate, interest, studyMode, questionType, resumeLink, referral
        } = req.body;
        const databaseId = getCleanNotionId(process.env.NOTION_DATABASE_ID);

        // Basic Validation
        if (!fullName || !email || !startDate || !interest || !studyMode) {
            return res.status(400).json({ success: false, message: 'Missing required fields.' });
        }
        if (!databaseId) {
            console.error('Database ID is missing or invalid.');
            return res.status(500).json({ success: false, message: 'Server configuration error: Notion Database ID missing.' });
        }

        console.log(`Received enrollment for: ${email}`);
        console.log(`Using Database ID: ${databaseId}`);
        console.log(`Environment Database ID: ${process.env.NOTION_DATABASE_ID}`);

        // 1. Add to Notion
        try {
            console.log('Attempting to create Notion page...');
            const notionProperties = {
                'Name': {
                    title: [{ text: { content: fullName } }]
                },
                'Email': {
                    email: email
                },
                'Phone': {
                    phone_number: phone
                },
                'Area of study': {
                    rich_text: [{ text: { content: interest } }]
                }
            };

            // Optional/New Fields Mapping
            if (school) {
                notionProperties['School'] = {
                    rich_text: [{ text: { content: school } }]
                };
            }
            if (level) {
                notionProperties['Level'] = {
                    select: { name: level }
                };
            }
            if (startDate) {
                notionProperties['Internship Start Date'] = {
                    date: { start: startDate }
                };
            }
            if (studyMode) {
                notionProperties['Study mode'] = {
                    select: { name: studyMode }
                };
            }
            if (questionType) {
                notionProperties['Internship Type'] = {
                    select: { name: questionType }
                };
            }
            if (referral) {
                notionProperties['Referral'] = {
                    rich_text: [{ text: { content: referral } }]
                };
            }
            // Resume removed as it does not exist in the target Notion database

            const notionResponse = await notion.pages.create({
                parent: { database_id: databaseId },
                properties: notionProperties
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
                        <div style="font-family: sans-serif; padding: 20px;">
                            <h1>New Enrollment for ApheZis Tech</h1>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${fullName}</td></tr>
                                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${email}</td></tr>
                                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${phone}</td></tr>
                                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>School:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${school || 'N/A'}</td></tr>
                                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Level:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${level || 'N/A'}</td></tr>
                                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Start Date:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${startDate}</td></tr>
                                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Area of Study:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${interest}</td></tr>
                                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Study Mode:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${studyMode}</td></tr>
                                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Question Type:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${questionType || 'N/A'}</td></tr>
                                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Resume/Portfolio:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="${resumeLink}">${resumeLink}</a></td></tr>
                            </table>
                            <p>Check Notion for full details.</p>
                        </div>
                    `
                });
                console.log('Admin email sent.');
            } catch (emailError) {
                console.error('Resend Admin Email Error:', emailError);
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
                    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
                        <h1 style="color: #40E0FF;">Welcome to the Future, ${fullName.split(' ')[0]}!</h1>
                        <p>We have successfully received your application for the <strong>ApheZis Tech Internship Program</strong>.</p>
                        <p>Our team is currently reviewing your profile for the <strong>${interest}</strong> track (${studyMode} mode).</p>
                        
                        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0;">Application Summary:</h3>
                            <ul style="list-style: none; padding: 0;">
                                <li><strong>Track:</strong> ${interest}</li>
                                <li><strong>Mode:</strong> ${studyMode}</li>
                                <li><strong>Target Start Date:</strong> ${startDate}</li>
                            </ul>
                        </div>

                        <p>We will be in touch shortly regarding the next steps.</p>
                        <br>
                        <p>Best regards,</p>
                        <p><strong>The ApheZis Tech Team</strong></p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 12px; color: #888; text-align: center;">24P7+C3V, Kigali (ADEPR Nyakabanda)</p>
                    </div>
                `
            });
            console.log('Candidate email sent.');
        } catch (emailError) {
            console.error('Resend Candidate Email Error:', emailError);
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
