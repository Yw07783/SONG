import { NextResponse } from "next/server";
import { getUploadLogs, getPreferences, getChatMemory, markReviewed } from "@/lib/memoryStore";

/** GET → 获取记忆全景（供前端管理和审核） */
export async function GET() {
  try {
    const preferences = getPreferences();
    const chatMemory = getChatMemory();
    const uploadLogs = getUploadLogs();

    return NextResponse.json({
      preferences,
      chatMemory: chatMemory.slice(-10),
      uploadLogs,
      unreviewed: uploadLogs.filter((l) => !l.reviewed).length,
    });
  } catch (err) {
    return NextResponse.json({ error: "获取记忆失败" }, { status: 500 });
  }
}

/** PATCH → 标记审核 / 更新偏好 */
export async function PATCH(req: Request) {
  try {
    const { action, id, preferences } = await req.json() as {
      action: string;
      id?: string;
      preferences?: Record<string, unknown>;
    };

    if (action === "review" && id) {
      markReviewed(id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "未知操作" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
