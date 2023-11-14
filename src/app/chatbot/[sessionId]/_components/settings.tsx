"use client";
import { Modal } from "~/app/_components/modal";
import {
  supportedLanguageModels,
  useSettingsStorage,
} from "~/store/settings_store";
import { Toggle } from "./toggle";
import { useState } from "react";
import { IconSettings } from "@tabler/icons-react";

const SettingsModal = (props: { onClose: () => void }) => {
  const settingsStore = useSettingsStorage();
  const handleModelChange = (event: any) => {
    settingsStore.selectLanguageModel(event.target.value);
  };

  return (
    <Modal onClose={props.onClose} title="Settings">
      <div>
        <label
          htmlFor="languageModel"
          className="mb-2 block text-sm font-medium text-gray-900"
        >
          Language Model
        </label>
        <select
          id="languageModel"
          value={settingsStore.languageModel}
          onChange={handleModelChange}
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        >
          {supportedLanguageModels.map((model) => (
            <option value={model}>{model}</option>
          ))}
        </select>
      </div>
    </Modal>
  );
};

export const InputModalityToggle = () => {
  const settingsStore = useSettingsStorage();

  return (
    <Toggle
      label="Use Text Input"
      isActive={settingsStore.inputModality === "Text"}
      onChange={(isActive) => {
        if (isActive) {
          settingsStore.setInputModality("Text");
        } else {
          settingsStore.setInputModality("Voice");
        }
      }}
    />
  );
};

export const VideoToggle = () => {
  const settingsStore = useSettingsStorage();

  return (
    <Toggle
      label="Video Analysis"
      isActive={settingsStore.useVideo}
      onChange={(isActive) => {
        settingsStore.setUseVideo(isActive);
      }}
    />
  );
};

export const SettingsButton = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      <button
        onClick={() => setSettingsOpen(true)}
        className="fixed bottom-0 right-0 m-2 rounded-full bg-blue-500 p-2 text-white shadow-lg transition-colors duration-200 ease-in-out hover:bg-blue-600"
        aria-label="Open Settings"
      >
        <IconSettings />
      </button>
    </>
  );
};
