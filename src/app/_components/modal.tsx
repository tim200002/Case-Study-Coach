"use client";
export const Modal = (props: {
  title: string;
  bodyText: string;
  onOk?: () => void;
  onDecline?: () => void | null;
}) => {
  const { title, bodyText, onOk, onDecline } = props;

  return (
    <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black bg-opacity-60">
      <div className="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-50">
        <div className="w-96 rounded-lg bg-white p-8 shadow-lg">
          <h2 className="mb-4 text-xl font-bold">{title}</h2>
          <p className="mb-6 text-gray-700">{bodyText}</p>
          <div className="flex justify-end space-x-4">
            {onDecline && (
              <button
                className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100"
                onClick={onDecline}
              >
                Cancel
              </button>
            )}
            {onOk && (
              <button
                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-400"
                onClick={onOk}
              >
                OK
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
