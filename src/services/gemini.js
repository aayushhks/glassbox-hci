/**
 * ─── GEMINI API SERVICE ───
 *
 * Each slider position maps to a system prompt template.
 * Temperature is derived from the Creativity slider.
 * Stability scores are computed from slider positions
 * (how far into novel territory the settings push the model).
 */

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

function getApiKey() {
    return import.meta.env.VITE_GEMINI_API_KEY || ''
}

/**
 * Build a system prompt from slider values.
 * Each slider maps to specific instructions.
 */
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

    return `You are a distributed systems expert generating algorithm designs.

STYLE INSTRUCTIONS (follow these precisely):
- Efficiency: ${effInstr}
- Readability: ${readInstr}
- Detail level: ${detailInstr}
- Creativity: ${creativeInstr}

FORMAT INSTRUCTIONS:
- Structure your response into clearly labeled sections using markdown headers (##).
- Use these section types as appropriate: Algorithm Selection, Election Mechanism, Term & Vote Logic, Partition Handling, Optimizations, Pseudocode, Complexity Analysis.
- Each section should be 2-5 sentences unless the detail level calls for more.
- If including pseudocode, use a code block.
- Do NOT include meta-commentary about your confidence or style choices.`
}

/**
 * Build a simple system prompt for the chat condition.
 */
function buildChatSystemPrompt() {
    return `You are a helpful AI assistant specializing in distributed systems and algorithms. 
Respond naturally to user questions. When asked to modify your previous response, 
make the requested changes. Keep responses focused and relevant.
Use markdown formatting (headers, bold, code blocks) for readability.`
}

/**
 * Compute stability score per section based on slider positions.
 * Higher creativity / lower efficiency → lower stability.
 * Standard content → high stability.
 */
export function computeStability(params, sectionType) {
    const { efficiency, readability, detail, creativity } = params
    const cre = creativity / 100
    const eff = efficiency / 100
    const det = detail / 100

    const baseStability = {
        'algorithm-selection': 0.92,
        'election-mechanism': 0.95,
        'term-logic': 0.97,
        'partition-handling': 0.85,
        'optimizations': 0.55,
        'pseudocode': 0.91,
        'complexity-analysis': 0.94,
        'default': 0.80,
    }

    const base = baseStability[sectionType] || baseStability['default']

    // Creativity lowers stability (novel content is less consistent)
    // Efficiency raises it slightly (concise = more deterministic)
    const adjusted = base - cre * 0.2 + eff * 0.05 - (det > 0.7 ? 0.03 : 0)

    return Math.max(0.15, Math.min(0.99, adjusted))
}

/**
 * Map section header text to a section type for stability computation.
 */
export function classifySection(headerText) {
    const h = headerText.toLowerCase()
    if (h.includes('selection') || h.includes('approach') || h.includes('overview')) return 'algorithm-selection'
    if (h.includes('election') || h.includes('mechanism') || h.includes('voting')) return 'election-mechanism'
    if (h.includes('term') || h.includes('vote logic') || h.includes('vote grant')) return 'term-logic'
    if (h.includes('partition') || h.includes('fault') || h.includes('failure') || h.includes('edge')) return 'partition-handling'
    if (h.includes('optim') || h.includes('novel') || h.includes('enhance') || h.includes('improv')) return 'optimizations'
    if (h.includes('pseudo') || h.includes('code') || h.includes('implementation')) return 'pseudocode'
    if (h.includes('complex') || h.includes('analysis') || h.includes('performance')) return 'complexity-analysis'
    return 'default'
}

/**
 * Parse markdown response into segments with headers and content.
 */
export function parseResponseIntoSegments(text, params) {
    const lines = text.split('\n')
    const segments = []
    let currentHeader = null
    let currentContent = []

    for (const line of lines) {
        const headerMatch = line.match(/^#{1,3}\s+(.+)/)
        if (headerMatch) {
            // Save previous segment
            if (currentHeader && currentContent.length > 0) {
                const content = currentContent.join('\n').trim()
                if (content) {
                    const sectionType = classifySection(currentHeader)
                    segments.push({
                        id: `s${segments.length + 1}`,
                        label: currentHeader,
                        category: sectionType === 'pseudocode' ? 'code' : sectionType === 'optimizations' ? 'optimization' : sectionType === 'partition-handling' ? 'edge-case' : sectionType === 'complexity-analysis' ? 'analysis' : 'algorithm',
                        text: content,
                        stability: computeStability(params, sectionType),
                        sectionType,
                        influence: computeInfluence(sectionType),
                    })
                }
            }
            currentHeader = headerMatch[1].trim()
            currentContent = []
        } else {
            currentContent.push(line)
        }
    }

    // Push last segment
    if (currentHeader && currentContent.length > 0) {
        const content = currentContent.join('\n').trim()
        if (content) {
            const sectionType = classifySection(currentHeader)
            segments.push({
                id: `s${segments.length + 1}`,
                label: currentHeader,
                category: sectionType === 'pseudocode' ? 'code' : sectionType === 'optimizations' ? 'optimization' : sectionType === 'partition-handling' ? 'edge-case' : sectionType === 'complexity-analysis' ? 'analysis' : 'algorithm',
                text: content,
                stability: computeStability(params, sectionType),
                sectionType,
                influence: computeInfluence(sectionType),
            })
        }
    }

    // If no headers found, treat as a single segment
    if (segments.length === 0 && text.trim()) {
        segments.push({
            id: 's1',
            label: 'Response',
            category: 'algorithm',
            text: text.trim(),
            stability: computeStability(params, 'default'),
            sectionType: 'default',
            influence: { efficiency: 0.5, readability: 0.5, detail: 0.5, creativity: 0.5 },
        })
    }

    return segments
}

/**
 * Compute influence weights per section type.
 */
function computeInfluence(sectionType) {
    const influences = {
        'algorithm-selection': { efficiency: 0.2, readability: 0.5, detail: 0.1, creativity: 0.8 },
        'election-mechanism': { efficiency: 0.6, readability: 0.9, detail: 0.4, creativity: 0.1 },
        'term-logic': { efficiency: 0.7, readability: 0.8, detail: 0.5, creativity: 0.05 },
        'partition-handling': { efficiency: 0.3, readability: 0.4, detail: 0.95, creativity: 0.3 },
        'optimizations': { efficiency: 0.5, readability: 0.3, detail: 0.4, creativity: 0.95 },
        'pseudocode': { efficiency: 0.85, readability: 0.7, detail: 0.6, creativity: 0.1 },
        'complexity-analysis': { efficiency: 0.8, readability: 0.7, detail: 0.5, creativity: 0.1 },
        'default': { efficiency: 0.5, readability: 0.5, detail: 0.5, creativity: 0.5 },
    }
    return influences[sectionType] || influences['default']
}

/**
 * Call Gemini API for the Glass-Box interface.
 */
export async function generateGlassBoxResponse(taskPrompt, params) {
    const apiKey = getApiKey()
    if (!apiKey) {
        throw new Error('No API key found. Set VITE_GEMINI_API_KEY in your .env file.')
    }

    const systemPrompt = buildSystemPrompt(params)
    const temperature = 0.3 + (params.creativity / 100) * 0.9 // 0.3 to 1.2

    const response = await fetch(`${API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: taskPrompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
                temperature: Math.min(temperature, 1.5),
                maxOutputTokens: 1500,
            },
        }),
    })

    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error?.message || `Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    return {
        rawText: text,
        segments: parseResponseIntoSegments(text, params),
    }
}

/**
 * Call Gemini API for the Chat interface.
 */
export async function generateChatResponse(messages) {
    const apiKey = getApiKey()
    if (!apiKey) {
        throw new Error('No API key found. Set VITE_GEMINI_API_KEY in your .env file.')
    }

    // Build Gemini conversation format
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
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1500,
            },
        }),
    })

    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error?.message || `Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not generate a response.'
}
