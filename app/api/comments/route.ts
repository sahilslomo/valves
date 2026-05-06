let comments: any[] = [];

// GET COMMENTS (BY QUESTION)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const topicSlug = searchParams.get("topic");
  const classId = searchParams.get("class");
  const subject = searchParams.get("subject");
  const questionIndex = Number(searchParams.get("qIndex"));

  const filtered = comments
    .filter(
      (c) =>
        c.topicSlug === topicSlug &&
        c.classId === classId &&
        c.subject === subject &&
        c.questionIndex === questionIndex
    )
    .sort((a, b) => b.createdAt - a.createdAt); // 🔥 latest first

  return Response.json(filtered);
}

// ADD COMMENT
export async function POST(req: Request) {
  const body = await req.json();

  const newComment = {
    id: Date.now(),
    topicSlug: body.topicSlug,
    classId: body.classId,
    subject: body.subject,
    questionIndex: body.questionIndex,

    text: body.text,
    userId: body.userId,
    userName: body.userName,

    createdAt: Date.now(),
  };

  comments.push(newComment);

  return Response.json({ success: true });
}

// EDIT / DELETE
export async function PATCH(req: Request) {
  const body = await req.json();

  const comment = comments.find((c) => c.id === body.id);

  if (!comment) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const isAdmin = body.isAdmin;
  const isOwner = comment.userId === body.userId;

  // ✏️ EDIT
  if (body.type === "edit") {
    if (!isOwner && !isAdmin) {
      return Response.json({ error: "Not allowed" }, { status: 403 });
    }

    comment.text = body.text;
  }

  // ❌ DELETE
  if (body.type === "delete") {
    if (!isOwner && !isAdmin) {
      return Response.json({ error: "Not allowed" }, { status: 403 });
    }

    comments = comments.filter((c) => c.id !== body.id);
  }

  return Response.json({ success: true });
}