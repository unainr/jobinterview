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

export function CreateAgentForm() {
	const [imageUploading, setImageUploading] = React.useState(false);
    const {mutate,isPending}= useCreateAgent()
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
	// const result = data?.[0]?.id ?? ""
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
		mutate(data,{
            onSuccess: (agent) => {
                toast.success("Agent created successfully!");
                form.reset();
				
				router.push(`/agent/${agent.id}`)
				
            },
            onError: () => {
				toast.error("Failed to create agent");
            },
        })
	}

	return (
		<Card className="w-full sm:max-w-lg">
			<CardHeader>
				<CardTitle>Create Agent</CardTitle>
				<CardDescription>
					Set up your AI interview agent. It will ask questions based on your
					role and background.
				</CardDescription>
			</CardHeader>
 
			<CardContent>
				<form id="create-agent-form" onSubmit={form.handleSubmit(onSubmit)}>
					<FieldGroup>
 
						{/* Agent Name */}
						<Controller
							name="name"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="agent-name">Agent Name</FieldLabel>
									<Input
										{...field}
										id="agent-name"
										placeholder="My Frontend Agent"
										autoComplete="off"
										aria-invalid={fieldState.invalid}
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
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="agent-role">Role</FieldLabel>
									<Input
										{...field}
										id="agent-role"
										placeholder="Frontend Developer"
										autoComplete="off"
										aria-invalid={fieldState.invalid}
									/>
									<FieldDescription>
										e.g. Backend Engineer, DevOps Engineer, Full Stack Developer
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
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="experience-level">
										Experience Level
									</FieldLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<SelectTrigger
											id="experience-level"
											aria-invalid={fieldState.invalid}
											className="mt-1.5 h-9 text-sm"
										>
											<SelectValue placeholder="Choose level" />
										</SelectTrigger>
										<SelectContent>
											{EXPERIENCE_LEVELS.map(({ value, label }) => (
												<SelectItem key={value} value={value} className="text-sm">
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
						<div className="space-y-2">
							<label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
								Banner Image
							</label>
							<label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all group">
								<div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center shrink-0">
									{imageUploading ? (
										<Spinner />
									) : (
										<HugeiconsIcon icon={Upload01Icon} strokeWidth={2} />
									)}
								</div>
								<div>
									<p className="text-sm text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
										{imageUploading ? "Uploading…" : "Click to upload banner"}
									</p>
									<p className="text-xs text-zinc-400">
										PNG, JPG, WEBP up to 5MB
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
											<div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
												<HugeiconsIcon icon={CircleCheckIcon} strokeWidth={2} />

												<span>Banner uploaded</span>
												<Progress value={100} className="flex-1 h-1" />
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
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel>Skills</FieldLabel>
									<FieldDescription>
										Pick the technologies relevant to your role.
									</FieldDescription>
									<div className="mt-2 flex flex-wrap gap-2">
										{SKILLS_LIST.map((skill) => {
											const isSelected = selectedSkills.includes(skill);
											return (
												<button
													key={skill}
													type="button"
													onClick={() => toggleSkill(skill)}
													className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
														isSelected
															? "bg-primary text-primary-foreground border-primary"
															: "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
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
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="about-me">
										About Me{" "}
										<span className="text-muted-foreground font-normal">
											(optional)
										</span>
									</FieldLabel>
									<InputGroup>
										<InputGroupTextarea
											{...field}
											id="about-me"
											placeholder="e.g. 3 years building React apps, worked at a fintech startup, led a team of 4..."
											rows={4}
											className="min-h-20 resize-none text-sm"
											aria-invalid={fieldState.invalid}
										/>
										<InputGroupAddon align="block-end">
											<InputGroupText className="tabular-nums text-xs">
												{(field.value ?? "").length}/300
											</InputGroupText>
										</InputGroupAddon>
									</InputGroup>
									<FieldDescription>
										Give the AI context about your background so it asks better
										questions.
									</FieldDescription>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>
 
					</FieldGroup>
				</form>
			</CardContent>
 
			<CardFooter>
				<Field orientation="horizontal">
					<Button type="button" variant="outline" onClick={() => form.reset()}>
						Reset
					</Button>
					<Button disabled={isPending || imageUploading} type="submit" form="create-agent-form">
						{
                            
                            isPending?<><Spinner /> Creating...</>:<>Create</>
                    }
					</Button>
				</Field>
			</CardFooter>
		</Card>
	);
}
