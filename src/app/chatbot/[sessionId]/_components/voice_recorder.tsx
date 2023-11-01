import { IconMicrophone } from "@tabler/icons-react";
import React, { useState } from "react";

enum Recording_State {
  NOT_STARTED,
  RECORDING,
  COMPLETED,
}

const TranscriptPopup = (props: {
  text: string;
  setText: (text: string) => void;
  isEditable: boolean;
}) => {
  const { text, setText, isEditable } = props;

  const handleChange = (event: any) => {
    setText(event.target.value);
  };

  return (
    <div
      className="absolute bottom-full mb-2 max-h-40 w-96  rounded border bg-white p-4 shadow-lg"
      style={{ transform: "translateX(-50%)", left: "50%" }}
    >
      <p> {isEditable ? "Edit Transcript" : "Live Transcript"}</p>
      <textarea
        value={text}
        onChange={handleChange}
        readOnly={!isEditable}
        className="h-28 w-full resize-none rounded border p-2"
      />
    </div>
  );
};

export default TranscriptPopup;

export const VoiceRecorderButton = (props: {
  onSendMessage: (message: string) => void;
}) => {
  const [recordingState, setRecordingState] = useState(
    Recording_State.NOT_STARTED,
  );
  const [transcript, setTranscript] = useState("");

  const handleMicrophoneClick = () => {
    if (recordingState === Recording_State.NOT_STARTED) {
      setRecordingState(Recording_State.RECORDING);
    } else if (recordingState === Recording_State.RECORDING) {
      setRecordingState(Recording_State.COMPLETED);
    }
  };

  const reset = () => {
    setRecordingState(Recording_State.NOT_STARTED);
    setTranscript("");
  };

  const handleCancel = () => {
    // Handle cancellation logic here, if any.
    reset();
  };

  const handleAccept = () => {
    // Handle acceptance logic here, if any.
    props.onSendMessage(transcript);
    reset();
  };

  return (
    <div className="relative flex justify-center">
      {(recordingState === Recording_State.RECORDING ||
        recordingState === Recording_State.COMPLETED) && (
        <TranscriptPopup
          isEditable={recordingState === Recording_State.COMPLETED}
          text={transcript}
          setText={setTranscript}
        />
      )}

      {recordingState == Recording_State.COMPLETED ? (
        <div className="flex space-x-2">
          <button
            onClick={handleCancel}
            className="m-2 rounded bg-red-500 p-4 text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleAccept}
            className="m-2 rounded bg-green-500 p-4 text-white"
          >
            Accept
          </button>
        </div>
      ) : (
        <button
          onClick={handleMicrophoneClick}
          className={`m-2 rounded-full bg-blue-500 p-4 ${
            recordingState === Recording_State.RECORDING ? "animate-pulse" : ""
          }`}
        >
          <IconMicrophone size={24} color="white" />
        </button>
      )}
    </div>
  );
};
