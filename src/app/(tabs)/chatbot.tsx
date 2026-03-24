import React, { useEffect, useMemo, useRef, useState } from "react";
import * as Speech from "expo-speech";
import { Audio, AVPlaybackStatus } from "expo-av";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Mic,
  Send,
  Square,
  Volume2,
  Bot,
  User,
  Play,
  Pause,
  Trash2,
} from "lucide-react-native";
import { AxiosError } from "axios";
import { ChatHistoryMessage, sendChatMessage } from "../../services/chatbot.api";

type MessageKind = "text" | "audio";
type MessageRole = "user" | "bot";

type ChatMessage = {
  id: string;
  role: MessageRole;
  kind: MessageKind;
  text?: string;
  durationSec?: number;
  audioUri?: string;
};

const MAX_HISTORY_MESSAGES = 20;

function formatDuration(totalSec: number) {
  const min = Math.floor(totalSec / 60)
    .toString()
    .padStart(2, "0");
  const sec = (totalSec % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}

function MessageBubble({
  item,
  isPlaying,
  playbackSec,
  onTogglePlay,
  isSpeakingText,
  onToggleSpeakText,
}: {
  item: ChatMessage;
  isPlaying: boolean;
  playbackSec: number;
  onTogglePlay: () => void;
  isSpeakingText: boolean;
  onToggleSpeakText: () => void;
}) {
  const isUser = item.role === "user";
  const totalSec = item.durationSec ?? 0;
  const currentSec = Math.min(playbackSec, totalSec);

  return (
    <View
      style={[
        styles.row,
        { justifyContent: isUser ? "flex-end" : "flex-start" },
      ]}
    >
      {!isUser && (
        <View style={[styles.avatar, styles.avatarBot]}>
          <Bot size={14} color="#1d4ed8" strokeWidth={2.4} />
        </View>
      )}

      <View
        style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleBot,
          item.kind === "audio" ? styles.audioBubble : null,
        ]}
      >
        {item.kind === "text" ? (
          <View style={styles.textBubbleWrap}>
            <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>
              {item.text}
            </Text>
            {!isUser && (
              <Pressable
                onPress={onToggleSpeakText}
                style={[styles.textToSpeechButton, isSpeakingText ? styles.textToSpeechButtonActive : null]}
              >
                {isSpeakingText ? (
                  <Square size={12} color="#1d4ed8" strokeWidth={2.7} />
                ) : (
                  <Volume2 size={14} color="#1d4ed8" strokeWidth={2.4} />
                )}
              </Pressable>
            )}
          </View>
        ) : (
          <View style={styles.audioRow}>
            <Pressable onPress={onTogglePlay} style={styles.audioPlayButton}>
              {isPlaying ? (
                <Pause
                  size={14}
                  color={isUser ? "#dbeafe" : "#1d4ed8"}
                  strokeWidth={2.6}
                />
              ) : (
                <Play
                  size={14}
                  color={isUser ? "#dbeafe" : "#1d4ed8"}
                  strokeWidth={2.6}
                />
              )}
            </Pressable>
            <View style={styles.waveWrap}>
              {Array.from({ length: 10 }).map((_, idx) => (
                <View
                  key={`${item.id}-wave-${idx}`}
                  style={[
                    styles.wave,
                    {
                      height: 8 + ((idx * 3) % 12),
                      backgroundColor: isUser ? "#bfdbfe" : "#93c5fd",
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.audioDuration, isUser ? styles.userText : styles.botText]}>
              {formatDuration(currentSec)} / {formatDuration(totalSec)}
            </Text>
          </View>
        )}
      </View>

      {isUser && (
        <View style={[styles.avatar, styles.avatarUser]}>
          <User size={14} color="#1e3a8a" strokeWidth={2.4} />
        </View>
      )}
    </View>
  );
}

export default function ChatbotScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "bot-initial",
      role: "bot",
      kind: "text",
      text: "Hello. I am Sahachari assistant. You can chat with text or send an audio query.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSec, setRecordingSec] = useState(0);
  const [draftAudioSec, setDraftAudioSec] = useState(0);
  const [draftAudioUri, setDraftAudioUri] = useState<string | null>(null);
  const [isDraftPlaying, setIsDraftPlaying] = useState(false);
  const [draftPlaybackSec, setDraftPlaybackSec] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [playbackSecById, setPlaybackSecById] = useState<Record<string, number>>({});
  const [speakingTextId, setSpeakingTextId] = useState<string | null>(null);
  const [history, setHistory] = useState<ChatHistoryMessage[]>([]);
  const [isSendingText, setIsSendingText] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    if (!isRecording) {
      return;
    }

    const timer = setInterval(() => {
      setRecordingSec((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRecording]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 50);
    return () => clearTimeout(timeout);
  }, [messages.length]);

  useEffect(() => {
    return () => {
      Speech.stop();
      const recording = recordingRef.current;
      const sound = soundRef.current;
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => undefined);
      }
      if (sound) {
        sound.unloadAsync().catch(() => undefined);
      }
    };
  }, []);

  const canSendText = useMemo(
    () => input.trim().length > 0 && !isSendingText,
    [input, isSendingText],
  );
  const canSendAudio = useMemo(
    () => !isRecording && !!draftAudioUri && draftAudioSec > 0,
    [isRecording, draftAudioSec, draftAudioUri],
  );
  const canSend = canSendText || canSendAudio;

  const stopSoundPlayback = async () => {
    const sound = soundRef.current;
    if (!sound) {
      setPlayingAudioId(null);
      setIsDraftPlaying(false);
      return;
    }

    try {
      const status = await sound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await sound.stopAsync();
      }
    } catch {
      // Ignore status/stop errors for stale sound references.
    }

    try {
      await sound.unloadAsync();
    } catch {
      // Ignore unload failures and continue resetting local state.
    }

    soundRef.current = null;
    setPlayingAudioId(null);
    setIsDraftPlaying(false);
  };

  const startAudioPlayback = async (
    uri: string,
    target: { type: "draft" } | { type: "message"; id: string },
  ) => {
    await stopSoundPlayback();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });

    const sound = new Audio.Sound();
    soundRef.current = sound;

    sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
      if (!status.isLoaded) {
        return;
      }

      const currentSec = Math.floor((status.positionMillis ?? 0) / 1000);

      if (target.type === "draft") {
        setDraftPlaybackSec(currentSec);
        setIsDraftPlaying(status.isPlaying);
      } else {
        setPlaybackSecById((prev) => ({ ...prev, [target.id]: currentSec }));
        setPlayingAudioId(status.isPlaying ? target.id : null);
      }

      if (status.didJustFinish) {
        if (target.type === "draft") {
          setIsDraftPlaying(false);
        } else {
          setPlayingAudioId(null);
        }

        sound.unloadAsync().catch(() => undefined);
        if (soundRef.current === sound) {
          soundRef.current = null;
        }
      }
    });

    if (target.type === "draft") {
      setIsDraftPlaying(true);
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(target.id);
      setIsDraftPlaying(false);
    }

    await sound.loadAsync(
      { uri },
      { shouldPlay: true, progressUpdateIntervalMillis: 250 },
    );
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (trimmed) {
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        kind: "text",
        text: trimmed,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsSendingText(true);

      try {
        const response = await sendChatMessage({
          message: trimmed,
          history,
        });

        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: "bot",
          kind: "text",
          text: response.reply,
        };

        setMessages((prev) => [...prev, botMessage]);
        setHistory((prev) => {
          const next: ChatHistoryMessage[] = [
            ...prev,
            { role: "user", parts: [{ text: trimmed }] },
            { role: "model", parts: [{ text: response.reply }] },
          ];
          return next.slice(-MAX_HISTORY_MESSAGES);
        });
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string | string[] }>;
        const statusCode = axiosError.response?.status;
        const apiMessage = axiosError.response?.data?.message;
        const normalizedMessage = Array.isArray(apiMessage)
          ? apiMessage[0]
          : apiMessage;

        let fallbackMessage = "Saha is unavailable right now. Please try again.";
        if (statusCode === 401) {
          fallbackMessage = "Please login again to continue chatting with Saha.";
        } else if (statusCode === 429) {
          fallbackMessage = "Saha is too busy right now, please try again in a moment!";
        } else if (statusCode === 400) {
          fallbackMessage = "Invalid chat request. Please send a valid message.";
        }

        const botErrorMessage: ChatMessage = {
          id: `bot-error-${Date.now()}`,
          role: "bot",
          kind: "text",
          text: normalizedMessage || fallbackMessage,
        };

        setMessages((prev) => [...prev, botErrorMessage]);
      } finally {
        setIsSendingText(false);
      }

      return;
    }

    if (canSendAudio && draftAudioUri) {
      const audioId = `user-audio-${Date.now()}`;
      const userAudio: ChatMessage = {
        id: audioId,
        role: "user",
        kind: "audio",
        durationSec: draftAudioSec,
        audioUri: draftAudioUri,
      };

      setMessages((prev) => [...prev, userAudio]);
      setPlaybackSecById((prev) => ({ ...prev, [audioId]: 0 }));
      setDraftAudioSec(0);
      setDraftAudioUri(null);
      setDraftPlaybackSec(0);
      setIsDraftPlaying(false);

      setTimeout(() => {
        const botAudioAck: ChatMessage = {
          id: `bot-audio-${Date.now()}`,
          role: "bot",
          kind: "text",
          text: "Audio received. I am processing your voice query.",
        };
        setMessages((prev) => [...prev, botAudioAck]);
      }, 500);
    }
  };

  const startRecording = async () => {
    const permission = await Audio.requestPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("Microphone permission", "Please allow microphone access to record audio.");
      return;
    }

    await stopSoundPlayback();
    Speech.stop();
    setSpeakingTextId(null);

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await recording.startAsync();

    recordingRef.current = recording;
    setDraftPlaybackSec(0);
    setDraftAudioSec(0);
    setDraftAudioUri(null);
    setRecordingSec(0);
    setIsRecording(true);
  };

  const stopRecording = async (saveDraft: boolean) => {
    const recording = recordingRef.current;
    setIsRecording(false);

    if (!recording) {
      return;
    }

    try {
      await recording.stopAndUnloadAsync();
      const status = await recording.getStatusAsync();
      const uri = recording.getURI();

      if (uri && saveDraft) {
        const duration = Math.max(
          1,
          Math.round(((status.durationMillis ?? 0) || recordingSec * 1000) / 1000),
        );
        setDraftAudioUri(uri);
        setDraftAudioSec(duration);
        setDraftPlaybackSec(0);
      } else if (!saveDraft) {
        setDraftAudioUri(null);
        setDraftAudioSec(0);
        setDraftPlaybackSec(0);
        setIsDraftPlaying(false);
      }
    } catch {
      Alert.alert("Recording failed", "Could not finalize audio recording. Please try again.");
    } finally {
      recordingRef.current = null;
      setRecordingSec(0);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      }).catch(() => undefined);
    }
  };

  const toggleAudioRecording = async () => {
    if (!isRecording) {
      await startRecording();
      return;
    }

    await stopRecording(true);
  };

  const discardCurrentRecording = async () => {
    if (!isRecording) {
      return;
    }

    await stopRecording(false);
  };

  const toggleDraftPlayback = async () => {
    if (draftAudioSec <= 0 || isRecording || !draftAudioUri) {
      return;
    }

    const currentSound = soundRef.current;
    if (isDraftPlaying && currentSound) {
      try {
        await currentSound.pauseAsync();
      } catch {
        // Ignore pause errors on stale playback instances.
      }
      return;
    }

    if (!isDraftPlaying && currentSound && !playingAudioId) {
      try {
        const status = await currentSound.getStatusAsync();
        if (status.isLoaded) {
          await currentSound.playAsync();
          setIsDraftPlaying(true);
          return;
        }
      } catch {
        // Fall through to fresh playback start.
      }
    }

    Speech.stop();
    setSpeakingTextId(null);
    if (!isDraftPlaying && draftPlaybackSec >= draftAudioSec) {
      setDraftPlaybackSec(0);
    }

    await startAudioPlayback(draftAudioUri, { type: "draft" });
  };

  const deleteDraftAudio = async () => {
    await stopSoundPlayback();
    setDraftAudioUri(null);
    setDraftAudioSec(0);
    setDraftPlaybackSec(0);
    setIsDraftPlaying(false);
  };

  const toggleMessagePlayback = async (message: ChatMessage) => {
    if (message.kind !== "audio" || !message.audioUri) {
      return;
    }

    const currentSound = soundRef.current;
    if (playingAudioId === message.id && currentSound) {
      try {
        const status = await currentSound.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await currentSound.pauseAsync();
          setPlayingAudioId(null);
          return;
        }
        if (status.isLoaded && !status.isPlaying) {
          await currentSound.playAsync();
          setPlayingAudioId(message.id);
          return;
        }
      } catch {
        // Ignore stale instance errors and start fresh playback below.
      }
    }

    Speech.stop();
    setSpeakingTextId(null);
    setIsDraftPlaying(false);
    setDraftPlaybackSec(0);

    const totalSec = message.durationSec ?? 0;
    const currentSec = playbackSecById[message.id] ?? 0;
    if (currentSec >= totalSec) {
      setPlaybackSecById((prev) => ({ ...prev, [message.id]: 0 }));
    }

    await startAudioPlayback(message.audioUri, { type: "message", id: message.id });
  };

  const toggleSpeakBotText = async (message: ChatMessage) => {
    if (message.role !== "bot" || message.kind !== "text" || !message.text?.trim()) {
      return;
    }

    if (speakingTextId === message.id) {
      Speech.stop();
      setSpeakingTextId(null);
      return;
    }

    await stopSoundPlayback();

    Speech.stop();
    setSpeakingTextId(message.id);
    Speech.speak(message.text, {
      language: "en-IN",
      pitch: 1,
      rate: 0.95,
      onDone: () => setSpeakingTextId(null),
      onStopped: () => setSpeakingTextId(null),
      onError: () => setSpeakingTextId(null),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ ios: "padding", android: "height" })}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 86 }) ?? 0}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sahachari Assistant</Text>
          <Text style={styles.headerSubtitle}>Text chat + audio chat</Text>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble
              item={item}
              isPlaying={playingAudioId === item.id}
              playbackSec={playbackSecById[item.id] ?? 0}
              onTogglePlay={() => {
                void toggleMessagePlayback(item);
              }}
              isSpeakingText={speakingTextId === item.id}
              onToggleSpeakText={() => {
                void toggleSpeakBotText(item);
              }}
            />
          )}
          contentContainerStyle={[styles.listContent, { paddingBottom: 16 + insets.bottom }]}
          keyboardShouldPersistTaps="handled"
        />

        {isRecording && (
          <View style={styles.recordingBanner}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording {formatDuration(recordingSec)}</Text>
            <Pressable
              onPress={() => {
                void discardCurrentRecording();
              }}
              style={styles.draftControlButton}
            >
              <Trash2 size={14} color="#991b1b" strokeWidth={2.6} />
            </Pressable>
            <Text style={styles.recordingHint}>Stop to save, trash to discard</Text>
          </View>
        )}

        {!isRecording && draftAudioSec > 0 && (
          <View style={styles.recordingBanner}>
            <Volume2 size={16} color="#991b1b" strokeWidth={2.4} />
            <Text style={styles.recordingText}>
              Audio draft {formatDuration(draftPlaybackSec)} / {formatDuration(draftAudioSec)}
            </Text>
            <Pressable
              onPress={() => {
                void toggleDraftPlayback();
              }}
              style={styles.draftControlButton}
            >
              {isDraftPlaying ? (
                <Pause size={14} color="#991b1b" strokeWidth={2.6} />
              ) : (
                <Play size={14} color="#991b1b" strokeWidth={2.6} />
              )}
            </Pressable>
            <Pressable
              onPress={() => {
                void deleteDraftAudio();
              }}
              style={styles.draftControlButton}
            >
              <Trash2 size={14} color="#991b1b" strokeWidth={2.6} />
            </Pressable>
            <Text style={styles.recordingHint}>Send button to share</Text>
          </View>
        )}

        <View style={styles.composerWrap}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message"
            placeholderTextColor="#94a3b8"
            multiline
            editable={!isSendingText}
            style={styles.input}
          />

          <Pressable
            onPress={() => {
              void toggleAudioRecording();
            }}
            style={[styles.iconButton, isRecording ? styles.stopButton : styles.micButton]}
          >
            {isRecording ? (
              <Square size={18} color="#ffffff" strokeWidth={2.5} />
            ) : (
              <Mic size={18} color="#ffffff" strokeWidth={2.5} />
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              void sendMessage();
            }}
            disabled={!canSend}
            style={[styles.iconButton, canSend ? styles.sendButton : styles.sendButtonDisabled]}
          >
            <Send size={18} color="#ffffff" strokeWidth={2.5} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#eef2ff",
  },
  container: {
    flex: 1,
    backgroundColor: "#eef2ff",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#dbeafe",
    backgroundColor: "#f8faff",
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#dbeafe",
  },
  headerBadgeText: {
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: "700",
  },
  headerTitle: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#475569",
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarBot: {
    backgroundColor: "#dbeafe",
  },
  avatarUser: {
    backgroundColor: "#bfdbfe",
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: "#1d4ed8",
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  audioBubble: {
    minWidth: 190,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  textBubbleWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  textToSpeechButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dbeafe",
  },
  textToSpeechButtonActive: {
    backgroundColor: "#bfdbfe",
  },
  userText: {
    color: "#eff6ff",
    flexShrink: 1,
  },
  botText: {
    color: "#0f172a",
    flexShrink: 1,
  },
  audioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  audioPlayButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  waveWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    flex: 1,
  },
  wave: {
    width: 3,
    borderRadius: 99,
  },
  audioDuration: {
    fontSize: 12,
    fontWeight: "700",
    minWidth: 38,
    textAlign: "right",
  },
  recordingBanner: {
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fecaca",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#dc2626",
  },
  recordingText: {
    color: "#991b1b",
    fontWeight: "800",
    fontSize: 13,
  },
  recordingHint: {
    color: "#b91c1c",
    fontSize: 12,
    marginLeft: "auto",
  },
  draftControlButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fecaca",
  },
  composerWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#dbeafe",
    backgroundColor: "#f8faff",
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0f172a",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  micButton: {
    backgroundColor: "#0ea5e9",
  },
  stopButton: {
    backgroundColor: "#dc2626",
  },
  sendButton: {
    backgroundColor: "#1d4ed8",
  },
  sendButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
});
