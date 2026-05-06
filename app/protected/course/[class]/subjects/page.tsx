"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

const subjects = [
  { id: "safety", name: "Safety" },
  { id: "electrical", name: "Electrical" },
  { id: "motor", name: "Motor" },
  { id: "mep", name: "MEP" },
];

type Topic = {
  title: string;
  slug: string;
};

export default function SubjectsPage() {
  const [active, setActive] = useState("safety");
  const [search, setSearch] = useState("");
  const [topics, setTopics] = useState<Topic[]>([]);

  const router = useRouter();
  const params = useParams();

  const classId = params.class as string;

  // 🔥 FETCH TOPICS FROM API
  useEffect(() => {
    if (!classId || !active) return;

    fetch(`/api/topics?class=${classId}&subject=${active}`)
      .then((res) => res.json())
      .then((data) => {
        const formatted: Topic[] = data.map((t: any) => ({
          title: t.title,
          slug: t.slug,
        }));
        setTopics(formatted);
      });
  }, [classId, active]);

  // ✅ Load previous search
  useEffect(() => {
    const saved = localStorage.getItem("topic-search");
    if (saved) setSearch(saved);
  }, []);

  // ✅ Save search
  useEffect(() => {
    localStorage.setItem("topic-search", search);
  }, [search]);

  const handleTopicClick = (slug: string) => {
    router.push(
      `/protected/course/${classId}/subjects/${active}/${slug}`
    );
  };

  const filteredTopics = topics.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">

      {/* SEARCH */}
      <div className="w-full max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search topics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-4 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/20 shadow outline-none"
        />
      </div>

      {/* SUBJECTS */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {subjects.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setActive(sub.id)}
            className="flex flex-col items-center min-w-[70px]"
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-sm font-bold
              ${
                active === sub.id
                  ? "bg-[#6F8F6B] text-white scale-105"
                  : "bg-white/40 backdrop-blur-md text-black"
              }
              transition-all duration-200 shadow`}
            >
              {sub.name[0]}
            </div>

            <span className="text-xs mt-2">{sub.name}</span>
          </button>
        ))}
      </div>

      {/* TOPICS */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTopics.length > 0 ? (
          filteredTopics.map((topic) => (
            <div
              key={topic.slug}
              onClick={() => handleTopicClick(topic.slug)}
              className="cursor-pointer p-4 rounded-xl bg-white/30 backdrop-blur-xl border border-white/20 shadow hover:scale-[1.02] transition"
            >
              {topic.title}
            </div>
          ))
        ) : (
          <p className="text-center text-sm text-gray-500">
            No topics found
          </p>
        )}
      </div>
    </div>
  );
}