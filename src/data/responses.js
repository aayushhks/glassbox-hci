/**
 * ─── GLASS-BOX RESPONSE DATA ───
 *
 * DESIGN RATIONALE — SLIDER → RESPONSE MAPPING
 *
 * Each slider does NOT claim to "tune an internal LLM weight." Instead, each
 * slider position maps to a PROMPT PRESET — a pre-configured system prompt
 * template that steers the model's output style. This is exactly how real
 * products work (ChatGPT Custom Instructions, Claude style settings, Notion AI
 * tone selector). The novelty is replacing discrete presets or free-text prompt
 * engineering with CONTINUOUS, VISUAL, DIRECT-MANIPULATION controls.
 *
 *   Readability=30  → system prompt: "Use formal notation and technical shorthand"
 *   Readability=80  → system prompt: "Explain step-by-step in plain language"
 *
 * The current prototype hardcodes response variants to simulate the ideal
 * behavior of such a system. This lets us isolate the UI/UX variable in the
 * study without confounding it with LLM prompt-adherence quality.
 */

export const TASK_PROMPT =
    'Design a leader election algorithm for a distributed system with 5 nodes that handles network partitions gracefully.'

/**
 * Generates response segments whose text and stability vary based on the
 * four parameter sliders. Each segment has:
 *  - id, category, label: identification
 *  - text: content (switches based on parameter values → simulated prompt presets)
 *  - stability: 0–1 score (how consistent this output is across regenerations)
 *  - influence: how much each parameter affects this segment (for transparency panel)
 */
export function generateSegments(params) {
    const eff = params.efficiency / 100
    const read = params.readability / 100
    const det = params.detail / 100
    const cre = params.creativity / 100

    const segments = [
        // ── Opening / Approach ──
        {
            id: 's1',
            category: 'approach',
            label: 'Algorithm Selection',
            stability: 0.92 - cre * 0.15 + eff * 0.05,
            text:
                cre > 0.65
                    ? 'I propose a hybrid approach combining Raft\'s log-based consensus with a gossip protocol dissemination layer — an unconventional pairing that improves partition tolerance while maintaining leader authority.'
                    : read > 0.6
                        ? 'I\'ll use the Raft consensus algorithm for leader election. Raft is designed to be understandable and provides strong consistency guarantees across distributed nodes.'
                        : 'Implementing Raft-based leader election. Raft provides linearizable consistency via replicated log state machines with O(n) message complexity per heartbeat round.',
            influence: { efficiency: 0.2, readability: 0.5, detail: 0.1, creativity: 0.8 },
        },

        // ── Core Election Mechanism ──
        {
            id: 's2',
            category: 'algorithm',
            label: 'Election Mechanism',
            stability: 0.95 - cre * 0.1,
            text:
                read > 0.6
                    ? 'Each node starts as a Follower. If a Follower doesn\'t hear from the Leader within a randomized timeout (150–300ms), it becomes a Candidate, increments its term, votes for itself, and requests votes from all other nodes. A node wins the election by receiving votes from a majority (≥3 of 5 nodes).'
                    : 'Nodes initialize in FOLLOWER state. Election timeout ∈ [150, 300]ms (randomized). On timeout: transition → CANDIDATE, increment term T, self-vote, broadcast RequestVote(T, candidateId, lastLogIndex, lastLogTerm). Majority quorum = ⌈(5+1)/2⌉ = 3 votes required.',
            influence: { efficiency: 0.6, readability: 0.9, detail: 0.4, creativity: 0.1 },
        },

        // ── Term Logic ──
        {
            id: 's3',
            category: 'algorithm',
            label: 'Term & Vote Logic',
            stability: 0.97,
            text:
                read > 0.6
                    ? 'Every message carries a term number. If a node receives a message with a higher term, it immediately steps down to Follower and updates its term. Each node votes for at most one candidate per term, ensuring only one leader can be elected.'
                    : 'All RPCs carry term T. If incoming T > local T: revert to FOLLOWER, set T = incoming T. Vote grant is idempotent within a term — at most one vote per (term, nodeId) pair, enforcing single-leader invariant.',
            influence: { efficiency: 0.7, readability: 0.8, detail: 0.5, creativity: 0.05 },
        },

        // ── Partition Handling ──
        {
            id: 's4',
            category: 'edge-case',
            label: 'Partition Handling',
            stability: 0.82 - cre * 0.12 + det * 0.08,
            text:
                det > 0.6
                    ? 'During a network partition, the majority partition (≥3 nodes) will elect a new leader and continue processing. The minority partition\'s leader will step down after failing to receive heartbeat acknowledgments. When the partition heals, stale leaders discover the higher term and revert to Follower, replaying the log to catch up. Edge case: if a symmetric 2-2-1 split occurs, the isolated node cannot form a majority, preventing split-brain entirely.'
                    : 'On partition, the majority side (≥3 nodes) elects a leader. The minority side\'s leader steps down. Upon healing, stale nodes discover the higher term and revert to Follower state, then replay missed log entries.',
            influence: { efficiency: 0.3, readability: 0.4, detail: 0.95, creativity: 0.3 },
        },

        // ── Creative Optimization (conditional — appears when Creativity > 40%) ──
        ...(cre > 0.4
            ? [
                {
                    id: 's5',
                    category: 'optimization',
                    label: 'Novel Optimization',
                    stability: 0.58 + eff * 0.15 - cre * 0.1,
                    text:
                        cre > 0.7
                            ? 'Novel enhancement: Implement speculative pre-voting where Candidates probe peers before incrementing their term. This prevents term inflation during transient partitions — a node that can\'t win doesn\'t disrupt the cluster. Additionally, use adaptive heartbeat intervals: reduce frequency when the network is stable (saving bandwidth) and increase during detected instability.'
                            : 'Optimization: Add a PreVote phase (Raft §9.6 extension). Before incrementing the term, a Candidate checks if it could win. This prevents unnecessary term inflation and leader disruption from transiently partitioned nodes.',
                    influence: { efficiency: 0.5, readability: 0.3, detail: 0.4, creativity: 0.95 },
                },
            ]
            : []),

        // ── Pseudocode (conditional — appears when Detail > 35%) ──
        ...(det > 0.35
            ? [
                {
                    id: 's6',
                    category: 'code',
                    label: 'Pseudocode',
                    stability: 0.91 + eff * 0.06,
                    text:
                        eff > 0.6
                            ? 'func onElectionTimeout():\n  state = CANDIDATE; term++; votedFor = self\n  votes = {self}\n  for peer in peers:\n    send RequestVote(term, self, log.lastIndex, log.lastTerm) → peer\n  if |votes| >= 3: state = LEADER; broadcastHeartbeats()'
                            : 'function onElectionTimeout():\n  // Step 1: Transition to candidate\n  this.state = CANDIDATE\n  this.currentTerm += 1\n  this.votedFor = this.nodeId\n  this.votesReceived = new Set([this.nodeId])\n\n  // Step 2: Request votes from all peers\n  for each peer in this.peers:\n    response = send RequestVote {\n      term: this.currentTerm,\n      candidateId: this.nodeId,\n      lastLogIndex: this.log.lastIndex(),\n      lastLogTerm: this.log.lastTerm()\n    } to peer\n\n  // Step 3: Check if we won\n  if this.votesReceived.size >= 3:\n    this.state = LEADER\n    this.startHeartbeatTimer()',
                    influence: { efficiency: 0.85, readability: 0.7, detail: 0.6, creativity: 0.1 },
                },
            ]
            : []),

        // ── Complexity Analysis ──
        {
            id: 's7',
            category: 'analysis',
            label: 'Complexity Analysis',
            stability: 0.94,
            text:
                read > 0.65
                    ? 'The algorithm completes election in one round-trip (best case). Each heartbeat costs 4 messages (leader → 4 followers). With 5 nodes, we tolerate up to 2 simultaneous failures while maintaining availability.'
                    : 'Election: O(n) messages per round. Heartbeat: O(n) per interval. Fault tolerance: f = ⌊(5−1)/2⌋ = 2 crash failures. Availability maintained iff ≥3 nodes operational.',
            influence: { efficiency: 0.8, readability: 0.7, detail: 0.5, creativity: 0.1 },
        },
    ]

    return segments.map((s) => ({
        ...s,
        stability: Math.max(0.15, Math.min(0.99, s.stability)),
    }))
}

/**
 * Pre-canned chat responses for Condition A (control).
 */
export const CHAT_RESPONSES = [
    {
        trigger: null,
        text: `I'll design a leader election algorithm based on the Raft consensus protocol, tailored for your 5-node system.

**Election Process:**
Each node starts as a Follower. If a Follower doesn't hear from the Leader within a randomized timeout (150–300ms), it becomes a Candidate, increments its term, votes for itself, and requests votes from all other nodes. A node wins by receiving a majority (≥3 of 5 votes).

**Term Logic:**
Every message carries a term number. If a node receives a higher term, it steps down to Follower. Each node votes for at most one candidate per term.

**Partition Handling:**
During a network partition, the majority partition (≥3 nodes) elects a new leader. The minority side's leader steps down. When the partition heals, stale leaders discover the higher term and revert to Follower.

**Pseudocode:**
\`\`\`
function onElectionTimeout():
  this.state = CANDIDATE
  this.currentTerm += 1
  this.votedFor = this.nodeId
  this.votesReceived = {this.nodeId}
  for each peer in this.peers:
    send RequestVote(term, candidateId, lastLogIndex, lastLogTerm)
  if votesReceived.size >= 3:
    this.state = LEADER
    startHeartbeatTimer()
\`\`\`

**Complexity:** Election completes in one round-trip (best case). Each heartbeat costs 4 messages. We tolerate up to 2 simultaneous node failures.

Would you like me to elaborate on any section?`,
    },
    {
        trigger: 'efficiency',
        text: `Here's a more optimized version:

\`\`\`
func onElectionTimeout():
  state = CANDIDATE; term++; votedFor = self
  votes = {self}
  for peer in peers:
    send RequestVote(term, self, log.lastIndex, log.lastTerm) → peer
  if |votes| >= 3: state = LEADER; broadcastHeartbeats()
\`\`\`

This reduces verbosity while maintaining correctness. Election: O(n) messages per round. Heartbeat: O(n) per interval.`,
    },
    {
        trigger: 'creative',
        text: `Here's a novel enhancement: Implement speculative pre-voting where Candidates probe peers before incrementing their term. This prevents term inflation during transient partitions.

Additionally, you could use adaptive heartbeat intervals — reduce frequency when the network is stable (saving bandwidth) and increase during detected instability.

Note: These are extensions beyond the standard Raft specification, so they may need careful testing.`,
    },
    {
        trigger: 'detail',
        text: `Let me add more detail on edge cases:

**Symmetric partition (2-2-1 split):** The isolated node cannot form a majority, preventing split-brain. The two pairs of 2 nodes also cannot reach majority individually, so no leader is elected until the partition heals.

**Simultaneous candidates:** If two nodes time out simultaneously, they split the vote. Since neither gets 3 votes, both restart with a new randomized timeout. The randomization makes repeated splits unlikely.

**Log consistency:** When a stale leader rejoins, it may have uncommitted entries. The new leader's AppendEntries RPCs will overwrite these, maintaining consistency.`,
    },
]
