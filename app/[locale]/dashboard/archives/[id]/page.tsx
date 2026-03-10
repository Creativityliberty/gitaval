import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ArchiveDetailClient from "@/app/components/ArchiveDetailClient";

interface Props {
    params: { id: string };
}

export default async function ArchiveDetailPage({ params }: Props) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) notFound();

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) notFound();

    const raw = await prisma.project.findFirst({
        where: { id: params.id, userId: user.id }
    });

    if (!raw) notFound();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const project = {
        id: raw.id,
        repoUrl: raw.repoUrl,
        owner: raw.owner,
        repoName: raw.repoName,
        fileCount: raw.fileCount,
        tokenCount: raw.tokenCount,
        timestamp: raw.timestamp,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        exportFormat: (raw as any).exportFormat ?? null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        promptTemplate: (raw as any).promptTemplate ?? null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        digest: (raw as any).digest ?? null,
    };

    return <ArchiveDetailClient project={project} />;
}
