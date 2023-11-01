import { IconMicrophone } from "@tabler/icons-react";
import React, { useState } from "react";

export const VoiceRecorderButton = () => {
  const [isRecording, setIsRecording] = useState(false);

  const handleRecord = () => {
    setIsRecording(!isRecording);
  };

  return (
    <button
      onClick={handleRecord}
      className={`relative m-2 rounded-full bg-blue-500 p-4 ${
        isRecording ? "animate-pulse" : ""
      }`}
    >
      <IconMicrophone size={24} color="white" />
    </button>
  );
};
