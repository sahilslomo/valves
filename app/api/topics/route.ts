let topics: any[] = [];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const classId = searchParams.get("class");
  const subject = searchParams.get("subject");
  const slug = searchParams.get("topic");

  // 🔹 Get single topic
  if (slug) {
    const found = topics.find(
      (t) =>
        t.classId === classId &&
        t.subject === subject &&
        t.slug === slug
    );

    return Response.json(found || {});
  }

  // 🔹 Get all topics
  const filtered = topics.filter(
    (t) =>
      t.classId === classId &&
      t.subject === subject
  );

  return Response.json(filtered);
}


// ✅ CREATE TOPIC
export async function POST(req: Request) {
  const body = await req.json();

  const exists = topics.find(
    (t) =>
      t.classId === body.classId &&
      t.subject === body.subject &&
      t.slug === body.slug
  );

  if (exists) {
    return Response.json(
      { error: "Topic already exists" },
      { status: 400 }
    );
  }

  topics.push({
    classId: body.classId,
    subject: body.subject,
    title: body.title,
    slug: body.slug,
    content: body.content,
    questions: [],
  });

  return Response.json({ success: true });
}


// ✅ UPDATE (ADD / EDIT / DELETE)
export async function PATCH(req: Request) {
  const body = await req.json();

  const topic = topics.find(
    (t) =>
      t.classId === body.classId &&
      t.subject === body.subject &&
      t.slug === body.slug
  );

  if (!topic) {
    return Response.json({ error: "Topic not found" }, { status: 404 });
  }

  // 🛠 ensure questions array exists
  if (!topic.questions) {
    topic.questions = [];
  }

  // 🛠 ensure labels always array
  const normalizeLabels = (labels: any) => {
    if (!labels) return [];
    if (Array.isArray(labels)) return labels;
    return [];
  };

  // ➕ ADD QUESTION
  if (body.type === "add") {
    topic.questions.push({
      q: body.question.q,
      a: body.question.a,
      labels: normalizeLabels(body.question.labels), // ✅ SAFE LABELS
    });
  }

  // ✏️ EDIT QUESTION
  if (body.type === "edit") {
    topic.questions[body.index] = {
      q: body.question.q,
      a: body.question.a,
      labels: normalizeLabels(body.question.labels), // ✅ SAFE LABELS
    };
  }

  // ❌ DELETE QUESTION
  if (body.type === "delete") {
    topic.questions.splice(body.index, 1);
  }

  // ✏️ EDIT TOPIC
  if (body.type === "edit-topic") {
    topic.title = body.title;
    topic.content = body.content;
  }

  return Response.json({ success: true });
}


// ❌ DELETE TOPIC
export async function DELETE(req: Request) {
  const body = await req.json();

  topics = topics.filter(
    (t) =>
      !(
        t.classId === body.classId &&
        t.subject === body.subject &&
        t.slug === body.slug
      )
  );

  return Response.json({ success: true });
}