import React, { useState } from "react";
import "./App.css";
import { useSpeechSynthesis } from "react-speech-kit";
import { styled } from "@material-ui/core/styles";
import { CircularProgress, IconButton } from "@material-ui/core";
import MicIcon from "@material-ui/icons/Mic";
import Background from "./assets/pwcGeom04.png";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const mic = new SpeechRecognition();
mic.continuous = true;
mic.interimResults = true;
mic.lang = "en-US";

function App() {
  const [isListening, setIsListening] = useState(false);
  const [note, setNote] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [responseHeading, setResponseHeading] = useState("");
  const [loadingResult, setLoadingResult] = useState(false);
  const { speak, cancel } = useSpeechSynthesis();

  const handleListen = async (listenStatus) => {
    if (listenStatus) {
      setNote("");
      mic.start();
      mic.onend = () => {
        mic.start();
      };
      cancel();
    } else {
      mic.stop();
      mic.onend = () => {};
      await askQuestion();
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
        setNote("");
      };
    };
  };

  const askQuestion = async () => {
    try {
      setResponseHeading("Processing your input...");
      setLoadingResult(true);
      let formData = new FormData();
      formData.append("question", note);
      const response = await fetch(
        "https://generativeaidev.azurewebsites.net/fileupload",
        {
          method: "POST",
          body: formData,
        }
      );
      if (response.ok) {
        setResponseHeading("Response from GPT-3");
        const data = await response.json();
        const parsedData = data.answer;
        handleSaveNote(parsedData);
      } else {
        handleSaveNote("Error: API call failed. Try again..");
      }
    } catch (err) {
      setResponseHeading("Response from GPT-3");
      handleSaveNote("Error: API call failed. Try again..");
    }
  };

  const handleSaveNote = (value) => {
    // Call OpenAI Apis using note
    setLoadingResult(false);
    let res = value?.split("\n")?.map((str) => <p>{str}</p>);
    setSavedNote(res);
    speak({ text: value });
  };

  const HandleSpeak = () => {
    setIsListening(!isListening);
    handleListen(!isListening);
  };

  return (
    <Container>
      <Header>Enhanced User interaction using gpt 3</Header>
      <Wrapper>
        <SpeechTranscriptcontainer>
          <SpeakSection>
            <SpeakButton
              onClick={HandleSpeak}
              style={{ backgroundColor: isListening ? "#EB8C00" : "white " }}
            >
              <MicIcon
                style={{
                  fontSize: 90,
                  color: isListening ? "white" : "rgba(0, 0, 0, 0.54)",
                }}
              />
            </SpeakButton>
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
          </SpeakSection>
          {note.length > 0 && (
            <TranscriptBox>
              <span style={{ color: "rgb(0,0,0,0.5)" }}>Transcript :</span>{" "}
              {note}
            </TranscriptBox>
          )}
        </SpeechTranscriptcontainer>
        {responseHeading.length > 0 && (
          <ResponseSection>
            <RespHeader>{responseHeading}</RespHeader>
            {loadingResult && (
              <CircularProgressContainer>
                <CircularProgress style={{ color: "#EB8C00" }} />
              </CircularProgressContainer>
            )}
            <ResponseBox>{savedNote}</ResponseBox>
          </ResponseSection>
        )}
      </Wrapper>
    </Container>
  );
}

const Container = styled("div")({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundImage: `url(${Background})`,
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
});

const Header = styled("div")({
  position: "fixed",
  top: 0,
  textAlign: "center",
  padding: "10px 40px",
  fontSize: "25px",
  fontWeight: 400,
  textTransform: "uppercase",
  color: "#EBEBEB",
  boxShadow: "0px 20px 15px -10px rgba(0,0,0,0.3)",
  background: "#2D2D2D",
  zIndex: 5,
});

const Wrapper = styled("div")({
  display: "flex",
  flexDirection: "column",
  width: "50%",
  background: "#FFFFFF",
  justifyContent: "center",
  alignItems: "center",
  marginTop: "50px",
  marginBottom: "50px",
  minHeight: "70vh",
  borderRadius: "10px",
  boxShadow: "0px 20px 15px -10px rgba(0,0,0,0.3)",
});

const SpeechTranscriptcontainer = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-evenly",
  width: "100%",
  margin: "20px",
});

const SpeakSection = styled("div")({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
});

const TextBox = styled("div")({
  fontSize: "15px",
  color: "rgb(0,0,0,0.5)",
});

const SpeakButton = styled(IconButton)({
  boxShadow:
    "0px 20px 15px -10px rgb(0,0,0,0.1), 20px 15px 15px -10px rgb(0,0,0,0.1), -20px 15px 15px -10px rgb(0,0,0,0.1)",
  marginBottom: "30px",
});

const TranscriptBox = styled("div")({
  padding: "10px",
  fontSize: "12px",
  color: "#000000",
  width: "40%",
  backgroundColor: "#F4F4F4",
  fontFamily: "Helvetica Neue",
  borderRadius: "10px",
  height: "200px",
  overflowY: "auto",
});

const ResponseSection = styled("div")({
  display: "flex",
  flexDirection: "column",
  padding: "20px",
  width: "70%",
  borderRadius: "10px",
  backgroundColor: "#F4F4F4",
  fontFamily: "Helvetica Neue",
  color: "#000000",
  marginBottom: "20px",
});

const RespHeader = styled("div")({
  fontSize: "20px",
  color: "#000000",
  textAlign: "center",
  fontFamily: "Helvetica Neue",
});

const CircularProgressContainer = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginTop: "20px",
});

const ResponseBox = styled("div")({
  color: "#000000",
  fontSize: "15px",
  fontFamily: "Helvetica Neue",
  fontWeight: 400,
  marginTop: "20px",
});

export default App;
