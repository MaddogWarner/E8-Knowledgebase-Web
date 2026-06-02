interface GapNoteProps {
  note: string;
}

export function GapNote({ note }: GapNoteProps) {
  return (
    <section className="gap-note">
      <h3>Beyond Windows built-in tooling</h3>
      <p>{note}</p>
    </section>
  );
}

