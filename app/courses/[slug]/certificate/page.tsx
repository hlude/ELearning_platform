"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type CertificateData = {
  id: string;
  issuedAt: string;
  studentName: string;
  courseTitle: string;
  instructorName: string;
};

export default function CertificatePage() {
  const { slug } = useParams();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCertificate() {
      try {
        const res = await fetch(`/api/courses/${slug}/certificate`);
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "Could not load certificate."); return; }
        setCertificate(data.certificate);
      } catch (err) {
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchCertificate();
  }, [slug]);

  if (loading) return <p className="text-center text-[#14213D]/50 mt-24">Loading certificate...</p>;

  if (error) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <p className="text-[#14213D]/60 mb-4">{error}</p>
        <Link href={`/courses/${slug}`} className="text-[#14213D] font-semibold underline">
          ← Back to course
        </Link>
      </div>
    );
  }

  if (!certificate) return null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex justify-end mb-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-[#14213D] text-white rounded-full px-5 py-2.5 font-semibold hover:bg-[#1f2f57] transition-colors"
        >
          🖨️ Print / Save as PDF
        </button>
      </div>

      <div className="bg-white border-8 border-double border-[#14213D] rounded-lg p-12 text-center shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#F2B705]" />

        <p className="text-sm tracking-widest text-[#14213D]/50 uppercase mb-2">
          Certificate of Completion
        </p>
        <div className="w-16 h-0.5 bg-[#F2B705] mx-auto mb-8" />

        <p className="text-[#14213D]/60 mb-2">This certifies that</p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold text-[#14213D] mb-4">
          {certificate.studentName}
        </h1>
        <p className="text-[#14213D]/60 mb-2">has successfully completed the course</p>
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#14213D] mb-8">
          "{certificate.courseTitle}"
        </h2>

        <div className="flex items-center justify-between mt-16 pt-8 border-t-2 border-[#14213D]/10 text-sm text-[#14213D]/50">
          <div>
            <p className="font-semibold text-[#14213D]">{certificate.instructorName}</p>
            <p>Instructor</p>
          </div>
          <div>
            <p className="font-semibold text-[#14213D]">
              {new Date(certificate.issuedAt).toLocaleDateString()}
            </p>
            <p>Date Issued</p>
          </div>
        </div>
      </div>

      <p className="text-center text-[#14213D]/30 text-xs mt-4 print:hidden">
        Certificate ID: {certificate.id}
      </p>
    </div>
  );
}