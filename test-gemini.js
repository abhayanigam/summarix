const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function main() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  // For npm @google/generative-ai, we might need to access the model list differently or it's not exposed directly in the high level client easily for some versions?
  // Actually usually it is not directly exposed on genAI.
  // But let's try a direct fetch to the API to see what's up, or just use the simplest model 'gemini-pro' again but with a fresh install?
  
  // No, let's try to infer from the error. 404 on the model usually means the project doesn't have access to it or the key is restricted.
  
  try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent("Hello");
      console.log("Success with gemini-1.5-flash:", result.response.text());
  } catch (e) {
      console.log("Error with gemini-1.5-flash:", e.message);
  }

  try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent("Hello");
      console.log("Success with gemini-pro:", result.response.text());
  } catch (e) {
      console.log("Error with gemini-pro:", e.message);
  }
}

main();
