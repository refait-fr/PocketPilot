"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function LandingAnimations() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const root = document.querySelector<HTMLElement>("[data-landing-root]");
    if (!root) return;

    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      ScrollTrigger.create({
        end: "max",
        start: 28,
        toggleClass: {
          className: "is-scrolled",
          targets: "[data-landing-header]",
        },
      });

      media.add(
        {
          desktop: "(min-width: 1024px)",
          mobile: "(max-width: 1023px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        ({ conditions }) => {
          if (conditions?.reduceMotion) return;

          gsap
            .timeline({ defaults: { duration: 0.75, ease: "power3.out" } })
            .from(".js-hero-reveal", {
              opacity: 0,
              stagger: 0.09,
              y: 34,
            })
            .from(
              ".js-hero-preview",
              { clipPath: "inset(10% 3% 8% 3% round 28px)", opacity: 0, y: 72 },
              "-=0.45",
            );

          gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
            gsap.from(element, {
              opacity: 0,
              scrollTrigger: {
                end: "top 58%",
                scrub: conditions?.desktop ? 0.7 : false,
                start: "top 88%",
              },
              y: conditions?.desktop ? 70 : 34,
            });
          });

          gsap
            .timeline({
              scrollTrigger: {
                end: "bottom 54%",
                scrub: 0.65,
                start: "top 72%",
                trigger: ".landing-margin-equation",
              },
            })
            .from("[data-margin-step]", {
              opacity: 0,
              stagger: 0.16,
              x: conditions?.desktop ? 54 : 20,
            })
            .from("[data-margin-result]", { opacity: 0, scale: 0.92, y: 24 });

          const cockpit = gsap.timeline({
            scrollTrigger: {
              end: "bottom 52%",
              scrub: 0.8,
              start: "top 80%",
              trigger: "[data-cockpit-stage]",
            },
          });
          cockpit
            .from("[data-cockpit-stage] [data-demo-card]", {
              opacity: 0.35,
              scale: 0.96,
              stagger: 0.08,
              y: 34,
            })
            .fromTo(
              "[data-cockpit-stage] [data-demo-line]",
              { strokeDasharray: 1, strokeDashoffset: 1 },
              { strokeDashoffset: 0 },
              0.08,
            );

          gsap.from("[data-transaction-row]", {
            opacity: 0,
            scrollTrigger: {
              end: "bottom 60%",
              scrub: 0.6,
              start: "top 78%",
              trigger: "[data-transaction-ledger]",
            },
            stagger: 0.12,
            x: conditions?.desktop ? 68 : 22,
          });

          gsap.utils.toArray<HTMLElement>("[data-budget-card]").forEach((card) => {
            const fill = card.querySelector<HTMLElement>("[data-budget-fill]");
            const timeline = gsap.timeline({
              scrollTrigger: {
                end: "center 58%",
                scrub: 0.5,
                start: "top 88%",
                trigger: card,
              },
            });
            timeline.from(card, { opacity: 0, y: 30 });
            if (fill) timeline.from(fill, { scaleX: 0, transformOrigin: "left" }, 0.1);
          });

          if (conditions?.desktop) {
            gsap
              .timeline({
                scrollTrigger: {
                  end: "+=130%",
                  pin: ".landing-purchase-pin",
                  pinSpacing: true,
                  scrub: 0.85,
                  start: "top top",
                  trigger: "[data-purchase-section]",
                },
              })
              .from("[data-purchase-step]", { opacity: 0, stagger: 0.28, y: 26 })
              .from(".landing-purchase-rule", { scaleX: 0, transformOrigin: "left" })
              .from("[data-purchase-result]", { opacity: 0, scale: 0.94, y: 24 })
              .from("[data-purchase-badge]", { opacity: 0, scale: 0.78, y: 12 });
          } else {
            gsap.from("[data-purchase-calculator]", {
              duration: 0.6,
              ease: "power2.out",
              opacity: 0,
              scrollTrigger: {
                start: "top 88%",
                toggleActions: "play none none none",
                trigger: "[data-purchase-calculator]",
              },
              y: 28,
            });
          }

          gsap
            .timeline({
              scrollTrigger: {
                end: "center 55%",
                scrub: 0.7,
                start: "top 82%",
                trigger: "[data-goal-demo]",
              },
            })
            .from("[data-goal-demo]", { opacity: 0.4, rotate: 1.5, y: 50 })
            .from("[data-goal-fill]", { scaleX: 0, transformOrigin: "left" }, 0.05);
        },
      );
    }, root);

    ScrollTrigger.refresh();

    return () => {
      context.revert();
      media.revert();
    };
  }, []);

  return null;
}
