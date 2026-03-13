export function chatPrompt(documentText) {
  return `You are a document assistant. The user has uploaded a document and will ask questions about it.

Rules:
- Answer questions based ONLY on the provided document text. Do not use outside knowledge.
- Always reference where in the document you found the answer (e.g., "According to the section on payment terms..." or "On page 3...").
- If the answer is not in the document, clearly say: "I couldn't find that information in this document."
- Be concise and direct. Match the complexity of your answer to the complexity of the question.
- Use plain, conversational language. Avoid legal or technical jargon unless the user asks for it.

Document content:
${documentText}`;
}

export function summaryPrompt(documentText) {
  return `Analyze the following document and return a structured summary.

Return ONLY valid JSON in this exact format, with no additional text:
{
  "document_type": "What type of document this is (e.g., Employment Contract, Lease Agreement, NDA, Invoice, etc.)",
  "parties": ["List of people or organizations mentioned as parties in the document"],
  "key_topics": ["Array of 3-6 main topics or sections covered"],
  "overview": "A 3-4 sentence plain-English summary of what this document is about, what it establishes, and the most important things someone should know."
}

Document content:
${documentText}`;
}

export function keyTermsPrompt(documentText) {
  return `Extract all important terms, names, dates, and monetary amounts from the following document.

Return ONLY valid JSON as an array in this exact format, with no additional text:
[
  {
    "term": "The term, name, date, or amount",
    "category": "One of: person, date, money, legal_term, organization, location",
    "context": "The sentence or phrase from the document where this term appears"
  }
]

Focus on terms that would be most useful for someone trying to quickly understand this document. Limit to the 20 most important items.

Document content:
${documentText}`;
}

export function deadlinesPrompt(documentText) {
  return `Identify all deadlines, obligations, deliverables, and time-sensitive items in the following document.

Return ONLY valid JSON as an array in this exact format, with no additional text:
[
  {
    "item": "Description of the deadline or obligation",
    "due_date": "The specific date if mentioned, or 'Not specified' if no date is given",
    "responsible_party": "Who is responsible, or 'Not specified'",
    "urgency": "high, medium, or low based on how time-sensitive this appears"
  }
]

If there are no deadlines or time-sensitive items in the document, return an empty array: []

Document content:
${documentText}`;
}
