import styles from "./HowItWorksSection.module.css";

export default function HowItWorksSection() {
  const steps = [
    { step: "01", title: "Tell us what matters." },
    { step: "02", title: "Shape your signal." },
    { step: "03", title: "Get a feed that reflects you." },
  ];

  return (
    <section
      id="how-it-works"
      className="min-h-screen border-t border-white/10 px-6 py-32"
    >
      <div className="mx-auto max-w-7xl">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">
          05 / How it works
        </p>
        <h2 className="mt-8 max-w-4xl text-5xl font-medium leading-tight tracking-[-0.04em] md:text-7xl">
          How it works
        </h2>

        <ol className="mt-12 space-y-12 md:space-y-0 md:grid md:grid-cols-3 md:gap-8">
          {steps.map((item, idx) => (
            <li key={idx} className="self-start">
              <span className="flex items-baseline space-x-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500 text-xs font-medium text-white">{item.step}</span>
                <span className="text-sm text-white">{item.title}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}