import { GoogleGenerativeAI } from '@google/generative-ai';
const GEMINI_API_KEY = "AIzaSyCqJIwBVK0Y425xz5rChsr2QWl9OaPpgjw";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
async function test() {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  try {
    const result = await model.generateContent("hello");
    console.log(result.response.text());
  } catch (e) {
    console.error("1.5-flash error:", e.message);
  }
}
test();
