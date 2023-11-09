import { Modal } from "~/app/_components/modal";
import {
  supportedLanguageModels,
  useSettingsStorage,
} from "~/store/settings_store";

export const SettingsModal = (props: { onClose: () => void }) => {
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
