import DashboardLayout from "../components/DashboardLayout";

export default function Placeholder({ title }) {
  return (
    <DashboardLayout>
      <div className="card p-10 text-center">
        <h1 className="text-2xl font-extrabold text-navy">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">This page is coming soon.</p>
      </div>
    </DashboardLayout>
  );
}