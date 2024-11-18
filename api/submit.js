const { OpenAI } = require('openai');  // Import OpenAI SDK
const nodemailer = require('nodemailer');
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  // Initialize OpenAI with API key from environment
});

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const { companyName, contactInfo, clientContactInfo, industry, mood, contentType, platforms, timeframe, targetClients, marketingPoints, seasonalPromotions, additionalInfo } = req.body;

        // Prepare the prompt for GPT-4
        const prompt = `Generate marketing materials for ${companyName} in the ${industry} industry...`;

        try {
            // Call GPT-4 API to generate marketing materials
            const response = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 1500,
            });

            const materials = response.choices[0].message.content;

            // Create a zip file with the marketing materials
            const zip = new AdmZip();
            materials.split('\n\n').forEach((content, idx) => {
                const filename = `material_${idx + 1}.txt`;
                fs.writeFileSync(filename, content);
                zip.addLocalFile(path.join(__dirname, filename));
                fs.unlinkSync(filename); // Delete the file after adding to the zip
            });

            // Send the zip file via email
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PW,
                },
            });

            const mailOptions = {
                from: process.env.EMAIL,
                to: contactInfo,
                subject: 'Your Marketing Materials',
                text: 'Please find your marketing materials attached.',
                attachments: [{
                    filename: 'marketing_materials.zip',
                    content: zip.toBuffer(),
                }],
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    return res.status(500).json({ error: `Error sending email: ${err.message}` });
                }
                res.status(200).json({ message: 'Marketing materials sent successfully!' });
            });
        } catch (error) {
            res.status(500).json({ error: `Server error: ${error.message}` });
        }
    } else {
        res.status(405).json({ error: 'Invalid request method' });
    }
};
