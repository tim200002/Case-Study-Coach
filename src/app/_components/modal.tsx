"use client";

import { ReactNode } from "react";

export const Modal = (props: {
  onClose?: () => void;
  title: string;
  children: ReactNode;
}) => {
  const { onClose, title, children } = props;

  const handleOverlayClick = (event: any) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      onClick={onClose ? handleOverlayClick : undefined}
    >
      <div className="w-96 rounded-lg bg-white p-8 shadow-lg">
        <h2 className="mb-4 text-xl font-bold">{title}</h2>
        <div className="mb-6 text-gray-700">{children}</div>
        <div className="flex justify-end space-x-4"></div>
      </div>
    </div>
  );
};

export const TextModal = (props: {
  onClose?: () => void;
  title: string;
  text: string;
  onOk?: () => void;
  onDecline?: () => void;
}) => {
  const { onClose, title, text, onOk, onDecline } = props;
  return (
    <Modal onClose={onClose} title={title}>
      <p>{text}</p>
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
    </Modal>
  );
};
