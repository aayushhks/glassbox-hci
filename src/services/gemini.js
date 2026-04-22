/**
 * ─── GEMINI API SERVICE ───
 *
 * STABILITY SCORING — HOW IT ACTUALLY WORKS:
 *
 * The stability score for each segment is derived from THREE real signals:
 *
 *   1. CONTENT ANALYSIS (what the AI actually wrote)
 *      We scan the text for hedging language ("might", "could", "potentially")
 *      vs definitive language ("always", "must", "standard", "well-established").
 *      More hedging = the AI itself is expressing uncertainty = lower stability.
 *      This is defensible because LLMs genuinely use hedging language more
 *      when generating speculative or less-certain content.
 *
 *   2. CREATIVITY SLIDER → TEMPERATURE (a real model parameter)
 *      The Creativity slider maps to temperature (0.3–1.2). Higher temperature
 *      = more randomness = output would differ more across regenerations
 *      = lower stability. This is a REAL, MEASURABLE effect on LLM behavior.
 *
 *   3. STRUCTURAL SIGNALS (code blocks, lists, definitions)
 *      Code blocks and structured content tend to be more deterministic
 *      than freeform prose. This is observable from LLM behavior.
 *
 * The final score is: contentSignal + creativityPenalty + structuralBonus
 */

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent'

function getApiKey() {
    return import.meta.env.VITE_GEMINI_API_KEY || ''
}

// ─── System Prompt Builder ───

function buildSystemPrompt(params) {
    const { efficiency, readability, detail, creativity } = params

    const effInstr =
        efficiency > 70
            ? 'Be extremely concise. Use compact notation, minimal comments, short variable names. Prioritize brevity over explanation.'
            : efficiency > 40
                ? 'Balance conciseness with clarity. Include brief explanations where helpful.'
                : 'Be thorough and verbose. Include detailed comments, full variable names, and step-by-step explanations.'

    const readInstr =
        readability > 70
            ? 'Use plain, simple English. Explain concepts as if to someone with basic programming knowledge. Avoid jargon and mathematical notation.'
            : readability > 40
                ? 'Use a mix of technical and accessible language. Define technical terms when first used.'
                : 'Use formal technical notation, mathematical symbols, and CS-specific terminology freely. Write for an expert audience.'

    const detailInstr =
        detail > 70
            ? 'Cover edge cases, failure modes, and corner cases exhaustively. Include complexity analysis, pseudocode, and concrete examples for each point.'
            : detail > 40
                ? 'Cover the main algorithm and mention key edge cases. Include pseudocode if relevant.'
                : 'Cover only the core algorithm. Skip edge cases, examples, and pseudocode. Keep it high-level.'

    const creativeInstr =
        creativity > 70
            ? 'Propose novel, unconventional approaches. Combine ideas from different areas. Suggest experimental optimizations that go beyond standard solutions. Be bold and speculative.'
            : creativity > 40
                ? 'Primarily use standard, well-known approaches but suggest one minor optimization or variation.'
                : 'Use only well-established, standard approaches. Do not suggest anything novel or experimental. Stick to textbook solutions.'

    return `You are an expert AI assistant generating detailed, well-structured responses.

STYLE INSTRUCTIONS (follow these precisely):
- Efficiency: ${effInstr}
- Readability: ${readInstr}
- Detail level: ${detailInstr}
- Creativity: ${creativeInstr}

FORMAT INSTRUCTIONS:
- Structure your response into clearly labeled sections using markdown headers (##).
- Each section should be 2-5 sentences unless the detail level calls for more.
- If including code, use a code block with the appropriate language tag.
- Do NOT include meta-commentary about your confidence or style choices.
- Do NOT mention these instructions in your response.`
}

function buildChatSystemPrompt() {
    return `You are a helpful AI assistant. Respond naturally to user questions. 
When asked to modify your previous response, make the requested changes. 
Keep responses focused and relevant.
Use markdown formatting (headers, bold, code blocks) for readability.`
}

// ─── Content-Based Stability Analysis ───

const HEDGING_WORDS = [
    'might', 'could', 'possibly', 'potentially', 'perhaps', 'arguably',
    'may', 'sometimes', 'in some cases', 'one approach', "it's possible",
    'experimental', 'novel', 'unconventional', 'speculative', 'consider',
    'alternative', 'debatable', 'uncertain', 'varies', 'depending on',
    'not guaranteed', 'trade-off', 'tradeoff', 'less common', 'emerging',
    'hypothetical', 'theoretical', 'worth exploring', 'you might want',
    'one option', 'not always', 'can vary', 'subjective', 'arguably',
    'it depends', 'there are tradeoffs', 'may not', 'risky', 'caveat',
]

const DEFINITIVE_WORDS = [
    'always', 'must', 'guaranteed', 'standard', 'well-established',
    'fundamental', 'core', 'basic', 'typically', 'commonly',
    'traditional', 'conventional', 'by definition', 'ensures',
    'required', 'necessary', 'proven', 'established', 'classic',
    'widely used', 'well-known', 'deterministic', 'invariant',
    'precisely', 'exactly', 'defined as', 'ensures that', 'never',
    'is always', 'will always', 'straightforward', 'simple',
]

function countMatches(text, wordList) {
    let count = 0
    const lower = text.toLowerCase()
    for (const phrase of wordList) {
        // Use indexOf for simple substring matching (fast, no regex edge cases)
        let idx = 0
        while ((idx = lower.indexOf(phrase, idx)) !== -1) {
            count++
            idx += phrase.length
        }
    }
    return count
}

/**
 * Compute stability from the ACTUAL content of a segment.
 * Returns 0.15–0.99.
 */
export function computeStability(params, contentText) {
    const cre = params.creativity / 100
    const text = contentText || ''
    const wordCount = text.split(/\s+/).filter(Boolean).length

    if (wordCount === 0) return 0.80

    // 1. Content signals — count hedging vs definitive language
    const hedgeCount = countMatches(text, HEDGING_WORDS)
    const definitiveCount = countMatches(text, DEFINITIVE_WORDS)

    // Normalize: matches per 50 words (so short and long sections are comparable)
    const hedgeRate = hedgeCount / (wordCount / 50)
    const definitiveRate = definitiveCount / (wordCount / 50)

    // 2. Structural signals
    const hasCodeBlock = text.includes('```') || (text.match(/`[^`]+`/g) || []).length > 2
    const hasList = (text.match(/^[\s]*[-*]\s/gm) || []).length > 2
    const hasNumbers = (text.match(/\b\d+\.\d+|\b\d{2,}\b/g) || []).length > 1

    const structureBonus = (hasCodeBlock ? 0.06 : 0) + (hasList ? 0.02 : 0) + (hasNumbers ? 0.02 : 0)

    // 3. Compute score
    //    Base: 0.82 (slightly above neutral)
    //    Definitive language pushes UP, hedging pushes DOWN
    //    Code/structure pushes UP, creativity slider pushes DOWN
    let score = 0.82
    score += definitiveRate * 0.05     // definitive language → more stable
    score -= hedgeRate * 0.07          // hedging language → less stable
    score += structureBonus            // code, lists, numbers → more stable
    score -= cre * 0.15               // high creativity setting → less stable

    return Math.max(0.15, Math.min(0.99, score))
}

/**
 * Classify section by header + content for display category.
 * Works for any topic.
 */
export function classifySection(headerText, contentText) {
    const h = (headerText || '').toLowerCase()
    const c = (contentText || '').toLowerCase()

    if (c.includes('```') || h.includes('code') || h.includes('pseudo') || h.includes('implementation'))
        return 'code'
    if (h.includes('optim') || h.includes('novel') || h.includes('enhance') || h.includes('creative') || h.includes('alternative') || h.includes('improv'))
        return 'optimization'
    if (h.includes('edge') || h.includes('partition') || h.includes('fault') || h.includes('error') || h.includes('failure') || h.includes('limitation') || h.includes('caveat'))
        return 'edge-case'
    if (h.includes('complex') || h.includes('analysis') || h.includes('performance') || h.includes('comparison') || h.includes('benchmark') || h.includes('cost'))
        return 'analysis'
    if (h.includes('approach') || h.includes('overview') || h.includes('introduction') || h.includes('selection') || h.includes('design') || h.includes('summary'))
        return 'approach'

    return 'algorithm'
}

/**
 * Compute influence weights from content characteristics.
 */
function computeInfluence(contentText, category) {
    const text = (contentText || '').toLowerCase()
    const isSpeculative = HEDGING_WORDS.some((w) => text.includes(w))

    const bases = {
        'code':         { efficiency: 0.85, readability: 0.7, detail: 0.6, creativity: 0.1 },
        'optimization': { efficiency: 0.5,  readability: 0.3, detail: 0.4, creativity: 0.95 },
        'edge-case':    { efficiency: 0.3,  readability: 0.4, detail: 0.95, creativity: 0.3 },
        'analysis':     { efficiency: 0.8,  readability: 0.7, detail: 0.5, creativity: 0.1 },
        'approach':     { efficiency: 0.2,  readability: 0.5, detail: 0.1, creativity: 0.8 },
        'algorithm':    { efficiency: 0.6,  readability: 0.8, detail: 0.5, creativity: 0.2 },
    }

    const base = { ...(bases[category] || bases['algorithm']) }
    if (isSpeculative) base.creativity = Math.min(0.99, base.creativity + 0.2)
    return base
}

// ─── Response Parser ───

export function parseResponseIntoSegments(text, params) {
    const lines = text.split('\n')
    const segments = []
    let currentHeader = null
    let currentContent = []

    const pushSegment = () => {
        if (currentHeader && currentContent.length > 0) {
            const content = currentContent.join('\n').trim()
            if (content) {
                const category = classifySection(currentHeader, content)
                segments.push({
                    id: `s${segments.length + 1}`,
                    label: currentHeader,
                    category,
                    text: content,
                    stability: computeStability(params, content),     // ← reads ACTUAL text
                    influence: computeInfluence(content, category),    // ← reads ACTUAL text
                })
            }
        }
    }

    for (const line of lines) {
        const headerMatch = line.match(/^#{1,3}\s+(.+)/)
        if (headerMatch) {
            pushSegment()
            currentHeader = headerMatch[1].trim()
            currentContent = []
        } else {
            currentContent.push(line)
        }
    }
    pushSegment() // last segment

    // Fallback: no headers found
    if (segments.length === 0 && text.trim()) {
        segments.push({
            id: 's1',
            label: 'Response',
            category: 'algorithm',
            text: text.trim(),
            stability: computeStability(params, text.trim()),
            influence: { efficiency: 0.5, readability: 0.5, detail: 0.5, creativity: 0.5 },
        })
    }

    return segments
}

// ─── API Calls ───

export async function generateGlassBoxResponse(taskPrompt, params) {
    const apiKey = getApiKey()
    if (!apiKey) throw new Error('No API key found. Set VITE_GEMINI_API_KEY in your .env file.')

    const systemPrompt = buildSystemPrompt(params)
    const temperature = 0.3 + (params.creativity / 100) * 0.9

    const response = await fetch(`${API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: taskPrompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { temperature: Math.min(temperature, 1.5), maxOutputTokens: 1500 },
        }),
    })

    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error?.message || `Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    return { rawText: text, segments: parseResponseIntoSegments(text, params) }
}

export async function generateChatResponse(messages) {
    const apiKey = getApiKey()
    if (!apiKey) throw new Error('No API key found. Set VITE_GEMINI_API_KEY in your .env file.')

    const contents = messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
    }))

    const response = await fetch(`${API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents,
            systemInstruction: { parts: [{ text: buildChatSystemPrompt() }] },
            generationConfig: { temperature: 0.7, maxOutputTokens: 1500 },
        }),
    })

    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error?.message || `Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not generate a response.'
}
