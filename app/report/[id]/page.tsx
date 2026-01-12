// app/report/[id]/page.tsx

import React from "react";
// 🔴 修改前可能是: import ReportClient from "./report-client";
// 🟢 修改后：加上花括号
import { ReportClient } from "./report-client"; 

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReportClient id={id} />;
}