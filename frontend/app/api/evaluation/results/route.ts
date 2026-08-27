import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const reportPath = path.join(process.cwd(), "..", "evaluation", "results", "benchmark_report.json");

    if (!fs.existsSync(reportPath)) {
      return NextResponse.json({ error: "Rapport de benchmark introuvable." }, { status: 404 });
    }

    const fileContent = fs.readFileSync(reportPath, "utf-8");
    const data = JSON.parse(fileContent);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
