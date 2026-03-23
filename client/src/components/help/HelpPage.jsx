const styles = {
  container: { maxWidth: '700px', margin: '0 auto', padding: '24px 16px' },
  title: { fontSize: '28px', fontWeight: 700, color: '#1e3a5f', marginBottom: '8px' },
  subtitle: { fontSize: '15px', color: '#666', marginBottom: '32px' },
  section: { marginBottom: '28px' },
  h2: { fontSize: '20px', fontWeight: 600, color: '#1e3a5f', marginBottom: '12px' },
  h3: { fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '8px', marginTop: '16px' },
  p: { fontSize: '15px', lineHeight: '1.6', color: '#444', marginBottom: '8px' },
  ol: { fontSize: '15px', lineHeight: '1.8', color: '#444', paddingLeft: '24px', marginBottom: '8px' },
  ul: { fontSize: '15px', lineHeight: '1.8', color: '#444', paddingLeft: '24px', marginBottom: '8px' },
  table: {
    width: '100%', borderCollapse: 'collapse', marginBottom: '8px',
    background: '#fff', borderRadius: '8px', overflow: 'hidden',
  },
  th: {
    background: '#f1f5f9', padding: '10px 14px', textAlign: 'left',
    fontSize: '13px', fontWeight: 600, color: '#555', borderBottom: '1px solid #e5e7eb',
  },
  td: { padding: '10px 14px', fontSize: '14px', color: '#444', borderBottom: '1px solid #f1f5f9' },
  tip: {
    background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px',
    padding: '12px 16px', fontSize: '14px', color: '#1e3a5f', marginTop: '16px',
  },
  warning: {
    background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px',
    padding: '12px 16px', fontSize: '14px', color: '#92400e', marginTop: '12px',
  },
}

export default function HelpPage() {
  return (
    <div style={styles.container}>
      <div style={styles.title}>How to Play</div>
      <div style={styles.subtitle}>Fantasy General Conference - Family Prediction Game</div>

      <div style={styles.section}>
        <div style={styles.h2}>Overview</div>
        <p style={styles.p}>
          Predict what will happen during General Conference before it starts, then earn
          points based on how accurate your predictions are. The player with the most
          points at the end of conference wins!
        </p>
        <p style={styles.p}>
          The game has two phases: <strong>Predictions</strong> (before conference) and
          <strong> Live Play</strong> (during conference).
        </p>
      </div>

      <div style={styles.section}>
        <div style={styles.h2}>Getting Started</div>
        <ol style={styles.ol}>
          <li>Open your personal game link (sent to you by email or text)</li>
          <li>Answer each prediction question across all categories</li>
          <li>Click <strong>Save Answers</strong> at the bottom when you're done</li>
          <li>You can come back and change your answers anytime before conference starts</li>
          <li>Once conference begins, predictions will be locked</li>
        </ol>
      </div>

      <div style={styles.section}>
        <div style={styles.h2}>Prediction Categories</div>

        <div style={styles.h3}>U.S. Temples & Worldwide Temples</div>
        <p style={styles.p}>
          Guess 2 locations where new temples will be announced in the U.S. and 2 worldwide.
          Type a city name and select from the search results. 10 points per correct guess.
        </p>

        <div style={styles.h3}>Topics</div>
        <p style={styles.p}>
          Guess 2 specific gospel topics that will be addressed during conference. Select from
          the official Church gospel topics list or type your own. 10 points per correct topic.
        </p>

        <div style={styles.h3}>Songs</div>
        <p style={styles.p}>
          Guess up to 4 hymns that will be sung during conference. Select from the hymn list
          or type your own. 10 points per correct song.
        </p>

        <div style={styles.h3}>Choir Clothing</div>
        <p style={styles.p}>
          Guess the color the women in the choir will be wearing during each of the 5 sessions.
          Select from the color list. 10 points per correct guess.
        </p>

        <div style={styles.h3}>Conducting</div>
        <p style={styles.p}>
          Guess who from Church leadership will conduct each of the 5 sessions.
          Select from the list. 10 points per correct guess.
        </p>

        <div style={styles.h3}>Quick Picks</div>
        <p style={styles.p}>
          Fun quick questions: How many new temples? Will Uchtdorf tell a flight story?
          What's the weather? Will there be a Youth Choir? 5 points each.
        </p>

        <div style={styles.h3}>Speakers</div>
        <p style={styles.p}>
          For each of the 15 Church leaders, predict which session they will speak in.
          10 points for a correct predicted session.
        </p>

        <div style={styles.h3}>Other Speakers</div>
        <p style={styles.p}>
          Guess up to 5 other speakers (from the Seventy, Presiding Bishopric, Relief Society,
          Young Women, Young Men, Sunday School, and Primary presidencies) who you think will
          speak. 5 points for each correct guess.
        </p>
      </div>

      <div style={styles.section}>
        <div style={styles.h2}>Live Play (During Conference)</div>
        <p style={styles.p}>
          Once predictions are locked, some fields open up for live play:
        </p>
        <ul style={styles.ul}>
          <li><strong>Actual Session</strong> - For each speaker, guess which session they're speaking in as conference happens. 5 points if correct. This rewards paying attention!</li>
          <li><strong>Topic</strong> - Type the topic of each speaker's talk as you listen. 5 points for entering anything before the final tally.</li>
          <li><strong>Prompting to...</strong> - Note whether the speaker is prompting you to Start, Stop, or Continue something. Just for fun, no points.</li>
        </ul>
        <p style={styles.p}>
          Fields marked <strong style={{ background: '#dcfce7', color: '#16a34a', padding: '1px 4px', borderRadius: '3px', fontSize: '12px' }}>LIVE</strong> become
          available once predictions are locked. Remember to click <strong>Save Answers</strong> after updating live fields!
        </p>
      </div>

      <div style={styles.section}>
        <div style={styles.h2}>Scoring</div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Scoring Rule</th>
              <th style={styles.th}>How Points Are Earned</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.td}><strong>Exact Match</strong></td>
              <td style={styles.td}>Full points if your answer matches exactly, zero otherwise</td>
            </tr>
            <tr>
              <td style={styles.td}><strong>Yes/No</strong></td>
              <td style={styles.td}>Full points for correct, zero for incorrect</td>
            </tr>
            <tr>
              <td style={styles.td}><strong>Partial Match</strong></td>
              <td style={styles.td}>Full points for an exact match, half points for a close match (topics, songs, temples)</td>
            </tr>
            <tr>
              <td style={styles.td}><strong>Any Answer</strong></td>
              <td style={styles.td}>Points awarded just for entering an answer (speaker topics during live play)</td>
            </tr>
            <tr>
              <td style={styles.td}><strong>Checkbox Match</strong></td>
              <td style={styles.td}>5 points for each correct pick (other speakers)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={styles.section}>
        <div style={styles.h2}>Penalties</div>
        <p style={styles.p}>
          During conference, penalties can be assigned for:
        </p>
        <ul style={styles.ul}>
          <li><strong>Fighting</strong> - 5 points deducted per infraction</li>
          <li><strong>Sleeping</strong> - 5 points deducted per infraction</li>
          <li><strong>Phone Use</strong> - 5 points deducted per infraction</li>
          <li><strong>Leaving</strong> - 5 points deducted per infraction</li>
        </ul>
        <p style={styles.p}>
          Up to 10 infractions per category. Activities approved by Mom or Dad don't count.
          Parents can assign penalties to themselves and their children. Grandparents can
          assign penalties to everyone. The Penalties page appears in the menu once conference begins.
        </p>
      </div>

      <div style={styles.section}>
        <div style={styles.h2}>Live Scoreboard</div>
        <p style={styles.p}>
          The scoreboard updates in real-time as answers are entered during conference. You can see:
        </p>
        <ul style={styles.ul}>
          <li>Total scores for every player</li>
          <li>Points earned per question (green = correct, orange = partial, red = incorrect)</li>
          <li>Correct answers in the question column once scored</li>
          <li>Penalty deductions</li>
          <li>Your answers and your children's answers (parents) or everyone's answers (grandparents)</li>
        </ul>
        <p style={styles.p}>
          Your column is highlighted and appears first. Use the <strong>Play</strong> link in
          the menu bar to get back to your game page.
        </p>
      </div>

      <div style={styles.section}>
        <div style={styles.h2}>Total Score</div>
        <p style={styles.p}>
          <strong>Total Points = Points Earned - Penalty Points</strong>
        </p>
        <p style={styles.p}>
          The player with the highest total score at the end of conference wins!
        </p>
      </div>

      <div style={styles.tip}>
        <strong>Tip:</strong> Keep your game link private! Anyone with your link can view
        and edit your answers before submissions are locked.
      </div>

      <div style={styles.warning}>
        <strong>Remember:</strong> Save your answers often! Click "Save Answers" at the bottom
        of your play page after making changes, especially during live play.
      </div>
    </div>
  )
}
