"use client";

import { useEffect } from "react";

export function ScrollAnimations() {
	useEffect(() => {
		const header = document.getElementById("header");
		const handleScroll = () => {
			header?.classList.toggle("scrolled", window.scrollY > 48);
		};
		window.addEventListener("scroll", handleScroll);

		// Stagger delays per grid
		document.querySelectorAll(".value-grid, .steps-grid").forEach((grid) => {
			grid.querySelectorAll(".fade-up").forEach((card, i) => {
				(card as HTMLElement).style.animationDelay = `${i * 0.14}s`;
			});
		});

		// IntersectionObserver for fade-up
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.classList.add("visible");
						observer.unobserve(entry.target);
					}
				}
			},
			{ threshold: 0.06, rootMargin: "0px 0px -30px 0px" },
		);
		for (const el of document.querySelectorAll(".fade-up")) {
			observer.observe(el);
		}

		return () => {
			window.removeEventListener("scroll", handleScroll);
			observer.disconnect();
		};
	}, []);

	return <span className="hidden" />;
}
