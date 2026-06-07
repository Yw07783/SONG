import dynamic from "next/dynamic";

const JournalEditor = dynamic(() => import("@/components/JournalEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-200 animate-bounce" />
        <span className="w-2.5 h-2.5 rounded-full bg-rose-300 animate-bounce" style={{ animationDelay: "0.1s" }} />
        <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
      </div>
    </div>
  ),
});

export default function JournalPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        <JournalEditor />
      </div>
    </div>
  );
}
