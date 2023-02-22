import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import { Configuration, OpenAIApi } from 'openai'
dotenv.config()
// This apis are created following https://platform.openai.com/docs/api-reference/edits/create?lang=node.js

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
const app = express()
app.use(cors())
app.use(express.json())

// Access OpenAI APIs at localhost:8080/ using POST request

// Create completion
app.post('/completion', async (req, res) => {
  try {
    // Prompt = Content + Instruction
    const prompt = req.body.prompt;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `${prompt}`,
      temperature: 0,
      max_tokens: 300, 
      top_p: 1, 
      frequency_penalty: 0.5,
      presence_penalty: 0, 
    });

    res.status(200).send({
      bot: response.data.choices[0].text
    });

  } catch (error) {
    // console.error(error)
    console.log("Error 2")
    res.status(500).send(error || 'Something went wrong');
  }
})

// Create edit (Example - Spelling mistake, Change tone of text)
app.post('/edits', async (req, res) => {
  try {
    const input = req.body.input
    const instruction = req.body.instruction

    const response = await openai.createEdit({
      model: "text-davinci-edit-001",
      input: `${input}`,
      instruction: `${instruction}`,
      temperature:0.2
      
    });

    res.status(200).send({
      bot: response.data.choices[0].text
    });

  } catch (error) {
    console.error(error)
    res.status(500).send(error || 'Something went wrong');
  }
})

// Create image
app.post('/images/generations', async (req, res) => {
  try {

    const prompt = req.body.prompt
    const size = req.body.size
    const number = req.body.number
    const response = await openai.createImage({
      prompt: prompt,
      n:  number,
      size: size
    });
    res.status(200).send({
      bot: response.data
    });

  } catch (error) {
    console.error(error)
    res.status(500).send(error || 'Something went wrong');
  }
})

// Create image edit
app.post('/images/edits', async (req, res) => {
  try {

    const image = req.body.image
    const mask = req.body.mask
    const prompt=req.body.prompt
    const number=req.body.number
    const size=req.body.size

    const response = await openai.createEdit(
      image,
      mask,
      prompt,
      number,
      size
    );

    res.status(200).send({
      bot: response.data
    });

  } catch (error) {
    console.error(error)
    res.status(500).send(error || 'Something went wrong');
  }
})

// Create image variation
app.post('/images/variations', async (req, res) => {
  try {

    const image = req.body.image
    const number = req.body.number
    const size=req.body.size


    const response = await openai.createEdit(
      image,
      number,
      size
    );

    res.status(200).send({
      bot: response.data
    });

  } catch (error) {
    console.error(error)
    res.status(500).send(error || 'Something went wrong');
  }
})
// 

// POST Request to upload a new file
app.post("/upload", (req, res) => {
    // use modules such as express-fileupload, Multer, Busboy
    // TODO: API to be implemented

    setTimeout(() => {
        console.log('file uploaded')
        return res.status(200).json({ result: true, msg: 'file uploaded' });
    }, 3000);
});

// DELETE Request to delete an existing file
app.delete("/upload", (req, res) => {
    // TODO: API to be implemented
    
    console.log(`File deleted`)
    return res.status(200).json({ result: true, msg: 'file deleted' });
});

app.listen(8080, () => {
    console.log(`Server running on port 8080`)
});