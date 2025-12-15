// import OpenAI from "openai";
// import readlineSync from "readline-sync";
// // For Ollama, we need to change the base URL and remove the API key requirement
// const client = new OpenAI({
//   baseURL: "http://localhost:11434/v1", // Ollama's API endpoint
//   apiKey: "ollama", // This can be any string, Ollama doesn't require authentication
// });

// // Tools
// function getWeatherDetails(city = "") {
//   if (city.toLowerCase() === "london") return "15°C";
//   if (city.toLowerCase() === "new york") return "22°C";
//   if (city.toLowerCase() === "tokyo") return "18°C";
//   if (city.toLowerCase() === "paris") return "20°C";
//   return "City not found";
// }

// // map
// const tools = {
//     "getWeatherDetails": getWeatherDetails,
// };

// const SYSTEM_PROMPT = `You are an AI Assistant with START, PLAN, ACTION, OBSERVATION and OUTPUT State. Wait for the user prompt and first PLAN using available TOOLS. After planning, Take the ACTION with appropriate TOOLS and wait for OBSERVATION based on ACTION. Once you get the OBSERVATION, Return the AI response based on START prompt and OBSERVATION

// Strictly follow the JSON putput format as in example.

// Available TOOLS:
// - function getWeatherDetails(city: string): string
// GetWeatherDetails is a function that accepts city name as string and returns the weather details of that city.

// Example:
// START
// {"type": "user", "user": "What is the sum of weather of London and New York?"}
// {"type": "plan", "plan": "I will call the getWeatherDetails for London"}
// {"type": "action", "function": "getWeatherDetails", "input": "London"}
// {"type": "observation", "observation": "15°C, Cloudy"}
// {"type": "plan", "plan": "I will call the getWeatherDetails for New York"}
// {"type": "action", "function": "getWeatherDetails", "input": "New York"}
// {"type": "observation", "observation": "22°C, Sunny"}
// {"type": "output", "output": "The sum of weather in London and New York is 37°C."}
// `;

// // const user = "What is the weather like in London?";

// // // Use a model that you have in Ollama (like 'tinyllama' or 'llama2')
// // client.chat.completions
// //   .create({
// //     model: "tinyllama", // Change this to a model you have installed
// //     messages: [
// //       { role: "system", content: SYSTEM_PROMPT },
// //       { role: "user", content: user },
// //     ],
// //     temperature: 0.7,
// //   })
// //   .then((e) => {
// //     console.log(e.choices[0].message.content);
// //   })
// //   .catch((error) => {
// //     console.error("Error:", error.message);
// //   });

// //  outopromt loop

// const messages = [
//   { role: "system", content: SYSTEM_PROMPT },
// ];

// while (true) {
//     const query = readlineSync.question(">> ");
//     const q = { type: "user", user: query };
//     messages.push({ role: "user", content: JSON.stringify(q) });

//     while (true) {
//         const chat = await client.chat.completions.create({
//             model: "tinyllama",
//             messages: messages,
//             temperature: 0.7,
//             response_format: { type: "json_object"},
//         });

//         const result = chat.choices[0].message.content;
//         messages.push({ role: "assistant", content: result });

//         // console.log(`\n\n---------------------- START AI ---------`);
//         // console.log(result);
//         // console.log(`-------------------- END AI ---------\n\n`);

//         const call = JSON.parse(result);

//         if (call.type === "output") {
//             console.log(`🤖: ${call.output}`);
//             break;
//         } else if (call.type === "action") {
//             const fn = tools[call.function];
//             const observation = fn(call.input);
//             const obs = { type: "observation", observation: observation };
//             messages.push({ role: "user", content: JSON.stringify(obs) } );
//         }
//     }
// }

import { GoogleGenAI } from "@google/genai";
import readlineSync from "readline-sync";

// --- Configuration ---
// Requires GEMINI_API_KEY environment variable to be set.
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// --- Tool Definitions ---
function getWeatherDetails(city = "") {
    if (city.toLowerCase() === "london") return "15°C";
    if (city.toLowerCase() === "new york") return "22°C";
    if (city.toLowerCase() === "tokyo") return "18°C";
    if (city.toLowerCase() === "paris") return "20°C";
    return "City not found";
}

const toolFunctions = {
    "getWeatherDetails": getWeatherDetails,
};

// Tool schema for the Gemini API
const weatherTool = {
    functionDeclarations: [{
        name: "getWeatherDetails",
        description: "GetWeatherDetails is a function that accepts a city name as string and returns the weather details of that city.",
        parameters: {
            type: "object",
            properties: {
                city: {
                    type: "string",
                    description: "The name of the city for which to get the weather."
                }
            },
            required: ["city"]
        }
    }]
};

const SYSTEM_PROMPT = `You are an AI Assistant that can use the available tools. Your goal is to answer the user's question. If you need to use a tool, use it immediately. When providing the final answer, be concise and do not include the steps you took to use the tool.`;

const messages = [
    { role: "user", parts: [{ text: SYSTEM_PROMPT }] }
];

// --- Main Chat Loop ---
async function chatLoop() {
    while (true) {
        const query = readlineSync.question(">> ");
        
        if (query.toLowerCase() === 'exit') break;

        messages.push({ role: "user", parts: [{ text: query }] });

        while (true) {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-lite",
                contents: messages,
                config: {
                    tools: [weatherTool],
                }
            });

            const resultText = response.text;
            const functionCalls = response.functionCalls;

            messages.push({ role: "model", parts: response.candidates[0].content.parts });

            if (functionCalls && functionCalls.length > 0) {
                const functionCall = functionCalls[0];
                const functionName = functionCall.name;
                const functionArgs = functionCall.args;
                
                const fn = toolFunctions[functionName];
                const observation = fn(functionArgs.city);

                // Send the function result back to the model
                const toolResult = {
                    role: "tool",
                    parts: [{
                        functionResponse: {
                            name: functionName,
                            response: {
                                content: observation,
                            },
                        }
                    }]
                };
                messages.push(toolResult);
                
            } else {
                // Final Answer
                console.log(`🤖: ${resultText}`);
                break;
            }
        }
    }
}

chatLoop();