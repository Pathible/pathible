"use client";

import { useParams } from "next/navigation";
import type { Id } from "@/convex/_generated/dataModel";
import { TemplateEditor } from "../../components/template-editor";

export default function EditTemplatePage() {
  const params = useParams();
  const templateId = params.templateId as Id<"emailTemplates">;

  return <TemplateEditor templateId={templateId} />;
}
