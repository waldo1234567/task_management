import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fade = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };

export default function Landing() {
  return (
    <div className="pt-12">
  <motion.div className="hero card-soft p-8 md:p-10 flex flex-col md:flex-row items-center gap-8"
        initial="hidden" animate="show" variants={container}
      >
        <motion.div className="flex-1" variants={fade}>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 text-slate-800 leading-tight">Manage your tasks, effortlessly</h1>
          <p className="text-slate-600 mb-6 max-w-xl">A minimal task manager to track work across To Do, In Progress, and Done. Built with React, Auth0 and React Query. Clean, fast, and secure.</p>
          <div className="flex gap-3">
            <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
            <a href="#features" className="px-4 py-3 border rounded hover:bg-gray-50 transition">Learn more</a>
          </div>
          <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-primary"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>Secure by default</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2v6" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>Fast realtime-like updates</span>
            </div>
          </div>
        </motion.div>
        <motion.div className="flex-1" variants={fade}>
          <div className="h-56 md:h-48 panel-surface rounded-2xl border border-gray-100 flex items-center justify-center text-indigo-600 p-6 card-soft">
            <img src="/illustration.svg" alt="illustration" className="max-h-40 md:max-h-48 w-auto rounded-lg" />
          </div>
        </motion.div>
      </motion.div>

      <section id="features" className="mt-8">
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div className="p-6 bg-white rounded shadow hover:shadow-lg transition" variants={fade}>
            <h3 className="font-semibold mb-2">Create tasks quickly</h3>
            <p className="text-sm text-gray-600">Add tasks with a title and description. Keyboard-friendly and fast.</p>
          </motion.div>
          <motion.div className="p-6 bg-white rounded shadow hover:shadow-lg transition" variants={fade}>
            <h3 className="font-semibold mb-2">Update status & track progress</h3>
            <p className="text-sm text-gray-600">Move tasks between To Do, In Progress, and Done. Optimistic updates planned.</p>
          </motion.div>
          <motion.div className="p-6 bg-white rounded shadow hover:shadow-lg transition" variants={fade}>
            <h3 className="font-semibold mb-2">Secure with Auth0</h3>
            <p className="text-sm text-gray-600">Authentication handled by Auth0. Tokens ready for a secured API.</p>
          </motion.div>
        </div>
      </section>

      <section className="mt-10">
        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          <motion.div className="p-6 bg-white rounded shadow" variants={fade}>
            <h3 className="text-lg font-semibold mb-2">How it works</h3>
            <ol className="text-sm text-gray-600 list-decimal list-inside space-y-2">
              <li>Sign in with Auth0</li>
              <li>Create tasks using the form</li>
              <li>Update status and track progress</li>
            </ol>
          </motion.div>
          <motion.div className="p-6 bg-white rounded shadow" variants={fade}>
            <h3 className="text-lg font-semibold mb-2">Plans</h3>
            <div className="flex gap-3">
              <div className="p-4 border rounded w-1/2">
                <div className="text-sm text-gray-600">Free</div>
                <div className="text-2xl font-bold">$0</div>
                <div className="text-xs text-gray-500">Basic features</div>
              </div>
              <div className="p-4 border rounded w-1/2">
                <div className="text-sm text-gray-600">Pro</div>
                <div className="text-2xl font-bold">$8</div>
                <div className="text-xs text-gray-500">Priority support</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mt-10 bg-primary/5 p-8 rounded">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-xl font-semibold mb-2">Loved by teams and solo builders</h3>
          <p className="text-gray-600 mb-6">Simple, fast task management that fits into your workflow.</p>
          <div className="grid md:grid-cols-3 gap-4">
            <motion.blockquote className="p-4 bg-white rounded shadow" variants={fade}>"Lightweight and intuitive." — Sarah</motion.blockquote>
            <motion.blockquote className="p-4 bg-white rounded shadow" variants={fade}>"Great for small teams." — Alex</motion.blockquote>
            <motion.blockquote className="p-4 bg-white rounded shadow" variants={fade}>"Auth flow was simple." — Priya</motion.blockquote>
          </div>
        </div>
      </section>

      <div className="mt-10 flex items-center justify-center">
        <div className="w-full max-w-4xl p-6 card-soft" style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-600))', color: 'var(--color-primary-contrast)' }}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold">Ready to get started?</div>
              <div className="text-sm">Create your first project and track work easily.</div>
            </div>
            <Link to="/dashboard" className="px-4 py-2 bg-white text-primary rounded-lg shadow" style={{ color: 'var(--color-primary)' }}>Get started</Link>
          </div>
        </div>
      </div>

      <footer className="mt-12 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Task Manager — Built with React
      </footer>
    </div>
  );
}
