"use client"

import { useState } from "react";

export const TextInput = (props: { onSendMessage: (message: string) => void; }) => {
    const { onSendMessage } = props;
    const [inputValue, setInputValue] = useState("");

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputValue(event.target.value);
    };

    const handleSendClick = () => {
      if (inputValue.trim() !== "") {
        onSendMessage(inputValue);
        setInputValue("");
      }
    };

    return (
      <div className="flex flex-row p-2 items-center">
        <textarea
          className="grow rounded border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none overflow-y-auto resize-none transition-height"
          placeholder="Type your message here..."
          value={inputValue}
          onChange={handleInputChange}
        />
        <div className="w-4" />
        <button
          className="rounded-full bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
          onClick={handleSendClick}
        >
          Send
        </button>
      </div>
    );
};
