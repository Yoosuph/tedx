const css = `
body { margin:0; padding:0; font-family:Arial,sans-serif; background:#000; color:#fff; }
.header { background:#111; padding:20px; text-align:center; border-bottom:3px solid #E62B1E; }
.header h2 { margin:0; font-size:24px; font-weight:bold; }
.container-inner { padding:20px; }
.section-title { font-size:20px; margin-bottom:15px; border-left:4px solid #E62B1E; padding-left:10px; font-weight:bold; }
table { width:100%; border-collapse:collapse; background:#1A1A1A; border-radius:12px; overflow:hidden; }
th, td { padding:14px; border-bottom:1px solid #333; text-align:left; font-size:15px; }
th { background:#E62B1E; color:#000; font-weight:700; }
tr:hover { background:#222; }
.back-btn { display:inline-block; margin-top:20px; padding:12px 18px; background:#E62B1E; color:#000; font-weight:bold; border-radius:8px; text-decoration:none; transition:0.3s; }
.back-btn:hover { background:#fff; color:#000; }
`

const rows = [
  { time: '', activity: 'Arrival & Introduction (Before 11:00 AM)', isHeader: true },
  { time: '11:00 – 11:10 AM', activity: '1st Speaker – Amina Sagir<br><em>"Dreaming With Root, Growing With Wings"</em> (10 mins)' },
  { time: '11:10 – 11:25 AM', activity: '2nd Speaker – Husna Mu\'Abaffah<br><em>"From Humble Root to Transformational Leadership"</em> (15 mins)' },
  { time: '11:25 – 11:35 AM', activity: 'Poetry Speech – Khadijah Adam Pingels (10 mins)' },
  { time: '11:35 – 11:50 AM', activity: '3rd Speaker – Dr. AY Kazaure<br><em>"From Ideas to Impact: Creating Your Own Path"</em> (15 mins)' },
  { time: '11:50 – 12:05 PM', activity: '4th Speaker – Dr. Yana<br><em>"Looking Back can Help You Forge a Clearer Future"</em> (15 mins)' },
  { time: '12:05 – 12:10 PM', activity: 'Host Remarks – Summary of first speakers (5 mins)' },
  { time: '12:10 – 12:40 PM', activity: 'Lunch Break + Networking (VVIP, VIP, Guests & Speakers) (30 mins)' },
  { time: '12:40 – 12:45 PM', activity: 'MC Introduction to New Segment (5 mins)' },
  { time: '12:45 – 12:50 PM', activity: 'Short Video Display (5 mins)' },
  { time: '12:50 – 1:05 PM', activity: '5th Speaker – Prof Haruna Musa<br><em>"From Learning Poverty to Learning Power: The Jigawa Model"</em> (15 mins)' },
  { time: '1:05 – 1:20 PM', activity: '6th Speaker – Dr Hauwa Babura<br><em>"Returning Home: Giving Back Without Losing Your Wings"</em> (15 mins)' },
  { time: '1:20 – 1:35 PM', activity: '7th Speaker – Engr. Mustapha Abu<br><em>"The Room I Was Born to Build"</em> (15 mins)' },
  { time: '1:35 – 1:50 PM', activity: '8th Speaker – Nasir Bin Shuraim<br><em>"Unleashing the Hidden Self: Roots as the Foundation for Flight"</em> (15 mins)' },
  { time: '1:50 – 2:05 PM', activity: 'Pre-Recorded Video – Prof. Uba Abdullahi (15 mins)' },
  { time: '2:05 – 2:10 PM', activity: 'Host Remarks – Second segment wrap-up (5 mins)' },
  { time: '2:10 – 2:15 PM', activity: 'MC Introduces Last Segment (5 mins)' },
  { time: '2:15 – 2:25 PM', activity: 'Artist Performance – Khairat Abdullahi (10 mins)' },
  { time: '2:25 – 2:40 PM', activity: 'Award Presentation to Guests (15 mins)' },
  { time: '2:40 – 2:50 PM', activity: 'Artist Performance – Mr Mooh (10 mins)' },
  { time: '2:50 – 3:00 PM', activity: 'Closing Remark (10 mins)' },
]

import { Link } from 'react-router-dom';

export default function OrderOfActivitiesPage() {
  return (
    <div>
      <style>{css}</style>
      <div className="header">
        <h2>Order of Activities</h2>
      </div>
      <div className="container-inner">
        <div className="section-title">Main Event Schedule</div>
        <table>
          <thead>
            <tr><th>Time</th><th>Activity</th></tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              r.isHeader ? (
                <tr key={i}>
                  <td colSpan={2} style={{ background: '#111', fontWeight: 'bold', color: '#E62B1E' }}>{r.activity}</td>
                </tr>
              ) : (
                <tr key={i}>
                  <td>{r.time}</td>
                  <td dangerouslySetInnerHTML={{ __html: r.activity }} />
                </tr>
              )
            ))}
          </tbody>
        </table>
        <Link to="/dashboard" className="back-btn">&larr; Back to Dashboard</Link>
      </div>
    </div>
  )
}
