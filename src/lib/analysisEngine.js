const RISK_KEYWORDS = {
  high: [
    'indemnif', 'arbitration', 'waive', 'waiver', 'forfeit', 'liquidated damages',
    'unlimited liability', 'irrevocable', 'perpetual', 'non-compete', 'restraint of trade',
    'penalty', 'penalties', 'punitive', 'consequential damages', 'intellectual property assignment',
    'all rights reserved to', 'exclusive jurisdiction', 'govern by the laws of',
    'automatic renewal', 'auto-renew', 'evergreen',
  ],
  medium: [
    'terminat', 'termination', 'cancel', 'cancellation', 'breach', 'default', 'cure period',
    'notice period', 'force majeure', 'limitation of liability', 'disclaimer',
    'confidential', 'non-disclosure', 'proprietary', 'trade secret',
    'assignment', 'transfer rights', 'sublicense',
  ],
  low: [
    'payment', 'fee', 'invoice', 'due date', 'net 30', 'net 60',
    'warranty', 'representation', 'obligation', 'responsible',
    'renewal', 'extend', 'modification', 'amendment',
  ],
}

const CLAUSE_PATTERNS = {
  payment: {
    keywords: ['payment', 'pay', 'fee', 'invoice', 'compensation', 'salary', 'wage', 'amount due', 'billing', 'cost', 'price', 'charge'],
    label: 'Payment Terms',
    icon: 'DollarSign',
    color: 'blue',
  },
  termination: {
    keywords: ['terminat', 'cancel', 'end', 'expir', 'dissolv', 'dismiss', 'cessation'],
    label: 'Termination Clause',
    icon: 'XCircle',
    color: 'red',
  },
  confidentiality: {
    keywords: ['confidential', 'non-disclosure', 'nda', 'secret', 'proprietary', 'private information'],
    label: 'Confidentiality',
    icon: 'Lock',
    color: 'purple',
  },
  responsibility: {
    keywords: ['responsible', 'obligation', 'duty', 'liable', 'liability', 'shall', 'must', 'required to', 'obligated'],
    label: 'Responsibilities',
    icon: 'ClipboardCheck',
    color: 'green',
  },
  penalty: {
    keywords: ['penalty', 'penalt', 'fine', 'damages', 'liquidated', 'late fee', 'surcharge', 'forfeit'],
    label: 'Penalty Conditions',
    icon: 'AlertTriangle',
    color: 'orange',
  },
  renewal: {
    keywords: ['renew', 'renewal', 'extend', 'extension', 'auto-renew', 'automatic renewal', 'roll over'],
    label: 'Renewal Terms',
    icon: 'RefreshCw',
    color: 'teal',
  },
  ip: {
    keywords: ['intellectual property', 'copyright', 'patent', 'trademark', 'ownership', 'proprietary rights', 'work for hire'],
    label: 'IP & Ownership',
    icon: 'FileText',
    color: 'indigo',
  },
  dispute: {
    keywords: ['dispute', 'arbitration', 'mediation', 'litigation', 'jurisdiction', 'governing law', 'court'],
    label: 'Dispute Resolution',
    icon: 'Scale',
    color: 'yellow',
  },
}

function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s\-]/g, ' ').split(/\s+/).filter(Boolean)
}

function splitSentences(text) {
  return text.match(/[^.!?]+[.!?]+/g) || [text]
}

function scoreRisk(text) {
  const lower = text.toLowerCase()
  let score = 0
  let reasons = []

  RISK_KEYWORDS.high.forEach(kw => {
    if (lower.includes(kw)) {
      score += 15
      reasons.push({ keyword: kw, level: 'high' })
    }
  })
  RISK_KEYWORDS.medium.forEach(kw => {
    if (lower.includes(kw)) {
      score += 7
      reasons.push({ keyword: kw, level: 'medium' })
    }
  })
  RISK_KEYWORDS.low.forEach(kw => {
    if (lower.includes(kw)) {
      score += 3
      reasons.push({ keyword: kw, level: 'low' })
    }
  })

  return { score: Math.min(score, 100), reasons }
}

function detectClauses(text) {
  const sentences = splitSentences(text)
  const detected = []

  Object.entries(CLAUSE_PATTERNS).forEach(([key, pattern]) => {
    const matchingSentences = sentences.filter(s =>
      pattern.keywords.some(kw => s.toLowerCase().includes(kw))
    )
    if (matchingSentences.length > 0) {
      detected.push({
        type: key,
        label: pattern.label,
        icon: pattern.icon,
        color: pattern.color,
        excerpt: matchingSentences[0].trim().slice(0, 200),
        count: matchingSentences.length,
      })
    }
  })

  return detected
}

function generateSummary(text) {
  const sentences = splitSentences(text)
  const importantWords = [
    'agreement', 'contract', 'party', 'parties', 'effective', 'term', 'service',
    'payment', 'confidential', 'terminat', 'obligation', 'right', 'license',
  ]

  const scored = sentences.map(s => {
    const lower = s.toLowerCase()
    const score = importantWords.reduce((acc, w) => acc + (lower.includes(w) ? 1 : 0), 0)
    return { sentence: s.trim(), score }
  })

  scored.sort((a, b) => b.score - a.score)
  const top = scored.slice(0, 4).map(s => s.sentence).join(' ')

  if (top.length < 50) {
    return sentences.slice(0, 3).join(' ')
  }
  return top
}

function generateKeyPoints(text) {
  const clauses = detectClauses(text)
  const points = []

  if (clauses.find(c => c.type === 'payment')) {
    points.push('Document includes payment terms and financial obligations.')
  }
  if (clauses.find(c => c.type === 'termination')) {
    points.push('Contains termination or cancellation conditions.')
  }
  if (clauses.find(c => c.type === 'confidentiality')) {
    points.push('Includes confidentiality and non-disclosure requirements.')
  }
  if (clauses.find(c => c.type === 'penalty')) {
    points.push('Specifies penalties or damages for breach of terms.')
  }
  if (clauses.find(c => c.type === 'renewal')) {
    points.push('Contains renewal or extension provisions.')
  }
  if (clauses.find(c => c.type === 'ip')) {
    points.push('Addresses intellectual property rights and ownership.')
  }
  if (clauses.find(c => c.type === 'dispute')) {
    points.push('Includes dispute resolution and governing law clauses.')
  }
  if (points.length === 0) {
    points.push('Document reviewed — no major standard clauses detected.')
    points.push('Consider having a legal professional review this document.')
  }

  return points
}

function generateRisks(text, riskScore) {
  const lower = text.toLowerCase()
  const risks = []

  if (lower.includes('arbitration') || lower.includes('binding arbitration')) {
    risks.push({
      level: 'high',
      title: 'Binding Arbitration',
      description: 'This document requires disputes to be resolved through binding arbitration, which may limit your legal options.',
    })
  }
  if (lower.includes('auto-renew') || lower.includes('automatic renewal') || lower.includes('automatically renew')) {
    risks.push({
      level: 'high',
      title: 'Automatic Renewal',
      description: 'The contract may renew automatically. Check cancellation notice requirements to avoid unwanted renewals.',
    })
  }
  if (lower.includes('unlimited liability') || (lower.includes('liable') && lower.includes('all damages'))) {
    risks.push({
      level: 'high',
      title: 'Unlimited Liability',
      description: 'Contract may expose you to unlimited financial liability. Seek legal advice before signing.',
    })
  }
  if (lower.includes('non-compete') || lower.includes('non compete')) {
    risks.push({
      level: 'high',
      title: 'Non-Compete Clause',
      description: 'Contains non-compete restrictions that may limit your future business activities.',
    })
  }
  if (lower.includes('intellectual property') && (lower.includes('assign') || lower.includes('transfer'))) {
    risks.push({
      level: 'medium',
      title: 'IP Assignment',
      description: 'Your intellectual property rights may be assigned or transferred under this agreement.',
    })
  }
  if (lower.includes('confidential') && lower.includes('perpetual')) {
    risks.push({
      level: 'medium',
      title: 'Perpetual Confidentiality',
      description: 'Confidentiality obligations may apply indefinitely with no expiry date.',
    })
  }
  if (lower.includes('penalty') || lower.includes('liquidated damages')) {
    risks.push({
      level: 'medium',
      title: 'Financial Penalties',
      description: 'The document specifies financial penalties or liquidated damages for breach.',
    })
  }
  if (lower.includes('force majeure')) {
    risks.push({
      level: 'low',
      title: 'Force Majeure',
      description: 'Contains force majeure provisions that may affect contract performance obligations.',
    })
  }

  if (riskScore > 60 && risks.length === 0) {
    risks.push({
      level: 'medium',
      title: 'Complex Legal Language',
      description: 'This document contains complex legal terms that may have significant implications. Professional legal review is recommended.',
    })
  }

  return risks
}

function generateRecommendations(clauses, risks, riskScore) {
  const recs = []

  if (riskScore >= 70) {
    recs.push('Strongly recommend consulting a qualified legal professional before signing this document.')
  }
  if (risks.find(r => r.level === 'high')) {
    recs.push('Review all high-risk clauses carefully and negotiate modifications where possible.')
  }
  if (clauses.find(c => c.type === 'termination')) {
    recs.push('Clarify the exact notice period and procedures required for termination.')
  }
  if (clauses.find(c => c.type === 'payment')) {
    recs.push('Confirm all payment terms, amounts, and due dates are clearly defined.')
  }
  if (clauses.find(c => c.type === 'renewal')) {
    recs.push('Note any automatic renewal dates and required cancellation notice periods.')
  }
  if (recs.length === 0) {
    recs.push('Review all terms carefully before agreeing.')
    recs.push('Ensure you understand all obligations and rights granted by this document.')
  }

  return recs
}

export function analyzeDocument(text) {
  const { score: riskScore, reasons } = scoreRisk(text)
  const clauses = detectClauses(text)
  const summary = generateSummary(text)
  const keyPoints = generateKeyPoints(text)
  const risks = generateRisks(text, riskScore)
  const recommendations = generateRecommendations(clauses, risks, riskScore)

  return {
    summary,
    keyPoints,
    clauses,
    risks,
    recommendations,
    riskScore,
    riskReasons: reasons,
    riskLevel: riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low',
  }
}

export function answerQuestion(question, analysisResult, documentText) {
  const q = question.toLowerCase()
  const { summary, clauses, risks, keyPoints, riskScore, riskLevel } = analysisResult

  if (q.includes('summary') || q.includes('summarize') || q.includes('about')) {
    return `Here is a summary of this document:\n\n${summary}\n\nKey points:\n${keyPoints.map(p => `• ${p}`).join('\n')}`
  }

  if (q.includes('risk') || q.includes('risky') || q.includes('dangerous')) {
    if (risks.length === 0) {
      return `The overall risk score for this document is ${riskScore}/100 (${riskLevel} risk). No specific high-risk clauses were identified, but always review carefully before signing.`
    }
    return `Risk Score: ${riskScore}/100 (${riskLevel.toUpperCase()} risk)\n\nIdentified risks:\n${risks.map(r => `• [${r.level.toUpperCase()}] ${r.title}: ${r.description}`).join('\n')}`
  }

  if (q.includes('payment') || q.includes('pay') || q.includes('fee') || q.includes('cost')) {
    const clause = clauses.find(c => c.type === 'payment')
    if (clause) return `Payment terms were detected in this document:\n\n"${clause.excerpt}"\n\nReview the payment section carefully to understand all financial obligations.`
    return 'No specific payment terms were detected in this document.'
  }

  if (q.includes('terminat') || q.includes('cancel') || q.includes('end')) {
    const clause = clauses.find(c => c.type === 'termination')
    if (clause) return `Termination conditions found:\n\n"${clause.excerpt}"\n\nMake sure you understand the notice periods and grounds for termination.`
    return 'No specific termination clauses were identified in this document.'
  }

  if (q.includes('confidential') || q.includes('secret') || q.includes('nda') || q.includes('disclose')) {
    const clause = clauses.find(c => c.type === 'confidentiality')
    if (clause) return `Confidentiality requirements detected:\n\n"${clause.excerpt}"\n\nEnsure you understand what information must be kept confidential and for how long.`
    return 'No specific confidentiality clauses were found in this document.'
  }

  if (q.includes('responsibilit') || q.includes('obligat') || q.includes('duty') || q.includes('must') || q.includes('duties')) {
    const clause = clauses.find(c => c.type === 'responsibility')
    if (clause) return `Responsibilities and obligations found:\n\n"${clause.excerpt}"\n\nMake sure you understand all duties required of you under this agreement.`
    return 'No specific responsibility clauses were identified.'
  }

  if (q.includes('penalty') || q.includes('fine') || q.includes('damages')) {
    const clause = clauses.find(c => c.type === 'penalty')
    if (clause) return `Penalty conditions detected:\n\n"${clause.excerpt}"\n\nBe aware of the financial consequences of breaching this agreement.`
    return 'No specific penalty clauses were identified in this document.'
  }

  if (q.includes('renew') || q.includes('expir') || q.includes('expire') || q.includes('duration') || q.includes('term')) {
    const clause = clauses.find(c => c.type === 'renewal')
    if (clause) return `Renewal/term information found:\n\n"${clause.excerpt}"\n\nPay attention to any automatic renewal provisions and required notice for cancellation.`
    return 'No specific renewal or term clauses were clearly identified.'
  }

  if (q.includes('intellectual property') || q.includes('ip') || q.includes('copyright') || q.includes('ownership')) {
    const clause = clauses.find(c => c.type === 'ip')
    if (clause) return `Intellectual property terms found:\n\n"${clause.excerpt}"\n\nReview carefully to understand what IP rights you are granting or retaining.`
    return 'No specific intellectual property clauses were identified.'
  }

  if (q.includes('clause') || q.includes('section') || q.includes('important')) {
    if (clauses.length === 0) return 'No specific standard clauses were identified in this document.'
    return `I identified the following important clauses:\n\n${clauses.map(c => `• ${c.label}: "${c.excerpt.slice(0, 100)}..."`).join('\n\n')}`
  }

  // Default: search document text for relevant sentences
  const sentences = splitSentences(documentText || '')
  const words = q.split(/\s+/).filter(w => w.length > 3)
  const relevant = sentences.filter(s => words.some(w => s.toLowerCase().includes(w))).slice(0, 2)

  if (relevant.length > 0) {
    return `Based on the document content:\n\n${relevant.join(' ')}\n\nFor a complete understanding, please review the full document or consult a legal professional.`
  }

  return `I analyzed this document and found a risk score of ${riskScore}/100 (${riskLevel} risk). I detected ${clauses.length} clause types and ${risks.length} potential risks. Ask me about specific topics like payment terms, termination, confidentiality, or risks for detailed information.`
}
