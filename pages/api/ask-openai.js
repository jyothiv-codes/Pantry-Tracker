import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { query } = req.body;

    try {
      
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',  
        messages: [{ role: 'user', content: query }],
      });

      res.status(200).json({ answer: response.choices[0].message.content.trim() });
    } catch (error) {
      console.error('Error fetching OpenAI response:', error);
      res.status(500).json({ error: 'Failed to fetch response' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
