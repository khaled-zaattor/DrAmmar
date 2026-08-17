import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { ChevronLeft, ChevronRight, CheckCircle, Calendar, Clock, User, Scissors, Search, X } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  api,
  NetworkError,
  TimeoutError,
  type Service,
  type Barber,
  type AppointmentResponse,
  type ServiceCategory,
} from "@/lib/api";

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) =>
  new Date(year, month, 1).getDay();

const inputCls =
  "font-body text-base py-3 px-4 bg-transparent border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 focus:border-accent focus:outline-none transition-colors w-full";

// ─── Load failure + retry ──────────────────────────────────────────────────────

// Only TimeoutError/NetworkError messages are shown verbatim — those are ours
// and written for humans. Anything else (HttpError) carries Laravel's message,
// which can include field names, so it gets a generic fallback instead.
const LoadError = ({
  error,
  fallback,
  onRetry,
  retrying,
}: {
  error: unknown;
  fallback: string;
  onRetry: () => void;
  retrying: boolean;
}) => (
  <div className="mt-3 border border-red-400/30 bg-red-400/5 p-4 text-center">
    <p className="font-body text-red-300 text-sm">
      {error instanceof TimeoutError || error instanceof NetworkError
        ? error.message
        : fallback}
    </p>
    <button
      type="button"
      onClick={onRetry}
      disabled={retrying}
      className="mt-3 font-body text-sm px-4 py-2 min-h-[44px] border border-primary-foreground/30 text-primary-foreground/80 hover:border-primary-foreground/60 disabled:opacity-50 transition-colors"
    >
      {retrying ? "Retrying…" : "Try again"}
    </button>
  </div>
);

// ─── Confirmation screen ───────────────────────────────────────────────────────

const ConfirmationScreen = ({
  booking,
  onReset,
}: {
  booking: AppointmentResponse["data"];
  onReset: () => void;
}) => {
  const displayServices =
    booking.services?.length > 0 ? booking.services : booking.service ? [booking.service] : [];

  return (
    <section id="booking" className="py-24 section-padding bg-primary">
      <div className="max-w-[600px] mx-auto text-center">
        <CheckCircle size={64} className="text-accent mx-auto mb-6" />
        <h2 className="font-display text-primary-foreground text-4xl md:text-6xl uppercase tracking-tight">
          Booked!
        </h2>
        <p className="font-body text-primary-foreground/60 mt-4">
          Your appointment has been confirmed. See you soon.
        </p>
        <p className="font-body text-primary-foreground/40 text-sm mt-2">
          A confirmation email has been sent to {booking.customer_email}.
        </p>

        <div className="mt-10 border border-primary-foreground/10 p-6 text-left space-y-4">
          <div>
            <p className="font-body text-primary-foreground/40 text-xs uppercase tracking-widest">
              Booking Reference
            </p>
            <p className="font-display text-accent text-2xl mt-1 tracking-wider">
              {booking.booking_reference}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-primary-foreground/10">
            <div className="flex items-start gap-3">
              <User size={16} className="text-accent mt-0.5 shrink-0" />
              <div>
                <p className="font-body text-primary-foreground/40 text-xs uppercase tracking-widest">Customer</p>
                <p className="font-body text-primary-foreground text-sm mt-0.5">{booking.customer_name}</p>
                <p className="font-body text-primary-foreground/50 text-xs">{booking.customer_email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Scissors size={16} className="text-accent mt-0.5 shrink-0" />
              <div>
                <p className="font-body text-primary-foreground/40 text-xs uppercase tracking-widest">
                  {displayServices.length > 1 ? "Services" : "Service"}
                </p>
                {displayServices.map((svc) => (
                  <p key={svc?.id} className="font-body text-primary-foreground text-sm mt-0.5">
                    {svc?.name}
                  </p>
                ))}
                <p className="font-body text-primary-foreground/50 text-xs">
                  ${booking.total_price} · {booking.duration_minutes} min
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar size={16} className="text-accent mt-0.5 shrink-0" />
              <div>
                <p className="font-body text-primary-foreground/40 text-xs uppercase tracking-widest">Date</p>
                <p className="font-body text-primary-foreground text-sm mt-0.5">{booking.appointment_date}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={16} className="text-accent mt-0.5 shrink-0" />
              <div>
                <p className="font-body text-primary-foreground/40 text-xs uppercase tracking-widest">Time · Barber</p>
                <p className="font-body text-primary-foreground text-sm mt-0.5">{booking.appointment_time}</p>
                <p className="font-body text-primary-foreground/50 text-xs">{booking.barber.name}</p>
              </div>
            </div>
          </div>
        </div>

        <p className="font-body text-primary-foreground/40 text-xs mt-6">
          A confirmation has been sent to {booking.customer_email}
        </p>

        <button
          onClick={onReset}
          className="mt-8 font-body text-sm uppercase tracking-widest border border-primary-foreground/20 text-primary-foreground/60 px-8 py-3 hover:border-primary-foreground/40 hover:text-primary-foreground transition-colors"
        >
          Book Another Appointment
        </button>
      </div>
    </section>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────

export type BookingSectionHandle = {
  /** Scroll to (and open) the first step the customer has not completed. */
  goToNextStep: () => void;
};

const BookingSection = forwardRef<BookingSectionHandle, {
  preselectedServiceId?: number | null;
  onServicesChange?: (count: number) => void;
  onBarberSelected?: (hasBarber: boolean) => void;
}>(({ preselectedServiceId, onServicesChange, onBarberSelected }, ref) => {
  const { toast } = useToast();
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState<AppointmentResponse["data"] | null>(null);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [showBarberSection, setShowBarberSection] = useState(false);

  // Takes the customer to whatever they still have to do, rather than always
  // bouncing them to the top of the booking section — which used to scroll them
  // *away* from the step they had just been given.
  useImperativeHandle(ref, () => ({
    goToNextStep: () => {
      if (selectedServices.length === 0) {
        document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      if (!selectedBarber) {
        setShowBarberSection(true);
        setTimeout(() => scrollToSection(barberRef), 50);
        return;
      }

      if (!selectedDay) {
        scrollToSection(calendarRef);
        return;
      }

      if (!selectedTime) {
        scrollToSection(timeSlotsRef);
        return;
      }

      scrollToSection(contactRef);
    },
  }));

  useEffect(() => {
    onServicesChange?.(selectedServices.length);
  }, [selectedServices.length]);

  useEffect(() => {
    onBarberSelected?.(selectedBarber !== null);
  }, [selectedBarber]);

  // On desktop, auto-show barber section when services are selected
  useEffect(() => {
    if (selectedServices.length === 0) return;
    if (window.innerWidth < 768) return;
    setShowBarberSection(true);
    const t = setTimeout(() => scrollToSection(barberRef), 150);
    return () => clearTimeout(t);
  }, [selectedServices.length]);

  const totalDuration = selectedServices.reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0);
  const totalPrice    = selectedServices.reduce((sum, s) => sum + Number(s.price ?? 0), 0);

  const barberRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const timeSlotsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const pendingTimeSlotsScroll = useRef(false);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return;
    requestAnimationFrame(() => {
      if (!ref.current) return;
      const top = ref.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    });
  };

  useEffect(() => {
    if (!selectedBarber) return;
    const t = setTimeout(() => scrollToSection(calendarRef), 150);
    return () => clearTimeout(t);
  }, [selectedBarber]);

  useEffect(() => {
    if (!selectedDay) return;
    pendingTimeSlotsScroll.current = true;
  }, [selectedDay]);

  useEffect(() => {
    if (!selectedTime) return;
    const t = setTimeout(() => scrollToSection(contactRef), 150);
    return () => clearTimeout(t);
  }, [selectedTime]);

  // ─── Data fetching ─────────────────────────────────────────────────────────

  const { data: rawHours } = useQuery({
    queryKey: ["business-hours"],
    queryFn: () => api.getBusinessHours(),
    staleTime: 10 * 60 * 1000,
  });
  const closedDays = new Set(
    (rawHours ?? []).filter((h) => h.is_closed).map((h) => h.day_of_week)
  );

  const {
    data: rawServices,
    isLoading: servicesLoading,
    error: servicesError,
    refetch: refetchServices,
    isFetching: servicesFetching,
  } = useQuery({
    queryKey: ["services"],
    queryFn: () => api.getServices(),
    staleTime: 5 * 60 * 1000,
  });
  const services: Service[] = Array.isArray(rawServices) ? rawServices : [];

  const { data: rawCategories } = useQuery<ServiceCategory[]>({
    queryKey: ["categories"],
    queryFn: () => api.getCategories(),
    staleTime: 10 * 60 * 1000,
  });
  const categories: ServiceCategory[] = Array.isArray(rawCategories) ? rawCategories : [];

  const isSearching = searchQuery.trim().length > 0;
  const browsedServices = services.filter((s) => {
    if (isSearching) {
      return s.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
    }
    return activeCategory === null || s.category_id === activeCategory;
  });

  useEffect(() => {
    if (preselectedServiceId && services.length > 0 && selectedServices.length === 0) {
      const match = services.find((s) => s.id === preselectedServiceId);
      if (match) setSelectedServices([match]);
    }
  }, [preselectedServiceId, services]);

  useEffect(() => {
    if (confirmedBooking) {
      setTimeout(() => {
        document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [confirmedBooking]);

  const {
    data: rawBarbers,
    isLoading: barbersLoading,
    error: barbersError,
    refetch: refetchBarbers,
    isFetching: barbersFetching,
  } = useQuery({
    queryKey: ["barbers"],
    queryFn: () => api.getBarbers(),
    staleTime: 5 * 60 * 1000,
  });
  const allBarbers: Barber[] = Array.isArray(rawBarbers) ? rawBarbers : [];

  // Only show barbers who offer ALL selected services
  const barbers = selectedServices.length > 0
    ? allBarbers.filter((b) =>
        selectedServices.every((sel) => b.services?.some((s) => s.id === sel.id))
      )
    : allBarbers;

  const selectedDate =
    selectedDay && selectedBarber
      ? `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
      : null;

  const {
    data: timeSlots = [],
    isLoading: availabilityLoading,
    error: availabilityError,
    refetch: refetchAvailability,
    isFetching: availabilityFetching,
  } = useQuery({
    queryKey: ["availability", selectedBarber?.id, selectedDate, totalDuration],
    queryFn: () => api.getAvailability(selectedBarber!.id, selectedDate!, totalDuration || undefined),
    enabled: !!selectedBarber && !!selectedDate,
    staleTime: 30 * 1000,
  });

  const todayInET = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const currentETTime = (() => {
    const etDate = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
    return `${String(etDate.getHours()).padStart(2, "0")}:${String(etDate.getMinutes()).padStart(2, "0")}`;
  })();
  const visibleSlots = selectedDate === todayInET
    ? timeSlots.filter((t) => t > currentETTime)
    : timeSlots;

  useEffect(() => {
    if (availabilityLoading || !pendingTimeSlotsScroll.current) return;
    pendingTimeSlotsScroll.current = false;
    const t = setTimeout(() => scrollToSection(timeSlotsRef), 150);
    return () => clearTimeout(t);
  }, [availabilityLoading]);

  // ─── Booking mutation ──────────────────────────────────────────────────────

  const bookMutation = useMutation({
    mutationFn: api.bookAppointment,
    onSuccess: (res) => {
      setConfirmedBooking(res.data);
    },
    onError: (err: Error) => {
      toast({
        title: "Booking failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // ─── Calendar helpers ──────────────────────────────────────────────────────

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const monthName = new Date(currentYear, currentMonth).toLocaleString("en-US", { month: "long" });

  const isDisabledDay = (day: number) => {
    const d = new Date(currentYear, currentMonth, day);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d < t || closedDays.has(d.getDay());
  };

  const prevMonth = () => {
    setSelectedDay(null);
    setSelectedTime(null);
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };

  const nextMonth = () => {
    setSelectedDay(null);
    setSelectedTime(null);
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  const allSelected = selectedServices.length > 0 && selectedBarber && selectedDay && selectedTime;

  const handleConfirm = () => {
    if (!contactName.trim()) {
      toast({ title: "Please enter your name", variant: "destructive" });
      return;
    }
    if (!contactEmail.trim()) {
      toast({ title: "Please enter your email address", variant: "destructive" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      toast({ title: "Please enter a valid email address", variant: "destructive" });
      return;
    }
    if (!contactPhone.trim()) {
      toast({ title: "Please enter your phone number", variant: "destructive" });
      return;
    }
    if (contactPhone.replace(/\D/g, "").length < 7) {
      toast({ title: "Please enter a valid phone number (at least 7 digits)", variant: "destructive" });
      return;
    }
    bookMutation.mutate({
      service_ids: selectedServices.map((s) => s.id),
      barber_id: selectedBarber!.id,
      appointment_date: selectedDate!,
      appointment_time: selectedTime!,
      customer_name: contactName.trim(),
      customer_email: contactEmail.trim(),
      customer_phone: contactPhone.trim(),
      notes: notes.trim() || undefined,
    });
  };

  const handleReset = () => {
    setConfirmedBooking(null);
    setSelectedServices([]);
    setSelectedBarber(null);
    setSelectedDay(null);
    setSelectedTime(null);
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setNotes("");
    setPhoneError("");
  };

  const removeService = (id: number) => {
    setSelectedServices((prev) => prev.filter((s) => s.id !== id));
    setSelectedBarber(null);
    setSelectedDay(null);
    setSelectedTime(null);
    setShowBarberSection(false);
  };

  // ─── Show confirmation screen after successful booking ─────────────────────

  if (confirmedBooking) {
    return <ConfirmationScreen booking={confirmedBooking} onReset={handleReset} />;
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <section id="booking" className="py-24 section-padding bg-primary">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="font-display text-primary-foreground text-3xl sm:text-5xl md:text-7xl uppercase tracking-tight text-center">
          Book Your Appointment
        </h2>
        <p className="font-body text-primary-foreground/60 mt-4 text-center">
          Select one or more services, then choose your barber, date, and time.
        </p>

        {/* ── Step 1: Service Browser ── */}
        <div className="mt-12">
          <span className="block font-body text-primary-foreground/60 text-[0.975rem] uppercase tracking-widest">
            Services
          </span>

          {/* Search bar */}
          <div className="relative mt-3">
            <label htmlFor="service-search" className="sr-only">
              Search services
            </label>
            <Search
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-foreground/40 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="service-search"
              name="service-search"
              type="text"
              autoComplete="off"
              placeholder="Search services…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full font-body text-sm py-3 pl-10 pr-4 bg-black/40 border border-primary-foreground/15 text-primary-foreground placeholder:text-primary-foreground/30 focus:border-accent focus:outline-none transition-colors rounded-lg"
            />
          </div>

          {/* Category tabs */}
          {categories.length > 0 && (
            <div className="mt-3 flex gap-1 overflow-x-auto pb-1 scrollbar-none" role="tablist" aria-label="Service categories">
              <button
                role="tab"
                aria-selected={activeCategory === null}
                onClick={() => setActiveCategory(null)}
                className={`font-body text-xs uppercase tracking-widest whitespace-nowrap px-4 py-2.5 min-h-[44px] rounded-md transition-colors duration-200 shrink-0 border ${
                  activeCategory === null
                    ? "border-accent text-accent bg-accent/10"
                    : "border-primary-foreground/15 text-primary-foreground/50 hover:text-primary-foreground/80 hover:border-primary-foreground/30"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={activeCategory === cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`font-body text-xs uppercase tracking-widest whitespace-nowrap px-4 py-2.5 min-h-[44px] rounded-md transition-colors duration-200 shrink-0 border ${
                    activeCategory === cat.id
                      ? "border-accent text-accent bg-accent/10"
                      : "border-primary-foreground/15 text-primary-foreground/50 hover:text-primary-foreground/80 hover:border-primary-foreground/30"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Service cards */}
          {servicesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-white/10 bg-white/5 animate-pulse flex flex-row sm:flex-col">
                  <div className="w-24 self-stretch shrink-0 sm:w-full sm:aspect-[208/266] bg-white/5" />
                  <div className="flex-1 p-3 sm:p-4 space-y-2">
                    <div className="h-5 bg-white/10 rounded w-3/4" />
                    <div className="h-3 bg-white/10 rounded w-1/3" />
                    <div className="h-8 bg-white/10 rounded mt-2 hidden sm:block" />
                  </div>
                </div>
              ))}
            </div>
          ) : servicesError ? (
            <LoadError
              error={servicesError}
              fallback="We couldn't load our services right now."
              onRetry={() => refetchServices()}
              retrying={servicesFetching}
            />
          ) : browsedServices.length === 0 ? (
            <p className="mt-6 font-body text-primary-foreground/40 text-sm text-center py-8">
              No services found{searchQuery ? ` for "${searchQuery}"` : ""}.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
              {browsedServices.map((s) => {
                const isSelected = selectedServices.some((sel) => sel.id === s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      setSelectedServices((prev) => {
                        const already = prev.some((sel) => sel.id === s.id);
                        return already ? prev.filter((sel) => sel.id !== s.id) : [...prev, s];
                      });
                      setSelectedBarber(null);
                      setSelectedDay(null);
                      setSelectedTime(null);
                      setShowBarberSection(false);
                    }}
                    className={`rounded-xl overflow-hidden border cursor-pointer transition-all duration-200 flex flex-row ${
                      isSelected
                        ? "border-accent shadow-[0_0_0_1px_#c9a84c,0_4px_24px_rgba(201,168,76,0.15)]"
                        : "border-white/10 hover:border-white/25 hover:shadow-lg"
                    }`}
                    style={{ background: "#1e1e1e" }}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    aria-label={`${isSelected ? "Remove" : "Add"} ${s.name}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedServices((prev) => {
                          const already = prev.some((sel) => sel.id === s.id);
                          return already ? prev.filter((sel) => sel.id !== s.id) : [...prev, s];
                        });
                        setSelectedBarber(null);
                        setSelectedDay(null);
                        setSelectedTime(null);
                        setShowBarberSection(false);
                      }
                    }}
                  >
                    {/* Card image — fixed-width left column at all sizes */}
                    <div className="relative w-24 lg:w-32 self-stretch shrink-0 overflow-hidden bg-black">
                      {s.image_url ? (
                        <img
                          src={s.image_url}
                          alt={s.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      ) : (
                        <img
                          src={`https://picsum.photos/seed/${encodeURIComponent(s.name)}/208/266`}
                          alt={s.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      {isSelected && (
                        <span className="absolute top-2 right-2 bg-accent text-black text-[10px] font-body font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                          Added
                        </span>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="flex flex-col flex-1 p-3 gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-display text-primary-foreground text-lg uppercase tracking-wide leading-tight">
                          {s.name}
                        </h4>
                        {s.price != null && (
                          <span className="font-display text-accent text-base shrink-0">
                            ${s.price}
                          </span>
                        )}
                      </div>

                      {s.duration_minutes != null && (
                        <div className="flex items-center gap-1.5 text-primary-foreground/50">
                          <Clock size={11} aria-hidden="true" />
                          <span className="font-body text-xs">{s.duration_minutes} mins</span>
                        </div>
                      )}

                      {s.description && (
                        <p className="font-body text-primary-foreground/60 text-xs leading-relaxed mt-1 line-clamp-2">
                          {s.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Selected services summary strip */}
          {selectedServices.length > 0 && (
            <div className="mt-4 p-4 border border-accent/30 bg-accent/5 flex flex-wrap gap-2 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {selectedServices.map((s) => (
                  <span
                    key={s.id}
                    className="font-body text-xs uppercase tracking-widest px-3 py-1.5 bg-accent/20 text-accent border border-accent/30 flex items-center gap-2"
                  >
                    {s.name}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeService(s.id); }}
                      aria-label={`Remove ${s.name}`}
                      className="hover:text-white transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="font-body text-xs text-primary-foreground/60 text-right shrink-0">
                <span>{totalDuration} min</span>
                <span className="ml-3 text-accent">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          )}

        </div>

        {/* ── Step 2: Barber (filtered to those offering ALL selected services) ── */}
        {showBarberSection && selectedServices.length > 0 && (
          <div ref={barberRef} className="mt-10 animate-fade-in">
            <span className="block font-body text-primary-foreground/60 text-xs uppercase tracking-widest">
              Barber
            </span>
            {barbersLoading ? (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-64 border border-primary-foreground/10 animate-pulse bg-primary-foreground/5" />
                ))}
              </div>
            ) : barbersError ? (
              <LoadError
                error={barbersError}
                fallback="We couldn't load our barbers right now."
                onRetry={() => refetchBarbers()}
                retrying={barbersFetching}
              />
            ) : barbers.length === 0 ? (
              <p className="mt-3 font-body text-primary-foreground/40 text-sm">
                No barbers offer all selected services. Try removing a service or selecting a different combination.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
                {barbers.map((b) => {
                  const isSelected = selectedBarber?.id === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => {
                        setSelectedBarber(b);
                        setSelectedDay(null);
                        setSelectedTime(null);
                      }}
                      className={`group relative overflow-hidden text-left transition-all duration-300 shadow-lg focus:outline-none ${
                        isSelected
                          ? "ring-2 ring-accent ring-offset-2 ring-offset-primary"
                          : "ring-1 ring-primary-foreground/10 hover:ring-primary-foreground/30"
                      }`}
                    >
                      <div className="relative h-52 overflow-hidden">
                        {b.image_url ? (
                          <img
                            src={b.image_url}
                            alt={b.name}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary-foreground/10 flex items-center justify-center">
                            <span className="font-display text-primary-foreground/30 text-5xl uppercase">
                              {b.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        {isSelected && (
                          <span className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs font-body font-semibold uppercase tracking-widest px-2 py-1">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className={`p-4 transition-colors duration-200 ${isSelected ? "bg-accent/10" : "bg-black"}`}>
                        <span className="font-display text-primary-foreground text-xl uppercase tracking-wide block leading-tight">
                          {b.name}
                        </span>
                        {b.title && (
                          <span className="font-body text-primary-foreground/40 text-xs block mt-1">
                            {b.title}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Calendar ── */}
        {selectedBarber && (
          <div ref={calendarRef} className="mt-10 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="text-primary-foreground/60 hover:text-primary-foreground min-w-[44px] min-h-[44px] flex items-center justify-center">
                <ChevronLeft size={20} />
              </button>
              <span className="font-display text-primary-foreground text-2xl uppercase tracking-wider">
                {monthName} {currentYear}
              </span>
              <button onClick={nextMonth} className="text-primary-foreground/60 hover:text-primary-foreground min-w-[44px] min-h-[44px] flex items-center justify-center">
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d, i) => (
                <div
                  key={d}
                  className={`font-body text-xs text-center py-2 uppercase ${
                    closedDays.has(i)
                      ? "text-primary-foreground/20"
                      : "text-primary-foreground/40"
                  }`}
                >
                  {d}
                </div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const disabled = isDisabledDay(day);
                const selected = selectedDay === day;
                return (
                  <button
                    key={day}
                    disabled={disabled}
                    onClick={() => { setSelectedDay(day); setSelectedTime(null); }}
                    className={`font-body text-sm py-3 text-center transition-colors duration-200 ${
                      disabled
                        ? "text-primary-foreground/20 cursor-not-allowed"
                        : selected
                        ? "bg-accent text-accent-foreground"
                        : "text-primary-foreground/70 hover:bg-primary-foreground/10"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Step 4: Time Slots ── */}
        {selectedDay && (
          <div ref={timeSlotsRef} className="mt-10 animate-fade-in">
            <span className="block font-body text-primary-foreground/60 text-xs uppercase tracking-widest">
              Available Times
            </span>
            {availabilityLoading ? (
              <div className="mt-3 grid grid-cols-3 md:grid-cols-5 gap-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-12 border border-primary-foreground/10 animate-pulse bg-primary-foreground/5" />
                ))}
              </div>
            ) : availabilityError ? (
              <LoadError
                error={availabilityError}
                fallback="We couldn't load available times right now."
                onRetry={() => refetchAvailability()}
                retrying={availabilityFetching}
              />
            ) : visibleSlots.length === 0 ? (
              <p className="mt-3 font-body text-primary-foreground/40 text-sm">
                No available slots for this date. Please choose another day.
              </p>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-3">
                {visibleSlots.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTime(t)}
                    className={`font-body text-sm py-3 min-h-[44px] border transition-colors duration-200 ${
                      selectedTime === t
                        ? "bg-accent text-accent-foreground border-accent"
                        : "border-primary-foreground/20 text-primary-foreground/70 hover:border-primary-foreground/40"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Step 5: Contact details & confirm ── */}
        {allSelected && (
          <div ref={contactRef} className="mt-12 animate-fade-in">
            <span
              id="your-details-heading"
              className="block font-body text-primary-foreground/60 text-xs uppercase tracking-widest"
            >
              Your Details
            </span>
            <div
              role="group"
              aria-labelledby="your-details-heading"
              className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3"
            >
              <div>
                <label htmlFor="booking-name" className="sr-only">
                  Full Name
                </label>
                <input
                  id="booking-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Full Name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  maxLength={100}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="booking-email" className="sr-only">
                  Email Address
                </label>
                <input
                  id="booking-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email Address"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  maxLength={255}
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="booking-phone" className="sr-only">
                  Phone Number
                </label>
                <input
                  id="booking-phone"
                  name="tel"
                  type="tel"
                  autoComplete="tel"
                  inputMode="numeric"
                  pattern="[0-9+\-\s]+"
                  placeholder="Phone Number"
                  value={contactPhone}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^0-9+\-\s]/g, "");
                    setContactPhone(cleaned);
                    setPhoneError(e.target.value !== cleaned ? "Phone number must contain numbers only" : "");
                  }}
                  maxLength={20}
                  aria-invalid={phoneError ? true : undefined}
                  aria-describedby={phoneError ? "booking-phone-error" : undefined}
                  className={inputCls}
                />
                {phoneError && (
                  <p id="booking-phone-error" className="font-body text-red-400 text-xs mt-1">{phoneError}</p>
                )}
              </div>
            </div>
            <label htmlFor="booking-notes" className="sr-only">
              Notes (optional)
            </label>
            <textarea
              id="booking-notes"
              name="notes"
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={2}
              className={`${inputCls} mt-3 resize-none`}
            />

            <button
              onClick={handleConfirm}
              disabled={bookMutation.isPending}
              className="w-full mt-6 bg-accent text-accent-foreground font-body font-semibold text-sm uppercase tracking-widest py-4 min-h-[48px] hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bookMutation.isPending ? "Booking…" : "Confirm Appointment →"}
            </button>
            <p className="font-body text-primary-foreground/40 text-xs text-center mt-3">
              {selectedServices.map((s) => s.name).join(", ")} with {selectedBarber?.name} — {monthName} {selectedDay}, {currentYear} at {selectedTime} · {totalDuration} min · ${totalPrice.toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </section>
  );
});

export default BookingSection;
