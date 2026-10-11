import { MapPin, Phone, Clock, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, type BusinessHours } from "@/lib/api";
import { BUSINESS, BUSINESS_HOURS } from "@/data/business";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// "08:30:00" → "8:30 AM"
function fmt(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

// Groups consecutive days with identical hours into display rows
// e.g. [{day:2,open:"08:30",close:"17:30"}, {day:3,...}, ...]
// → ["Tue–Fri: 8:30 AM – 5:30 PM", "Sat: Closed", ...]
function buildHoursRows(hours: BusinessHours[]): string[] {
  if (!hours.length) return [];

  const rows: string[] = [];
  let i = 0;

  while (i < hours.length) {
    const cur = hours[i];
    let j = i + 1;

    // Extend range while next day has same closed/open/close
    while (j < hours.length) {
      const next = hours[j];
      const samePattern =
        cur.is_closed === next.is_closed &&
        cur.open_time === next.open_time &&
        cur.close_time === next.close_time;
      if (!samePattern) break;
      j++;
    }

    const from = DAY_NAMES[cur.day_of_week];
    const to = DAY_NAMES[hours[j - 1].day_of_week];
    const label = from === to ? from : `${from}–${to}`;

    if (cur.is_closed) {
      rows.push(`${label}: Closed`);
    } else {
      rows.push(
        `${label}: ${fmt(cur.open_time!)} – ${fmt(cur.close_time!)}`
      );
    }

    i = j;
  }

  return rows;
}

const ContactSection = () => {
  // Seeded from the static module so the hours are in the prerendered HTML and
  // survive an API outage. initialDataUpdatedAt: 0 marks that seed as already
  // stale, so the live hours are still fetched on mount and win if they differ.
  const { data: rawHours } = useQuery({
    queryKey: ["business-hours"],
    queryFn: () => api.getBusinessHours(),
    initialData: BUSINESS_HOURS,
    initialDataUpdatedAt: 0,
    staleTime: 10 * 60 * 1000,
  });

  const hours: BusinessHours[] = Array.isArray(rawHours) ? rawHours : BUSINESS_HOURS;
  const hoursRows = buildHoursRows(hours);

  return (
    <section id="contact" className="py-24 section-padding bg-secondary">
      <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="font-display text-secondary-foreground text-5xl md:text-7xl uppercase tracking-tight">
            Find Us
          </h2>

          <div className="mt-12 space-y-8">
            <div className="flex items-start gap-4">
              <MapPin size={20} className="text-accent mt-1 shrink-0" />
              <address className="not-italic">
                <a
                  href={BUSINESS.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-secondary-foreground font-medium hover:text-accent transition-colors"
                >
                  {BUSINESS.name}, {BUSINESS.address.street}
                </a>
                <p className="font-body text-muted-foreground text-sm">
                  {BUSINESS.address.city}, {BUSINESS.address.region}{" "}
                  {BUSINESS.address.postalCode}
                </p>
                <p className="font-body text-muted-foreground text-sm mt-1">
                  Proudly serving Pinellas Park, Lealman, Kenneth City and the greater
                  St. Petersburg area. Our barbers speak both English and Arabic —
                  أهلاً وسهلاً.
                </p>
              </address>
            </div>

            <div className="flex items-start gap-4">
              <Phone size={20} className="text-accent mt-1 shrink-0" />
              <div>
                <a href={BUSINESS.phone.href} className="font-body text-secondary-foreground font-medium hover:text-accent transition-colors">
                  {BUSINESS.phone.display}
                </a>
                <p className="font-body text-muted-foreground text-sm">Call or text to book</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock size={20} className="text-accent mt-1 shrink-0" />
              <div>
                {/* No loading or empty state needed — initialData means there is
                    always a full week of hours to render, including in the
                    prerendered HTML. */}
                {hoursRows.map((row, i) => (
                  <p
                    key={i}
                    className={`font-body text-sm ${
                      i === 0
                        ? "text-secondary-foreground font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {row}
                  </p>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Mail size={20} className="text-accent mt-1 shrink-0" />
              <div>
                <a href={`mailto:${BUSINESS.email}`} className="font-body text-secondary-foreground font-medium hover:text-accent transition-colors">
                  {BUSINESS.email}
                </a>
                <p className="font-body text-muted-foreground text-sm">Email us anytime</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="w-full h-[300px] md:h-[450px] overflow-hidden rounded-sm">
          <iframe
            title={`${BUSINESS.name} location map`}
            src={BUSINESS.mapsEmbedUrl}
            className="w-full h-full"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          </div>
          <a
            href={BUSINESS.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-accent text-sm font-medium hover:underline text-center"
          >
            Get Directions →
          </a>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
