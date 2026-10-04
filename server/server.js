require("dotenv").config();

const express = require("express");
const path = require("path");

const extractPdfText = require("./services/pdfReader");
const offlineAI = require("./services/offlineAI");
const onlineAI = require("./services/onlineAI");
const knowledgeBase = require("./services/knowledgeBase");

const app = express();

const PORT = 3000;


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json({ limit: "15mb" }));

app.use(
    express.static(
        path.join(__dirname, "..", "client")
    )
);


// ==========================================
// KNOWLEDGE BASE SEARCH
// ==========================================

function searchKnowledgeBase(message) {

    const cleanedMessage =
        message
            .toLowerCase()
            .trim()
            .replace(/[?!.,]/g, "");

    for (const item of knowledgeBase) {

        for (const keyword of item.keywords) {

            if (
                cleanedMessage.includes(
                    keyword.toLowerCase()
                )
            ) {

                return item.answer;

            }

        }

    }

    return null;
}


// ==========================================
// TEST ROUTE
// ==========================================

app.get("/api/test", (req, res) => {

    res.json({
        message:
            "HybridAI backend is working! 🤖"
    });

});


// ==========================================
// CLEAR CHAT
// ==========================================

app.post("/api/clear", (req, res) => {

    res.json({
        message:
            "Chat cleared successfully."
    });

});


// ==========================================
// PDF TEXT EXTRACTION
// ==========================================

app.post("/api/pdf", async (req, res) => {

    try {

        const {
            fileName,
            fileData
        } = req.body;


        // ==========================================
        // VALIDATION
        // ==========================================

        if (!fileName || !fileData) {

            return res.status(400).json({
                error:
                    "PDF file data is missing."
            });

        }


        if (
            !fileName
                .toLowerCase()
                .endsWith(".pdf")
        ) {

            return res.status(400).json({
                error:
                    "Only PDF files are supported."
            });

        }


        // ==========================================
        // REMOVE DATA URL PREFIX
        // ==========================================

        const base64Data =
            fileData.includes(",")
                ? fileData.split(",")[1]
                : fileData;


        // ==========================================
        // CONVERT BASE64 → BUFFER
        // ==========================================

        const pdfBuffer =
            Buffer.from(
                base64Data,
                "base64"
            );


        // ==========================================
        // PDF SIZE LIMIT
        // ==========================================

        const MAX_PDF_SIZE =
            10 * 1024 * 1024;


        if (
            pdfBuffer.length >
            MAX_PDF_SIZE
        ) {

            return res.status(400).json({
                error:
                    "PDF is too large. Please use a PDF smaller than 10 MB."
            });

        }


        console.log("");
        console.log(
            `📄 Processing PDF: ${fileName}`
        );


        // ==========================================
        // EXTRACT PDF TEXT
        // ==========================================

        const extractedText =
            await extractPdfText(
                pdfBuffer
            );


        // ==========================================
        // LIMIT TEXT SENT TO AI
        // ==========================================

        const MAX_TEXT_LENGTH =
            100000;


        const limitedText =
            extractedText.length >
            MAX_TEXT_LENGTH
                ? extractedText.substring(
                    0,
                    MAX_TEXT_LENGTH
                )
                : extractedText;


        console.log(
            `✅ PDF processed: ${fileName}`
        );

        console.log(
            `📄 Extracted characters: ${limitedText.length}`
        );


        // ==========================================
        // SEND RESULT TO FRONTEND
        // ==========================================

        return res.json({

            success: true,

            fileName:
                fileName,

            text:
                limitedText

        });


    } catch (error) {

        console.error("");
        console.error(
            "❌ PDF extraction error:"
        );

        console.error(
            error
        );


        return res.status(500).json({

            error:
                "Could not read this PDF. It may be scanned, protected, corrupted, or contain no extractable text."

        });

    }

});


// ==========================================
// CHAT
// ==========================================

app.post("/api/chat", async (req, res) => {

    try {

        // ==========================================
        // GET USER MESSAGE
        // ==========================================

        const userMessage =
            typeof req.body.message === "string"
                ? req.body.message.trim()
                : "";


        // ==========================================
        // GET CHAT HISTORY
        // ==========================================

        const clientHistory =
            Array.isArray(
                req.body.history
            )
                ? req.body.history
                : [];


        // ==========================================
        // GET DOCUMENT CONTEXT
        // ==========================================

        let documentContext = null;


        if (
            req.body.documentContext &&
            typeof req.body.documentContext === "object"
        ) {

            const documentName =
                typeof req.body.documentContext.name === "string"
                    ? req.body.documentContext.name
                    : "Unknown document";


            const documentText =
                typeof req.body.documentContext.text === "string"
                    ? req.body.documentContext.text
                    : "";


            if (documentText.trim()) {

                documentContext = {

                    name:
                        documentName,

                    text:
                        documentText.substring(
                            0,
                            100000
                        )

                };

            }

        }


        // ==========================================
        // VALIDATION
        // ==========================================

        if (!userMessage) {

            return res
                .status(400)
                .send(
                    "Please enter a message."
                );

        }


        console.log("");
        console.log(
            "================================="
        );

        console.log(
            "📩 New user message:"
        );

        console.log(
            userMessage
        );


        // ==========================================
        // DOCUMENT STATUS
        // ==========================================

        if (documentContext) {

            console.log(
                "📄 Document attached:"
            );

            console.log(
                documentContext.name
            );

            console.log(
                "📄 Document characters:",
                documentContext.text.length
            );

        } else {

            console.log(
                "📄 No document attached."
            );

        }


        // ==========================================
        // KNOWLEDGE BASE
        // ==========================================

        // If a document is uploaded,
        // let Qwen use the document first.

        if (!documentContext) {

            const knowledgeAnswer =
                searchKnowledgeBase(
                    userMessage
                );


            if (knowledgeAnswer) {

                console.log(
                    "📚 Answer from Knowledge Base"
                );


                res.status(200);


                res.setHeader(
                    "Content-Type",
                    "text/plain; charset=utf-8"
                );


                res.setHeader(
                    "X-AI-Mode",
                    "offline"
                );


                return res.end(
                    knowledgeAnswer
                );

            }

        }


        // ==========================================
        // CONVERSATION HISTORY
        // ==========================================

        const conversationHistory =
            clientHistory
                .filter(message => {

                    return (
                        message &&
                        (
                            message.role === "user" ||
                            message.role === "assistant"
                        ) &&
                        typeof message.content === "string"
                    );

                })
                .slice(-10);


        // ==========================================
        // LOCAL QWEN
        // ==========================================

        console.log(
            "🧠 Connecting to Local Qwen..."
        );


        const stream =
            await onlineAI(
                userMessage,
                conversationHistory,
                documentContext
            );


        // ==========================================
        // STREAM HEADERS
        // ==========================================

        res.status(200);


        res.setHeader(
            "Content-Type",
            "text/plain; charset=utf-8"
        );


        res.setHeader(
            "Cache-Control",
            "no-cache"
        );


        res.setHeader(
            "Connection",
            "keep-alive"
        );


        res.setHeader(
            "X-AI-Mode",
            "local"
        );


        // ==========================================
        // STREAM QWEN RESPONSE
        // ==========================================

        let responseStarted = false;


        for await (
            const chunk of stream
        ) {

            const content =
                chunk
                    ?.choices?.[0]
                    ?.delta
                    ?.content;


            if (content) {

                responseStarted = true;

                res.write(
                    content
                );

            }

        }


        // ==========================================
        // RESPONSE COMPLETE
        // ==========================================

        if (!responseStarted) {

            console.log(
                "⚠️ Qwen returned no text."
            );

        } else {

            console.log(
                "✅ Qwen response completed."
            );

        }


        res.end();


    } catch (error) {

        // ==========================================
        // AI ERROR
        // ==========================================

        console.error("");

        console.error(
            "❌ AI BACKEND ERROR"
        );

        console.error(
            "================================="
        );

        console.error(
            error
        );

        console.error(
            "================================="
        );


        // ==========================================
        // OFFLINE FALLBACK
        // ==========================================

        try {

            const userMessage =
                typeof req.body.message === "string"
                    ? req.body.message.trim()
                    : "";


            const offlineAnswer =
                offlineAI(
                    userMessage
                );


            console.log(
                "⚡ Offline AI fallback used."
            );


            if (!res.headersSent) {

                res.status(200);


                res.setHeader(
                    "Content-Type",
                    "text/plain; charset=utf-8"
                );


                res.setHeader(
                    "X-AI-Mode",
                    "offline"
                );


                res.end(
                    offlineAnswer ||
                    "Sorry, I could not generate a response."
                );

            } else {

                res.end();

            }


        } catch (offlineError) {

            console.error(
                "❌ Offline AI error:"
            );

            console.error(
                offlineError
            );


            if (!res.headersSent) {

                res
                    .status(500)
                    .send(
                        "Sorry, something went wrong while connecting to the AI backend."
                    );

            } else {

                res.end();

            }

        }

    }

});


// ==========================================
// START SERVER
// ==========================================

app.listen(
    PORT,
    () => {

        console.log(
            "================================="
        );

        console.log(
            "🤖 HybridAI Chatbot Server"
        );

        console.log(
            `Server running at: http://localhost:${PORT}`
        );

        console.log(
            "================================="
        );

    }
);