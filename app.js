require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const APP_URL = process.env.APP_URL;
const emailRoutes = require("./routes/email");
const swagger = require("./swagger");
const Mbox = require('node-mbox').default || require('node-mbox');
// const Mbox = require('node-mbox');
console.log("Mbox Import:", Mbox);

app.use(express.json());
app.use(cors());
app.use("/api/email/", emailRoutes);


const fs = require('fs');
const { simpleParser } = require('mailparser');
const OpenAI = require('openai');
const path = require("path");
require('dotenv').config();

// Initialize OpenAI API
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Function to parse MBOX file
async function parseMboxFile(filePath) {
    return new Promise(async (resolve, reject) => {
        let emails = [];
        let rawEmails = fs.readFileSync(filePath, 'utf-8').split(/\nFrom /); // Splitting emails

        for (const rawEmail of rawEmails) {
            try {
                let parsedEmail = await simpleParser(rawEmail);
                emails.push({
                    from: parsedEmail.from ? parsedEmail.from.text : '',
                    to: parsedEmail.to ? parsedEmail.to.text : '',
                    subject: parsedEmail.subject || '',
                    date: parsedEmail.date || '',
                    body: parsedEmail.text || '',
                });
            } catch (error) {
                console.error("Error parsing email:", error);
            }
        }
        resolve(emails);
    });
}

// Send extracted email data to ChatGPT
// async function sendToChatGPT(email) {
//     try {
//         const response = await openai.chat.completions.create({
//             model: "gpt-4-turbo",
//             messages: [
//                 { role: "system", content: "You are a helpful assistant processing emails." },
//                 { role: "user", content: `Extracted Email Data:\n\nFrom: ${email.from}\nTo: ${email.to}\nSubject: ${email.subject}\nDate: ${email.date}\nMessage:\n${email.body}` },
//             ],
//         });

//         return response.choices[0].message.content;
//     } catch (error) {
//         console.error("Error sending to ChatGPT:", error);
//         return null;
//     }
// }

async function sendToChatGPT(email, newEmail) {
    try {
        const exampleEmails = email.slice(0, 3) // Use first 3 emails as examples
            .map(emails => `Example Email:\nFrom: ${emails.from}\nTo: ${emails.to}\nSubject: ${emails.subject}\nDate: ${emails.date}\nMessage:\n${emails.body}\n\nExpected Reply:\n(Insert appropriate response based on this email)`)
            .join("\n\n");

        const prompt = `Below are example email conversations demonstrating proper email replies:\n\n${exampleEmails}\n\nUsing these examples as a reference, generate a well-structured and professional reply to the following email:\n\nFrom: ${newEmail.from}\nTo: ${newEmail.to}\nSubject: ${newEmail.subject}\nDate: ${newEmail.date}\nMessage:\n${newEmail.body}\n\nEnsure the response maintains a similar tone and structure as the provided examples.`;

        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                { role: "system", content: "You are an AI that generates professional email replies based on provided example emails. Ensure consistency in tone and structure." },
                { role: "user", content: prompt },
            ],
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("Error sending to ChatGPT:", error);
        return null;
    }
}


// Main function to process MBOX and send to ChatGPT
async function processMbox(filePath) {
    console.log("filePath", filePath);
    try {
        const emails = await parseMboxFile(filePath);
        console.log("emails", emails); // Should now contain parsed emails

        for (let email of emails) {
            console.log("\n=== Sending Email to ChatGPT ===");
            console.log(`Subject: ${email.subject}`);
            const chatGPTResponse = await sendToChatGPT(email);
            console.log("ChatGPT Response:", chatGPTResponse);
        }
    } catch (error) {
        console.error("Error processing MBOX:", error);
    }
}

processMbox('AI-AIData-1.mbox');

swagger(app);
app.listen(port, () => {
    console.log(`Server is running at ${APP_URL}:${port}`);
});
