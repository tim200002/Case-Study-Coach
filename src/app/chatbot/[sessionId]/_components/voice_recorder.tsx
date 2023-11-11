import { IconMicrophone } from "@tabler/icons-react";
import React, { useContext, useRef, useState } from "react";
import {
  TranscriptResponse,
  VoiceRecorder,
  VoiceRecorderState,
} from "../_logic/voice_recorder";
import { TextModal } from "~/app/_components/modal";
import { api } from "~/trpc/react";
import { QueryClient, useQueryClient } from "@tanstack/react-query";

enum Recording_State {
  NOT_STARTED,
  REQUESTING_MICROPHONE_PERMISSION,
  MICROPHONE_PERMISSION_DENIED,
  RECORDING,
  WAITING_FOR_TRANSCRIPTION,
  COMPLETED,
  ERROR,
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

export const VoiceRecorderButton = (props: {
  onSendMessage: (message: string) => void;
  sessionId: number;
}) => {
  const [transcript, setTranscript] = useState("");

  const [recordingState, setRecordingState] = useState(
    Recording_State.NOT_STARTED,
  );

  const queryClient = useQueryClient();
  const { mutate } = api.chatbot.addConversationEvaluation.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries().then(() => console.log("invalidated"));
    },
  });

  const onNewTranscript = (transcripts: TranscriptResponse[]) => {
    // calculate current transcript
    const transcriptText = transcripts
      .map((transcript) => {
        return transcript.transcript;
      })
      .join("");
    setTranscript(transcriptText);

    const currentTranscript = transcripts[transcripts.length - 1];
    if (currentTranscript && currentTranscript.isFinal) {
      console.log(currentTranscript);
      const speechSpeed = currentTranscript.averageSpeedWPMCurrent!;
      const speechClarity = currentTranscript.speechClarity!;
      mutate({
        sessionId: props.sessionId,
        speechClarity,
        speechSpeed,
        content: currentTranscript.transcript,
      });
    }
  };

  const voiceRecoderRef = useRef(new VoiceRecorder(onNewTranscript));
  const handleMicrophoneClick = () => {
    // Start recording
    if (
      recordingState === Recording_State.NOT_STARTED &&
      voiceRecoderRef.current.state === VoiceRecorderState.IDLE
    ) {
      // request microphone permission
      (async () => {
        // Show Popup that we are requesting microphone access.
        // Wait for a short period before shoing the popup in case requesting microphone access is fast
        const timeout = setTimeout(() => {
          setRecordingState(Recording_State.REQUESTING_MICROPHONE_PERMISSION);
        }, 250);

        // check request microphone access
        const successStartingRecording =
          await voiceRecoderRef.current.startRecording();
        clearTimeout(timeout);
        if (!successStartingRecording) {
          // Illustrate to use that we don't have microphone access and that he must change this
          return setRecordingState(
            Recording_State.MICROPHONE_PERMISSION_DENIED,
          );
        }
        setRecordingState(Recording_State.RECORDING);
      })();
    }

    // Stop recording
    else if (
      recordingState === Recording_State.RECORDING &&
      voiceRecoderRef.current.state === VoiceRecorderState.RECORDING
    ) {
      setRecordingState(Recording_State.WAITING_FOR_TRANSCRIPTION);
      voiceRecoderRef.current.stopRecording().then(() => {
        setRecordingState(Recording_State.COMPLETED);
      });
    }
    // error case
    else {
      throw new Error(
        "Error in voice recorder state machine. Invalid state combination detected. The combination was " +
          recordingState +
          " and " +
          voiceRecoderRef.current.state +
          ".",
      );
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

  const RequestionMicrophonePermissionPopup = () => {
    return (
      <TextModal
        title="Requesting Microphone Permission"
        text="We need your mice to transcribe your text. Please accept the popup on the top left of the screen."
      />
    );
  };

  const MicrophonePermissionDeniedPopup = () => {
    return (
      <TextModal
        title="Microphone Permission Denied"
        text="Please allow microphone access to use this feature. Else use the chat to send messages."
        onOk={() => setRecordingState(Recording_State.NOT_STARTED)}
      />
    );
  };

  return (
    <div>
      {recordingState === Recording_State.REQUESTING_MICROPHONE_PERMISSION && (
        <RequestionMicrophonePermissionPopup />
      )}
      {recordingState === Recording_State.MICROPHONE_PERMISSION_DENIED && (
        <MicrophonePermissionDeniedPopup />
      )}

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
              recordingState === Recording_State.RECORDING
                ? "animate-pulse"
                : ""
            }`}
          >
            <IconMicrophone size={24} color="white" />
          </button>
        )}
      </div>
    </div>
  );
};
