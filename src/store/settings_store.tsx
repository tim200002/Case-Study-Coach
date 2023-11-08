import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const supportedLanguageModels = ["OpenAI", "Vertex"] as const;
export type supportedLanguageModelType =
  (typeof supportedLanguageModels)[number];

export const supportedInputModalities = ["Text", "Voice"] as const;
export type supportedInputModalityType =
  (typeof supportedInputModalities)[number];

interface SettingsStorageState {
  languageModel: supportedLanguageModelType;
  selectLanguageModel: (language_model: supportedLanguageModelType) => void;

  inputModality: supportedInputModalityType;
  setInputModality: (input_modality: supportedInputModalityType) => void;
}

export const useSettingsStorage = create<SettingsStorageState>()(
  persist(
    (set) => ({
      languageModel: "Vertex",
      selectLanguageModel: (language_model: supportedLanguageModelType) =>
        set({ languageModel: language_model }),
      inputModality: "Voice",
      setInputModality: (input_modality: supportedInputModalityType) => {
        set({ inputModality: input_modality });
      },
    }),
    {
      name: "settings-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    },
  ),
);
