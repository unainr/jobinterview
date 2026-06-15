"use client";

import {
	createInterviewAssistant,
	InterviewAssistantConfig,
} from "@/lib/assistant";
import { getVapi } from "@/lib/vapi";
import {
	useCreditsBalance,
	useSpendCredits,
} from "@/modules/credits/hooks/use-credits";
import { useCreateSession } from "@/modules/sessions/hooks/use-create-sessions";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
// CHANGE 1: import updateCallVapiId to save Vapi call ID to DB

type Status = "idle" | "connecting" | "speaking" | "listening" | "thinking";
type Message = { role: "user" | "assistant"; content: string };

// CHANGE 2: accept `id` (DB row id) as second param
export function useVapiAgent(config: InterviewAssistantConfig, id: string) {
	const vapi = getVapi();
	const [status, setStatus] = useState<Status>("idle");
	const [messages, setMessages] = useState<Message[]>([]);
	const [liveAssistantText, setLiveAssistantText] = useState("");
	const [liveUserText, setLiveUserText] = useState("");
	const stoppingRef = useRef(false);
	const { mutate: createSession } = useCreateSession(); // ✅
	const { data: credits } = useCreditsBalance(); // ← add
	const { mutateAsync: spendCredits } = useSpendCredits(); // ← add

	useEffect(() => {
		const onCallStart = () => {
			stoppingRef.current = false;
			setStatus("listening");
		};

		const onCallEnd = () => {
			setStatus("idle");
			setLiveAssistantText("");
			setLiveUserText("");
		};

		const onSpeechStart = () => {
			if (!stoppingRef.current) setStatus("speaking");
		};

		const onSpeechEnd = () => {
			if (!stoppingRef.current) setStatus("listening");
		};

		const onMessage = (msg: any) => {
			if (msg.type !== "transcript") return;

			if (msg.role === "user" && msg.transcriptType === "partial") {
				setLiveUserText(msg.transcript);
				return;
			}
			if (msg.role === "assistant" && msg.transcriptType === "partial") {
				setLiveAssistantText(msg.transcript);
				return;
			}
			if (msg.transcriptType === "final") {
				setLiveAssistantText("");
				setLiveUserText("");
				setMessages((prev) => [
					...prev,
					{ role: msg.role, content: msg.transcript },
				]);
				if (msg.role === "user") setStatus("thinking");
			}
		};

		const onError = (err: any) => {
			console.error("❌ Vapi error:", err);
			setStatus("idle");
		};

		vapi.on("call-start", onCallStart);
		vapi.on("call-end", onCallEnd);
		vapi.on("speech-start", onSpeechStart);
		vapi.on("speech-end", onSpeechEnd);
		vapi.on("message", onMessage);
		vapi.on("error", onError);

		return () => {
			vapi.off("call-start", onCallStart);
			vapi.off("call-end", onCallEnd);
			vapi.off("speech-start", onSpeechStart);
			vapi.off("speech-end", onSpeechEnd);
			vapi.off("message", onMessage);
			vapi.off("error", onError);
		};
	}, [vapi]);

	const start = async () => {
		if ((credits?.balance ?? 0) < 10) {
			toast.error("You need 10 credits to start a voice interview", {
				action: {
					label: "Upgrade plan",
					onClick: () => (window.location.href = "/billing"),
				},
			});
			return;
		}
		setStatus("connecting");
		setMessages([]);

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			stream.getTracks().forEach((t) => t.stop());
		} catch {
			console.error("❌ Mic permission denied");
			setStatus("idle");
			return;
		}

		const assistantOverrides = {
			variableValues: {
				aboutMe: config.aboutMe,
				agentId: config.id,
				experienceLevel: config.experienceLevel,
				role: config.role,
				skills: config.skills,
			},
			clientMessages: ["transcript"],
			serverMessages: [],
		};

		try {
			// Deduct credits before starting the call
			try {
				await spendCredits();
			} catch (err) {
				console.error("⚠️ Failed to deduct credits", err);
				toast.error("Failed to deduct credits. Please try again.");
				setStatus("idle");
				return;
			}

			// CHANGE 3: capture return value — vapi.start() returns the call object
			// @ts-expect-error
			const call = await vapi.start(createInterviewAssistant(config),assistantOverrides);
			// CHANGE 4: save vapiCallId to DB so generateFeedback can fetch transcript
			// updateCallVapiId(dbRowId, vapiCallId)
			if (call?.id) {
				// ✅ create session with vapiCallId in one shot
				createSession(
					{
						agentId: id, // agent id from URL
						isPublicSession: false,
						vapiCallId: call.id, // ✅ vapi call id saved immediately
					},
					{
						onSuccess: (data: any) => {
							console.log("✅ Session created with vapiCallId:", data.data.id);
						},
						onError: () => {
							console.error("❌ Failed to save session");
						},
					},
				);
			}
		} catch (err) {
			console.error("❌ Vapi start error:", err);
			setStatus("idle");
		}
	};

	const stop = () => {
		stoppingRef.current = true;
		vapi.stop();
	};

	return {
		status,
		messages,
		liveAssistantText,
		liveUserText,
		start,
		stop,
		isActive: status !== "idle",
	};
}
