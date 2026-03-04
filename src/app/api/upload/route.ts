import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const vehicleId = formData.get("vehicleId") as string | null;
  const contractId = formData.get("contractId") as string | null;
  const description = formData.get("description") as string | null;

  if (!file) {
    return NextResponse.json({ error: "Arquivo é obrigatório" }, { status: 400 });
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return NextResponse.json({ error: "Arquivo excede 10MB" }, { status: 400 });
  }

  const allowedTypes = [
    "image/jpeg", "image/png", "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Tipo de arquivo não permitido" }, { status: 400 });
  }

  try {
    const ext = path.extname(file.name);
    const filename = `${randomUUID()}${ext}`;
    const uploadPath = path.resolve(UPLOAD_DIR);
    
    await mkdir(uploadPath, { recursive: true });
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(path.join(uploadPath, filename), buffer);

    const attachment = await prisma.attachment.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        path: path.join(UPLOAD_DIR, filename),
        description: description || undefined,
        vehicleId: vehicleId || undefined,
        contractId: contractId || undefined,
      },
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao fazer upload" }, { status: 500 });
  }
}
