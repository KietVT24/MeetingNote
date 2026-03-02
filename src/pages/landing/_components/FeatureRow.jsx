import { CheckCircle2 } from "lucide-react";
import { useRef } from "react";
import useScrollReveal from "../../../hooks/useScrollReveal";

function GradientPadFrame({
  children,
  className = "",
}) {
  return (
    <div
      className={`rounded-[32px] p-4 sm:p-6 ${className}`}
      style={{
        // lớp padding có nền gradient bên ngoài (blue→teal như bạn chọn)
        background:
          "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(13,148,136,0.10))",
      }}
    >
      <div className="rounded-[22px] bg-white shadow-xl overflow-hidden">
        <div className="p-2 sm:p-3 bg-white">{children}</div>
      </div>
    </div>
  );
}


export default function FeatureRow({
  title,
  desc,
  bullets,
  img,
  icon,
  reverse = false,
  containerClass = "max-w-7xl mx-auto",
  sectionClass = "py-12 sm:py-16",
  imageAlt = title,
}) {
  const rootRef = useRef(null);
  useScrollReveal(rootRef, "reveal-up", "is-visible", { threshold: 0.15, once: true });

  return (
    <section ref={rootRef} className="">
      <div className={`${containerClass} ${sectionClass}`}>
        <div
          className={`grid items-center gap-10 lg:gap-14 lg:grid-cols-2 ${
            reverse ? "lg:[&>div:first-child]:order-2" : ""
          }`}
        >
          {/* LEFT: text block */}
          <div className="lg:max-w-xl lg:mx-0 p-4 h-full flex flex-col justify-center w-full reveal-up">
            <div className="flex items-center gap-3">
              {icon ? (
                <span className="shrink-0 text-sky-500">{icon}</span>
              ) : null}
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {title}
              </h3>
            </div>

            {desc ? (
              <p className="mt-3 text-slate-600">
                {desc}
              </p>
            ) : null}

            {Array.isArray(bullets) && bullets.length > 0 && (
              <ul className="mt-6 space-y-4">
                {bullets.map((t, i) => (
                  <li
                    key={i}
                    className="relative pl-9 text-slate-700 leading-relaxed reveal-up"
                    style={{ transitionDelay: `${i * 80}ms` }}
                  >
                    <CheckCircle2 className="absolute left-0 top-1 h-5 w-5 text-emerald-500" />
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* RIGHT: image with gradient padding */}
          <div className="relative reveal-up" style={{ transitionDelay: '120ms' }}>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 rounded-[36px] blur-2xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(13,148,136,0.10))",
              }}
            />
            <GradientPadFrame>
              <img
                src={img}
                alt={imageAlt}
                className="object-cover w-full rounded-xl ring-1 ring-emerald-500/10"
                style={{ aspectRatio: "16 / 9" }}
                loading="lazy"
              />
            </GradientPadFrame>
          </div>
        </div>
      </div>
    </section>
  );
}
