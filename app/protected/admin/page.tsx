"use client";

import { useState, useEffect } from "react";

const subjects = ["safety", "electrical", "motor", "mep"];
const labelOptions = ["MUMBAI", "CHENNAI", "KOCHI", "KOLKATA"];

export default function AdminPage() {
  const [classId, setClassId] = useState("");
  const [subject, setSubject] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);

  const [q, setQ] = useState("");
  const [a, setA] = useState("");

  const [labels, setLabels] = useState<string[]>([]);

  // ✅ NEW → dynamic custom labels
  const [customLabel, setCustomLabel] = useState("");

  const [editIndex, setEditIndex] = useState<number | null>(null);

  const slugify = (text: string) =>
    text.trim().toLowerCase().replace(/\s+/g, "-");

  const slug = slugify(title);

  useEffect(() => {
    if (!classId || !subject) return;

    fetch(`/api/topics?class=${classId}&subject=${subject}`)
      .then((res) => res.json())
      .then(setTopics);
  }, [classId, subject]);

  const refresh = () => {
    fetch(`/api/topics?class=${classId}&subject=${subject}`)
      .then((res) => res.json())
      .then(setTopics);
  };

  // ✅ CREATE / EDIT TOPIC
  const createOrEditTopic = async () => {
    if (selectedTopic) {
      await fetch("/api/topics", {
        method: "PATCH",
        body: JSON.stringify({
          type: "edit-topic",
          classId,
          subject,
          slug: selectedTopic.slug,
          title,
          content,
        }),
      });
    } else {
      const res = await fetch("/api/topics", {
        method: "POST",
        body: JSON.stringify({
          classId,
          subject,
          title,
          slug,
          content,
        }),
      });

      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
    }

    setTitle("");
    setContent("");
    setSelectedTopic(null);
    refresh();
  };

  // ➕ ADD / EDIT QUESTION
  const addQuestion = async () => {
    if (!selectedTopic) return;

    await fetch("/api/topics", {
      method: "PATCH",
      body: JSON.stringify({
        type: editIndex !== null ? "edit" : "add",
        classId,
        subject,
        slug: selectedTopic.slug,
        index: editIndex,
        question: {
          q,
          a,
          labels: labels.map((l) => ({
            type: labelOptions.includes(l) ? "city" : "tag",
            value: l,
          })),
        },
      }),
    });

    setQ("");
    setA("");
    setLabels([]);
    setCustomLabel("");
    setEditIndex(null);
    refresh();
  };

  // ❌ DELETE TOPIC
  const deleteTopic = async (t: any) => {
    await fetch("/api/topics", {
      method: "DELETE",
      body: JSON.stringify({
        classId,
        subject,
        slug: t.slug,
      }),
    });

    setSelectedTopic(null);
    refresh();
  };

  // ❌ DELETE QUESTION
  const deleteQuestion = async (index: number) => {
    await fetch("/api/topics", {
      method: "PATCH",
      body: JSON.stringify({
        type: "delete",
        classId,
        subject,
        slug: selectedTopic.slug,
        index,
      }),
    });

    refresh();
  };

  // ✅ toggle city labels
  const toggleLabel = (label: string) => {
    if (labels.includes(label)) {
      setLabels(labels.filter((l) => l !== label));
    } else {
      setLabels([...labels, label]);
    }
  };

  // ✅ ADD CUSTOM LABEL
  const addCustomLabel = () => {
    if (!customLabel.trim()) return;

    if (!labels.includes(customLabel.trim().toUpperCase())) {
      setLabels([...labels, customLabel.trim().toUpperCase()]);
    }

    setCustomLabel("");
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">

      <h1 className="text-2xl font-bold">⚙️ Admin Panel</h1>

      {/* CLASS */}
      <select
        className="w-full p-2 border"
        value={classId}
        onChange={(e) => {
          setClassId(e.target.value);
          setSubject("");
          setSelectedTopic(null);
        }}
      >
        <option value="">Select Class</option>
        <option value="2">Class 2</option>
        <option value="4">Class 4</option>
      </select>

      {/* SUBJECT */}
      {classId && (
        <select
          className="w-full p-2 border"
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            setSelectedTopic(null);
          }}
        >
          <option value="">Select Subject</option>
          {subjects.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      )}

      {/* CREATE / EDIT TOPIC */}
      {subject && (
        <div className="border p-4 space-y-3">

          <h2 className="font-semibold">
            {selectedTopic ? "Edit Topic" : "Create Topic"}
          </h2>

          <input
            className="w-full p-2 border"
            placeholder="Topic Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="w-full p-2 border"
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <button
            onClick={createOrEditTopic}
            className="bg-black text-white p-2 w-full"
          >
            {selectedTopic ? "✏️ Update Topic" : "➕ Create Topic"}
          </button>
        </div>
      )}

      {/* TOPIC LIST */}
      {topics.map((t) => (
        <div
          key={`${t.slug}-${t.classId}`}
          className={`p-3 border ${
            selectedTopic?.slug === t.slug ? "bg-gray-200" : ""
          }`}
        >
          <div className="flex justify-between items-center">

            <span
              className="cursor-pointer"
              onClick={() => setSelectedTopic(t)}
            >
              {t.title}
            </span>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedTopic(t);
                  setTitle(t.title);
                  setContent(t.content);
                }}
                className="text-blue-500 text-xs"
              >
                ✏️
              </button>

              <button
                onClick={() => deleteTopic(t)}
                className="text-red-500 text-xs"
              >
                ❌
              </button>
            </div>

          </div>
        </div>
      ))}

      {/* QUESTIONS */}
      {selectedTopic && (
        <div className="border p-4 space-y-3">

          <h2 className="font-semibold">
            Add Question → {selectedTopic.title}
          </h2>

          <input
            className="w-full p-2 border"
            placeholder="Question"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <textarea
            className="w-full p-2 border"
            placeholder="Answer"
            value={a}
            onChange={(e) => setA(e.target.value)}
          />

          {/* CITY LABELS */}
          <div className="flex gap-2 flex-wrap">
            {labelOptions.map((label) => (
              <button
                key={label}
                onClick={() => toggleLabel(label)}
                className={`text-xs px-2 py-1 rounded-full border ${
                  labels.includes(label)
                    ? "bg-black text-white"
                    : "bg-gray-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* CUSTOM LABEL INPUT */}
          <div className="flex gap-2">
            <input
              className="flex-1 p-2 border"
              placeholder="Add custom label (e.g IMPORTANT)"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
            />

            <button
              onClick={addCustomLabel}
              className="bg-gray-800 text-white px-3"
            >
              ➕
            </button>
          </div>

          {/* SELECTED LABEL PREVIEW */}
          <div className="flex gap-2 flex-wrap">
            {labels.map((l) => (
              <span
                key={l}
                className="text-xs px-2 py-1 rounded-full bg-black text-white"
              >
                {l}
              </span>
            ))}
          </div>

          <button
            onClick={addQuestion}
            className="bg-blue-600 text-white p-2 w-full"
          >
            {editIndex !== null ? "✏️ Update Question" : "➕ Add Question"}
          </button>

          {/* PREVIEW */}
          <div>
            <h3 className="font-semibold">Questions</h3>

            {selectedTopic.questions?.map((item: any, i: number) => (
              <div key={i} className="text-sm border p-2 mt-2">

                <div className="flex gap-2 mb-1 flex-wrap">
                  {item.labels?.map((l: any, idx: number) => (
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

                <b>Q{i + 1}:</b> {item.q}
                <p>{item.a}</p>

                <div className="flex gap-3 mt-2">

                  <button
                    onClick={() => {
                      setQ(item.q);
                      setA(item.a);
                      setLabels(item.labels?.map((l: any) => l.value) || []);
                      setEditIndex(i);
                    }}
                    className="text-blue-500 text-xs"
                  >
                    ✏️ Edit
                  </button>

                  <button
                    onClick={() => deleteQuestion(i)}
                    className="text-red-500 text-xs"
                  >
                    ❌ Delete
                  </button>

                </div>

              </div>
            ))}

          </div>
        </div>
      )}
    </div>
  );
}