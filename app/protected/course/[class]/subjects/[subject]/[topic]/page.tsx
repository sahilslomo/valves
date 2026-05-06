"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Label = {
  type: "city" | "tag";
  value: string;
};

type Question = {
  q: string;
  a: string;
  labels?: Label[];
};

export default function TopicPage() {
  const params = useParams();

  const classId = params.class as string;
  const subject = params.subject as string;
  const topic = params.topic as string;
  const [openCommentsIndex, setOpenCommentsIndex] = useState<number | null>(null);
  const [comments, setComments] = useState<any>({});
  const [commentText, setCommentText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [data, setData] = useState<any>(null);

  // ✅ FILTER STATE
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/topics?class=${classId}&subject=${subject}&topic=${topic}`)
      .then(res => res.json())
      .then(setData);
  }, [classId, subject, topic]);

  // ✅ GET ALL UNIQUE LABELS FROM QUESTIONS
  const allLabels: string[] = Array.from(
    new Set(
      data?.questions?.flatMap((q: Question) =>
        q.labels?.map((l) => l.value) || []
      ) || []
    )
  );

  // ✅ TOGGLE FILTER
  const toggleFilter = (label: string) => {
    if (activeFilters.includes(label)) {
      setActiveFilters(activeFilters.filter((l) => l !== label));
    } else {
      setActiveFilters([...activeFilters, label]);
    }
  };

  // ✅ FILTERED QUESTIONS
  const filteredQuestions = data?.questions?.filter((q: Question) => {
    if (activeFilters.length === 0) return true;

    const qLabels = q.labels?.map((l) => l.value) || [];

    return activeFilters.every((f) => qLabels.includes(f));
  });

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">

      {/* HEADER */}
      <div className="p-6 rounded-2xl bg-white/30 backdrop-blur-xl border border-white/20 shadow">

        <h1 className="text-2xl font-bold">
          Class {classId} - {subject}
        </h1>

        <p className="text-lg mt-1">
          {data?.title || topic.replace(/-/g, " ")}
        </p>

      </div>

      {/* CONTENT */}
      {data?.content && (
        <div className="p-5 rounded-xl bg-white/20 backdrop-blur border">
          {data.content}
        </div>
      )}

      {/* ✅ FILTER BAR */}
      {allLabels.length > 0 && (
        <div className="p-4 border rounded-xl bg-white/20 backdrop-blur">
          <h3 className="font-semibold mb-2">Filter Questions</h3>

          <div className="flex gap-2 flex-wrap">
            {allLabels.map((label) => (
              <button
                key={label}
                onClick={() => toggleFilter(label)}
                className={`text-xs px-3 py-1 rounded-full border ${
                  activeFilters.includes(label)
                    ? "bg-black text-white"
                    : "bg-gray-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* QUESTIONS */}
      {filteredQuestions?.length > 0 && (
        <div className="space-y-4">

          <h2 className="text-xl font-semibold">Questions</h2>

          {filteredQuestions.map((q: Question, i: number) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-white/30 backdrop-blur border shadow space-y-2"
            >
              {/* COMMENTS BUTTON */}
               <div className="pt-2 border-t">
                <button
                onClick={() => setOpenCommentsIndex(i)}
                className="text-sm text-blue-600"
                >
                View comments
               </button>
              </div>

              {/* LABELS */}
              <div className="flex gap-2 flex-wrap">
                {q.labels?.map((l, idx) => (
                  <span
                    key={idx}
                    className={`text-xs px-2 py-1 rounded-full text-white ${
                      l.type === "city"
                        ? "bg-blue-500"
                        : "bg-green-600"
                    }`}
                  >
                    {l.value}
                  </span>
                ))}
              </div>

              <p className="font-semibold">
                Q{i + 1}. {q.q}
              </p>

              <p className="text-gray-700">
                {q.a}
              </p>

            </div>
          ))}

        </div>
      )}

      {/* NO RESULTS */}
      {filteredQuestions?.length === 0 && (
        <p className="text-gray-500 text-center">
          No questions match selected filters
        </p>
      )}

      {/* ================= COMMENTS BOTTOM SHEET ================= */}
{openCommentsIndex !== null && (
  <div className="fixed inset-0 bg-black/50 flex items-end z-50">

    <div className="bg-white w-full rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold">Comments</h2>

        <button onClick={() => setOpenCommentsIndex(null)}>
          ✕
        </button>
      </div>

      {/* ADD COMMENT */}
      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 text-sm flex-1"
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />

        <button
          className="bg-black text-white px-3 text-xs"
          onClick={async () => {

            if (editingId) {
              await fetch("/api/comments", {
                method: "PATCH",
                body: JSON.stringify({
                  type: "edit",
                  id: editingId,
                  text: commentText,
                  userId: "user1",
                  isAdmin: false,
                }),
              });
            } else {
              await fetch("/api/comments", {
                method: "POST",
                body: JSON.stringify({
                  topicSlug: topic,
                  classId,
                  subject,
                  questionIndex: openCommentsIndex,
                  text: commentText,
                  userId: "user1",
                  userName: "User",
                }),
              });
            }

            setCommentText("");
            setEditingId(null);

            const res = await fetch(
              `/api/comments?class=${classId}&subject=${subject}&topic=${topic}&qIndex=${openCommentsIndex}`
            );
            const data = await res.json();

            setComments((prev: any) => ({
              ...prev,
              [openCommentsIndex]: data,
            }));
          }}
        >
          {editingId ? "Update" : "Post"}
        </button>
      </div>

      {/* COMMENTS LIST */}
      <div className="space-y-3">
        {comments[openCommentsIndex]?.map((c: any) => (
          <div key={c.id} className="border p-2 rounded">

            <div className="flex justify-between">
              <b>{c.userName}</b>

              {/* 3 DOT (placeholder for next upgrade) */}
              <span>⋮</span>
            </div>

            <p className="text-sm">{c.text}</p>

            {/* EDIT / DELETE SIMPLE */}
            <div className="flex gap-3 text-xs mt-2 text-blue-500">

              <button
                onClick={() => {
                  setCommentText(c.text);
                  setEditingId(c.id);
                }}
              >
                Edit
              </button>

              <button
                onClick={async () => {
                  await fetch("/api/comments", {
                    method: "PATCH",
                    body: JSON.stringify({
                      type: "delete",
                      id: c.id,
                      userId: "user1",
                      isAdmin: false,
                    }),
                  });

                  const res = await fetch(
                    `/api/comments?class=${classId}&subject=${subject}&topic=${topic}&qIndex=${openCommentsIndex}`
                  );
                  const data = await res.json();

                  setComments((prev: any) => ({
                    ...prev,
                    [openCommentsIndex]: data,
                  }));
                }}
                className="text-red-500"
              >
                Delete
              </button>

            </div>

          </div>
        ))}
      </div>

    </div>
  </div>
)}

    </div>
  );
}