import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "@/lib/auth";
import { getContent, saveContent } from "@/lib/storage";

export const runtime = "nodejs";

const Hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Choose a valid six-digit hex color.");

const EmailTemplateInput = z
  .object({
    subject: z.string().min(1).max(180),
    eyebrow: z.string().min(1).max(100),
    heading: z.string().min(1).max(180),
    subtitle: z.string().max(300),
    intro: z.string().min(1).max(500),
    message: z.string().min(1).max(1600),
    signoff: z.string().min(1).max(800),
    footer: z.string().min(1).max(1000),
    background: Hex,
    surface: Hex,
    headerBackground: Hex,
    border: Hex,
    accent: Hex,
    headingText: Hex,
    bodyText: Hex,
    mutedText: Hex,
  })
  .strict();

const Patch = z
  .object({
    metadataTitle: z.string().max(140).optional(),
    metadataDescription: z.string().max(280).optional(),
    eyebrow: z.string().max(80).optional(),
    headline: z.string().max(280).optional(),
    headlineAccent: z.string().max(80).optional(),
    subheadline: z.string().max(280).optional(),
    body: z.string().max(6000).optional(),
    bookTitle: z.string().max(140).optional(),
    author: z.string().max(140).optional(),
    coverEyebrow: z.string().max(80).optional(),
    coverEdition: z.string().max(80).optional(),
    formHeading: z.string().max(160).optional(),
    formMicrocopy: z.string().max(160).optional(),
    formBadge: z.string().max(40).optional(),
    formEmailLabel: z.string().max(100).optional(),
    formPlaceholder: z.string().max(100).optional(),
    buttonText: z.string().max(40).optional(),
    formLoadingText: z.string().max(40).optional(),
    formSubmittedText: z.string().max(40).optional(),
    privacyNote: z.string().max(240).optional(),
    formInvalidEmailMessage: z.string().max(160).optional(),
    formNetworkErrorMessage: z.string().max(160).optional(),
    formGenericErrorMessage: z.string().max(160).optional(),
    formSuccessMessage: z.string().max(160).optional(),
    formExistingMessage: z.string().max(160).optional(),
    footerText: z.string().max(240).optional(),
    footerCreditLabel: z.string().max(40).optional(),
    footerCreditName: z.string().max(100).optional(),
    footerCreditUrl: z.string().url().max(2000).optional(),
    coverImage: z.string().max(2000).optional(),
    releaseDate: z.string().max(60).optional(),

    upcomingEnabled: z.boolean().optional(),
    upcomingEyebrow: z.string().max(80).optional(),
    upcomingTitle: z.string().max(140).optional(),
    upcomingAuthor: z.string().max(140).optional(),
    upcomingSubheadline: z.string().max(280).optional(),
    upcomingBody: z.string().max(6000).optional(),
    upcomingCoverImage: z.string().max(2000).optional(),
    upcomingCoverEyebrow: z.string().max(80).optional(),
    upcomingCoverEdition: z.string().max(80).optional(),
    upcomingReleaseDate: z.string().max(60).optional(),
    upcomingFormHeading: z.string().max(160).optional(),
    upcomingFormMicrocopy: z.string().max(160).optional(),
    upcomingFormBadge: z.string().max(40).optional(),
    upcomingFormEmailLabel: z.string().max(100).optional(),
    upcomingFormPlaceholder: z.string().max(100).optional(),
    upcomingButtonText: z.string().max(40).optional(),
    upcomingFormLoadingText: z.string().max(40).optional(),
    upcomingFormSubmittedText: z.string().max(40).optional(),
    upcomingPrivacyNote: z.string().max(240).optional(),
    upcomingFormInvalidEmailMessage: z.string().max(160).optional(),
    upcomingFormNetworkErrorMessage: z.string().max(160).optional(),
    upcomingFormGenericErrorMessage: z.string().max(160).optional(),
    upcomingFormSuccessMessage: z.string().max(160).optional(),
    upcomingFormExistingMessage: z.string().max(160).optional(),
    upcomingEmailTemplate: EmailTemplateInput.optional(),
  })
  .strict();

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const content = await getContent();
  return NextResponse.json({ success: true, content });
}

export async function PUT(req: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
  }
  const parsed = Patch.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const content = await saveContent(parsed.data);
  return NextResponse.json({ success: true, content });
}
