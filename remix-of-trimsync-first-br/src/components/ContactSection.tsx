import { MapPin, Phone, Clock, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, type BusinessHours } from "@/lib/api";
import {
  ADDRESS_CITY,
  ADDRESS_REGION,
  ADDRESS_STREET,
  ADDRESS_ZIP,
  EMAIL,
  HOURS_ROWS,
  MAPS_URL,
  PHONE_DISPLAY,
  PHONE_TEL,
} from "@/lib/business";

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
  const { data: rawHours, isLoading } = useQuery({
    queryKey: ["business-hours"],
    queryFn: () => api.getBusinessHours(),
    staleTime: 10 * 60 * 1000,
  });

  const hours: BusinessHours[] = Array.isArray(rawHours) ? rawHours : [];
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
              <div>
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-secondary-foreground font-medium hover:text-accent transition-colors"
                >
                  Ali&apos;s Barbershop, {ADDRESS_STREET}
                </a>
                <p className="font-body text-muted-foreground text-sm">
                  {ADDRESS_CITY}, {ADDRESS_REGION} {ADDRESS_ZIP}
                </p>
                <p className="font-body text-muted-foreground text-sm mt-1">
                  Proudly serving Pinellas Park, Lealman, and the greater St. Petersburg area.
                  Our barbers speak both English and Arabic — أهلاً وسهلاً.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Phone size={20} className="text-accent mt-1 shrink-0" />
              <div>
                <a href={PHONE_TEL} className="font-body text-secondary-foreground font-medium hover:text-accent transition-colors">
                  {PHONE_DISPLAY}
                </a>
                <p className="font-body text-muted-foreground text-sm">Call or text to book</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock size={20} className="text-accent mt-1 shrink-0" />
              <div>
                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-4 w-48 bg-muted-foreground/20 animate-pulse rounded" />
                    ))}
                  </div>
                ) : hoursRows.length > 0 ? (
                  hoursRows.map((row, i) => (
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
                  ))
                ) : (
                  HOURS_ROWS.map((row, i) => (
                    <p
                      key={row}
                      className={`font-body text-sm ${
                        i === 0
                          ? "text-secondary-foreground font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {row}
                    </p>
                  ))
                )}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Mail size={20} className="text-accent mt-1 shrink-0" />
              <div>
                <a href={`mailto:${EMAIL}`} className="font-body text-secondary-foreground font-medium hover:text-accent transition-colors">
                  {EMAIL}
                </a>
                <p className="font-body text-muted-foreground text-sm">Email us anytime</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="w-full h-[300px] md:h-[450px] overflow-hidden rounded-sm">
          <iframe
            title="Ali's Barber Shop Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3529.461893485!2d-82.6914737!3d27.8288039!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88c2e5e61c59b849%3A0xd1899ae87c607955!2sAli's%20Barbershop!5e0!3m2!1sen!2sus!4v1716000000000!5m2!1sen!2sus"
            className="w-full h-full"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          </div>
          <a
            href={MAPS_URL}
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
