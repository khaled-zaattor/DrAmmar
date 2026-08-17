type Props = {
  hasServices: boolean;
  hasBarber: boolean;
  /** Scrolls to the first step the customer has not completed yet. */
  onNext: () => void;
};

const MobileStickyBar = ({ hasServices, hasBarber, onNext }: Props) => {
  const needsBarber = hasServices && !hasBarber;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-primary border-t border-primary-foreground/10 p-4">
      {/* Always jumps to the next unfinished step. This used to scroll to the
          top of #booking once a barber was chosen, which pulled the customer
          back past the calendar they had just been taken to. */}
      <button
        onClick={onNext}
        className="w-full bg-accent text-accent-foreground font-body font-semibold text-sm uppercase tracking-widest py-3 hover:opacity-90 transition-opacity duration-200"
      >
        {needsBarber ? "Choose your barber →" : "Book Appointment →"}
      </button>
    </div>
  );
};

export default MobileStickyBar;
