import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">

        <Link
          to="/"
          className="text-sm text-[#2E75B6] hover:underline mb-8 inline-block"
        >
          ← Back to DocAssist
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: March 2026</p>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-2">What is DocAssist?</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            DocAssist is an AI-powered document assistant. You upload PDF files and interact with
            them through natural language — asking questions, generating summaries, extracting key
            terms, and identifying deadlines. It is designed as a productivity tool for anyone who
            regularly reads and analyzes documents.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-2">What data we collect</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            When you sign in with Google, we receive your name, email address, and profile picture
            from your Google account. This is used solely to identify your account and display your
            name in the app.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mt-3">
            When you upload a PDF, we store the document and the text extracted from it in our
            database. We also store the chat history generated during your sessions with that
            document.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-2">How we use your data</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Uploaded documents are sent to the Anthropic Claude API to power the AI features —
            chat, summaries, key terms, and deadline detection. Documents are only used to generate
            responses for you. We do not analyze, read, or use your documents for any other purpose.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-2">Data storage</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Your documents, extracted text, AI-generated insights, and chat history are stored in a
            secure PostgreSQL database hosted on Neon. Your data is associated with your account
            and is never accessible to other users.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mt-3">
            You can delete any document at any time from the sidebar. Deleting a document
            permanently removes the file, all extracted text, AI insights, and the full chat
            history associated with it from our database.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-2">Third-party services</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            DocAssist uses the following third-party services:
          </p>
          <ul className="mt-3 space-y-2">
            <li className="text-sm text-gray-600 leading-relaxed">
              <span className="font-medium text-gray-700">Google OAuth</span> — used for
              authentication. Governed by Google's Privacy Policy.
            </li>
            <li className="text-sm text-gray-600 leading-relaxed">
              <span className="font-medium text-gray-700">Anthropic Claude API</span> — used to
              power all AI features. Document content is sent to Anthropic's servers to generate
              responses. Anthropic does not use API inputs to train their models by default.
            </li>
            <li className="text-sm text-gray-600 leading-relaxed">
              <span className="font-medium text-gray-700">Neon</span> — serverless PostgreSQL
              hosting for your data.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-2">We don't sell your data</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            We do not sell, share, rent, or otherwise distribute your data to third parties. We do
            not use your uploaded documents to train AI models or for any commercial purpose beyond
            providing the DocAssist service to you.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-2">Contact</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            If you have any questions about this privacy policy or how your data is handled, you
            can reach us at{' '}
            <a
              href="mailto:privacy@docassist.app"
              className="text-[#2E75B6] hover:underline"
            >
              privacy@docassist.app
            </a>
            .
          </p>
        </section>

        <p className="text-xs text-gray-400 mt-12 pt-6 border-t border-gray-100">
          Last updated: March 2026
        </p>
      </div>
    </div>
  );
}
