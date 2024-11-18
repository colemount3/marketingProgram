require('dotenv').config();
const express = require('express');
const { OpenAI } = require('openai');  // Import OpenAI SDK
const nodemailer = require('nodemailer');
const fs = require('fs');
const AdmZip = require('adm-zip');
const path = require('path');

const app = express();
app.use(express.json());  // To parse JSON bodies
app.use(express.urlencoded({ extended: true }));  // For form-encoded data

// Set up OpenAI API
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,  // Use your API key from the environment variable
});

// Endpoint to handle form submission
app.post('/submit', async (req, res) => {
    const { companyName, contactInfo, clientContactInfo, industry, mood, contentType, platforms, timeframe, targetClients, marketingPoints, seasonalPromotions, additionalInfo } = req.body;

    // Prepare the prompt for GPT-4
    const prompt = `Generate marketing materials for ${companyName} in the ${industry} industry...` + 
                   `Targeting ${targetClients} with a focus on ${marketingPoints} and considering ${seasonalPromotions}.`;

    try {
        // Call GPT-4 API to generate marketing materials
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1500
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
                pass: process.env.PW
            }
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: contactInfo,
            subject: 'Your Marketing Materials',
            text: 'Please find your marketing materials attached.',
            attachments: [{
                filename: 'marketing_materials.zip',
                content: zip.toBuffer()
            }]
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                return res.status(500).json({ error: `Error sending email: ${err.message}` });
            }
            res.json({ message: 'Marketing materials sent successfully!' });
        });
    } catch (error) {
        res.status(500).json({ error: `Server error: ${error.message}` });
    }
});

// Start the Express app
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
