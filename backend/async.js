import request from "request";
import cheerio from "cheerio";
import fs from "fs";
import React from "react";

import textversionjs from "textversionjs";
import axios from "axios";

var url =
  "https://www.pwc.in/research-and-insights-hub/immersive-outlook/immersive-outlook-with-tata-steel.html";
var question =
  "What initiatives Tata steel has taken to manage carbon footprint ?";
const max_chars = 10000;
const headers = 1000;
async function askQuestion(plainText, question) {
  // Call Backend OpenAI Apis for completion
  var responseAns = "";
  await axios
    .post("http://localhost:8080/completion", {
      prompt: plainText + question,
    })
    .then(async (response) => {
      if (response.status == 200) {
        const parsedData = await response.data.bot;
        // console.log(parsedData)
        responseAns = parsedData;
      } else responseAns = "Error: API call failed. Try again..";
    });
  return responseAns;
}

async function handleHTML_TV(html) {
  // Using textversionjs library

  // Omit links and images from HTML page
  var styleConfig = {
    linkProcess: function (href, linkText) {
      return linkText;
    },
    imgProcess: function (src, alt) {
      return alt;
    },
  };

  // Extract text from HTML page
  var plainText = textversionjs(html, styleConfig);

  // Write the text into a file
  fs.writeFileSync("Output.txt", plainText, (err) => {
    if (err) throw err;
  });

  plainText = plainText.substring(
    headers,
    headers + Math.min(max_chars, plainText.length)
  );
  // Ask Question from the parsed text
  var question =
    "\nWhat India needs to do to achieve the status of a developed economy by 2047 ?";
  console.log("Question: " + question);
  console.log("\nAnswer: " + (await askQuestion(plainText, question)));
}


async function handleHTML_CR(html) {
  var plainText = "";
  // Using cheerio library
  const select = cheerio.load(html);
  const selectors = ["p", "h1", "h2", "h3", "h4", "li", "sup"];
  for (let k = 0; k < selectors.length; k++) {
    let nums = select(selectors[k]);
    for (let i = 0; i < nums.length; i++) {
      plainText += select(nums[i]).text();
      //    console.log(data)
    }
  }
  // Write the text into a file
  fs.writeFile("Output.txt", plainText, (err) => {
    if (err) throw err;
  });
  plainText = plainText.substring(
    headers,
    headers + Math.min(max_chars, plainText.length)
  );
  // Ask Question from the parsed text
  question =
    "Write a detailed answer after understanding the above passage. " +
    question;
  console.log("Question: " + question);
  console.log("\nAnswer: " + (await askQuestion(plainText, "\n" + question)));
}

request(url, async function (error, response, html) {
  if (error) {
    console.error("error3:", error);
  } else {
    await handleHTML_CR(html);
  }
});
