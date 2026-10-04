const OpenAI = require("openai");

const client = new OpenAI({
    baseURL: "http://localhost:1234/v1",
    apiKey: "lm-studio"
});


async function onlineAI(
    userMessage,
    conversationHistory = [],
    documentContext = null
) {

    // ==========================================
    // DOCUMENT CONTEXT
    // ==========================================

    let documentInstructions = "";


    if (
        documentContext &&
        documentContext.text
    ) {

        const documentText =
            documentContext.text.substring(
                0,
                100000
            );


        documentInstructions = `
A document has been uploaded by the user.

Document name:
${documentContext.name || "Unknown document"}

Document content:
--------------------
${documentText}
--------------------

IMPORTANT DOCUMENT RULES:

1. Use the uploaded document when answering questions about it.
2. Do not invent information that is not present in the document.
3. If the answer cannot be found in the document, clearly say that the information is not available in the uploaded document.
4. You may use your general knowledge when the user asks something unrelated to the document.
5. If the user asks for a summary, summarize the uploaded document.
6. If the user asks a question about a specific section, use the relevant part of the document.
`;

    }


    // ==========================================
    // SYSTEM PROMPT
    // ==========================================

    const systemPrompt = `
You are the Local AI assistant inside a chatbot project called HybridAI.

You are powered by the Qwen3 model running locally through LM Studio.

Important rules:

1. Do not claim that you created HybridAI.
2. Do not invent or guess who created HybridAI.
3. If asked about HybridAI's creator or development team, say that the project is being developed by the user unless specific information is provided in the conversation.
4. Use previous conversation messages to understand words such as "it", "they", "that", or "this".
5. Give clear and simple answers.
6. Keep answers concise unless the user asks for more detail.
7. Use examples when useful.
8. If you are unsure about something, say that you are unsure instead of making up information.
9. When a document is provided, carefully use its contents when answering document-related questions.
10. Never pretend that information came from the document if it did not.

${documentInstructions}
`;


    // ==========================================
    // CREATE AI REQUEST
    // ==========================================

    const response =
        await client.chat.completions.create({

            model:
                "qwen/qwen3-4b-2507",

            messages: [

                {
                    role:
                        "system",

                    content:
                        systemPrompt
                },

                ...conversationHistory,

                {
                    role:
                        "user",

                    content:
                        userMessage
                }

            ],

            stream:
                true,

            max_tokens:
                500,

            temperature:
                0.7

        });


    return response;

}


module.exports =
    onlineAI;