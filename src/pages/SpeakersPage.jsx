const css = `
body { font-family:Arial; margin:20px; background:#000; color:#fff; }
h2 { text-align:center; color:#e62b1e; font-size:26px; margin-bottom:25px; }
.speaker-box { border-left:4px solid #e62b1e; padding:15px; margin-bottom:18px; display:flex; align-items:center; background:#111; border-radius:5px; box-shadow:0 2px 6px rgba(0,0,0,0.5); }
.speaker-box img { width:90px; height:90px; object-fit:cover; margin-right:15px; border-radius:5px; border:2px solid #e62b1e; }
.container-inner { max-width:650px; margin:auto; }
strong { color:#fff; font-size:18px; }
small { color:#e62b1e; font-weight:bold; }
p { color:#ddd; }
.back-btn { display:inline-block; margin-bottom:20px; padding:10px 20px; background:#e62b1e; color:#fff; border-radius:5px; text-decoration:none; font-weight:bold; }
`

const speakers = [
  {
    name: 'Idris Hamza Yana',
    specialty: 'African Literature | Culture | Youth Empowerment',
    bio: 'Specialist in African literature, culture, and history. Lecturer at Sule Lamido University, UK-trained with a PhD from University of Exeter. Over 20 years teaching experience and coordinator of British Council\'s Active Citizens programme.',
  },
  {
    name: 'Husna Baffa',
    specialty: 'Public Health Specialist | Civic Advocate',
    bio: 'Public health specialist overseeing TB & HIV programs in Kano State. Advocate for African Union Agenda 2063 and UNICEF YPAT alumna, empowering young people through training and conferences.',
  },
  {
    name: 'Dr. Abubakar Yahaya Kazaure',
    specialty: 'Medical Doctor | Public Health Advocate | Environmental Entrepreneur',
    bio: 'MBBS from Ibn Sina University. Public health advocate with clinical experience at ABUTH Zaria, FMC Birnin Kudu, and General Hospital Dawakin Tofa. Currently pursuing a Master\'s in Public Health.',
  },
]

export default function SpeakersPage() {
  return (
    <div>
      <style>{css}</style>
      <div className="container-inner">
        <a href="/dashboard" className="back-btn">&larr; Back to Dashboard</a>
        <h2>Event Speakers</h2>
        {speakers.map((s, i) => (
          <div key={i} className="speaker-box">
            <img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQAlAMBIgACEQEDEQH/xAAaAAEAAwEBAQAAAAAAAAAAAAAAAQYHBQIE/8QAOBAAAgECAwUDCgQHAAAAAAAAAAECAwQFBhESITFBUROBoQciI0JhcXKxwdEVMjORFDRSYpKTov/EABYBAQEBAAAAAAAAAAAAAAAAAAABAv/EABYRAQEBAAAAAAAAAAAAAAAAAAARAf/aAAwDAQACEQMRAD8ApYANAAAAAAAAAAAAAABJLgAAAAAAAAAAAAAAASAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAumV8k1L6nG7xXapUJb4UVulNdX0XiBTYQlUls04ylLpFas+tYTiTipKwudl8+yZs1jh9nh9NU7O3p0YpepHe+8+lolGDVac6UtirCUJdJRaPJul1Z295TdO6oU60WtNJx1KPmTIqp053WC66JaytpPXd/a/oKKED1KLjJxkmmtzT5HkoAAAAAI1JAAAAAAAAAAtmQcCjiV7K9uY621s1opcJz6dxqC3LccXJ9krPLllDTzqlPtZ+1y3/Y7WhAZKI0JIBDJAGd+UTAo0JxxW1hswqS2a6S3KXKXeUY2/GrSN9hV3az4VKUkvfpuMR0a3PiuJRAAKAAAAAAAAAAACX5X7gBo3LCZKWFWTjvXYU9P8UfWVzIl+r7LtCLfpbb0M1r04eHyLGQAAQAAB4qNKE2+Ci/kYRWadao1wcm1+5suZ76OHYFd3DlpJwcIfE9yMXLgAAoAAAAAAAAAAAAAO7lHHXgmJbdTV2tbzaqXJde412jVp1qUKlGanTnFOMo8GjBTuZdzPe4G+zh6a1b1dGb3L4ehBsIK7hudMFvYLtK7tamm+FdaePA6ixjDHDbWI2mz17aP3IPuInJQi5SaUUtW29EjhYhnDBLKLau1XmvUoLa8eHiUTMWb7zGFKhSX8NaP1IvzpfE/oUe88ZhWL3sbe1nrZ27ey+U5c5fYrI3EFAAAAAAAAAAAAAAAAEg6eDYDiGMy1s6Ho9d9Wb0gu/n3F0w7ye2VJRliFzUrz4uMFsR/fiKM37yN3sNntstYNbfpYbQ16zjtfM+z8MsFu/grb/UhRhq96fUlG0XGXsHude1w63evNR0fgcPEfJ/h9dN2NarbT6Pz4ijMgdnG8s4lg+s69HtKCe6tT3x7+aOMKAJIAAAAAAAAAAEgOehe8qZKVSEL3GYPZekoW3DX2y+xGQctKts4rf004r+XpyXF/1P6GgsgiFOFOnGnTjGMI8IxWiR63EEogAAAAAIcYtNNaxa0a6lJzTkmnXjO7weKhW4yoerP3dGXcAYJOMqc5QnFxlF6OL4pnk0jPuW1c0JYpYwSr01rWgl+pHr70Zx8iiAAUAAAAAA6OX8Nli+L29mm1Gb1nLpFb2c4u3kutdu/vbuS3UqUacX7ZPV+EfEmjRKNOFKlClSjswglGKXJI9gEAAAAAAAAAAAGk1o1qjGc04U8HxqvbxjpRk+0o/C/s9UbMZ/5U6Gk8OuUuKnTfgyihAAoAAAAABo3ktS/D76XPtor/AJAGi7gAyAAAAAAAAAAAFM8qEE8ItJv80bjd3xYBcGagAoAAD//Z" alt={s.name} />
            <div>
              <strong>{s.name}</strong><br />
              <small>{s.specialty}</small><br />
              <p style={{ margin: '5px 0', fontSize: 14 }}>{s.bio}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
