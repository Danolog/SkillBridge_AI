"use client";

import { Download, Loader2 } from "lucide-react";
import { type RefObject, useState } from "react";

export function PdfExportButton({
	passportRef,
}: {
	passportRef: RefObject<HTMLDivElement | null>;
}) {
	const [generating, setGenerating] = useState(false);

	const handleExport = async () => {
		if (!passportRef.current) return;
		setGenerating(true);
		try {
			const html2canvas = (await import("html2canvas")).default;
			const jsPDF = (await import("jspdf")).default;

			const canvas = await html2canvas(passportRef.current, {
				scale: 2,
				useCORS: true,
				backgroundColor: "#ffffff",
			});
			const imgData = canvas.toDataURL("image/png");
			const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
			const pdfWidth = pdf.internal.pageSize.getWidth();
			const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
			pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
			pdf.save("paszport-kompetencji.pdf");
		} finally {
			setGenerating(false);
		}
	};

	return (
		<button
			type="button"
			className="pp-btn pp-btn-primary"
			onClick={handleExport}
			disabled={generating}
		>
			{generating ? <Loader2 size={16} className="pp-spin" /> : <Download size={16} />}
			{generating ? "Generowanie..." : "Eksportuj PDF"}
		</button>
	);
}
