import React, { useState } from "react";
import "./App.css";
import { useSpeechSynthesis } from "react-speech-kit";
import { styled } from "@material-ui/core/styles";
import { IconButton } from "@material-ui/core";
import MicIcon from "@material-ui/icons/Mic";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const mic = new SpeechRecognition();

mic.continuous = true;
mic.interimResults = true;
mic.lang = "en-US";

function App() {
  const [isListening, setIsListening] = useState(false);
  const [note, setNote] = useState(" ");
  const [savedNote, setSavedNote] = useState("");
  const { speak, cancel } = useSpeechSynthesis();

  const handleListen = async (listenStatus) => {
    if (listenStatus) {
      setNote("");
      mic.start();
      mic.onend = () => {
        mic.start();
      };
      setSavedNote("Listening to your input...");
      cancel();
    } else {
      mic.stop();
      mic.onend = () => {};
      await handleSaveNote();
    }

    mic.onstart = () => {};

    mic.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");
      setNote(transcript);
      mic.onerror = (event) => {
        console.log(event.error);
      };
    };
  };

  async function askQuestion(prompt) {
    const response = await fetch("http://localhost:8080/completion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
      }),
    });
    if (response.ok) {
      const data = await response.json();
      const parsedData = data.bot;
      return parsedData;
    } else return "Error: API call failed. Try again..";
  }
  const handleSaveNote = async () => {
    // Call OpenAI Apis using note
    setSavedNote("Processing your input...");
    const res = await askQuestion(note);
    setSavedNote(res.split("\n").map((str) => <p>{str}</p>));
    speak({ text: res });
  };

  const HandleSpeak = () => {
    setIsListening(!isListening);
    handleListen(!isListening);
  };

  return (
    <Container>
      <Header>Enhanced User interaction using gpt 3</Header>
      <Wrapper>
        <SpeakSection>
          <TextBox>
            {isListening ? (
              <>
                Tap to <b>STOP</b> recording...
              </>
            ) : (
              <>
                Tap to <b>START</b> speaking...
              </>
            )}
          </TextBox>
          <SpeakButton
            onClick={HandleSpeak}
            style={{ backgroundColor: isListening ? "#1976d2" : "white " }}
          >
            <MicIcon
              style={{
                fontSize: 90,
                color: isListening ? "white" : "rgba(0, 0, 0, 0.54)",
              }}
            />
          </SpeakButton>
          <TranscriptBox>
            <b>TRANSCRIPT : </b> {note}
          </TranscriptBox>
        </SpeakSection>
        <ResponseSection>
          <RespHeader>Response from GPT-3</RespHeader>
          <ResponseBox>{savedNote}</ResponseBox>
        </ResponseSection>
      </Wrapper>
    </Container>
  );
}

const Container = styled("div")({
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

const Header = styled("div")({
  width: "-webkit-fill-available",
  textAlign: "center",
  padding: "40px",
  fontSize: "30px",
  fontWeight: 500,
  textTransform: "uppercase",
  boxShadow: "0px 20px 15px -10px rgba(0,0,0,0.1)",
  borderBottomLeftRadius: "4rem",
  borderBottomRightRadius: "4rem",
  background: "rgba(0,0,0,0.03) ",
});

const Wrapper = styled("div")({
  display: "flex",
  width: "100%",
  justifyContent: "space-evenly",
  marginTop: "50px",
  flexGrow: 1,
});

const SpeakSection = styled("div")({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
  width: "50%",
});

const TextBox = styled("div")({
  fontSize: "20px",
  color: "rgb(0,0,0,0.5)",
  marginBottom: "50px",
});

const SpeakButton = styled(IconButton)({
  boxShadow:
    "0px 20px 15px -10px rgb(0,0,0,0.1), 20px 15px 15px -10px rgb(0,0,0,0.1), -20px 15px 15px -10px rgb(0,0,0,0.1)",
  marginBottom: "50px",
});

const TranscriptBox = styled("div")({
  padding: "10px",
  fontSize: "15px",
  color: "#000000",
  width: "100%",
});

const ResponseSection = styled("div")({
  display: "flex",
  flexDirection: "column",
  padding: "20px",
  backgroundColor: "#193718",
  width: "50%",
});

const RespHeader = styled("div")({
  fontSize: "20px",
  color: "rgb(255,255,255,0.9)",
  marginBottom: "50px",
  textAlign: "center",
});

const ResponseBox = styled("div")({
  color: "rgb(255,255,255,0.9)",
  fontSize: "18px",
  padding: "20px",
});

export default App;
