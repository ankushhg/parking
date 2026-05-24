export default function LocationTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      <div>
        <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: "1.4rem", color: "#c9a84c", marginBottom: 4 }}>Parking Location</h1>
        <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>Find us at Sringeri Sharada Peetham Parking Lot.</p>
      </div>

      {/* Map */}
      <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid rgba(201,168,76,0.25)", lineHeight: 0 }}>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1331.5413377111793!2d75.25273881879211!3d13.416967097206754!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bbb417b558b61b3%3A0x7c880a166acf2b63!2sC783%2BJ72%20Sringeri%20Parking%20Lot%2C%2001%2C%20Sringeri%2C%20Menase%2C%20Karnataka%20577139!5e1!3m2!1sen!2sin!4v1777019046347!5m2!1sen!2sin"
          width="100%"
          height="420"
          style={{ border: 0, display: "block", filter: "invert(0.9) hue-rotate(180deg) saturate(0.6) brightness(0.85)" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Sringeri Parking Lot"
        />
      </div>

      {/* Info cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
        {[
          { icon: "📍", title: "Address", body: "Sringeri Parking Lot\nSringeri, Menase\nKarnataka 577139" },
          { icon: "🕐", title: "Timings", body: "Open daily\n5:00 AM – 9:00 PM\nExtended on festival days" },
          { icon: "📞", title: "Contact", body: "Temple Office\n+91 8265 250 230\nsupport@sringeri.temple" },
          { icon: "🚗", title: "Directions", body: "From Chikkamagaluru:\nNH 373 → Sringeri Town\n~75 km, ~2 hrs drive" },
        ].map(({ icon, title, body }) => (
          <div key={title} style={{ background: "linear-gradient(145deg,#1e0c02,#150800)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 10, padding: "20px 22px" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: 10 }}>{icon}</div>
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: "0.85rem", color: "#f0d080", marginBottom: 8 }}>{title}</p>
            <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", whiteSpace: "pre-line", lineHeight: 1.7 }}>{body}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
