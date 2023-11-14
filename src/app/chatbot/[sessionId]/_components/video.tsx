"use client";
import React, { useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";
import { TextModal } from "~/app/_components/modal";
import { useSettingsStorage } from "~/store/settings_store";
import HydrationZustand from "~/utils/hydration_zustand";

enum Recording_State {
  INITIAL,
  REQUESTION_PERMISSION,
  PERMISSION_DENIED,
  RECORDING,
  ERROR,
}

const RequestingVideoPermissionPopup = () => {
  return (
    <TextModal
      title="Requesting Video Permission"
      text="We need your video to transcribe your text. Please accept the popup on the top left of the screen."
    />
  );
};

const VideoDeniedPopup = () => {
  return (
    <TextModal
      title="Video Permission Denied"
      text="Please allow video access to use this feature. We can also deactivate video analysis completely."
    />
  );
};

const VideoSkeleton = () => {
  // Assuming a common video aspect ratio of 16:9
  return (
    <div className="h-36 w-full animate-pulse rounded-md bg-gray-200"></div>
  );
};

const VideoFeed = (props: { sessionId: number }) => {
  const [state, setState] = useState(Recording_State.INITIAL);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { mutate, isLoading } = api.analysis.analyzeScreenshot.useMutation();
  const recordingIntervall = 10000;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // helper function
  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;

    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]!);
    }
    return window.btoa(binary);
  };
  // on initial render
  useEffect(() => {
    const setupVideo = async () => {
      try {
        const timeout = setTimeout(() => {
          setState(Recording_State.REQUESTION_PERMISSION);
        }, 250);
        if (!streamRef.current) {
          streamRef.current = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
        }
        clearTimeout(timeout);
        setState(Recording_State.RECORDING);
        videoRef.current!.srcObject = streamRef.current;

        if (!intervalRef.current) {
          intervalRef.current = setInterval(async () => {
            const screenshot = await captureScreenshot();
            const base64String = arrayBufferToBase64(screenshot);
            mutate({ screenshot: base64String, sessionId: props.sessionId });
          }, recordingIntervall);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "NotAllowedError") {
          return setState(Recording_State.PERMISSION_DENIED);
        } else {
          return setState(Recording_State.ERROR);
        }
      }
    };

    setupVideo();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const captureScreenshot = (): Promise<ArrayBuffer> => {
    const videoElement = videoRef.current;
    if (!videoElement) {
      throw new Error("Video element is not available");
    }
    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const canvasContext = canvas.getContext("2d");
    if (!canvasContext) {
      throw new Error("Canvas context is not available");
    }
    canvasContext.drawImage(videoElement, 0, 0);
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result instanceof ArrayBuffer) {
              resolve(reader.result);
            } else {
              reject(new Error("Result is not an ArrayBuffer"));
            }
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsArrayBuffer(blob);
        } else {
          reject(new Error("Canvas to Blob conversion failed"));
        }
      }, "image/png");
    });
  };
  return (
    <div className="h-full w-full">
      {state === Recording_State.REQUESTION_PERMISSION && (
        <RequestingVideoPermissionPopup />
      )}
      {state === Recording_State.PERMISSION_DENIED && <VideoDeniedPopup />}
      {state !== Recording_State.RECORDING && <VideoSkeleton />}

      <video
        className={state === Recording_State.RECORDING ? "visible" : "hidden"}
        ref={videoRef}
        autoPlay
        playsInline
      ></video>
    </div>
  );
};

export const VideoAnalysis = (props: { sessionId: number }) => {
  const settingsStore = useSettingsStorage();

  if (!settingsStore.useVideo) {
    return null;
  }

  return (
    <HydrationZustand>
      <div className="m-2 w-96 rounded-md bg-white p-6 shadow-md">
        <h1 className="mb-4 text-xl font-bold">Your Video</h1>
        <VideoFeed sessionId={props.sessionId} />
      </div>
    </HydrationZustand>
  );
};
