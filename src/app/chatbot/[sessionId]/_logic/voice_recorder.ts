import { env } from "~/env.mjs";
import { Socket, io } from "socket.io-client";
import { Clerk, getAuth } from "@clerk/nextjs/dist/types/server";
import { auth } from "@clerk/nextjs";

const RECORDING_RATE = 500;

type TranscriptResponseNonFinal = {
  transcript: string;
  isFinal: false;
};

type TranscriptResponseFinal = {
  transcript: string;
  isFinal: true;
  speechClarity: number;
  speedWPM: number;
};

export type TranscriptResponse =
  | TranscriptResponseNonFinal
  | TranscriptResponseFinal;

export enum VoiceRecorderState {
  IDLE,
  RECORDING,
}
export class VoiceRecorder {
  state: VoiceRecorderState = VoiceRecorderState.IDLE;
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private socket: Socket | null = null;
  private transcriptHistory: TranscriptResponse[] = [];
  private getToken: () => Promise<string | null>;

  public onTranscriptChange: (transcripts: TranscriptResponse[]) => void;

  constructor(
    getToken: () => Promise<string | null>,
    onTranscriptChange: (transcripts: TranscriptResponse[]) => void,
  ) {
    this.getToken = getToken;
    this.onTranscriptChange = onTranscriptChange;
  }

  private async setupRecordingDevices(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      if (!this.stream) {
        return false;
      }

      this.recorder = new MediaRecorder(this.stream, {
        mimeType: "audio/webm",
      });

      if (!this.recorder) {
        return false;
      }

      this.state = VoiceRecorderState.IDLE;
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  private async setupSocket(): Promise<void> {
    if (this.socket) {
      this.socket.disconnect();
      console.log(
        "Socket already initialized before setup. This should not be the case.",
      );
    }

    const token = await this.getToken();
    if (!token) {
      throw new Error("Token is null");
    }

    this.socket = io(env.NEXT_PUBLIC_TRANSCRIPTION_SERVER_URL, {
      auth: {
        token,
      },
    });
    this.socket.on("connect", () => {
      console.log("Socket connected");
    });

    this.socket.on("transcript", (transcriptResponse: TranscriptResponse) => {
      if (transcriptResponse.isFinal) {
        this.transcriptHistory.push(transcriptResponse);
        this.onTranscriptChange(this.transcriptHistory);
      } else {
        this.onTranscriptChange([
          ...this.transcriptHistory,
          transcriptResponse,
        ]);
      }
    });

    this.socket.on("server_completed", () => {
      console.log("Server completed");
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    this.socket.on("connect_error", (err) => {
      throw new Error("Socket connection error: " + err);
    });
  }

  async startRecording(): Promise<boolean> {
    if (this.state !== VoiceRecorderState.IDLE) {
      throw new Error(
        "Cannot start recording when not ready. Current state: " + this.state,
      );
    }

    console.log("Setting up recording devices");
    const successSetupRecordingDevices = await this.setupRecordingDevices();
    if (!successSetupRecordingDevices) {
      return false;
    }
    console.log("Finished setting up recording devices");

    console.log("Setting up socket");
    await this.setupSocket();
    console.log("Finished setting up socket");

    console.log("Starting recording");
    this.recorder!.addEventListener("dataavailable", (event) => {
      this.socket!.emit("audio", event.data);
    });

    this.recorder!.start(RECORDING_RATE);
    this.state = VoiceRecorderState.RECORDING;
    return true;
  }

  async stopRecording(): Promise<void> {
    console.log("Stopping recording");
    if (this.state !== VoiceRecorderState.RECORDING) {
      throw new Error(
        "Cannot stop recording when not recording. Current state: " +
          this.state,
      );
    }

    // stop recording
    this.recorder!.stop();
    this.recorder?.stream.getTracks().forEach((track) => track.stop());

    // wait short amount
    await new Promise((resolve) => setTimeout(resolve, 100));

    await new Promise(async (resolve) => {
      this.socket!.on("server_completed", () => {
        resolve(null);
      });

      // send transcript finish event
      this.socket!.emit("client_completed");
    });

    // disconnect socket
    this.socket!.disconnect();

    this.state = VoiceRecorderState.IDLE;
  }
}
