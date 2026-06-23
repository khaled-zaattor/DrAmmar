type Props = {
  hasServices: boolean;
  hasBarber: boolean;
  onChooseBarber: () => void;
};

const MobileStickyBar = ({ hasServices, hasBarber, onChooseBarber }: Props) => {
  const scrollToBooking = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  const needsBarber = hasServices && !hasBarber;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-primary border-t border-primary-foreground/10 p-4">
      <button
        onClick={needsBarber ? onChooseBarber : scrollToBooking}
        className="w-full bg-accent text-accent-foreground font-body font-semibold text-sm uppercase tracking-widest py-3 hover:opacity-90 transition-opacity duration-200"
      >
        {needsBarber ? "Choose your barber →" : "Book Appointment →"}
      </button>
    </div>
  );
};

export default MobileStickyBar;
