import { IconMicrophone } from "@tabler/icons-react";
import React, { useState } from "react";

export const VoiceRecorderButton = () => {
  const [isRecording, setIsRecording] = useState(false);

  const handleRecord = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="relative flex justify-center">
      {isRecording && (
        <div 
          className="absolute bottom-full mb-2 bg-white border p-4 rounded shadow-lg max-w-md max-h-40 overflow-y-auto"
          style={{ transform: 'translateX(-50%)', left: '50%' }}
        >
          <p>Live Transcript:</p>
          <p>...fsfjksldfjlsdkjfklsdjfklsdjfklsjdfklsjdfl kjsdklfjksldjfklfsfnsknfsdkfdsjfkjsdlkfjsdkljfklsdjflksdj fkljskdjfklsjfklsjfkjsdlfjsdkfjsdklfjslkfjslfkdjfklsdjf lsjfkls fsfjksldfjlsdkjfklsdjfklsdjfklsjdfklsjdfl kjsdklfjksldjfklfsfnsknfsdkfdsjfkjsdlkfjsdkljfklsdjflksdj fkljskdjfklsjfklsjfkjsdlfjsdkfjsdklfjslkfjslfkdjfklsdjf lsjfkls</p>
        </div>
      )}
      <button
        onClick={handleRecord}
        className={`m-2 rounded-full bg-blue-500 p-4 ${
          isRecording ? "animate-pulse" : ""
        }`}
      >
        <IconMicrophone size={24} color="white" />
      </button>
    </div>
  );
};
