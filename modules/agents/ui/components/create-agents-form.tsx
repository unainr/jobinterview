"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	InputGroupTextarea,
} from "@/components/ui/input-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/lib/image-upload";
import { Spinner } from "@/components/ui/spinner";
import { HugeiconsIcon } from "@hugeicons/react";
import { CircleCheckIcon, Upload01Icon } from "@hugeicons/core-free-icons";
import { Progress } from "@/components/ui/progress";
import { useCreateAgent } from "../../hooks/use-create-agent";
import { useRouter } from "next/navigation";
import { useAgent } from "../../hooks/use-agent";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const EXPERIENCE_LEVELS = [
	{ value: "junior", label: "Junior (0–2 years)" },
	{ value: "mid", label: "Mid (2–5 years)" },
	{ value: "senior", label: "Senior (5–8 years)" },
	{ value: "lead", label: "Lead (8+ years)" },
] as const;

const SKILLS_LIST = [
	// frontend
	"React",
	"Next.js",
	"Vue",
	"Angular",
	"TypeScript",
	"JavaScript",
	"Tailwind CSS",
	// backend
	"Node.js",
	"Hono",
	"Express",
	"NestJS",
	"Python",
	"Django",
	"FastAPI",
	"Go",
	// database
	"PostgreSQL",
	"MySQL",
	"MongoDB",
	"Redis",
	"Drizzle ORM",
	"Prisma",
	// devops
	"Docker",
	"AWS",
	"GCP",
	"Azure",
	"CI/CD",
	"Kubernetes",
	// other
	"GraphQL",
	"REST APIs",
	"Git",
	"Linux",
];

// ─────────────────────────────────────────────
// SCHEMA — Zod v4 syntax
// ─────────────────────────────────────────────

const formSchema = z.object({
	name: z
		.string()
		.min(2, "Name must be at least 2 characters.")
		.max(40, "Name must be at most 40 characters."),
	role: z
		.string()
		.min(2, "Role is required.")
		.max(60, "Role must be at most 60 characters."),
	// Zod v4: z.enum() takes array directly, no options object
	experienceLevel: z.enum(["junior", "mid", "senior", "lead"]),
	avatarUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
		
	aboutMe: z.string().max(300, "Must be at most 300 characters.").optional(),
	skills: z.array(z.string()).min(1, "Select at least one skill."),
});

type FormValues = z.infer<typeof formSchema>;

// ─────────────────────────────────────────────
// FORM
// ─────────────────────────────────────────────

export function CreateAgentForm({ onSuccessAction }: { onSuccessAction?: (agentId: string) => void }) {
	const [imageUploading, setImageUploading] = React.useState(false);
	const { mutate, isPending } = useCreateAgent()
	const router = useRouter()
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			role: "",
			experienceLevel: undefined,
			avatarUrl: "",
			aboutMe: "",
			skills: [],
		},
	});
	const selectedSkills = form.watch("skills");

	const toggleSkill = (skill: string) => {
		const current = form.getValues("skills");
		const updated = current.includes(skill)
			? current.filter((s) => s !== skill)
			: [...current, skill];
		form.setValue("skills", updated, { shouldValidate: true });
	};

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setImageUploading(true);
		try {
			const url = await ImageUpload(file);
			if (url) {
				form.setValue("avatarUrl", url);
				toast.success("Image uploaded");
			} else {
				toast.error("Failed to upload image");
			}
		} catch {
			toast.error("Error uploading image");
		} finally {
			setImageUploading(false);
		}
	};

	function onSubmit(data: FormValues) {
		mutate(data, {
			onSuccess: (agent) => {
				toast.success("Agent created successfully!");
				form.reset();
				if (onSuccessAction) {
					onSuccessAction(agent.id);
				}
				router.push(`/agent/${agent.id}`);
			},
			onError: () => {
				toast.error("Failed to create agent");
			},
		})
	}

	return (
		<div className="w-full flex flex-col h-full pb-4">
			<form id="create-agent-form" onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-8">
				<FieldGroup className="space-y-6">

					{/* Agent Name */}
					<Controller
						name="name"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid} className="space-y-2">
								<FieldLabel htmlFor="agent-name" className="font-medium">Agent Name</FieldLabel>
								<Input
									{...field}
									id="agent-name"
									placeholder="e.g. Senior Frontend Specialist"
									autoComplete="off"
									aria-invalid={fieldState.invalid}
									className="h-10 transition-colors focus-visible:ring-primary/20"
								/>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>

					{/* Role */}
					<Controller
						name="role"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid} className="space-y-2">
								<FieldLabel htmlFor="agent-role" className="font-medium">Role</FieldLabel>
								<Input
									{...field}
									id="agent-role"
									placeholder="e.g. Frontend Developer"
									autoComplete="off"
									aria-invalid={fieldState.invalid}
									className="h-10 transition-colors focus-visible:ring-primary/20"
								/>
								<FieldDescription className="text-muted-foreground/70 text-xs">
									Specifying the exact role helps the AI generate more relevant questions.
								</FieldDescription>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>

					{/* Experience Level */}
					<Controller
						name="experienceLevel"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid} className="space-y-2">
								<FieldLabel htmlFor="experience-level" className="font-medium">
									Experience Level
								</FieldLabel>
								<Select onValueChange={field.onChange} value={field.value}>
									<SelectTrigger
										id="experience-level"
										aria-invalid={fieldState.invalid}
										className="h-10"
									>
										<SelectValue placeholder="Select experience level" />
									</SelectTrigger>
									<SelectContent>
										{EXPERIENCE_LEVELS.map(({ value, label }) => (
											<SelectItem key={value} value={value}>
												{label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>

					{/* Avatar URL */}
					<div className="space-y-3 pt-2">
						<label className="text-sm font-medium text-foreground">
							Banner Image <span className="text-muted-foreground font-normal">(optional)</span>
						</label>
						<label className="flex flex-col sm:flex-row items-center gap-4 p-5 rounded-xl border-2 border-dashed border-border bg-muted/20 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group">
							<div className="w-12 h-12 rounded-full bg-background border border-border shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
								{imageUploading ? (
									<Spinner className="text-primary" />
								) : (
									<HugeiconsIcon icon={Upload01Icon} strokeWidth={1.5} className="text-muted-foreground group-hover:text-primary transition-colors" />
								)}
							</div>
							<div className="flex flex-col text-center sm:text-left">
								<p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
									{imageUploading ? "Uploading your banner…" : "Click to upload a banner image"}
								</p>
								<p className="text-xs text-muted-foreground mt-0.5">
									Supports PNG, JPG, WEBP up to 5MB
								</p>
							</div>
							<Input
								type="file"
								accept="image/*"
								onChange={handleImageUpload}
								disabled={imageUploading}
								className="hidden"
							/>
						</label>
						<Controller
							name="avatarUrl"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<Input {...field} type="hidden" />
									{field.value && (
										<div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
											<HugeiconsIcon icon={CircleCheckIcon} strokeWidth={2} size={16} />
											<span>Banner uploaded successfully</span>
										</div>
									)}
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>
					</div>

					{/* Skills */}
					<Controller
						name="skills"
						control={form.control}
						render={({ fieldState }) => (
							<Field data-invalid={fieldState.invalid} className="space-y-3 pt-2">
								<FieldLabel className="font-medium">Core Skills</FieldLabel>
								<FieldDescription className="text-muted-foreground/70 text-xs">
									Select the technologies you want the AI to focus on during the interview.
								</FieldDescription>
								<div className="flex flex-wrap gap-2 pt-1">
									{SKILLS_LIST.map((skill) => {
										const isSelected = selectedSkills.includes(skill);
										return (
											<button
												key={skill}
												type="button"
												onClick={() => toggleSkill(skill)}
												className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
													isSelected
														? "bg-primary text-primary-foreground border-primary shadow-sm"
														: "bg-muted/30 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground hover:bg-muted/60"
												}`}
											>
												{skill}
											</button>
										);
									})}
								</div>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>

					{/* About Me */}
					<Controller
						name="aboutMe"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid} className="space-y-2 pt-2">
								<FieldLabel htmlFor="about-me" className="font-medium">
									About Me <span className="text-muted-foreground font-normal">(optional)</span>
								</FieldLabel>
								<InputGroup>
									<InputGroupTextarea
										{...field}
										id="about-me"
										placeholder="e.g. I have 3 years of experience building React applications. I recently worked at a fintech startup..."
										rows={4}
										className="min-h-[100px] resize-none p-3 transition-colors focus-visible:ring-primary/20"
										aria-invalid={fieldState.invalid}
									/>
									<InputGroupAddon align="block-end">
										<InputGroupText className="tabular-nums text-xs text-muted-foreground/50">
											{(field.value ?? "").length}/300
										</InputGroupText>
									</InputGroupAddon>
								</InputGroup>
								<FieldDescription className="text-muted-foreground/70 text-xs">
									Provide brief context about your background so the AI can ask more personalized questions.
								</FieldDescription>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>

				</FieldGroup>
			</form>

			<div className="mt-8 pt-6 border-t border-border flex items-center justify-end gap-3 sticky bottom-0 bg-background/95 backdrop-blur z-10">
				<Button type="button" variant="ghost" onClick={() => form.reset()} className="px-6">
					Clear
				</Button>
				<Button disabled={isPending || imageUploading} type="submit" form="create-agent-form" className="px-8 shadow-sm">
					{isPending ? (
						<>
							<Spinner className="mr-2" /> Creating...
						</>
					) : (
						<>Create Agent</>
					)}
				</Button>
			</div>
		</div>
	);
}
