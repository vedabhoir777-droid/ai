/*
# AI Contract & Legal Document Analyzer Schema

## Summary
Creates the core database schema for the AI legal document analysis platform.

## New Tables

### documents
Stores metadata about uploaded legal documents.
- id: UUID primary key
- user_id: Owner reference to auth.users (defaults to current auth user)
- file_name: Original filename
- file_url: Supabase Storage URL path
- file_size: File size in bytes
- file_type: MIME type (pdf, docx, txt)
- uploaded_at: Upload timestamp
- status: Processing status (pending, analyzing, completed, error)
- risk_score: Numeric 0-100 risk score

### analysis_results
Stores AI analysis output for each document.
- id: UUID primary key
- document_id: FK to documents
- summary: AI-generated summary text
- key_points: JSONB array of key points
- clauses: JSONB array of detected clauses
- risks: JSONB array of detected risks
- recommendations: JSONB array of recommendations
- created_at: Timestamp

### chat_messages
Stores AI assistant chat messages per document.
- id: UUID primary key
- document_id: FK to documents
- user_id: Owner reference
- role: 'user' or 'assistant'
- content: Message text
- created_at: Timestamp

## Security
- RLS enabled on all tables
- Authenticated users can only access their own data
- Owner defaults set to auth.uid() for seamless inserts
*/

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text,
  file_size bigint DEFAULT 0,
  file_type text DEFAULT 'pdf',
  uploaded_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'completed', 'error')),
  risk_score integer DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100)
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_documents" ON documents;
CREATE POLICY "select_own_documents" ON documents FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_documents" ON documents;
CREATE POLICY "insert_own_documents" ON documents FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_documents" ON documents;
CREATE POLICY "update_own_documents" ON documents FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_documents" ON documents;
CREATE POLICY "delete_own_documents" ON documents FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Analysis results table
CREATE TABLE IF NOT EXISTS analysis_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  summary text,
  key_points jsonb DEFAULT '[]'::jsonb,
  clauses jsonb DEFAULT '[]'::jsonb,
  risks jsonb DEFAULT '[]'::jsonb,
  recommendations jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_analysis" ON analysis_results;
CREATE POLICY "select_own_analysis" ON analysis_results FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM documents WHERE documents.id = analysis_results.document_id AND documents.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_analysis" ON analysis_results;
CREATE POLICY "insert_own_analysis" ON analysis_results FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM documents WHERE documents.id = analysis_results.document_id AND documents.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_analysis" ON analysis_results;
CREATE POLICY "update_own_analysis" ON analysis_results FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM documents WHERE documents.id = analysis_results.document_id AND documents.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_analysis" ON analysis_results;
CREATE POLICY "delete_own_analysis" ON analysis_results FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM documents WHERE documents.id = analysis_results.document_id AND documents.user_id = auth.uid())
  );

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_chat" ON chat_messages;
CREATE POLICY "select_own_chat" ON chat_messages FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_chat" ON chat_messages;
CREATE POLICY "insert_own_chat" ON chat_messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_chat" ON chat_messages;
CREATE POLICY "delete_own_chat" ON chat_messages FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS documents_user_id_idx ON documents(user_id);
CREATE INDEX IF NOT EXISTS documents_uploaded_at_idx ON documents(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS analysis_results_document_id_idx ON analysis_results(document_id);
CREATE INDEX IF NOT EXISTS chat_messages_document_id_idx ON chat_messages(document_id);
