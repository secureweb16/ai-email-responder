const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const imap = require("imap-simple");

const config = {
    imap: {
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASS,
        host: "imap.gmail.com",
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
        authTimeout: 10000,
    },
};

const chat = async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({ error: "Question is required" });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: question }],
            max_tokens: 100,
        });

        res.json({ reply: response.choices[0].message.content });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
}

const fetchEmails = async (req, res) => {
    try {
        console.log("request started here");

        const connection = await imap.connect(config);
        await connection.openBox("INBOX"); // Open the inbox folder

        console.log("before messages", connection);

        // Search criteria: ALL emails
        const searchCriteria = ["UNSEEN"];

        // Fetch options
        const fetchOptions = {
            bodies: ["HEADER", "TEXT"], // Fetch email headers and body
            struct: true,
        };

        // Get all email message UIDs
        const messages = await connection.search(searchCriteria, fetchOptions);

        console.log("after messages: ", messages);

        if (!messages || messages.length === 0) {
            console.log("No emails found.");
            connection.end();
            return res.status(200).send("No emails found.");
        }

        // Get only the last 10 emails
        const last10Messages = messages.slice(-10);

        // Fetch the latest 10 emails
        const emails = await Promise.all(last10Messages.map((msg) => {
            const headerPart = msg.parts.find((part) => part.which === "HEADER")?.body;
            const textPart = msg.parts.find((part) => part.which === "TEXT")?.body;

            return {
                from: headerPart?.from?.[0] || "Unknown",
                subject: headerPart?.subject?.[0] || "No Subject",
                date: headerPart?.date?.[0] || "Unknown Date",
                body: textPart || "No Body",
            };
        }));

        // console.log("Fetched Emails: ", emails);
        connection.end();
        res.status(200).send(emails);
    } catch (error) {
        console.error("Error fetching emails:", error);
        return [];
    }
};


module.exports = { chat, fetchEmails }