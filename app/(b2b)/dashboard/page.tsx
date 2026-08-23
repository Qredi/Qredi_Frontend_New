export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <p className="text-sm font-medium text-muted">Overview</p>

        <h1 className="mt-1 text-2xl font-semibold text-foreground">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-muted">
          Monitor your credit scoring activity and portfolio performance.
        </p>
      </div>

      {/* Example Content */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Applications",
            value: "1,284",
          },
          {
            label: "Average Score",
            value: "76.4",
          },
          {
            label: "High Risk",
            value: "124",
          },
          {
            label: "Scored This Month",
            value: "342",
          },
        ].map((item) => (
          <div key={item.label} className="border border-border bg-surface p-6">
            <p className="text-sm text-muted">{item.label}</p>

            <p className="mt-3 text-3xl font-semibold text-foreground">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Example Section */}
      <div className="mt-8 border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-foreground">
          Recent Applications
        </h2>

        <p className="mt-1 text-sm text-muted">
          Your latest credit scoring applications will appear here.
        </p>
      </div>
    </div>
  );
}
