'use client'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">✅ TEST PAGE WORKS!</h1>
        <p className="text-gray-400">If you can see this, the server is working.</p>
        <a href="/login" className="mt-6 inline-block px-6 py-3 bg-white text-black rounded-xl">
          Go to Login
        </a>
      </div>
    </div>
  )
}
