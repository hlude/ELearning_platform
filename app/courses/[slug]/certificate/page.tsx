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

  if (loading) return <p className="text-center text-gray-500 mt-24">Loading certificate...</p>;

  if (error) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <p className="text-gray-600 mb-4">{error}</p>
        <Link href={`/courses/${slug}`} className="text-gray-900 font-medium underline">
          ← Back to course
        </Link>
      </div>
    );
  }

  if (!certificate) return null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Print button — hidden when actually printing */}
      <div className="flex justify-end mb-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-gray-900 text-white rounded-lg px-5 py-2.5 font-medium hover:bg-gray-800 transition-colors"
        >
          🖨️ Print / Save as PDF
        </button>
      </div>

      {/* The certificate itself */}
      <div className="bg-white border-8 border-double border-gray-800 rounded-lg p-12 text-center shadow-lg">
        <p className="text-sm tracking-widest text-gray-500 uppercase mb-2">
          Certificate of Completion
        </p>
        <div className="w-16 h-0.5 bg-gray-800 mx-auto mb-8" />

        <p className="text-gray-600 mb-2">This certifies that</p>
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
          {certificate.studentName}
        </h1>
        <p className="text-gray-600 mb-2">has successfully completed the course</p>
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">
          "{certificate.courseTitle}"
        </h2>

        <div className="flex items-center justify-between mt-16 pt-8 border-t border-gray-200 text-sm text-gray-500">
          <div>
            <p className="font-semibold text-gray-900">{certificate.instructorName}</p>
            <p>Instructor</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {new Date(certificate.issuedAt).toLocaleDateString()}
            </p>
            <p>Date Issued</p>
          </div>
        </div>
      </div>

      <p className="text-center text-gray-400 text-xs mt-4 print:hidden">
        Certificate ID: {certificate.id}
      </p>
    </div>
  );
}
