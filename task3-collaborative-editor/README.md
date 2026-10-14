# Task 3 — Real-Time Collaborative Document Editor

## Requirement

Use React/Vue for a dynamic responsive UI, Node.js/Python for the backend, and MongoDB/PostgreSQL for data storage.

## Implementation

- React 18 UI (served through the page for a simple internship submission).
- Node.js + Express backend.
- Socket.IO for live document updates.
- MongoDB through Mongoose for document persistence.
- Room-based collaboration using a shareable document ID.
- Autosave after edits.

## Important scope note

This implementation uses synchronized document snapshots (last update wins) rather than a full CRDT/OT engine. It satisfies the assignment's real-time collaboration requirement and provides a clean foundation for adding Yjs/CRDT conflict resolution later.

## Run

1. Start MongoDB locally or use MongoDB Atlas.
2. Set `MONGO_URI` if needed.
3. Install and run:

```bash
npm install
npm start
```

Open `http://localhost:3003` in two browser windows. Use the same document ID in both windows and edit the document to see live updates.
